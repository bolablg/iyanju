export const serviceIds = ["kazi", "wlan", "playkin"] as const;
export type ServiceId = (typeof serviceIds)[number];
export type ServiceAccess =
  | { kind: "unrestricted" }
  | { kind: "restricted"; services: ServiceId[] }
  | { kind: "invalid" };

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

/** Only call with server-owned metadata or a signature-verified claim value. */
export function parseServiceRestriction(value: unknown): ServiceAccess {
  if (
    !object(value) ||
    !exactKeys(value, ["version", "services"]) ||
    value.version !== 1 ||
    !Array.isArray(value.services) ||
    value.services.length === 0 ||
    value.services.length > serviceIds.length ||
    value.services.some((id) => !serviceIds.includes(id as ServiceId)) ||
    new Set(value.services).size !== value.services.length
  )
    return { kind: "invalid" };
  return { kind: "restricted", services: [...value.services] as ServiceId[] };
}

/** A missing field is ordinary ONLY on a successfully fetched, exact user. */
export function authoritativeServiceAccess(
  user: unknown,
  verifiedSubject: string,
): ServiceAccess {
  if (
    !verifiedSubject ||
    !object(user) ||
    user.id !== verifiedSubject ||
    !object(user.publicMetadata)
  )
    return { kind: "invalid" };
  return Object.hasOwn(user.publicMetadata, "iyanju_service_restriction")
    ? parseServiceRestriction(user.publicMetadata.iyanju_service_restriction)
    : { kind: "unrestricted" };
}

/** Alternative for backends that cannot do a current directory lookup. */
export function signedServiceAccess(
  value: unknown,
  verifiedSubject: string,
): ServiceAccess {
  if (
    !verifiedSubject ||
    !object(value) ||
    !exactKeys(value, ["version", "subject", "restriction"]) ||
    value.version !== 1 ||
    value.subject !== verifiedSubject
  )
    return { kind: "invalid" };
  return value.restriction === null
    ? { kind: "unrestricted" }
    : parseServiceRestriction(value.restriction);
}

export function permitsService(access: ServiceAccess, id: ServiceId) {
  return (
    access.kind === "unrestricted" ||
    (access.kind === "restricted" && access.services.includes(id))
  );
}

export type AccountAccess = { version: 1; services: ServiceId[] };
export function parseAccountAccess(value: unknown): AccountAccess | null {
  if (!object(value) || !exactKeys(value, ["version", "services"])) return null;
  const access = parseServiceRestriction(value);
  return access.kind === "restricted"
    ? { version: 1, services: access.services }
    : null;
}

const wlanConsentScopes = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "user:org:read",
  "wlan:styles:read",
  "wlan:drafts:read",
  "wlan:drafts:write",
  "wlan:requests:read",
  "wlan:requests:write",
];
const consentParameters = [
  "client_id",
  "scope",
  "redirect_uri",
  "resource",
  "state",
  "code_challenge",
  "code_challenge_method",
  "response_type",
  "nonce",
];

/** Navigation to provider consent only; Clerk and Wlan still authorize the grant. */
export function wlanConsentReturn(url: URL) {
  if (
    url.origin !== "https://accounts.iyanju.com" ||
    url.pathname !== "/oauth-consent" ||
    url.hash ||
    url.username ||
    url.password
  )
    return false;
  const params = url.searchParams;
  for (const key of params.keys())
    if (!consentParameters.includes(key) || params.getAll(key).length !== 1)
      return false;
  for (const key of ["client_id", "redirect_uri"])
    if (
      !params.get(key) ||
      params.get(key)!.length > 2048 ||
      /\s/.test(params.get(key)!)
    )
      return false;
  if (params.get("resource") !== "https://wlan.iyanju.com/mcp") return false;
  const scope = params.get("scope");
  if (
    !scope ||
    scope.length > 512 ||
    scope.trim() !== scope ||
    /[^\x20-\x7e]/.test(scope)
  )
    return false;
  const scopes = scope.split(" ");
  return (
    new Set(scopes).size === scopes.length &&
    scopes.every((value) => wlanConsentScopes.includes(value)) &&
    scopes.some((value) => value.startsWith("wlan:"))
  );
}

/** Presentation only; each destination still enforces its own server policy. */
export function serviceReturnAllowed(
  destination: string,
  access: AccountAccess,
  rootOrigin: string,
) {
  if (access.services.length === serviceIds.length) return true;
  if (destination === "/account" || destination === "/account?view=profile")
    return true;
  try {
    const url = new URL(destination);
    const production = rootOrigin === "https://iyanju.com";
    if (
      production &&
      access.services.includes("wlan") &&
      wlanConsentReturn(url)
    )
      return true;
    return access.services.some((id) => {
      const origin = production
        ? `https://${id}.iyanju.com`
        : id === "wlan"
          ? "http://127.0.0.1:49570"
          : id === "kazi"
            ? "http://127.0.0.1:5192"
            : null;
      return url.origin === origin && !url.username && !url.password;
    });
  } catch {
    return false;
  }
}
