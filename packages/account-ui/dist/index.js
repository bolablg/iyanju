"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { createPortal } from "react-dom";
export { accountTheme } from "./theme.js";
// Authorization of central/return origins remains in adapters. Reject executable hrefs too.
function safeHref(value) {
    if (!value ||
        value !== value.trim() ||
        /[\\\u0000-\u0020\u007f]/.test(value) ||
        /%(?:0[0-9a-f]|1[0-9a-f]|5c|7f)/i.test(value))
        return;
    if (value.startsWith("/") && !value.startsWith("//"))
        return value;
    try {
        const url = new URL(value);
        if (url.username || url.password)
            return;
        if (url.protocol === "https:")
            return url.href;
        if (url.protocol === "http:" &&
            ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
            return url.href;
    }
    catch {
        /* Render unsafe input as a disabled action. */
    }
}
function identityText(identity) {
    const email = identity.email?.trim() || "No primary email";
    const name = identity.name?.trim() || identity.email?.trim() || "Your account";
    const initials = name === "Your account"
        ? "I"
        : name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => Array.from(part)[0])
            .join("")
            .toUpperCase();
    return { name, email, initials };
}
function Avatar({ identity }) {
    const [failedUrl, setFailedUrl] = useState();
    const src = identity.imageUrl ? safeHref(identity.imageUrl) : undefined;
    return (_jsx("span", { className: "iy-avatar", "aria-hidden": "true", children: src && src !== failedUrl ? (
        // Framework-neutral image; no Next.js dependency.
        // eslint-disable-next-line @next/next/no-img-element
        _jsx("img", { src: src, alt: "", referrerPolicy: "no-referrer", ref: (element) => {
                // An SSR image can fail before hydration attaches onError.
                if (element?.complete && element.naturalWidth === 0)
                    setFailedUrl(src);
            }, onError: () => setFailedUrl(src) })) : (_jsx("span", { children: identityText(identity).initials })) }));
}
export function AccountSummary({ state, compact = false, }) {
    if (state.status === "loading")
        return (_jsxs("span", { className: "iy-account iy-summary", role: "status", "aria-busy": "true", children: [_jsx("span", { className: "iy-avatar iy-placeholder", "aria-hidden": "true" }), _jsx("span", { children: "Loading your account\u2026" })] }));
    if (state.status === "unavailable")
        return (_jsxs("span", { className: "iy-account iy-summary", role: "status", children: [_jsx("span", { children: "Account unavailable." }), state.onRetry && (_jsx("button", { type: "button", className: "iy-action", onClick: state.onRetry, children: "Try again" }))] }));
    if (state.status === "signed-out")
        return (_jsxs("span", { className: "iy-account iy-summary", children: [_jsx("span", { className: "iy-avatar", "aria-hidden": "true", children: "I" }), _jsxs("span", { className: "iy-identity", children: [_jsx("span", { className: "iy-label", children: "iYANJU account" }), _jsx("strong", { children: "You\u2019re signed out." })] })] }));
    const { name, email } = identityText(state.identity);
    return (_jsxs("span", { className: "iy-account iy-summary", "data-compact": compact || undefined, children: [_jsx(Avatar, { identity: state.identity }), _jsxs("span", { className: "iy-identity", children: [_jsx("span", { className: "iy-label", children: state.status === "legacy" ? state.label : "iYANJU account" }), _jsx("strong", { children: name }), !compact && _jsx("span", { className: "iy-email", children: email })] })] }));
}
function Icon({ kind }) {
    return (_jsxs("svg", { className: "iy-icon", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [kind === "profile" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "8", r: "3" }), _jsx("path", { d: "M5 21v-2a7 7 0 0 1 14 0v2" })] })), kind === "services" && (_jsxs(_Fragment, { children: [_jsx("rect", { x: "3", y: "3", width: "7", height: "7" }), _jsx("rect", { x: "14", y: "3", width: "7", height: "7" }), _jsx("rect", { x: "3", y: "14", width: "7", height: "7" }), _jsx("rect", { x: "14", y: "14", width: "7", height: "7" })] })), kind === "out" && (_jsx(_Fragment, { children: _jsx("path", { d: "M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" }) })), kind === "arrow" && _jsx("path", { d: "m7 10 5 5 5-5" })] }));
}
function useSignOut(onSignOut) {
    const [status, setStatus] = useState("idle");
    const lock = useRef(false);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    async function run() {
        if (lock.current)
            return;
        lock.current = true;
        setStatus("pending");
        try {
            await onSignOut();
            if (mounted.current)
                setStatus("success");
        }
        catch {
            lock.current = false;
            if (mounted.current)
                setStatus("error");
        }
    }
    return { status, run };
}
const signOutError = "We couldn’t sign you out. Please try again.";
export function AccountSignOutButton({ onSignOut, }) {
    const { status, run } = useSignOut(onSignOut);
    const button = useRef(null);
    useLayoutEffect(() => {
        if (status === "error")
            button.current?.focus();
    }, [status]);
    return (_jsxs("div", { className: "iy-account iy-signout", children: [_jsxs("button", { ref: button, type: "button", className: "iy-action iy-out", onClick: () => void run(), disabled: status === "pending" || status === "success", children: [_jsx(Icon, { kind: "out" }), status === "pending"
                        ? "Signing out…"
                        : status === "success"
                            ? "Signed out"
                            : "Sign out"] }), status === "error" && (_jsx("p", { className: "iy-error", role: "alert", children: signOutError })), _jsx("span", { className: "iy-sr-only", role: "status", children: status === "success" ? "You’re signed out." : "" })] }));
}
export function AccountMenu(props) {
    const identity = props.state.status === "signed-in" || props.state.status === "legacy"
        ? props.state.identity
        : undefined;
    const stateKey = `${props.state.status}:${identity?.name || ""}:${identity?.email || ""}`;
    return _jsx(AccountMenuSession, { ...props }, stateKey);
}
function AccountMenuSession({ state, links, service, onSignOut, onNavigate, variant = "default", align = "end", }) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState(false);
    const [actionPending, setActionPending] = useState();
    const actionLock = useRef(false);
    const trigger = useRef(null);
    const menu = useRef(null);
    const entry = useRef(null);
    const focusLast = useRef(false);
    const typeahead = useRef({ value: "", at: 0 });
    const { status: signOutStatus, run: signOut } = useSignOut(onSignOut);
    const effectiveState = signOutStatus === "success" ? { status: "signed-out" } : state;
    const authenticated = effectiveState.status === "signed-in" || effectiveState.status === "legacy";
    const busy = signOutStatus === "pending" || Boolean(actionPending);
    useLayoutEffect(() => {
        if (signOutStatus === "success")
            entry.current?.querySelector("a[href]")?.focus();
        if (signOutStatus === "error")
            menu.current?.querySelector(".iy-out")?.focus();
    }, [signOutStatus]);
    function close(restoreFocus = false) {
        setOpen(false);
        if (restoreFocus)
            trigger.current?.focus();
    }
    function items() {
        return Array.from(menu.current?.querySelectorAll('[role="menuitem"]:not(:disabled):not([aria-disabled="true"])') || []);
    }
    useLayoutEffect(() => {
        if (!open || !authenticated || !menu.current || !trigger.current)
            return;
        const popup = menu.current;
        function place() {
            if (!trigger.current)
                return;
            const rect = trigger.current.getBoundingClientRect();
            const width = popup.offsetWidth, height = popup.offsetHeight;
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
        if (!open || !authenticated)
            return;
        function outside(event) {
            const target = event.target;
            if (!menu.current?.contains(target) && !trigger.current?.contains(target))
                setOpen(false);
        }
        function escape(event) {
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
    function keydown(event) {
        const available = items(), index = available.indexOf(document.activeElement);
        if (event.key === " " && event.target instanceof HTMLAnchorElement) {
            event.preventDefault();
            event.target.click();
        }
        else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const next = event.key === "Home"
                ? 0
                : event.key === "End"
                    ? available.length - 1
                    : (index +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        available.length) %
                        available.length;
            available[next]?.focus();
        }
        else if (event.key === "Tab") {
            event.preventDefault();
            const tabbable = Array.from(document.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter((element) => !menu.current?.contains(element) &&
                element.getClientRects().length &&
                element.tabIndex >= 0);
            const position = tabbable.indexOf(trigger.current);
            close();
            tabbable[position + (event.shiftKey ? -1 : 1)]?.focus();
        }
        else if (event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            event.key !== " ") {
            event.preventDefault();
            const now = event.timeStamp, value = (now - typeahead.current.at < 600 ? typeahead.current.value : "") +
                event.key.toLowerCase();
            typeahead.current = { value, at: now };
            const ordered = [
                ...available.slice(index + 1),
                ...available.slice(0, index + 1),
            ];
            (ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(value)) ||
                ordered.find((item) => item.textContent
                    ?.trim()
                    .toLowerCase()
                    .startsWith(event.key.toLowerCase())))?.focus();
        }
    }
    function navigate(event, href) {
        if (event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey)
            return;
        close();
        if (onNavigate) {
            event.preventDefault();
            onNavigate(href);
        }
    }
    function link(label, value, icon, disabled = false) {
        const href = safeHref(value);
        return href && !disabled ? (_jsxs("a", { className: "iy-action", role: authenticated && open ? "menuitem" : undefined, href: href, onClick: (event) => navigate(event, href), children: [icon && _jsx(Icon, { kind: icon }), label] })) : (_jsxs("button", { type: "button", className: "iy-action", role: authenticated && open ? "menuitem" : undefined, disabled: true, children: [icon && _jsx(Icon, { kind: icon }), label] }));
    }
    async function select(action) {
        if (!action.onSelect || actionLock.current || busy)
            return;
        actionLock.current = true;
        setActionError(false);
        setActionPending(action.id);
        try {
            await action.onSelect();
            // A service callback may have opened a dialog and moved focus itself.
            close(Boolean(menu.current?.contains(document.activeElement)));
        }
        catch {
            setActionError(true);
        }
        finally {
            actionLock.current = false;
            setActionPending(undefined);
        }
    }
    if (!authenticated)
        return (_jsx("div", { ref: entry, className: "iy-account iy-entry", children: effectiveState.status === "signed-out" ? (_jsxs(_Fragment, { children: [link("Sign in", links.signIn), link("Create account", links.signUp), _jsx("span", { className: "iy-sr-only", role: "status", children: signOutStatus === "success" ? "You’re signed out." : "" })] })) : (_jsx(AccountSummary, { state: effectiveState })) }));
    const name = identityText(effectiveState.identity).name;
    return (_jsxs("div", { className: "iy-account iy-menu-root", "data-variant": variant, children: [_jsxs("button", { ref: trigger, type: "button", className: "iy-trigger", "aria-label": `${effectiveState.status === "legacy" ? effectiveState.label : "iYANJU account"}: ${name}`, "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? id : undefined, onClick: () => {
                    focusLast.current = false;
                    setOpen(!open);
                }, onKeyDown: (event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        focusLast.current = event.key === "ArrowUp";
                        setOpen(true);
                    }
                }, children: [_jsx(AccountSummary, { state: effectiveState, compact: true }), _jsx(Icon, { kind: "arrow" })] }), open &&
                createPortal(_jsxs("div", { className: "iy-account iy-popover", ref: menu, onKeyDown: keydown, style: { visibility: "hidden" }, children: [_jsx("div", { className: "iy-menu-heading", children: _jsx(AccountSummary, { state: effectiveState }) }), _jsxs("div", { id: id, role: "menu", "aria-label": effectiveState.status === "legacy"
                                ? effectiveState.label
                                : "iYANJU account", children: [effectiveState.status === "signed-in" && (_jsxs("div", { className: "iy-group", role: "group", "aria-label": "iYANJU account", children: [link("Profile & security", links.profile, "profile", busy), link("Your services", links.services, "services", busy)] })), service && (_jsxs("div", { className: "iy-group iy-service", role: "group", "aria-label": `${service.name} settings${service.role ? `, ${service.name} role: ${service.role}` : ""}`, children: [_jsxs("p", { className: "iy-group-label", "aria-hidden": "true", children: [service.name, " settings"] }), service.role && (_jsxs("p", { className: "iy-service-role", "aria-hidden": "true", children: [service.name, " role: ", service.role] })), service.actions.length ? (service.actions.map((action) => (_jsx("div", { role: "presentation", children: action.href !== undefined ? (link(action.label, action.href, undefined, busy || action.disabled)) : (_jsx("button", { type: "button", className: "iy-action", role: "menuitem", disabled: busy || action.disabled, onClick: () => void select(action), children: actionPending === action.id
                                                    ? "Opening…"
                                                    : action.label })) }, action.id)))) : (_jsx("span", { className: "iy-empty", role: "menuitem", "aria-disabled": "true", children: "No service settings available." }))] })), _jsx("div", { className: "iy-group", role: "group", "aria-label": "Session", children: _jsxs("button", { type: "button", className: "iy-action iy-out", role: "menuitem", disabled: busy, onClick: () => void signOut(), children: [_jsx(Icon, { kind: "out" }), signOutStatus === "pending" ? "Signing out…" : "Sign out"] }) })] }), actionError && (_jsx("p", { className: "iy-error", role: "alert", children: "We couldn\u2019t open that setting. Please try again." })), signOutStatus === "error" && (_jsx("p", { className: "iy-error", role: "alert", children: signOutError })), _jsx("span", { className: "iy-sr-only", role: "status", children: busy
                                ? signOutStatus === "pending"
                                    ? "Signing out…"
                                    : "Opening setting…"
                                : "" })] }), document.body)] }));
}
