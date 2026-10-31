import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountMenu, AccountSummary } from "@iyanju/account-ui";
import { accountTheme } from "@iyanju/account-ui/theme";

test("shared identity fallbacks and legacy labels remain honest", () => {
  const summary = (state) =>
    renderToStaticMarkup(createElement(AccountSummary, { state }));
  assert.match(
    summary({ status: "signed-in", identity: {} }),
    /iYANJU account.*Your account.*No primary email/,
  );
  assert.match(
    summary({
      status: "signed-in",
      identity: { name: " ", email: "ada@example.invalid" },
    }),
    /ada@example.invalid/,
  );
  assert.match(
    summary({ status: "signed-in", identity: { name: "<script>" } }),
    /&lt;script&gt;/,
  );
  const legacy = summary({
    status: "legacy",
    identity: { name: "Ada" },
    label: "Legacy Example account",
  });
  assert.match(legacy, /Legacy Example account/);
  assert.doesNotMatch(legacy, /iYANJU account/);
  assert.doesNotMatch(summary({ status: "loading" }), /Ada|No primary email/);
});

test("signed-out actions accept exact safe routes and reject executable/ambiguous URLs", () => {
  function render(signIn) {
    return renderToStaticMarkup(
      createElement(AccountMenu, {
        state: { status: "signed-out" },
        links: {
          profile: "/account?view=profile",
          services: "/account",
          signIn,
          signUp: "/account/sign-up",
        },
        onSignOut: async () => {},
      }),
    );
  }
  assert.match(
    render("http://127.0.0.1:43127/account?redirect_url=%2Faccount"),
    /href="http:\/\/127.0.0.1:43127\/account/,
  );
  for (const value of [
    "javascript:alert(1)",
    "//evil.example",
    "/\\evil",
    " https://example.com",
    "https://user:password@example.com",
    "http://untrusted.example",
    "/%0a/evil",
  ])
    assert.doesNotMatch(render(value), /href="[^"]*">Sign in/);
  assert.match(render("https://iyanju.com/account"), /Sign in/);
  assert.match(render("/account"), /Create account/);
});

test("appearance and bundled font never depend on the host's font or a remote font service", async () => {
  assert.equal(
    accountTheme.variables.fontFamily,
    '"iYANJU Account", sans-serif',
  );
  assert.equal(accountTheme.variables.borderRadius, "12px");
  const css = await readFile(
    new URL("../packages/account-ui/dist/styles.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /url\("\.\/fonts\/plus-jakarta-sans.woff2"\)/);
  assert.doesNotMatch(css, /fonts.googleapis|@import/);
  const font = await readFile(
    new URL(
      "../packages/account-ui/dist/fonts/plus-jakarta-sans.woff2",
      import.meta.url,
    ),
  );
  assert.equal(font.subarray(0, 4).toString(), "wOF2");
});
