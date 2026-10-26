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
      publishableKey={config.publishableKey}
      signInUrl="/account"
      signUpUrl="/account/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
      appearance={{
        variables: {
          colorPrimary: "#bc3e2b",
          fontFamily: "var(--font-sans), sans-serif",
          borderRadius: "0",
        },
        elements: {
          card: { boxShadow: "none", border: "1px solid #d8d9cf" },
          formButtonPrimary: { boxShadow: "none" },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
