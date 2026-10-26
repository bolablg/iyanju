"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  MINIMUM_ACCOUNT_AGE,
  createMinimumAgeConfirmation,
  readMinimumAgeConfirmation,
  type MinimumAgeConfirmation,
} from "../lib/account-eligibility";

export function SignupAgeConfirmation({
  pendingConfirmation,
  onConfirm,
  title = "Before you sign up.",
  signInUrl = "/account",
  children,
}: {
  pendingConfirmation?: unknown;
  onConfirm?: (confirmation: MinimumAgeConfirmation) => Promise<void>;
  title?: string;
  signInUrl?: string;
  children: (confirmation: MinimumAgeConfirmation) => ReactNode;
}) {
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState<MinimumAgeConfirmation | null>(() =>
      readMinimumAgeConfirmation(pendingConfirmation),
    );

  async function continueSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const record = createMinimumAgeConfirmation(
      form.get("minimumAgeConfirmed") === "on",
    );
    if (!record) return;
    setPending(true);
    setError("");
    try {
      await onConfirm?.(record);
      setConfirmation(record);
    } catch {
      setError("We couldn’t save your confirmation. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (confirmation) return children(confirmation);

  return (
    <form
      className="account-panel signup-age-confirmation"
      onSubmit={continueSignup}
      aria-labelledby="signup-age-title"
    >
      <h2 id="signup-age-title">{title}</h2>
      <p id="signup-age-description">
        You must be {MINIMUM_ACCOUNT_AGE} or older to use an iYANJU account. We
        don’t ask for your date of birth.
      </p>
      <label className="signup-age-check">
        <input
          type="checkbox"
          name="minimumAgeConfirmed"
          required
          disabled={pending}
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          aria-describedby="signup-age-description"
        />
        <span>I confirm I am {MINIMUM_ACCOUNT_AGE} or older.</span>
      </label>
      <button type="submit" className="button" disabled={!checked || pending}>
        {pending ? "Saving…" : onConfirm ? "Continue" : "Continue to signup"}
      </button>
      {error && <p role="alert">{error}</p>}
      <p className="small">
        Read our <Link href="/privacy">Privacy notice</Link> and{" "}
        <Link href="/terms">Terms</Link>.
      </p>
      {!onConfirm && (
        <p className="small">
          Already have an account? <Link href={signInUrl}>Sign in</Link>
        </p>
      )}
    </form>
  );
}
