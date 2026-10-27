import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { identityConfig } from "@/lib/identity-config";
import { accountTheme } from "@iyanju/account-ui/theme";
import "@iyanju/account-ui/styles.css";
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
      appearance={accountTheme}
    >
      {children}
    </ClerkProvider>
  );
}
