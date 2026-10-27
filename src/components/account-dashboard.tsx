"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserAvatar, UserProfile, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Arrow } from "./brand";
import {
  accountServiceDisplay,
  accountServiceOpenUrl,
  activationDateLabel,
  hasConvexAudience,
  parseAccountServices,
  type AccountServiceSummary,
} from "../lib/account-services-view";

type DashboardProps = {
  onSignOut: () => void;
  signingOut: boolean;
  signOutError: string;
};
export function AccountDashboard({
  onSignOut,
  signingOut,
  signOutError,
}: DashboardProps) {
  const { user } = useUser();
  const params = useSearchParams();
  const profile = params.get("view") === "profile";
  if (!user) return <p role="status">Loading your account…</p>;
  const email = user.primaryEmailAddress?.emailAddress;
  const name = user.fullName || user.username || email || "Your account";
  return (
    <div className="account-dashboard">
      <div className="account-dashboard-head">
        <div className="account-person">
          <UserAvatar
            appearance={{
              elements: { avatarBox: { width: "44px", height: "44px" } },
            }}
          />
          <div>
            <strong>{name}</strong>
            {email && email !== name && <p>{email}</p>}
          </div>
        </div>
        <button
          className="button button-secondary"
          onClick={onSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
      {signOutError && (
        <p className="account-status-error" role="alert">
          {signOutError}
        </p>
      )}
      <nav className="account-dashboard-tabs" aria-label="Account sections">
        <Link
          href="/account"
          prefetch={false}
          aria-current={!profile ? "page" : undefined}
        >
          Services
        </Link>
        <Link
          href="/account?view=profile"
          prefetch={false}
          aria-current={profile ? "page" : undefined}
        >
          Profile &amp; security
        </Link>
      </nav>
      {profile ? (
        <section
          className="account-profile"
          aria-label="Shared account profile and security"
        >
          <p className="account-profile-note">
            These settings apply to your shared iYANJU account.
          </p>
          <UserProfile
            key={user.id}
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: "#18181b",
                fontFamily: "var(--font-sans), sans-serif",
                borderRadius: "0",
              },
              elements: {
                rootBox: { width: "100%", maxWidth: "none" },
                cardBox: {
                  width: "100%",
                  maxWidth: "none",
                  boxShadow: "none",
                  border: "0",
                },
                card: { width: "100%", boxShadow: "none", border: "0" },
                navbar: { backgroundColor: "#f2ede0", boxShadow: "none" },
                scrollBox: { boxShadow: "none" },
              },
            }}
          />
        </section>
      ) : (
        <AccountServices key={user.id} userId={user.id} />
      )}
    </div>
  );
}

type ServiceState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "ready"; summary: AccountServiceSummary };
function AccountServices({ userId }: { userId: string }) {
  const { getToken, sessionClaims } = useAuth();
  const [state, setState] = useState<ServiceState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const audience = sessionClaims?.aud;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      try {
        if (!hasConvexAudience(audience))
          throw new Error("Service connection unavailable");
        const token = await getToken({ skipCache: true });
        if (!active) return;
        if (!token) throw new Error("Sign-in unavailable");
        const response = await fetch("/account/services", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "omit",
          cache: "no-store",
          redirect: "error",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Service lookup unavailable");
        const summary = parseAccountServices(await response.json());
        if (!summary) throw new Error("Invalid service summary");
        if (active) setState({ kind: "ready", summary });
      } catch {
        if (active) setState({ kind: "unavailable" });
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [getToken, audience, attempt, userId]);
  const retry = () => {
    setState({ kind: "loading" });
    setAttempt((value) => value + 1);
  };
  const activated =
    state.kind === "ready"
      ? state.summary.services.filter(
          (service) => service.state === "activated",
        )
      : [];
  const partial =
    state.kind === "ready" &&
    state.summary.services.some((service) => service.state === "unavailable");
  return (
    <section
      className="account-services"
      aria-labelledby="account-services-title"
    >
      <div className="account-section-heading">
        <h2 id="account-services-title">Your services</h2>
        <Link href="/tools" className="text-link">
          Browse applications <Arrow />
        </Link>
      </div>
      {state.kind === "loading" && (
        <p className="account-service-state" role="status">
          Checking your services…
        </p>
      )}
      {state.kind === "unavailable" && (
        <div className="account-service-state" role="status">
          <p>Your service list is unavailable right now.</p>
          <button className="button button-secondary" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {state.kind === "ready" && (
        <>
          {activated.length > 0 && (
            <ul
              className="account-service-list"
              aria-label="Activated services"
            >
              {activated.map((service) => {
                const display = accountServiceDisplay[service.serviceId];
                const openUrl = accountServiceOpenUrl(
                  service.serviceId,
                  window.location.origin,
                );
                return (
                  <li key={service.serviceId}>
                    <div
                      className="account-service-mark"
                      data-tone={display.tone}
                      aria-hidden="true"
                    >
                      {display.logo ? (
                        <Image
                          src={display.logo}
                          width={108}
                          height={34}
                          alt=""
                        />
                      ) : (
                        <span>{display.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="account-service-copy">
                      <h3>{display.name}</h3>
                      <p>{display.category}</p>
                      <small>{activationDateLabel(service.activation)}</small>
                    </div>
                    {openUrl && (
                      <a
                        className="text-link account-service-open"
                        href={openUrl}
                      >
                        Open {display.name} <Arrow diagonal />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {partial && (
            <div className="account-service-note" role="status">
              <p>Some service checks are unavailable.</p>
              <button className="text-link" onClick={retry}>
                Try again
              </button>
            </div>
          )}
          {activated.length === 0 && !partial && (
            <div className="account-service-state">
              <h3>No activated services yet.</h3>
              <p>Explore the applications to get started.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
