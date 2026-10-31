"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

export type AccountIdentity = {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
};
export type AccountState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; identity: AccountIdentity }
  | { status: "legacy"; identity: AccountIdentity; label: string }
  | { status: "unavailable"; onRetry?: () => void };
export type AccountLinks = {
  profile: string;
  services: string;
  signIn: string;
  signUp: string;
};
export type AccountAction = {
  id: string;
  label: string;
  disabled?: boolean;
} & (
  | { href: string; onSelect?: never }
  | { href?: never; onSelect: () => void | Promise<void> }
);
export type AccountService = {
  name: string;
  role?: string;
  actions: readonly AccountAction[];
};
export type AccountMenuProps = {
  state: AccountState;
  links: AccountLinks;
  service?: AccountService;
  onSignOut: () => void | Promise<void>;
  onNavigate?: (href: string) => void;
  variant?: "default" | "compact";
  align?: "start" | "end";
};

export { accountTheme } from "./theme.js";

// Authorization of central/return origins remains in adapters. Reject executable hrefs too.
function safeHref(value: string): string | undefined {
  if (
    !value ||
    value !== value.trim() ||
    /[\\\u0000-\u0020\u007f]/.test(value) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|5c|7f)/i.test(value)
  )
    return;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.username || url.password) return;
    if (url.protocol === "https:") return url.href;
    if (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      return url.href;
  } catch {
    /* Render unsafe input as a disabled action. */
  }
}

function identityText(identity: AccountIdentity) {
  const email = identity.email?.trim() || "No primary email";
  const name =
    identity.name?.trim() || identity.email?.trim() || "Your account";
  const initials =
    name === "Your account"
      ? "I"
      : name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => Array.from(part)[0])
          .join("")
          .toUpperCase();
  return { name, email, initials };
}

function Avatar({ identity }: { identity: AccountIdentity }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const src = identity.imageUrl ? safeHref(identity.imageUrl) : undefined;
  return (
    <span className="iy-avatar" aria-hidden="true">
      {src && src !== failedUrl ? (
        // Framework-neutral image; no Next.js dependency.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          ref={(element) => {
            // An SSR image can fail before hydration attaches onError.
            if (element?.complete && element.naturalWidth === 0)
              setFailedUrl(src);
          }}
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <span>{identityText(identity).initials}</span>
      )}
    </span>
  );
}

export function AccountSummary({
  state,
  compact = false,
}: {
  state: AccountState;
  compact?: boolean;
}) {
  if (state.status === "loading")
    return (
      <span className="iy-account iy-summary" role="status" aria-busy="true">
        <span className="iy-avatar iy-placeholder" aria-hidden="true" />
        <span>Loading your account…</span>
      </span>
    );
  if (state.status === "unavailable")
    return (
      <span className="iy-account iy-summary" role="status">
        <span>Account unavailable.</span>
        {state.onRetry && (
          <button type="button" className="iy-action" onClick={state.onRetry}>
            Try again
          </button>
        )}
      </span>
    );
  if (state.status === "signed-out")
    return (
      <span className="iy-account iy-summary">
        <span className="iy-avatar" aria-hidden="true">
          I
        </span>
        <span className="iy-identity">
          <span className="iy-label">iYANJU account</span>
          <strong>You’re signed out.</strong>
        </span>
      </span>
    );
  const { name, email } = identityText(state.identity);
  return (
    <span className="iy-account iy-summary" data-compact={compact || undefined}>
      <Avatar identity={state.identity} />
      <span className="iy-identity">
        <span className="iy-label">
          {state.status === "legacy" ? state.label : "iYANJU account"}
        </span>
        <strong>{name}</strong>
        {!compact && <span className="iy-email">{email}</span>}
      </span>
    </span>
  );
}

function Icon({ kind }: { kind: "profile" | "services" | "out" | "arrow" }) {
  return (
    <svg
      className="iy-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "profile" && (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </>
      )}
      {kind === "services" && (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </>
      )}
      {kind === "out" && (
        <>
          <path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" />
        </>
      )}
      {kind === "arrow" && <path d="m7 10 5 5 5-5" />}
    </svg>
  );
}

function useSignOut(onSignOut: () => void | Promise<void>) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function run() {
    if (lock.current) return;
    lock.current = true;
    setStatus("pending");
    try {
      await onSignOut();
      if (mounted.current) setStatus("success");
    } catch {
      lock.current = false;
      if (mounted.current) setStatus("error");
    }
  }
  return { status, run };
}

const signOutError = "We couldn’t sign you out. Please try again.";
export function AccountSignOutButton({
  onSignOut,
}: {
  onSignOut: () => void | Promise<void>;
}) {
  const { status, run } = useSignOut(onSignOut);
  const button = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (status === "error") button.current?.focus();
  }, [status]);
  return (
    <div className="iy-account iy-signout">
      <button
        ref={button}
        type="button"
        className="iy-action iy-out"
        onClick={() => void run()}
        disabled={status === "pending" || status === "success"}
      >
        <Icon kind="out" />
        {status === "pending"
          ? "Signing out…"
          : status === "success"
            ? "Signed out"
            : "Sign out"}
      </button>
      {status === "error" && (
        <p className="iy-error" role="alert">
          {signOutError}
        </p>
      )}
      <span className="iy-sr-only" role="status">
        {status === "success" ? "You’re signed out." : ""}
      </span>
    </div>
  );
}

export function AccountMenu(props: AccountMenuProps) {
  const identity =
    props.state.status === "signed-in" || props.state.status === "legacy"
      ? props.state.identity
      : undefined;
  const stateKey = `${props.state.status}:${identity?.name || ""}:${identity?.email || ""}`;
  return <AccountMenuSession key={stateKey} {...props} />;
}

function AccountMenuSession({
  state,
  links,
  service,
  onSignOut,
  onNavigate,
  variant = "default",
  align = "end",
}: AccountMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [actionPending, setActionPending] = useState<string>();
  const actionLock = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const entry = useRef<HTMLDivElement>(null);
  const focusLast = useRef(false);
  const typeahead = useRef({ value: "", at: 0 });
  const { status: signOutStatus, run: signOut } = useSignOut(onSignOut);
  const effectiveState: AccountState =
    signOutStatus === "success" ? { status: "signed-out" } : state;
  const authenticated =
    effectiveState.status === "signed-in" || effectiveState.status === "legacy";
  const busy = signOutStatus === "pending" || Boolean(actionPending);
  useLayoutEffect(() => {
    if (signOutStatus === "success")
      entry.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    if (signOutStatus === "error")
      menu.current?.querySelector<HTMLButtonElement>(".iy-out")?.focus();
  }, [signOutStatus]);
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }
  function items() {
    return Array.from(
      menu.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
      ) || [],
    );
  }

  useLayoutEffect(() => {
    if (!open || !authenticated || !menu.current || !trigger.current) return;
    const popup = menu.current;
    function place() {
      if (!trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const width = popup.offsetWidth,
        height = popup.offsetHeight;
      const desired = align === "start" ? rect.left : rect.right - width;
      popup.style.left = `${Math.max(12, Math.min(desired, window.innerWidth - width - 12))}px`;
      popup.style.top = `${Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - height - 12))}px`;
      popup.style.visibility = "visible";
    }
    place();
    const available = items();
    (focusLast.current ? available.at(-1) : available[0])?.focus();
    const observer = new ResizeObserver(place);
    observer.observe(popup);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align, authenticated]);
  useEffect(() => {
    if (!open || !authenticated) return;
    function outside(event: Event) {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target))
        setOpen(false);
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, authenticated]);
  function keydown(event: KeyboardEvent<HTMLDivElement>) {
    const available = items(),
      index = available.indexOf(document.activeElement as HTMLElement);
    if (event.key === " " && event.target instanceof HTMLAnchorElement) {
      event.preventDefault();
      event.target.click();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? available.length - 1
            : (index +
                (event.key === "ArrowDown" ? 1 : -1) +
                available.length) %
              available.length;
      available[next]?.focus();
    } else if (event.key === "Tab") {
      event.preventDefault();
      const tabbable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      ).filter(
        (element) =>
          !menu.current?.contains(element) &&
          element.getClientRects().length &&
          element.tabIndex >= 0,
      );
      const position = tabbable.indexOf(trigger.current!);
      close();
      tabbable[position + (event.shiftKey ? -1 : 1)]?.focus();
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key !== " "
    ) {
      event.preventDefault();
      const now = event.timeStamp,
        value =
          (now - typeahead.current.at < 600 ? typeahead.current.value : "") +
          event.key.toLowerCase();
      typeahead.current = { value, at: now };
      const ordered = [
        ...available.slice(index + 1),
        ...available.slice(0, index + 1),
      ];
      (
        ordered.find((item) =>
          item.textContent?.trim().toLowerCase().startsWith(value),
        ) ||
        ordered.find((item) =>
          item.textContent
            ?.trim()
            .toLowerCase()
            .startsWith(event.key.toLowerCase()),
        )
      )?.focus();
    }
  }
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    close();
    if (onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  }
  function link(
    label: string,
    value: string,
    icon?: "profile" | "services",
    disabled = false,
  ) {
    const href = safeHref(value);
    return href && !disabled ? (
      <a
        className="iy-action"
        role={authenticated && open ? "menuitem" : undefined}
        href={href}
        onClick={(event) => navigate(event, href)}
      >
        {icon && <Icon kind={icon} />}
        {label}
      </a>
    ) : (
      <button
        type="button"
        className="iy-action"
        role={authenticated && open ? "menuitem" : undefined}
        disabled
      >
        {icon && <Icon kind={icon} />}
        {label}
      </button>
    );
  }
  async function select(action: AccountAction) {
    if (!action.onSelect || actionLock.current || busy) return;
    actionLock.current = true;
    setActionError(false);
    setActionPending(action.id);
    try {
      await action.onSelect();
      // A service callback may have opened a dialog and moved focus itself.
      close(Boolean(menu.current?.contains(document.activeElement)));
    } catch {
      setActionError(true);
    } finally {
      actionLock.current = false;
      setActionPending(undefined);
    }
  }
  if (!authenticated)
    return (
      <div ref={entry} className="iy-account iy-entry">
        {effectiveState.status === "signed-out" ? (
          <>
            {link("Sign in", links.signIn)}
            {link("Create account", links.signUp)}
            <span className="iy-sr-only" role="status">
              {signOutStatus === "success" ? "You’re signed out." : ""}
            </span>
          </>
        ) : (
          <AccountSummary state={effectiveState} />
        )}
      </div>
    );
  const name = identityText(effectiveState.identity).name;
  return (
    <div className="iy-account iy-menu-root" data-variant={variant}>
      <button
        ref={trigger}
        type="button"
        className="iy-trigger"
        aria-label={`${effectiveState.status === "legacy" ? effectiveState.label : "iYANJU account"}: ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          focusLast.current = false;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            focusLast.current = event.key === "ArrowUp";
            setOpen(true);
          }
        }}
      >
        <AccountSummary state={effectiveState} compact />
        <Icon kind="arrow" />
      </button>
      {open &&
        createPortal(
          <div
            className="iy-account iy-popover"
            ref={menu}
            onKeyDown={keydown}
            style={{ visibility: "hidden" }}
          >
            <div className="iy-menu-heading">
              <AccountSummary state={effectiveState} />
            </div>
            <div
              id={id}
              role="menu"
              aria-label={
                effectiveState.status === "legacy"
                  ? effectiveState.label
                  : "iYANJU account"
              }
            >
              {effectiveState.status === "signed-in" && (
                <div
                  className="iy-group"
                  role="group"
                  aria-label="iYANJU account"
                >
                  {link("Profile & security", links.profile, "profile", busy)}
                  {link("Your services", links.services, "services", busy)}
                </div>
              )}
              {service && (
                <div
                  className="iy-group iy-service"
                  role="group"
                  aria-label={`${service.name} settings${service.role ? `, ${service.name} role: ${service.role}` : ""}`}
                >
                  <p className="iy-group-label" aria-hidden="true">
                    {service.name} settings
                  </p>
                  {service.role && (
                    <p className="iy-service-role" aria-hidden="true">
                      {service.name} role: {service.role}
                    </p>
                  )}
                  {service.actions.length ? (
                    service.actions.map((action) => (
                      <div key={action.id} role="presentation">
                        {action.href !== undefined ? (
                          link(
                            action.label,
                            action.href,
                            undefined,
                            busy || action.disabled,
                          )
                        ) : (
                          <button
                            type="button"
                            className="iy-action"
                            role="menuitem"
                            disabled={busy || action.disabled}
                            onClick={() => void select(action)}
                          >
                            {actionPending === action.id
                              ? "Opening…"
                              : action.label}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <span
                      className="iy-empty"
                      role="menuitem"
                      aria-disabled="true"
                    >
                      No service settings available.
                    </span>
                  )}
                </div>
              )}
              <div className="iy-group" role="group" aria-label="Session">
                <button
                  type="button"
                  className="iy-action iy-out"
                  role="menuitem"
                  disabled={busy}
                  onClick={() => void signOut()}
                >
                  <Icon kind="out" />
                  {signOutStatus === "pending" ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
            {actionError && (
              <p className="iy-error" role="alert">
                We couldn’t open that setting. Please try again.
              </p>
            )}
            {signOutStatus === "error" && (
              <p className="iy-error" role="alert">
                {signOutError}
              </p>
            )}
            <span className="iy-sr-only" role="status">
              {busy
                ? signOutStatus === "pending"
                  ? "Signing out…"
                  : "Opening setting…"
                : ""}
            </span>
          </div>,
          document.body,
        )}
    </div>
  );
}
