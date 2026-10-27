# @iyanju/account-ui

One React implementation of the shared iYANJU account surface. The core has no Clerk SDK, router, database, storage or network API dependency. React and React DOM are peers; Next.js and React SPAs use the same build. Import `@iyanju/account-ui/styles.css` once in the application's CSS entry. It includes Plus Jakarta Sans and its OFL license.

```tsx
import { AccountMenu, AccountSummary, accountTheme } from "@iyanju/account-ui";
import "@iyanju/account-ui/styles.css";

<AccountMenu
  state={{
    status: "signed-in",
    identity: {
      name: user.fullName || user.username,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.hasImage ? user.imageUrl : null,
    },
  }}
  links={validatedAccountLinks}
  service={{
    name: "Example",
    actions: [{ id: "settings", label: "Settings", href: "/settings" }],
  }}
  onSignOut={async () => {
    await signOutAndLocalCleanup();
  }}
/>;
```

`AccountLinks` has `profile`, `services`, `signIn`, and `signUp` URLs. Production profile and services destinations are `https://iyanju.com/account?view=profile` and `https://iyanju.com/account`. Sign-in and sign-up use existing adapter validation for central origin and exact return origins. Development/staging must use their configured non-production central identity origin. This presentation package rejects executable/ambiguous URLs; it does not authorize return destinations or grant service access.

`AccountState` is `loading`, `signed-out`, `signed-in` with `identity`, `legacy` with `identity` and an honest service `label`, or `unavailable` with optional `onRetry`. The identity accepts nullable `name`, `email`, and `imageUrl` from the central Clerk user in shared mode. Fallbacks are name → email → “Your account”, “No primary email”, and initials for missing/broken avatars. Legacy mode does not show shared account management links.

`AccountService` contains `name`, optional service `role`, and `actions`. Each action has `id`, `label`, optional `disabled`, and exactly one of `href` or async-capable `onSelect`. Only pass currently authorized service actions. Role descriptions are explicitly labeled with the service name. Empty actions show an honest empty state.

`AccountMenu` also supports `variant="compact"`, `align="start"`, and `onNavigate(href)` for router adapters. Omit `onNavigate` for native anchors, or handle both absolute central and relative service destinations. Modified clicks retain normal browser behavior. Menu navigation supports arrows, Home/End, typeahead, Escape with focus return, Tab, and outside dismissal. The popup is portaled to the document body to avoid sidebar clipping and remains inside the viewport. Shared elements have 44px targets and scoped CSS resets. Host code may position the root but must not override shared internals. Do not put the menu inside an interactive element.

Sign-out adapters must resolve only after successful sign-out/local cleanup and reject on failure. The package prevents duplicate submissions, announces progress/success and allows retry. Sign-out is a session action, not service-data deletion, provider disconnection, or a promise of global token revocation. `AccountSignOutButton` exposes the same behavior for non-menu surfaces. Key identity-bound adapters by stable authenticated user/session ID to reset any local action state on identity replacement.

`AccountSummary` accepts `state` and optional `compact`. `accountTheme` is a Clerk-compatible appearance object. The central profile uses `className="iy-account-theme"` and this theme. Service profile/security editors should link to the central destination; service settings remain local.

## Distribution and maintenance

Canonical source lives here. Built `dist/` and a versioned npm archive in `releases/` are committed so clean consumers need no build hooks, registry publication or local sibling checkout. Pin the archive's full Git commit URL and commit the consumer's lockfile. Do not depend on a moving branch URL. `packages/account-ui/releases.json` records version, archive path and SHA-256; the repository handoff supplies the exact immutable URL for a released revision.

From the repository root, run `npm ci`, `npm run build:account-ui`, then `npm run pack:account-ui`. Rebuild and verify source/dist/archive parity before a release; package version changes require a new archive. Run `node tests/account-ui-consumers.mjs` for independent React 18 SPA and Next.js archive installations/builds. Set `IYANJU_ACCOUNT_UI_ARCHIVE` to the immutable HTTPS archive URL to verify remote consumption. The test compares every installed build/type/style/font file with the canonical build.

For synthetic browser checks, run `node tests/prepare-account-ui-fixture.mjs`, start `node node_modules/next/dist/bin/next dev test-results/account-ui-app --webpack --hostname 127.0.0.1 --port 43127`, then run `python tests/account-ui-browser.py` using the project's Playwright environment. The fixture substitutes Clerk with a test-only adapter, exercises the actual central dashboard, and writes desktop/mobile evidence under ignored `test-results/`. It creates or signs out no real account. The ordinary public browser suite remains `tests/browser.py`.

Root unit/browser checks cover account state, interaction and central adapter boundaries. Fonts are bundled locally; the package never requests a remote font, stores identity, accepts a token, or shares business records. The serializable theme is also available from `@iyanju/account-ui/theme` for React server components.
