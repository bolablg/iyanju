"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserProfile, useAuth, useUser } from "@clerk/nextjs";
import {
  AccountMenu,
  AccountSummary,
  accountTheme,
  type AccountState,
} from "@iyanju/account-ui";
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
  onSignOut: () => Promise<void>;
};
export function AccountDashboard({ onSignOut }: DashboardProps) {
  const { user } = useUser();
  const params = useSearchParams();
  const profile = params.get("view") === "profile";
  if (!user) return <AccountSummary state={{ status: "loading" }} />;
  const state: AccountState = {
    status: "signed-in",
    identity: {
      name: user.fullName || user.username,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.hasImage ? user.imageUrl : null,
    },
  };
  return (
    <div className="account-dashboard">
      <div className="account-dashboard-head">
        <AccountSummary state={state} />
        <AccountMenu
          key={user.id}
          state={state}
          links={{
            profile: "/account?view=profile",
            services: "/account",
            signIn: "/account",
            signUp: "/account/sign-up",
          }}
          onSignOut={onSignOut}
          variant="compact"
        />
      </div>
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
          className="account-profile iy-account-theme"
          aria-label="Shared account profile and security"
        >
          <p className="account-profile-note">
            These settings apply to your shared iYANJU account.
          </p>
          <UserProfile
            key={user.id}
            routing="hash"
            appearance={{
              ...accountTheme,
              elements: {
                ...accountTheme.elements,
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
  const restricted =
    state.kind === "ready" &&
    state.summary.services.some((service) => service.state === "restricted");
  const permitted =
    state.kind === "ready"
      ? state.summary.services.filter(
          (service) => service.state !== "restricted",
        )
      : [];
  return (
    <section
      className="account-services"
      aria-labelledby="account-services-title"
    >
      <div className="account-section-heading">
        <h2 id="account-services-title">Your services</h2>
        {state.kind === "ready" && !restricted && (
          <Link href="/tools" className="text-link">
            Browse applications <Arrow />
          </Link>
        )}
      </div>
      {restricted && (
        <p className="account-profile-note">
          This account has access to{" "}
          {permitted
            .map((service) => accountServiceDisplay[service.serviceId].name)
            .join(", ")}
          . Each application manages its own permissions.
        </p>
      )}
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
                          width={display.logoWidth}
                          height={display.logoHeight}
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
              <p>
                {restricted
                  ? "Open your allowed application to get started."
                  : "Explore the applications to get started."}
              </p>
              {restricted &&
                permitted.map((service) => {
                  const openUrl = accountServiceOpenUrl(
                    service.serviceId,
                    window.location.origin,
                  );
                  return openUrl ? (
                    <p key={service.serviceId}>
                      <a className="text-link" href={openUrl}>
                        Open {accountServiceDisplay[service.serviceId].name}{" "}
                        <Arrow diagonal />
                      </a>
                    </p>
                  ) : null;
                })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
