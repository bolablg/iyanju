"use client";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignIn,
  SignUp,
  useClerk,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { emailLink } from "@/content/site";
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
                Contact Bolaji
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
      <h2>Your identity is connected.</h2>
      <p>
        This sign-in does not grant access to a Kazi workspace. Product
        membership and permissions are checked by each tool. For product data or
        whole-account removal, contact the operator and specify the scope.
      </p>
      <button className="button" onClick={leave} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
