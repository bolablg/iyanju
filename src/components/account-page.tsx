import Link from "next/link";
import { Suspense } from "react";
import { PageIntro, ButtonLink, Eyebrow } from "./ui";
import { Arrow } from "./brand";
import { AccountControls } from "./account-controls";
import { identityConfig } from "@/lib/identity-config";
import { kazi } from "@/content/products";
export function AccountPage({ signUp = false }: { signUp?: boolean }) {
  const config = identityConfig(process.env);
  return (
    <>
      <PageIntro
        eyebrow="THE ACCOUNT PLAN"
        title={
          <>
            One identity.
            <br />
            <em>Tool by tool.</em>
          </>
        }
      >
        <p>
          A shared sign-in for the iYanJu collection is the direction. Each tool
          will keep its own workspace access and permissions.
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
            <Eyebrow>SHARED ACCOUNTS ARE BEING PREPARED</Eyebrow>
            <h2>For now, start in Kazi.</h2>
            <p>
              Shared account features aren’t enabled on this website. You can
              explore every public page without signing in. To use Kazi, open
              the tool and use its own sign-in and workspace access.
            </p>
            <div className="button-row">
              <ButtonLink href={kazi.url} external>
                Open Kazi
              </ButtonLink>
              <Link href="/contact" className="text-link">
                Account question? <Arrow />
              </Link>
            </div>
          </div>
        )}
        <div className="account-explanation">
          <div>
            <h2>A shared identity. Separate access.</h2>
            <p>
              The plan is to let related tools recognize one account. That won’t
              automatically share your projects, calendar, or other product
              data. Each tool will enforce its own access.
            </p>
          </div>
          <div>
            <h2>Clear choices about your information.</h2>
            <p>
              Removing a tool’s data and deleting an entire shared account have
              different effects. Account adoption will need clear notices and a
              verified deletion process first.
            </p>
            <Link href="/privacy#accounts" className="text-link">
              Read the account privacy draft <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
