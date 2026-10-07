"use client";

import { useCallback, useEffect, useRef } from "react";

type Challenge = {
  token: string;
  readyAt: number;
};

type ContactResponse = {
  error?: string;
  errors?: Record<string, string>;
  reference?: string;
  code?: string;
  retryAfterMs?: number;
};

const REFRESHABLE_CHALLENGE_CODES = new Set([
  "challenge_missing",
  "challenge_invalid",
  "challenge_expired",
]);

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

// Bound both the connection and response body: a stalled network must not leave
// the form disabled indefinitely. The submit limit allows the server's retries.
async function requestJson<T>(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = (await response.json().catch(() => ({}))) as T;
    if (controller.signal.aborted) throw new Error("Request timed out");
    return { response, body };
  } catch {
    throw new Error(
      url === "/api/contact"
        ? "We couldn’t confirm delivery. Check your connection and try again, or call us directly."
        : "The secure form could not connect. Check your connection and try again, or call us directly."
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export function useContactSubmission() {
  const challengeRef = useRef<Challenge | null>(null);
  const pendingChallengeRef = useRef<Promise<Challenge> | null>(null);

  const loadChallenge = useCallback(async (force = false) => {
    if (!force && challengeRef.current) return challengeRef.current;
    if (!force && pendingChallengeRef.current) return pendingChallengeRef.current;

    const request = (async () => {
      const { response, body } = await requestJson<{
        token?: string;
        minWaitMs?: number;
      }>("/api/contact/challenge", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }, 12_000);
      if (!response.ok || !body.token) {
        throw new Error("The secure form could not start. Please try again or call us directly.");
      }

      const challenge = {
        token: body.token,
        // Small clock/network cushion prevents a just-issued token from
        // arriving a few milliseconds before the server's minimum age.
        readyAt: Date.now() + Math.max(0, body.minWaitMs || 0) + 100,
      };
      challengeRef.current = challenge;
      return challenge;
    })();

    pendingChallengeRef.current = request;
    try {
      return await request;
    } finally {
      if (pendingChallengeRef.current === request) pendingChallengeRef.current = null;
    }
  }, []);

  useEffect(() => {
    void loadChallenge().catch(() => {
      // Submission retries this request and presents the actionable error.
    });
  }, [loadChallenge]);

  return useCallback(
    async (data: Record<string, string>) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const challenge = await loadChallenge(attempt > 0);
        const waitMs = challenge.readyAt - Date.now();
        if (waitMs > 0) await wait(waitMs);

        const { response, body } = await requestJson<ContactResponse>("/api/contact", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, challengeToken: challenge.token }),
        }, 45_000);

        if (
          attempt === 0 &&
          (REFRESHABLE_CHALLENGE_CODES.has(body.code || "") ||
            response.status === 425)
        ) {
          challengeRef.current = null;
          if (response.status === 425 && body.retryAfterMs) {
            await wait(Math.min(Math.max(body.retryAfterMs, 0) + 100, 2_000));
          }
          continue;
        }

        return { response, body };
      }

      throw new Error("The secure form expired. Please try again or call us directly.");
    },
    [loadChallenge]
  );
}
