import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { identityConfig } from "@/lib/identity-config";
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = identityConfig(process.env);
  if (!config.enabled) return children;
  return (
    <ClerkProvider
      telemetry={false}
      publishableKey={config.publishableKey}
      signInUrl="/account"
      signUpUrl="/account/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
      allowedRedirectOrigins={config.returnOrigins}
      allowedRedirectProtocols={[
        "https:",
        ...(config.publishableKey.startsWith("pk_test_") ? ["http:"] : []),
      ]}
      appearance={{
        variables: {
          colorPrimary: "#18181b",
          fontFamily: "var(--font-sans), sans-serif",
          borderRadius: "0",
        },
        elements: {
          card: { boxShadow: "none", border: "2px solid #18181b" },
          cardBox: { boxShadow: "none", maxWidth: "100%" },
          formButtonPrimary: { boxShadow: "none" },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
