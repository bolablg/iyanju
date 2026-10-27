"use client";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignIn,
  SignUp,
  useClerk,
  useSignUp,
  useSignIn,
  useUser,
} from "@clerk/nextjs";
import { useEffect, useState, useSyncExternalStore } from "react";
import { emailLink } from "@/content/site";
import Link from "next/link";
import { SignupAgeConfirmation } from "./signup-age-confirmation";
import { AccountDashboard } from "./account-dashboard";
import { accountEntryUrl } from "@/lib/account-routing";
import { readMinimumAgeConfirmation } from "@/lib/account-eligibility";
import {
  AccountMenu,
  AccountSummary,
  AccountSignOutButton,
} from "@iyanju/account-ui";
import {
  currentSignupConfirmation,
  needsExplicitSignup,
  signupAttemptScope,
} from "@/lib/account-recovery";
export function AccountControls({
  signUp = false,
  returnUrl = "/account",
}: {
  signUp?: boolean;
  returnUrl?: string;
}) {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(true), 12000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <ClerkLoading>
        <div className="auth-loading" role="status">
          {delayed ? (
            <>
              The account service is taking longer than expected. Public pages
              and application links remain available.{" "}
              <a
                className="text-link"
                href={emailLink("Account connection help")}
              >
                Get in touch
              </a>
            </>
          ) : (
            <AccountSummary state={{ status: "loading" }} />
          )}
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-out">
          <AccountMenu
            state={{ status: "signed-out" }}
            links={{
              profile: "/account?view=profile",
              services: "/account",
              signIn: accountEntryUrl(false, returnUrl),
              signUp: accountEntryUrl(true, returnUrl),
            }}
            onSignOut={async () => {}}
          />
          <div className="clerk-controls">
            {signUp ? (
              <SignupControls returnUrl={returnUrl} />
            ) : (
              <SignInControls returnUrl={returnUrl} />
            )}
          </div>
        </Show>
        <Show when="signed-in">
          <SignedInControls returnUrl={returnUrl} />
        </Show>
      </ClerkLoaded>
    </>
  );
}
function subscribeAccountHash(notify: () => void) {
  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener("hashchange", notify);
    window.removeEventListener("popstate", notify);
  };
}
function useAccountHash() {
  return useSyncExternalStore(
    subscribeAccountHash,
    () => window.location.hash,
    () => "",
  );
}
function SignInControls({ returnUrl }: { returnUrl: string }) {
  const { signIn, fetchStatus } = useSignIn();
  const hash = useAccountHash();
  const verification = signIn.firstFactorVerification;
  if (
    needsExplicitSignup({
      hash,
      fetchStatus,
      status: signIn.status,
      verificationStatus: verification.status,
      errorCode: verification.error?.code,
      strategy: verification.strategy,
    })
  )
    return (
      <div className="account-panel" role="status">
        <h2>Create your iYANJU account.</h2>
        <p>
          This sign-in did not find an iYANJU account. If this is your first
          visit, continue to signup. You’ll confirm your eligibility before
          creating an account.
        </p>
        <div className="button-row">
          <a className="button" href={accountEntryUrl(true, returnUrl)}>
            Continue to signup
          </a>
          <a className="text-link" href={accountEntryUrl(false, returnUrl)}>
            Try another sign-in method
          </a>
        </div>
      </div>
    );
  return (
    <SignIn
      routing="hash"
      signUpUrl={accountEntryUrl(true, returnUrl)}
      forceRedirectUrl={accountEntryUrl(false, returnUrl)}
      signUpForceRedirectUrl={accountEntryUrl(true, returnUrl)}
      withSignUp={false}
      transferable={false}
    />
  );
}
function SignupControls({ returnUrl }: { returnUrl: string }) {
  const { signUp } = useSignUp();
  const hash = useAccountHash();
  return (
    <SignupAgeConfirmation
      signInUrl={accountEntryUrl(false, returnUrl)}
      pendingConfirmation={currentSignupConfirmation(signUp, hash)}
      attemptId={signUp.id}
      attemptScope={signupAttemptScope(signUp, hash)}
    >
      {(confirmation) => (
        <SignUp
          routing="hash"
          signInUrl={accountEntryUrl(false, returnUrl)}
          forceRedirectUrl={accountEntryUrl(false, returnUrl)}
          signInForceRedirectUrl={accountEntryUrl(false, returnUrl)}
          unsafeMetadata={{
            ...signUp.unsafeMetadata,
            minimumAgeConfirmation: confirmation,
          }}
        />
      )}
    </SignupAgeConfirmation>
  );
}
function SignedInControls({ returnUrl }: { returnUrl: string }) {
  const { user } = useUser();
  if (!user) return <AccountSummary state={{ status: "loading" }} />;
  if (!readMinimumAgeConfirmation(user.unsafeMetadata.minimumAgeConfirmation))
    return (
      <SignupAgeConfirmation
        key={user.id}
        title="Confirm your account eligibility."
        onConfirm={async (confirmation) => {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              minimumAgeConfirmation: confirmation,
            },
          });
        }}
      >
        {() => <SignedInAccount key={user.id} returnUrl={returnUrl} />}
      </SignupAgeConfirmation>
    );
  return <SignedInAccount key={user.id} returnUrl={returnUrl} />;
}
function SignedInAccount({ returnUrl }: { returnUrl: string }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  useEffect(() => {
    if (returnUrl !== "/account") window.location.assign(returnUrl);
  }, [returnUrl]);
  async function leave() {
    await signOut({ redirectUrl: "/account" });
  }
  if (returnUrl === "/account") return <AccountDashboard onSignOut={leave} />;
  return (
    <div className="account-panel">
      <AccountSummary
        state={
          user
            ? {
                status: "signed-in",
                identity: {
                  name: user.fullName || user.username,
                  email: user.primaryEmailAddress?.emailAddress,
                  imageUrl: user.hasImage ? user.imageUrl : null,
                },
              }
            : { status: "loading" }
        }
      />
      <h2>You’re signed in to iYANJU.</h2>
      <p>
        Your account is ready. Each application manages its own data,
        membership, and permissions. Existing application accounts are adopted
        separately.
      </p>
      {returnUrl !== "/account" && (
        <p>
          <a className="button" href={returnUrl}>
            Continue to your application →
          </a>
        </p>
      )}
      <p>
        <Link href="/tools" className="text-link">
          Explore the applications →
        </Link>
      </p>
      <AccountSignOutButton onSignOut={leave} />
    </div>
  );
}
