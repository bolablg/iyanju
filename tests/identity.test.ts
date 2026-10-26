import { test } from "node:test";
import assert from "node:assert/strict";
import { identityConfig } from "../src/lib/identity-config.ts";

const credentials = (mode: "test" | "live" = "test") => ({
  IYANJU_ENABLE_ACCOUNTS: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_${mode}_${btoa("identity.example.com$")}`,
  CLERK_SECRET_KEY: `sk_${mode}_synthetic_non_secret_fixture`,
  IYANJU_AUTHORIZED_PARTIES: "http://127.0.0.1:3000",
});
test("public mode never enables a directory from credentials alone", () => {
  const env = credentials();
  delete (env as Partial<typeof env>).IYANJU_ENABLE_ACCOUNTS;
  assert.equal(identityConfig(env).enabled, false);
  assert.equal(identityConfig({}).enabled, false);
});
test("partial and mismatched environments fail closed", () => {
  for (const change of [
    { CLERK_SECRET_KEY: "" },
    { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_placeholder" },
    { CLERK_SECRET_KEY: "sk_live_wrong_environment" },
    { IYANJU_AUTHORIZED_PARTIES: "" },
  ])
    assert.equal(
      identityConfig({ ...credentials(), ...change }).enabled,
      false,
    );
});
test("only exact secure origins or local development origins are accepted", () => {
  for (const origin of [
    "*",
    "https://*.example.com",
    "https://example.com/path",
    "https://example.com/",
    "https://example.com?token=private",
    "https://a:b@example.com",
    "http://example.com",
    "null",
  ])
    assert.equal(
      identityConfig({ ...credentials(), IYANJU_AUTHORIZED_PARTIES: origin })
        .enabled,
      false,
      origin,
    );
  const config = identityConfig(credentials());
  assert.equal(config.enabled, true);
  if (config.enabled)
    assert.deepEqual(config.authorizedParties, ["http://127.0.0.1:3000"]);
});
test("live identity requires review and approved first-party origins", () => {
  const env = {
    ...credentials("live"),
    IYANJU_AUTHORIZED_PARTIES: "https://iyanju.com, https://kazi.iyanju.com",
  };
  assert.equal(identityConfig(env).enabled, false);
  assert.equal(
    identityConfig({ ...env, IYANJU_AUTH_REVIEWED: "true" }).enabled,
    true,
  );
  assert.equal(
    identityConfig({
      ...env,
      IYANJU_AUTH_REVIEWED: "true",
      IYANJU_AUTHORIZED_PARTIES: "https://other.example.com",
    }).enabled,
    false,
  );
});
test("malformed publishable hostname cannot activate the SDK", () => {
  for (const hostname of [
    "https://identity.example.com$",
    "localhost$",
    "user@example.com$",
    "bad hostname$",
    "example.com/path$",
  ])
    assert.equal(
      identityConfig({
        ...credentials(),
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${btoa(hostname)}`,
      }).enabled,
      false,
    );
});
