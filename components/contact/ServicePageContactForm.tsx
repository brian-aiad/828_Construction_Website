"use client";

import { useHydrated } from "@/utils/useHydrated";

import { useState, useRef } from "react";
import { SITE } from "@/lib/constants";
import { useContactSubmission } from "@/components/contact/useContactSubmission";

interface Props {
  serviceTitle: string;
}

type FormState = "idle" | "loading" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "phone" | "email" | "message", string>>;

function validate(data: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (data.name.trim().length < 2) errors.name = "Full name required";
  if (!/^\+?[\d\s\-(). ]{7,}$/.test(data.phone)) errors.phone = "Valid phone number required";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }
  if (data.message.trim().length < 20) {
    errors.message = "Please describe your project (min 20 characters)";
  }
  return errors;
}

function CheckmarkSVG() {
  return (
    <svg viewBox="0 0 52 52" className="w-14 h-14 mx-auto" fill="none" aria-hidden="true">
      <circle
        cx="26" cy="26" r="23"
        stroke="var(--color-accent)" strokeWidth="2"
        strokeDasharray="145" strokeDashoffset="145"
        style={{ animation: "drawCircle 0.55s ease forwards" }}
      />
      <polyline
        points="14,26 23,35 38,18"
        stroke="var(--color-accent)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="36" strokeDashoffset="36"
        style={{ animation: "drawCheck 0.4s ease forwards 0.45s" }}
      />
    </svg>
  );
}

export default function ServicePageContactForm({ serviceTitle }: Props) {
  const hydrated = useHydrated();
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successReference, setSuccessReference] = useState("");
  const submittingRef = useRef(false);
  const submitContact = useContactSubmission();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;

    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      address: (form.elements.namedItem("address") as HTMLInputElement).value.trim(),
      service: serviceTitle,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationMsg("Please complete the highlighted required fields before sending.");
      const firstInvalidName = ["name", "phone", "email", "message"].find(
        (field) => errors[field as keyof FieldErrors]
      );
      if (firstInvalidName) {
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
      const { response: res, body } = await submitContact(formData);
      if (!res.ok) {
        if (res.status === 429) throw new Error("Too many requests. Please try again shortly.");
        if (body.errors) {
          setFieldErrors(body.errors as FieldErrors);
          setValidationMsg("Please correct the highlighted fields before sending again.");
          setState("idle");
          submittingRef.current = false;
          return;
        }
        throw new Error(body.error || "Something went wrong");
      }
      setSuccessReference(body.reference || "");
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      submittingRef.current = false;
    }
  }

  if (state === "success") {
    return (
      <div className="py-12 text-center flex flex-col items-center">
        <CheckmarkSVG />
        <h3
          className="font-display font-bold text-white mt-6 mb-3 tracking-tight"
          style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
        >
          Message Received
        </h3>
        <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
          Joe will review your {serviceTitle.toLowerCase()} inquiry and get back to you within 24 hours.
        </p>
        {successReference && (
          <p className="mt-5 font-labels text-[9px] uppercase tracking-[0.18em] text-white/48">
            Confirmation {successReference}
          </p>
        )}
      </div>
    );
  }

  const inputClass =
    "w-full bg-transparent border-b border-white/20 px-0 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200";
  const labelClass =
    "block font-labels text-[9px] text-gray-400 tracking-[0.22em] uppercase mb-2";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8" aria-label="Service inquiry form">
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <input name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>

      {validationMsg && (
        <div role="alert" className="border border-amber-300/35 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">
          {validationMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <label htmlFor="sp-name" className={labelClass}>
            Full Name <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="sp-name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={!!fieldErrors.name || undefined}
            aria-describedby={fieldErrors.name ? "sp-name-err" : undefined}
            className={`${inputClass} ${fieldErrors.name ? "border-red-400/70" : ""}`}
            placeholder="John Smith"
          />
          {fieldErrors.name && <p id="sp-name-err" role="alert" className="mt-2 text-[10px] text-red-400">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="sp-phone" className={labelClass}>
            Phone <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="sp-phone"
            name="phone"
            type="tel"
            required
            maxLength={40}
            autoComplete="tel"
            aria-invalid={!!fieldErrors.phone || undefined}
            aria-describedby={fieldErrors.phone ? "sp-phone-err" : undefined}
            className={`${inputClass} ${fieldErrors.phone ? "border-red-400/70" : ""}`}
            placeholder="(310) 555-0000"
          />
          {fieldErrors.phone && <p id="sp-phone-err" role="alert" className="mt-2 text-[10px] text-red-400">{fieldErrors.phone}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <label htmlFor="sp-email" className={labelClass}>
            Email{" "}
            <span className="text-gray-500 normal-case tracking-normal">— add for one-click replies</span>
          </label>
          <input
            id="sp-email"
            name="email"
            type="email"
            maxLength={160}
            autoComplete="email"
            aria-invalid={!!fieldErrors.email || undefined}
            aria-describedby={fieldErrors.email ? "sp-email-err" : undefined}
            className={`${inputClass} ${fieldErrors.email ? "border-red-400/70" : ""}`}
            placeholder="john@example.com"
          />
          {fieldErrors.email && <p id="sp-email-err" role="alert" className="mt-2 text-[10px] text-red-400">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="sp-address" className={labelClass}>
            Project Address{" "}
            <span className="text-gray-600 normal-case tracking-normal">— optional</span>
          </label>
          <input
            id="sp-address"
            name="address"
            type="text"
            maxLength={240}
            autoComplete="street-address"
            className={inputClass}
            placeholder="123 Main St, Torrance"
          />
        </div>
      </div>
      <div>
        <label htmlFor="sp-message" className={labelClass}>
          Project Description <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          id="sp-message"
          name="message"
          required
          maxLength={4000}
          rows={4}
          aria-invalid={!!fieldErrors.message || undefined}
          aria-describedby={fieldErrors.message ? "sp-message-err" : undefined}
          className={`${inputClass} resize-none ${fieldErrors.message ? "border-red-400/70" : ""}`}
          placeholder="Timeline, scope, and any specific concerns…"
        />
        {fieldErrors.message && <p id="sp-message-err" role="alert" className="mt-2 text-[10px] text-red-400">{fieldErrors.message}</p>}
      </div>

      {state === "error" && (
        <div role="alert" className="border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {errorMsg || "Something went wrong. Please call us directly."}
        </div>
      )}

      <button
        type="submit"
        disabled={!hydrated || state === "loading"}
        className="w-full border border-[var(--color-accent)] text-white py-4 font-labels text-[10px] tracking-[0.22em] uppercase hover:bg-[var(--color-accent)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
      >
        {state === "loading" ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Sending…
          </>
        ) : (
          `Request ${serviceTitle} Consultation`
        )}
      </button>

      <p className="font-labels text-[9px] text-gray-500 tracking-[0.12em] text-center">
        We respond personally within 24 hours · Or call{" "}
        <a href={SITE.phoneHref} className="text-gray-400 hover:text-[var(--color-accent)] transition-colors">
          {SITE.phone}
        </a>
      </p>
    </form>
  );
}
