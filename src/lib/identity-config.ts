type Environment = Record<string, string | undefined>;
export type IdentityConfig =
  | { enabled: false; reason: "disabled" | "incomplete" | "unreviewed" }
  | { enabled: true; publishableKey: string; authorizedParties: string[] };

// Fail closed. Reading the public site never provisions or initializes a Clerk instance.
export function identityConfig(env: Environment): IdentityConfig {
  if (env.IYANJU_ENABLE_ACCOUNTS !== "true")
    return { enabled: false, reason: "disabled" };
  const pk = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = env.CLERK_SECRET_KEY ?? "";
  const environment = pk.startsWith("pk_live_")
    ? "live"
    : pk.startsWith("pk_test_")
      ? "test"
      : null;
  const parties = (env.IYANJU_AUTHORIZED_PARTIES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!environment || !sk.startsWith(`sk_${environment}_`) || !parties.length)
    return { enabled: false, reason: "incomplete" };
  try {
    const encoded = pk.slice(`pk_${environment}_`.length);
    const hostname = atob(encoded).replace(/\$$/, "");
    if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname))
      return { enabled: false, reason: "incomplete" };
    for (const party of parties) {
      const url = new URL(party);
      if (
        url.origin !== party ||
        url.username ||
        url.password ||
        url.hostname.includes("*")
      )
        throw new Error("Exact origins only");
      const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(
        url.hostname,
      );
      if (
        url.protocol !== "https:" &&
        !(environment === "test" && loopback && url.protocol === "http:")
      )
        throw new Error("Secure origins required");
    }
  } catch {
    return { enabled: false, reason: "incomplete" };
  }
  // `next build` uses NODE_ENV=production even for local testing. Test keys remain allowed on loopback.
  if (
    environment === "live" &&
    (env.IYANJU_AUTH_REVIEWED !== "true" ||
      parties.some(
        (p) =>
          ![
            "https://iyanju.com",
            "https://kazi.iyanju.com",
            "https://accounts.iyanju.com",
          ].includes(p),
      ))
  )
    return { enabled: false, reason: "unreviewed" };
  return { enabled: true, publishableKey: pk, authorizedParties: parties };
}
