"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  MINIMUM_ACCOUNT_AGE,
  createMinimumAgeConfirmation,
  readMinimumAgeConfirmation,
  type MinimumAgeConfirmation,
} from "../lib/account-eligibility";
import {
  preserveLocalAgeConfirmation,
  type SignupAttemptScope,
} from "../lib/account-recovery";

export function SignupAgeConfirmation({
  pendingConfirmation,
  attemptId,
  attemptScope = "new",
  onConfirm,
  title = "Before you sign up.",
  signInUrl = "/account",
  children,
}: {
  pendingConfirmation?: unknown;
  attemptId?: string;
  attemptScope?: SignupAttemptScope;
  onConfirm?: (confirmation: MinimumAgeConfirmation) => Promise<void>;
  title?: string;
  signInUrl?: string;
  children: (confirmation: MinimumAgeConfirmation) => ReactNode;
}) {
  const id = attemptId ?? null;
  const [local, setLocal] = useState<{
    id: string | null;
    scope: SignupAttemptScope;
    confirmation: MinimumAgeConfirmation | null;
    checked: boolean;
    pending: boolean;
    error: string;
    generation: number;
  }>(() => ({
    id,
    scope: attemptScope,
    confirmation: null,
    checked: false,
    pending: false,
    error: "",
    generation: 0,
  }));
  let current = local;
  if (local.id !== id || local.scope !== attemptScope) {
    const preserve = preserveLocalAgeConfirmation(local, {
      id,
      scope: attemptScope,
    });
    current = {
      ...local,
      id,
      scope: attemptScope,
      ...(preserve
        ? {}
        : {
            confirmation: null,
            checked: false,
            pending: false,
            error: "",
            generation: local.generation + 1,
          }),
    };
    // Adjust before rendering children: an effect would expose the previous
    // attempt's declaration for a render after its identity changes.
    setLocal(current);
  }
  const { checked, pending, error } = current;
  const confirmation =
    readMinimumAgeConfirmation(pendingConfirmation) ?? current.confirmation;

  async function continueSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const record = createMinimumAgeConfirmation(
      form.get("minimumAgeConfirmed") === "on",
    );
    if (!record) return;
    const generation = current.generation;
    const isCurrent = (state: typeof local) =>
      state.id === id &&
      state.scope === attemptScope &&
      state.generation === generation;
    setLocal((state) =>
      isCurrent(state) ? { ...state, pending: true, error: "" } : state,
    );
    try {
      await onConfirm?.(record);
      setLocal((state) =>
        isCurrent(state)
          ? { ...state, confirmation: record, pending: false }
          : state,
      );
    } catch {
      setLocal((state) =>
        isCurrent(state)
          ? {
              ...state,
              error: "We couldn’t save your confirmation. Please try again.",
              pending: false,
            }
          : state,
      );
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
          onChange={(event) => {
            const checked = event.target.checked;
            setLocal((state) => ({ ...state, checked }));
          }}
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
