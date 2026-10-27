import { clerkClient } from "@clerk/nextjs/server";
import {
  createAccountServicesHandler,
  serviceActivationSettings,
} from "@/lib/service-activation";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const handler = createAccountServicesHandler(
    serviceActivationSettings(process.env),
    async (headerOnly, settings) => {
      const client = await clerkClient();
      const state = await client.authenticateRequest(headerOnly, {
        acceptsToken: "session_token",
        issuer: settings.issuer,
        authorizedParties: [settings.rootOrigin],
        audience: "convex",
      });
      const session = state.toAuth();
      if (!session) return { userId: null, sessionId: null, claims: null };
      return {
        userId: session.userId,
        sessionId: session.sessionId,
        claims: session.sessionClaims as Record<string, unknown> | null,
      };
    },
  );
  return handler(request);
}
