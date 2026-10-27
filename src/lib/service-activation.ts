import { identityConfig } from "./identity-config.ts";

export type ServiceId = "kazi" | "wlan" | "playkin";
export type ActivationDates = {
  activatedAt: number | null;
  firstObservedAt: number;
};
export type AccountService = {
  serviceId: ServiceId;
  state: "activated" | "not_activated" | "unavailable";
  activation?: ActivationDates;
};
export type AccountServices = { version: 1; services: AccountService[] };
export type ServiceActivationSettings = {
  environment: "development" | "production";
  issuer: string;
  rootOrigin: string;
  kaziEndpoint: string;
};

/** Fixed reviewed tuples, not destinations selected by a request or user profile. */
export function serviceActivationSettings(
  env: Record<string, string | undefined>,
): ServiceActivationSettings | null {
  const identity = identityConfig(env);
  if (!identity.enabled) return null;
  const production = identity.publishableKey.startsWith("pk_live_");
  const issuer = production
    ? "https://clerk.iyanju.com"
    : "https://funky-monitor-8635.clerk.accounts.dev";
  const rootOrigin = production
    ? "https://iyanju.com"
    : "http://127.0.0.1:49569";
  try {
    const keyIssuer =
      "https://" +
      atob(identity.publishableKey.replace(/^pk_(live|test)_/, "")).replace(
        /\$$/,
        "",
      );
    if (
      keyIssuer !== issuer ||
      !identity.authorizedParties.includes(rootOrigin)
    )
      return null;
  } catch {
    return null;
  }
  return {
    environment: production ? "production" : "development",
    issuer,
    rootOrigin,
    kaziEndpoint: production
      ? "https://kazi.iyanju.com/api/account/service-activation"
      : "http://127.0.0.1:5192/api/account/service-activation",
  };
}

export type VerifiedRootSession = {
  userId: string | null;
  sessionId: string | null;
  claims: Record<string, unknown> | null;
};

/** Additional scope checks on the exact JWT already verified by Clerk. */
export function validRootServiceSession(
  session: VerifiedRootSession,
  settings: ServiceActivationSettings,
  now = Date.now(),
) {
  const claims = session.claims;
  if (
    !claims ||
    !session.userId ||
    session.userId.length > 180 ||
    !session.sessionId
  )
    return false;
  return (
    claims.iss === settings.issuer &&
    claims.sub === session.userId &&
    claims.sid === session.sessionId &&
    claims.client_id === undefined &&
    claims.azp === settings.rootOrigin &&
    (claims.sts === undefined || claims.sts === "active") &&
    (claims.aud === "convex" ||
      (Array.isArray(claims.aud) &&
        claims.aud.length === 1 &&
        claims.aud[0] === "convex")) &&
    typeof claims.exp === "number" &&
    Number.isFinite(claims.exp) &&
    claims.exp > now / 1000 &&
    typeof claims.iat === "number" &&
    Number.isFinite(claims.iat) &&
    claims.iat >= 0 &&
    claims.iat <= now / 1000 + 60 &&
    claims.exp > claims.iat &&
    (claims.nbf === undefined ||
      (typeof claims.nbf === "number" &&
        Number.isFinite(claims.nbf) &&
        claims.nbf <= now / 1000 + 60))
  );
}

export function parseKaziActivation(
  value: unknown,
  environment: ServiceActivationSettings["environment"],
): ActivationDates | null | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const record = value as Record<string, unknown>;
  if (
    record.version !== 1 ||
    record.serviceId !== "kazi" ||
    record.environment !== environment ||
    Object.keys(record).some(
      (key) =>
        !["version", "serviceId", "environment", "activation"].includes(key),
    )
  )
    return undefined;
  if (record.activation === null) return null;
  if (
    !record.activation ||
    typeof record.activation !== "object" ||
    Array.isArray(record.activation)
  )
    return undefined;
  const dates = record.activation as Record<string, unknown>;
  const timestamp = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
  if (
    !(dates.activatedAt === null || timestamp(dates.activatedAt)) ||
    !timestamp(dates.firstObservedAt) ||
    Object.keys(dates).some(
      (key) => !["activatedAt", "firstObservedAt"].includes(key),
    )
  )
    return undefined;
  return {
    activatedAt: dates.activatedAt,
    firstObservedAt: dates.firstObservedAt,
  };
}

async function readSummary(response: Response) {
  if (
    !response.headers.get("content-type")?.includes("application/json") ||
    Number(response.headers.get("content-length") ?? 0) > 4096 ||
    !response.body
  )
    throw new Error("Invalid service summary");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let text = "",
    bytes = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 4096) throw new Error("Invalid service summary");
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export const accountServicesHeaders = {
  "Cache-Control": "private, no-store",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  Vary: "Authorization",
};

type Authenticate = (
  request: Request,
  settings: ServiceActivationSettings,
) => Promise<VerifiedRootSession>;
export function createAccountServicesHandler(
  settings: ServiceActivationSettings | null,
  authenticate: Authenticate,
  fetchService: typeof fetch = fetch,
) {
  const failure = (status: number) =>
    Response.json(
      {
        error:
          status === 401
            ? "Authentication required"
            : "Service overview unavailable",
      },
      { status, headers: accountServicesHeaders },
    );
  return async (request: Request): Promise<Response> => {
    if (!settings) return failure(503);
    if (request.method !== "GET") {
      const response = failure(405);
      response.headers.set("Allow", "GET");
      return response;
    }
    const url = new URL(request.url);
    if (
      url.origin !== settings.rootOrigin ||
      url.pathname !== "/account/services" ||
      url.search
    )
      return failure(400);
    const authorization = request.headers.get("Authorization");
    if (
      !authorization ||
      authorization.length > 16400 ||
      !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
        authorization,
      )
    )
      return failure(401);
    let session: VerifiedRootSession;
    try {
      // Clerk ordinarily prefers a cookie over the Authorization header. Verify
      // a header-only request so the exact forwarded JWT selects this account.
      session = await authenticate(
        new Request(settings.rootOrigin + "/account/services", {
          headers: { Authorization: authorization },
        }),
        settings,
      );
    } catch {
      return failure(503);
    }
    if (!validRootServiceSession(session, settings)) return failure(401);
    const kazi: AccountService = { serviceId: "kazi", state: "unavailable" };
    try {
      const response = await fetchService(settings.kaziEndpoint, {
        method: "GET",
        headers: { Authorization: authorization, Accept: "application/json" },
        credentials: "omit",
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(3000)]),
      });
      if (response.status === 200) {
        const activation = parseKaziActivation(
          await readSummary(response),
          settings.environment,
        );
        if (activation === null) kazi.state = "not_activated";
        else if (activation !== undefined) {
          kazi.state = "activated";
          kazi.activation = activation;
        }
      } else await response.body?.cancel();
    } catch {
      /* Failed lookups remain unavailable; never imply nonactivation. */
    }
    return Response.json(
      {
        version: 1,
        services: [
          kazi,
          // No JWT is forwarded until each product releases a dedicated contract.
          { serviceId: "wlan", state: "unavailable" },
          { serviceId: "playkin", state: "unavailable" },
        ],
      } satisfies AccountServices,
      { headers: accountServicesHeaders },
    );
  };
}
