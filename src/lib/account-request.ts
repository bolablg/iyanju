import { clerkClient } from "@clerk/nextjs/server";
import {
  createAccountAccessHandler,
  createAccountServicesHandler,
  serviceActivationSettings,
  type ServiceActivationSettings,
} from "./service-activation";

async function authenticate(
  headerOnly: Request,
  settings: ServiceActivationSettings,
  mode: "services" | "access",
) {
  const client = await clerkClient();
  const state = await client.authenticateRequest(headerOnly, {
    acceptsToken: "session_token",
    issuer: settings.issuer,
    authorizedParties: [settings.rootOrigin],
    // Navigation reads our current directory policy. Forwarding the proof to
    // another service additionally requires that service's Convex audience.
    ...(mode === "services" ? { audience: "convex" } : {}),
  });
  const session = state.toAuth();
  if (!session) return { userId: null, sessionId: null, claims: null };
  return {
    userId: session.userId,
    sessionId: session.sessionId,
    claims: session.sessionClaims as Record<string, unknown> | null,
  };
}

export function accountRequestHandler(mode: "services" | "access") {
  const create =
    mode === "services"
      ? createAccountServicesHandler
      : createAccountAccessHandler;
  return create(
    serviceActivationSettings(process.env),
    (request, settings) => authenticate(request, settings, mode),
    async (subject) => {
      const client = await clerkClient();
      // Current server-owned metadata, never the session's optional metadata.
      const user = await client.users.getUser(subject);
      return { id: user.id, publicMetadata: user.publicMetadata };
    },
  );
}
