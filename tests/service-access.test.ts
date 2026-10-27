import assert from "node:assert/strict";
import test from "node:test";
import {
  authoritativeServiceAccess,
  parseServiceRestriction,
  parseAccountAccess,
  signedServiceAccess,
  permitsService,
  serviceReturnAllowed,
  wlanConsentReturn,
} from "../src/lib/service-access.ts";

const subject = "user_synthetic_reviewer";
const restriction = { version: 1, services: ["wlan"] };
const user = {
  id: subject,
  publicMetadata: { iyanju_service_restriction: restriction },
};

test("current exact directory user controls service eligibility independently of email and client metadata", () => {
  const policy = authoritativeServiceAccess(user, subject);
  assert.deepEqual(policy, { kind: "restricted", services: ["wlan"] });
  assert.equal(permitsService(policy, "wlan"), true);
  assert.equal(permitsService(policy, "kazi"), false);
  assert.equal(permitsService(policy, "playkin"), false);
  for (const email of ["first@example.invalid", "changed@example.invalid"])
    assert.deepEqual(
      authoritativeServiceAccess(
        {
          ...user,
          email,
          unsafeMetadata: { iyanju_service_restriction: null },
          sessionClaims: { iyanju_access: null },
        },
        subject,
      ),
      policy,
    );
  assert.deepEqual(
    authoritativeServiceAccess({ id: subject, publicMetadata: {} }, subject),
    { kind: "unrestricted" },
  );
  for (const value of [
    undefined,
    null,
    {},
    { ...user, id: "someone_else" },
    { id: subject },
    { id: subject, publicMetadata: null },
  ])
    assert.deepEqual(authoritativeServiceAccess(value, subject), {
      kind: "invalid",
    });
});

test("malformed present restrictions deny rather than becoming ordinary", () => {
  for (const value of [
    undefined,
    null,
    "wlan",
    [],
    {},
    { ...restriction, version: 2 },
    { ...restriction, services: [] },
    { ...restriction, services: ["unknown"] },
    { ...restriction, services: ["wlan", "wlan"] },
    { ...restriction, unsafe: true },
  ]) {
    assert.deepEqual(parseServiceRestriction(value), { kind: "invalid" });
    assert.deepEqual(
      authoritativeServiceAccess(
        { id: subject, publicMetadata: { iyanju_service_restriction: value } },
        subject,
      ),
      { kind: "invalid" },
    );
  }
});

test("signed alternative requires a complete subject-bound envelope, including explicit ordinary null", () => {
  const envelope = { version: 1, subject, restriction };
  assert.deepEqual(signedServiceAccess(envelope, subject), {
    kind: "restricted",
    services: ["wlan"],
  });
  assert.deepEqual(
    signedServiceAccess({ ...envelope, restriction: null }, subject),
    { kind: "unrestricted" },
  );
  for (const value of [
    undefined,
    null,
    { version: 1, subject },
    { ...envelope, subject: "other" },
    { ...envelope, restriction: undefined },
    { ...envelope, version: 2 },
    { ...envelope, unsafeMetadata: {} },
  ])
    assert.deepEqual(signedServiceAccess(value, subject), { kind: "invalid" });
});

test("navigation accepts only allowed service origins for restricted accounts", () => {
  const access = parseAccountAccess(restriction)!;
  assert.equal(
    serviceReturnAllowed(
      "https://wlan.iyanju.com/drafts",
      access,
      "https://iyanju.com",
    ),
    true,
  );
  for (const url of [
    "https://kazi.iyanju.com",
    "https://playkin.iyanju.com",
    "/tools",
    "https://accounts.iyanju.com/oauth-consent",
    "https://wlan.iyanju.com.evil.invalid",
    "https://user@wlan.iyanju.com",
  ])
    assert.equal(
      serviceReturnAllowed(url, access, "https://iyanju.com"),
      false,
    );
  assert.equal(
    serviceReturnAllowed("/account?view=profile", access, "https://iyanju.com"),
    true,
  );
  assert.equal(
    serviceReturnAllowed(
      "http://127.0.0.1:49570/drafts",
      access,
      "http://127.0.0.1:49569",
    ),
    true,
  );
  assert.equal(
    serviceReturnAllowed(
      "https://wlan.iyanju.com",
      access,
      "http://127.0.0.1:49569",
    ),
    false,
  );
});

test("restricted OAuth navigation requires one exact Wlan resource and only known Wlan/identity scopes", () => {
  const url = new URL("https://accounts.iyanju.com/oauth-consent");
  url.search = new URLSearchParams({
    client_id: "synthetic-client",
    redirect_uri: "http://localhost:7777/callback",
    resource: "https://wlan.iyanju.com/mcp",
    scope: "openid profile email offline_access user:org:read wlan:drafts:read",
    response_type: "code",
  }).toString();
  assert.equal(wlanConsentReturn(url), true);
  assert.equal(
    serviceReturnAllowed(
      url.href,
      { version: 1, services: ["wlan"] },
      "https://iyanju.com",
    ),
    true,
  );
  assert.equal(
    serviceReturnAllowed(
      url.href,
      { version: 1, services: ["kazi"] },
      "https://iyanju.com",
    ),
    false,
  );
  for (const [key, value] of [
    ["resource", "https://kazi.iyanju.com/mcp"],
    ["resource", ""],
    ["scope", "openid profile email"],
    ["scope", "wlan:drafts:read kazi:read"],
    ["scope", "wlan:drafts:read wlan:drafts:read"],
    ["scope", "wlan:drafts:read\twlan:drafts:write"],
    ["redirect_uri", ""],
    ["audience", "https://other.invalid"],
  ]) {
    const changed = new URL(url);
    changed.searchParams.set(key, value);
    assert.equal(wlanConsentReturn(changed), false);
  }
  for (const key of ["resource", "client_id", "scope", "redirect_uri"]) {
    const changed = new URL(url);
    changed.searchParams.append(key, changed.searchParams.get(key)!);
    assert.equal(wlanConsentReturn(changed), false);
  }
  const missing = new URL(url);
  missing.searchParams.delete("resource");
  assert.equal(wlanConsentReturn(missing), false);
});
