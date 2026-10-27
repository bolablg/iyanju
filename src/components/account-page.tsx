import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "./ui";
import { Arrow } from "./brand";
import { AccountControls } from "./account-controls";
import { identityConfig } from "@/lib/identity-config";
import { accountReturnUrl } from "@/lib/account-routing";
export type AccountSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;
export async function AccountPage({
  signUp = false,
  searchParams,
}: {
  signUp?: boolean;
  searchParams?: AccountSearchParams;
}) {
  const config = identityConfig(process.env);
  const params = await searchParams;
  const returnUrl = accountReturnUrl(
    params?.redirect_url,
    config.enabled ? config.returnOrigins : [],
  );
  return (
    <>
      <PageIntro eyebrow="YOUR ACCOUNT" title="Your iYANJU account.">
        <p>Profile, security, and the services you use.</p>
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
            <AccountControls signUp={signUp} returnUrl={returnUrl} />
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
        {config.enabled && (
          <noscript>
            <p className="account-panel">
              Enable JavaScript to use the secure account service. You can still
              read the public pages and contact us.
            </p>
          </noscript>
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
