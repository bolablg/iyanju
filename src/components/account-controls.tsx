"use client";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignIn,
  SignUp,
  UserButton,
  useClerk,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { emailLink } from "@/content/site";
import Link from "next/link";
export function AccountControls({ signUp = false }: { signUp?: boolean }) {
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
              and Kazi links remain available.{" "}
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
              <SignUp routing="hash" signInUrl="/account" />
            ) : (
              <SignIn routing="hash" signUpUrl="/account/sign-up" />
            )}
          </div>
        </Show>
        <Show when="signed-in">
          <SignedInControls />
        </Show>
      </ClerkLoaded>
    </>
  );
}
function SignedInControls() {
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
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
