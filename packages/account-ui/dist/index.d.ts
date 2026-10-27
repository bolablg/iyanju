export type AccountIdentity = {
    name?: string | null;
    email?: string | null;
    imageUrl?: string | null;
};
export type AccountState = {
    status: "loading";
} | {
    status: "signed-out";
} | {
    status: "signed-in";
    identity: AccountIdentity;
} | {
    status: "legacy";
    identity: AccountIdentity;
    label: string;
} | {
    status: "unavailable";
    onRetry?: () => void;
};
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
} & ({
    href: string;
    onSelect?: never;
} | {
    href?: never;
    onSelect: () => void | Promise<void>;
});
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
export declare function AccountSummary({ state, compact, }: {
    state: AccountState;
    compact?: boolean;
}): import("react").JSX.Element;
export declare function AccountSignOutButton({ onSignOut, }: {
    onSignOut: () => void | Promise<void>;
}): import("react").JSX.Element;
export declare function AccountMenu(props: AccountMenuProps): import("react").JSX.Element;
