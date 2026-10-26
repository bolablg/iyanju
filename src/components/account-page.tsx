import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "./ui";
import { Arrow } from "./brand";
import { AccountControls } from "./account-controls";
import { identityConfig } from "@/lib/identity-config";
export function AccountPage({ signUp = false }: { signUp?: boolean }) {
  const config = identityConfig(process.env);
  return (
    <>
      <PageIntro
        eyebrow="YOUR ACCOUNT"
        title={signUp ? "Join iYANJU." : "Sign in to iYANJU."}
      >
        <p>
          {signUp
            ? "Create your account for participating iYANJU applications."
            : "Use your iYANJU account to continue."}
        </p>
      </PageIntro>
      <section className="container account-content">
        {config.enabled ? (
          <Suspense
            fallback={
              <div className="auth-loading" role="status">
                Preparing account controls…
              </div>
            }
          >
            <AccountControls signUp={signUp} />
          </Suspense>
        ) : (
          <div className="account-panel">
            <h2>Accounts will be available soon.</h2>
            <p>
              You can explore the applications without signing in. Existing
              application accounts continue to work on their own websites.
            </p>
            <div className="button-row">
              <Link href="/tools" className="text-link">
                Explore the applications <Arrow />
              </Link>
            </div>
          </div>
        )}
        <p className="small">
          Each application manages its own data and permissions.{" "}
          <Link href="/privacy#accounts" className="text-link">
            Account privacy <Arrow />
          </Link>
        </p>
      </section>
    </>
  );
}
