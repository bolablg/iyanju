import { test } from "node:test";
import assert from "node:assert/strict";
import {
  accountReturnUrl,
  accountEntryUrl,
  PRODUCTION_ACCOUNT_ORIGINS,
} from "../src/lib/account-routing.ts";

test("account completion accepts only exact approved origins", () => {
  const allowed = [...PRODUCTION_ACCOUNT_ORIGINS];
  for (const url of [
    "https://wlan.iyanju.com/workspace?tab=drafts#recent",
    "https://kazi.iyanju.com/",
    "https://playkin.iyanju.com/library",
  ])
    assert.equal(accountReturnUrl(url, allowed), url);
  for (const url of [
    undefined,
    ["https://wlan.iyanju.com/", "https://evil.example"],
    "https://evil.example",
    "//wlan.iyanju.com",
    "https://wlan.iyanju.com.evil.example/",
    "https://wlan.iyanju.com@evil.example/",
    "https://a:b@wlan.iyanju.com/",
    "https://wlan.iyanju.com:444/",
    "http://wlan.iyanju.com/",
    "javascript:alert(1)",
    "/\\evil.example",
    "https://wlan.iyanju.com\\@evil.example",
    " https://wlan.iyanju.com",
    "https://wlan.iyanju.com/%0d%0aLocation:evil",
    "https://wlan.iyanju.com/%5c/evil",
    "/account?redirect_url=https://evil.example",
    "https://iyanju.com/account/sign-up?redirect_url=https://evil.example",
  ])
    assert.equal(accountReturnUrl(url, allowed), "/account", String(url));
  assert.equal(accountReturnUrl("https://wlan.iyanju.com/", []), "/account");
});

test("login and signup preserve a validated destination without adding a second parameter", () => {
  const destination = "https://wlan.iyanju.com/drafts?name=a&value=b#editor";
  for (const signUp of [false, true]) {
    const url = new URL(
      accountEntryUrl(signUp, destination),
      "https://iyanju.com",
    );
    assert.equal(url.pathname, signUp ? "/account/sign-up" : "/account");
    assert.deepEqual([...url.searchParams], [["redirect_url", destination]]);
  }
  assert.equal(accountEntryUrl(true), "/account/sign-up");
  assert.equal(accountReturnUrl("/tools", []), "/tools");
});

test("production sign-in resumes only the exact hosted OAuth consent page", () => {
  const consent =
    "https://accounts.iyanju.com/oauth-consent?client_id=https%3A%2F%2Fchatgpt.com%2Foauth%2Fcodex%2Fclient.json&state=test&redirect_uri=http%3A%2F%2F127.0.0.1%3A12345%2Fcallback";
  assert.equal(
    accountReturnUrl(consent, [...PRODUCTION_ACCOUNT_ORIGINS]),
    consent,
  );
  for (const origins of [[], ["http://127.0.0.1:49569"]])
    assert.equal(accountReturnUrl(consent, origins), "/account");
  for (const value of [
    "https://accounts.iyanju.com/",
    "https://accounts.iyanju.com/sign-in",
    "https://accounts.iyanju.com/oauth-consent/other",
    "https://accounts.iyanju.com/oauth-consent#token",
    "https://accounts.iyanju.com.evil.example/oauth-consent",
    "http://accounts.iyanju.com/oauth-consent",
    "https://user@accounts.iyanju.com/oauth-consent",
    "https://accounts.iyanju.com:444/oauth-consent",
  ])
    assert.equal(
      accountReturnUrl(value, [...PRODUCTION_ACCOUNT_ORIGINS]),
      "/account",
      value,
    );
  assert.ok(
    !PRODUCTION_ACCOUNT_ORIGINS.includes(
      "https://accounts.iyanju.com" as (typeof PRODUCTION_ACCOUNT_ORIGINS)[number],
    ),
  );
});
