export const MINIMUM_ACCOUNT_AGE = 18;
const CONFIRMATION_VERSION = 1;

export type MinimumAgeConfirmation = {
  confirmed: true;
  minimumAge: typeof MINIMUM_ACCOUNT_AGE;
  confirmedAt: string;
  version: typeof CONFIRMATION_VERSION;
};

// This is a user's declaration, not verified age or an authorization claim.
export function createMinimumAgeConfirmation(
  confirmed: boolean,
  now = new Date(),
): MinimumAgeConfirmation | null {
  if (!confirmed) return null;
  return {
    confirmed: true,
    minimumAge: MINIMUM_ACCOUNT_AGE,
    confirmedAt: now.toISOString(),
    version: CONFIRMATION_VERSION,
  };
}

// Resume the same Clerk signup after an OAuth redirect or email verification.
export function readMinimumAgeConfirmation(
  value: unknown,
): MinimumAgeConfirmation | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    record.confirmed !== true ||
    record.minimumAge !== MINIMUM_ACCOUNT_AGE ||
    record.version !== CONFIRMATION_VERSION ||
    typeof record.confirmedAt !== "string"
  )
    return null;
  const date = new Date(record.confirmedAt);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString() !== record.confirmedAt
  )
    return null;
  return createMinimumAgeConfirmation(true, date);
}
