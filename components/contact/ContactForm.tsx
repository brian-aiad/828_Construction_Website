"use client";

import { useHydrated } from "@/utils/useHydrated";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/constants";
import { useContactSubmission } from "@/components/contact/useContactSubmission";

type FormState = "idle" | "loading" | "success" | "error";
type FieldName = "name" | "phone" | "email" | "service" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const projectChoices = [
  { value: "ADU Construction", title: "ADU", detail: "Build or convert space" },
  { value: "Remediation", title: "Remediation", detail: "Diagnose and repair" },
  { value: "Consulting", title: "Consulting", detail: "Get expert direction" },
  { value: "Not sure", title: "Not sure yet", detail: "Help me choose" },
] as const;

function validate(data: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (data.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^\+?[\d\s\-(). ]{7,}$/.test(data.phone)) {
    errors.phone = "Enter a phone number we can reach.";
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.service) errors.service = "Choose the closest project type.";
  if (data.message.trim().length < 20) {
    errors.message = "Add a little more detail (at least 20 characters).";
  }
  return errors;
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SuccessMark() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="m6 12.5 3.7 3.7L18.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-[#171717] font-numbers text-[8px] font-bold text-white">
        828
      </span>
    </div>
  );
}

export default function ContactForm() {
  const hydrated = useHydrated();
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [successReference, setSuccessReference] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [completedEssentials, setCompletedEssentials] = useState(0);
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const submitContact = useContactSubmission();

  useEffect(() => {
    if (state !== "success") return;
    const frame = requestAnimationFrame(() => {
      successRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [state]);

  function readForm(form: HTMLFormElement) {
    return {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      service: (form.elements.namedItem("service") as RadioNodeList | null)?.value || "",
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };
  }

  function updateProgress(form: HTMLFormElement) {
    const data = readForm(form);
    const complete = [
      Boolean(data.service),
      data.name.length >= 2,
      data.phone.replace(/\D/g, "").length >= 7,
      data.message.length >= 20,
    ].filter(Boolean).length;
    setCompletedEssentials(complete);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const data = readForm(form);
    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationMsg("A few details still need your attention.");
      setState("idle");
      const firstInvalidName = ["service", "name", "phone", "email", "message"].find(
        (field) => errors[field as FieldName]
      );
      if (firstInvalidName === "service") {
        form.querySelector<HTMLInputElement>('input[name="service"]')?.focus();
      } else if (firstInvalidName) {
        (form.elements.namedItem(firstInvalidName) as HTMLElement | null)?.focus();
      }
      return;
    }

    setFieldErrors({});
    setValidationMsg("");
    submittingRef.current = true;
    setState("loading");
    setErrorMsg("");

    try {
      const { response, body } = await submitContact(data);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests came through at once. Try again in a few minutes or call us now.");
        }
        if (body.errors) {
          const serverErrors = body.errors as FieldErrors;
          setFieldErrors(serverErrors);
          setValidationMsg("Check the highlighted details and send again.");
          setState("idle");
          submittingRef.current = false;
          requestAnimationFrame(() => {
            const firstInvalidName = ["service", "name", "phone", "email", "message"].find(
              (field) => serverErrors[field as FieldName]
            );
            if (firstInvalidName === "service") {
              formRef.current?.querySelector<HTMLInputElement>('input[name="service"]')?.focus();
            } else if (firstInvalidName) {
              (formRef.current?.elements.namedItem(firstInvalidName) as HTMLElement | null)?.focus();
            }
          });
          return;
        }
        throw new Error(body.error || "Your details could not be sent.");
      }

      setSuccessReference(body.reference || "");
      setSuccessEmail(data.email);
      setState("success");
    } catch (error) {
      setState("error");
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Your details could not be sent. Call us directly and we’ll help."
      );
    } finally {
      submittingRef.current = false;
    }
  }

  const labelClass =
    "mb-2.5 block font-labels text-[9px] font-medium uppercase tracking-[0.2em] text-white/62";
  const inputBase =
    "min-h-12 w-full rounded-none border bg-[#151515] px-4 py-3 text-base text-[#f6f4f0] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-white/46 hover:border-[#77726d] focus:border-[var(--color-accent)] focus:bg-[#191919] focus:ring-2 focus:ring-[var(--color-accent)]/30";
  const inputClass = (field: FieldName) =>
    `${inputBase} ${fieldErrors[field] ? "border-[#ff9289] ring-2 ring-[#ff9289]/20" : "border-[#66615d]"}`;

  if (state === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="flex min-h-[28rem] flex-col justify-center py-8 sm:min-h-[31rem] sm:py-12" role="status" aria-live="polite">
        <SuccessMark />
        <p className="mt-8 font-labels text-[9px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Delivered to 828 Construction
        </p>
        <h3 className="mt-3 max-w-md font-display text-[clamp(1.9rem,4vw,2.65rem)] font-normal leading-[1.04] tracking-[-0.02em] text-white">
          Your project details are in Joe’s inbox.
        </h3>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/66">
          Expect a personal response within 24 hours.
          {successEmail
            ? " The email notification is already set so Joe can reply directly to you."
            : " Joe will reach you at the phone number you shared."}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={SITE.phoneHref}
            className="inline-flex min-h-11 items-center justify-center bg-white px-5 font-labels text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Call about this project
          </a>
          {successReference && (
            <span className="font-numbers text-[10px] uppercase tracking-[0.12em] text-white/62">
              Ref. {successReference}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={(event) => updateProgress(event.currentTarget)}
      onChange={(event) => updateProgress(event.currentTarget)}
      noValidate
      className="@container space-y-6 sm:space-y-8"
      aria-label="Contact form"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] opacity-0">
        <input name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-labels text-[9px] uppercase tracking-[0.18em] text-white/62">
            Brief completeness
          </span>
          <span className="font-numbers text-[10px] font-bold text-white" aria-live="polite">
            {completedEssentials}/4
          </span>
        </div>
        <div
          className="mt-3 h-[3px] overflow-hidden bg-white/18"
          role="progressbar"
          aria-label="Project brief completeness"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={completedEssentials}
        >
          <span
            className="block h-full bg-[var(--color-accent)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${completedEssentials * 25}%` }}
          />
        </div>
      </div>

      {validationMsg && (
        <div role="alert" className="border-l-2 border-[#ff9289] bg-[#7f2924]/24 px-4 py-3 text-sm leading-6 text-[#ffd4d0]">
          {validationMsg}
        </div>
      )}

      <fieldset
        aria-invalid={fieldErrors.service ? "true" : undefined}
        aria-describedby={fieldErrors.service ? "cf-service-err" : undefined}
      >
        <legend className={labelClass}>
          What do you need? <span className="text-[var(--color-accent)]">*</span>
        </legend>
        <div className="grid auto-rows-fr grid-cols-1 gap-3 @min-[260px]:grid-cols-2">
          {projectChoices.map((choice) => {
            const id = `cf-service-${choice.value.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <div key={choice.value} className="relative">
                <input
                  id={id}
                  className="peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
                  type="radio"
                  name="service"
                  value={choice.value}
                  required
                  aria-describedby={fieldErrors.service ? "cf-service-err" : undefined}
                />
                <label
                  htmlFor={id}
                  className="pointer-events-none flex h-full min-h-[5.5rem] min-w-0 flex-col justify-between border border-[#66615d] bg-[#151515] p-3 text-white transition-[border-color,background-color,color,box-shadow] duration-200 peer-hover:border-[#8c8782] peer-hover:bg-[#1b1b1b] peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white"
                >
                  <span className="font-display text-base leading-tight">{choice.title}</span>
                  <span className="mt-2 text-xs leading-5 text-current opacity-75">
                    {choice.detail}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        {fieldErrors.service && (
          <p id="cf-service-err" className="mt-2 text-xs text-[#ffaaa2]">
            {fieldErrors.service}
          </p>
        )}
      </fieldset>

      <div className="border-t border-white/14 pt-6 sm:pt-7">
        <div className="mb-5 space-y-2">
          <h4 className="font-display text-xl font-normal text-white">How should Joe reach you?</h4>
          <span className="block font-labels text-[9px] uppercase tracking-[0.16em] text-white/58">
            No sales list. Ever.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 @min-[400px]:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className={labelClass}>
              Your name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              aria-invalid={!!fieldErrors.name || undefined}
              aria-describedby={fieldErrors.name ? "cf-name-err" : undefined}
              className={inputClass("name")}
              placeholder="Name"
            />
            {fieldErrors.name && <p id="cf-name-err" className="mt-2 text-xs text-[#ffaaa2]">{fieldErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="cf-phone" className={labelClass}>
              Phone <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              required
              maxLength={40}
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={!!fieldErrors.phone || undefined}
              aria-describedby={fieldErrors.phone ? "cf-phone-err" : undefined}
              className={inputClass("phone")}
              placeholder="(310) 555-0000"
            />
            {fieldErrors.phone && <p id="cf-phone-err" className="mt-2 text-xs text-[#ffaaa2]">{fieldErrors.phone}</p>}
          </div>
        </div>
        <div className="mt-5">
          <div>
            <label htmlFor="cf-email" className={labelClass}>
              Email <span className="normal-case tracking-normal text-white/58">— optional</span>
            </label>
          </div>
          <input
            id="cf-email"
            name="email"
            type="email"
            maxLength={160}
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!fieldErrors.email || undefined}
            aria-describedby={fieldErrors.email ? "cf-email-err" : "cf-email-help"}
            className={inputClass("email")}
            placeholder="you@example.com"
          />
          <p id="cf-email-help" className="sr-only">Add your email if you prefer an email reply.</p>
          {fieldErrors.email && <p id="cf-email-err" className="mt-2 text-xs text-[#ffaaa2]">{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="border-t border-white/14 pt-6 sm:pt-7">
        <div className="mb-3 flex flex-col items-start gap-2">
          <label htmlFor="cf-message" className="font-display text-xl font-normal text-white">
            What are you planning or trying to fix?
          </label>
          <span className="font-labels text-[8px] uppercase tracking-[0.15em] text-white/58">A sentence or two is enough</span>
        </div>
        <textarea
          id="cf-message"
          name="message"
          required
          maxLength={4000}
          rows={5}
          aria-invalid={!!fieldErrors.message || undefined}
          aria-describedby={fieldErrors.message ? "cf-message-err" : "cf-message-help"}
          className={`${inputClass("message")} min-h-32 resize-y leading-6 sm:min-h-36`}
          placeholder="For example: We’re considering a detached ADU in Torrance and want to understand feasibility, budget, and timing."
        />
        <p id="cf-message-help" className="mt-2 text-[11px] leading-5 text-white/60">
          Helpful: city, current condition, timing, and the decision you need to make.
        </p>
        {fieldErrors.message && <p id="cf-message-err" className="mt-2 text-xs text-[#ffaaa2]">{fieldErrors.message}</p>}
      </div>

      {state === "error" && (
        <div role="alert" className="border border-[#ff9289]/45 bg-[#7f2924]/24 px-4 py-3 text-sm leading-6 text-[#ffd4d0]">
          {errorMsg}{" "}
          <a href={SITE.phoneHref} className="font-medium underline underline-offset-4">Call {SITE.phone}</a>.
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={!hydrated || state === "loading"}
          className="group flex min-h-14 w-full items-center justify-between bg-white px-5 text-black transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <span className="flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.18em]">
            {state === "loading" && <Spinner />}
            {state === "loading" ? "Sending securely…" : "Send project details"}
          </span>
          <span className="font-numbers text-lg transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] leading-5 text-white/58">
          <span>Sent directly to 828 Construction</span>
          <span>Personal response within 24 hours</span>
        </div>
      </div>
    </form>
  );
}
