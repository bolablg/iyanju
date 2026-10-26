"use client";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignIn,
  SignUp,
  UserButton,
  useClerk,
  useSignUp,
  useUser,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { emailLink } from "@/content/site";
import Link from "next/link";
import { SignupAgeConfirmation } from "./signup-age-confirmation";
import { accountEntryUrl } from "@/lib/account-routing";
import { readMinimumAgeConfirmation } from "@/lib/account-eligibility";
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
            "Connecting to the account service…"
          )}
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-out">
          <div className="clerk-controls">
            {signUp ? (
              <SignupControls returnUrl={returnUrl} />
            ) : (
              <SignIn
                routing="hash"
                signUpUrl={accountEntryUrl(true, returnUrl)}
                forceRedirectUrl={accountEntryUrl(false, returnUrl)}
                signUpForceRedirectUrl={accountEntryUrl(true, returnUrl)}
                withSignUp={false}
                transferable={false}
              />
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
function SignupControls({ returnUrl }: { returnUrl: string }) {
  const { signUp } = useSignUp();
  return (
    <SignupAgeConfirmation
      signInUrl={accountEntryUrl(false, returnUrl)}
      pendingConfirmation={
        signUp.status === "missing_requirements"
          ? signUp.unsafeMetadata.minimumAgeConfirmation
          : undefined
      }
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
  if (!user) return <p role="status">Loading your account…</p>;
  if (!readMinimumAgeConfirmation(user.unsafeMetadata.minimumAgeConfirmation))
    return (
      <SignupAgeConfirmation
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
        {() => <SignedInAccount returnUrl={returnUrl} />}
      </SignupAgeConfirmation>
    );
  return <SignedInAccount returnUrl={returnUrl} />;
}
function SignedInAccount({ returnUrl }: { returnUrl: string }) {
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (returnUrl !== "/account") window.location.assign(returnUrl);
  }, [returnUrl]);
  async function leave() {
    setPending(true);
    setError("");
    try {
      await signOut({ redirectUrl: "/account" });
    } catch {
      setError("We couldn’t sign you out. Please try again.");
      setPending(false);
    }
  }
  return (
    <div className="account-panel">
      <UserButton />
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
      <button className="button" onClick={leave} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
