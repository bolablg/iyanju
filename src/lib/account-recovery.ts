import { readMinimumAgeConfirmation } from "./account-eligibility.ts";

export function isAccountOAuthCallback(hash: string): boolean {
  return /^#\/sso-callback\/?(?:\?|$)/.test(hash);
}

export function needsExplicitSignup({
  hash,
  fetchStatus,
  status,
  verificationStatus,
  errorCode,
  strategy,
}: {
  hash: string;
  fetchStatus: string;
  status: string | null;
  verificationStatus: string | null;
  errorCode?: string | null;
  strategy?: string | null;
}): boolean {
  return (
    isAccountOAuthCallback(hash) &&
    fetchStatus === "idle" &&
    status === "needs_identifier" &&
    (verificationStatus === "transferable" ||
      verificationStatus === "verified") &&
    errorCode === "external_account_not_found" &&
    typeof strategy === "string" &&
    strategy.startsWith("oauth_")
  );
}

export type SignupAttempt = {
  id?: string;
  status: string | null;
  abandonAt: number | null;
  unsafeMetadata: { minimumAgeConfirmation?: unknown };
};
export type SignupAttemptScope =
  "new" | "pending" | "complete-callback" | "inactive";

export function signupAttemptScope(
  attempt: SignupAttempt,
  hash: string,
  now = Date.now(),
): SignupAttemptScope {
  if (!attempt.id) return attempt.status === null ? "new" : "inactive";
  const futureDeadline =
    typeof attempt.abandonAt === "number" &&
    Number.isFinite(attempt.abandonAt) &&
    attempt.abandonAt > now;
  if (attempt.status === "missing_requirements" && futureDeadline)
    return "pending";
  if (
    attempt.status === "complete" &&
    isAccountOAuthCallback(hash) &&
    futureDeadline
  )
    return "complete-callback";
  return "inactive";
}

export function currentSignupConfirmation(
  attempt: SignupAttempt,
  hash: string,
  now = Date.now(),
) {
  const scope = signupAttemptScope(attempt, hash, now);
  if (scope !== "pending" && scope !== "complete-callback") return null;
  return readMinimumAgeConfirmation(
    attempt.unsafeMetadata.minimumAgeConfirmation,
  );
}

// A first server id binds the user's just-given declaration to that attempt.
// Replacing a concrete id or leaving an active attempt invalidates local intent.
export function preserveLocalAgeConfirmation(
  previous: { id: string | null; scope: SignupAttemptScope },
  current: { id: string | null; scope: SignupAttemptScope },
): boolean {
  if (previous.id === current.id && previous.scope === current.scope)
    return true;
  return (
    current.scope === "pending" &&
    (previous.scope === "new" || previous.scope === "pending") &&
    (previous.id === null || previous.id === current.id)
  );
}
