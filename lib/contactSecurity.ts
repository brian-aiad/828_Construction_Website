import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONTACT_CHALLENGE_MIN_AGE_MS = 800;
export const CONTACT_CHALLENGE_MAX_AGE_MS = 2 * 60 * 60 * 1000;
export const CONTACT_DEDUP_WINDOW_MS = 10 * 60 * 1000;

const TOKEN_VERSION = "v1";
const SIGNATURE_CHARACTERS = 43;

type ChallengeFailureCode =
  | "challenge_missing"
  | "challenge_invalid"
  | "challenge_too_fast"
  | "challenge_expired";

export type ChallengeVerification =
  | { ok: true; issuedAt: number }
  | { ok: false; code: ChallengeFailureCode; retryAfterMs?: number };

function challengeSecret() {
  const configuredSecret =
    process.env.CONTACT_FORM_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    "";

  if (configuredSecret) return configuredSecret;

  // Keep local browser QA usable without weakening the deployment contract.
  // Production still fails closed until CONTACT_FORM_SECRET (or the Resend
  // key fallback) is configured, while `next dev` can issue and verify the
  // same signed, expiring challenges without logging a 503 on every visit.
  if (process.env.NODE_ENV !== "production") {
    return "828-construction-local-development-challenge-secret";
  }

  return "";
}

function signatureFor(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function contactChallengeIsConfigured() {
  return challengeSecret().length >= 20;
}

export function issueContactChallenge(now = Date.now()) {
  const secret = challengeSecret();
  if (secret.length < 20) return null;

  const payload = `${TOKEN_VERSION}.${now}.${randomBytes(18).toString("base64url")}`;
  return `${payload}.${signatureFor(payload, secret)}`;
}

export function verifyContactChallenge(
  token: unknown,
  now = Date.now()
): ChallengeVerification {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, code: "challenge_missing" };
  }
  if (token.length > 256) {
    return { ok: false, code: "challenge_invalid" };
  }

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) {
    return { ok: false, code: "challenge_invalid" };
  }

  const [, timestamp, nonce, suppliedSignature] = parts;
  const issuedAt = Number(timestamp);
  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt <= 0 ||
    !/^[A-Za-z0-9_-]{20,40}$/.test(nonce) ||
    !/^[A-Za-z0-9_-]{40,50}$/.test(suppliedSignature)
  ) {
    return { ok: false, code: "challenge_invalid" };
  }

  const secret = challengeSecret();
  if (secret.length < 20) {
    return { ok: false, code: "challenge_invalid" };
  }

  const payload = `${TOKEN_VERSION}.${timestamp}.${nonce}`;
  const expected = Buffer.from(signatureFor(payload, secret), "ascii");
  const supplied = Buffer.from(suppliedSignature, "ascii");
  if (
    expected.length !== SIGNATURE_CHARACTERS ||
    supplied.length !== expected.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return { ok: false, code: "challenge_invalid" };
  }

  const age = now - issuedAt;
  if (age < 0) return { ok: false, code: "challenge_invalid" };
  if (age < CONTACT_CHALLENGE_MIN_AGE_MS) {
    return {
      ok: false,
      code: "challenge_too_fast",
      retryAfterMs: CONTACT_CHALLENGE_MIN_AGE_MS - age,
    };
  }
  if (age > CONTACT_CHALLENGE_MAX_AGE_MS) {
    return { ok: false, code: "challenge_expired" };
  }

  return { ok: true, issuedAt };
}

function normalized(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function createContactDeliveryIdentity(
  fields: {
    name: string;
    phone: string;
    email: string;
    address: string;
    service: string;
    message: string;
  },
  now = Date.now()
) {
  const bucketStartedAt = Math.floor(now / CONTACT_DEDUP_WINDOW_MS) * CONTACT_DEDUP_WINDOW_MS;
  const fingerprint = createHash("sha256")
    .update(
      [
        normalized(fields.name),
        fields.phone.replace(/\D/g, ""),
        normalized(fields.email),
        normalized(fields.address),
        normalized(fields.service),
        normalized(fields.message),
        String(bucketStartedAt),
      ].join("\u001f")
    )
    .digest("hex");

  return {
    bucketStartedAt,
    idempotencyKey: `contact-owner/${fingerprint}`,
    reference: `828-${fingerprint.slice(0, 8).toUpperCase()}`,
  };
}
