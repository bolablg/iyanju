"use client";
import { useState } from "react";
import {
  AccountMenu,
  AccountSummary,
  AccountSignOutButton,
  type AccountState,
} from "@iyanju/account-ui";
import { AccountDashboard } from "../../src/components/account-dashboard";

const identity = {
  name: "Ada Example",
  email: "ada@example.invalid",
  imageUrl: "/missing-avatar.png",
};
export default function Fixture() {
  const [state, setState] = useState<AccountState>({
    status: "signed-in",
    identity,
  });
  const [fail, setFail] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [actionFailed, setActionFailed] = useState(true);
  const [actions, setActions] = useState(0);
  async function leave() {
    setAttempts((value) => value + 1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (fail) throw new Error("Fixture failure");
  }
  return (
    <main>
      <h1>Shared account verification</h1>
      <p>
        This page uses synthetic identity and service data. No real account is
        changed.
      </p>
      <div className="fixture-controls">
        <button onClick={() => setState({ status: "signed-in", identity })}>
          Shared session
        </button>
        <button onClick={() => setState({ status: "signed-out" })}>
          Signed out fixture
        </button>
        <button onClick={() => setState({ status: "loading" })}>
          Loading fixture
        </button>
        <button
          onClick={() =>
            setState({
              status: "legacy",
              identity,
              label: "Legacy Example account",
            })
          }
        >
          Legacy fixture
        </button>
        <button
          onClick={() =>
            setState({
              status: "unavailable",
              onRetry: () => setState({ status: "signed-in", identity }),
            })
          }
        >
          Unavailable fixture
        </button>
        <button onClick={() => setFail(!fail)}>
          Signout failure: {fail ? "on" : "off"}
        </button>
        <button onClick={() => setActionFailed(!actionFailed)}>
          Action failure: {actionFailed ? "on" : "off"}
        </button>
        <output aria-label="Signout attempts">{attempts}</output>
        <output aria-label="Service actions">{actions}</output>
      </div>
      <div className="hostile-app">
        <div className="hostile-header">
          <AccountMenu
            state={state}
            links={{
              profile: "/account?view=profile",
              services: "/account",
              signIn: "/account",
              signUp: "/account/sign-up",
            }}
            service={{
              name: "Example",
              role: "Editor",
              actions: [
                { id: "settings", label: "Settings", href: "/settings" },
                {
                  id: "connection",
                  label: "Connections",
                  onSelect: async () => {
                    setActions((value) => value + 1);
                    if (actionFailed) throw new Error("Fixture action failed");
                  },
                },
                {
                  id: "dialog",
                  label: "Invite teammate",
                  onSelect: () => {
                    const dialog =
                      document.querySelector<HTMLDialogElement>(
                        "#service-dialog",
                      );
                    dialog?.showModal();
                    dialog?.querySelector<HTMLInputElement>("input")?.focus();
                  },
                },
                {
                  id: "disabled",
                  label: "Admin settings",
                  href: "/admin",
                  disabled: true,
                },
              ],
            }}
            onSignOut={leave}
          />
        </div>
      </div>
      <dialog id="service-dialog" aria-label="Invite teammate">
        <label>
          Invite email
          <input type="email" />
        </label>
        <button
          type="button"
          onClick={() =>
            document
              .querySelector<HTMLDialogElement>("#service-dialog")
              ?.close()
          }
        >
          Close invitation
        </button>
      </dialog>
      <a href="/after" className="after-menu">
        After menu
      </a>
      <section className="fixture-summary">
        <h2>Identity summary</h2>
        <AccountSummary state={state} />
      </section>
      <section className="fixture-signout">
        <h2>Standalone session action</h2>
        <AccountSignOutButton key={state.status} onSignOut={leave} />
      </section>
      <section className="fixture-dashboard">
        <h2>Central adapter</h2>
        <AccountDashboard onSignOut={leave} />
      </section>
    </main>
  );
}
