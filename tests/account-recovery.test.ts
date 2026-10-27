import assert from "node:assert/strict";
import test from "node:test";
import {
  currentSignupConfirmation,
  isAccountOAuthCallback,
  needsExplicitSignup,
  preserveLocalAgeConfirmation,
  signupAttemptScope,
} from "../src/lib/account-recovery.ts";

const now = 1_800_000_000_000;
const confirmation = {
  confirmed: true,
  minimumAge: 18,
  confirmedAt: "2026-10-26T06:00:00.000Z",
  version: 1,
};
const pending = {
  id: "fixture-attempt",
  status: "missing_requirements",
  abandonAt: now + 60_000,
  unsafeMetadata: { minimumAgeConfirmation: confirmation },
};

test("Google and GitHub get explicit signup recovery only for a confirmed no-account OAuth callback", () => {
  for (const provider of ["google", "github"]) {
    const attempt = {
      hash: "#/sso-callback",
      fetchStatus: "idle",
      status: "needs_identifier",
      verificationStatus: "transferable",
      errorCode: "external_account_not_found",
      strategy: `oauth_${provider}`,
      expiresAt: now + 60_000,
    };
    assert.equal(needsExplicitSignup(attempt), true);
    const expiredAttempt = { ...attempt, expiresAt: now - 1 };
    assert.equal(needsExplicitSignup(expiredAttempt), true);
    for (const change of [
      { hash: "" },
      { hash: "#/sso-callback/unrelated" },
      { fetchStatus: "fetching" },
      { verificationStatus: "verified" },
      { errorCode: "access_denied" },
      { strategy: "password" },
    ])
      assert.equal(needsExplicitSignup({ ...attempt, ...change }), false);
  }
  assert.equal(isAccountOAuthCallback("#/sso-callback?intent=signUp"), true);
});

test("only the current unexpired attempt hydrates a saved age declaration", () => {
  assert.deepEqual(currentSignupConfirmation(pending, "", now), confirmation);
  for (const change of [
    { id: undefined },
    { status: "abandoned" },
    { status: "expired" },
    { abandonAt: now - 1 },
    { abandonAt: null },
    {
      unsafeMetadata: {
        minimumAgeConfirmation: { ...confirmation, confirmed: false },
      },
    },
  ])
    assert.equal(
      currentSignupConfirmation(
        { ...pending, ...change },
        "#/sso-callback",
        now,
      ),
      null,
    );
  assert.equal(
    currentSignupConfirmation({ ...pending, unsafeMetadata: {} }, "", now),
    null,
  );
});

test("completed signup metadata resumes only on its unexpired OAuth callback", () => {
  const complete = { ...pending, status: "complete" };
  assert.deepEqual(
    currentSignupConfirmation(complete, "#/sso-callback", now),
    confirmation,
  );
  assert.equal(currentSignupConfirmation(complete, "", now), null);
  assert.equal(
    currentSignupConfirmation(
      { ...complete, abandonAt: null },
      "#/sso-callback",
      now,
    ),
    null,
  );
  assert.equal(
    currentSignupConfirmation(
      { ...complete, abandonAt: now - 1 },
      "#/sso-callback",
      now,
    ),
    null,
  );
  assert.equal(
    currentSignupConfirmation(
      { ...complete, unsafeMetadata: {} },
      "#/sso-callback",
      now,
    ),
    null,
  );
});

test("local checkbox consent binds to the first id without crossing a replacement or abandoned attempt", () => {
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: null, scope: "new" },
      { id: "first", scope: "pending" },
    ),
    true,
  );
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: "first", scope: "pending" },
      { id: "first", scope: "pending" },
    ),
    true,
  );
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: "first", scope: "pending" },
      { id: "second", scope: "pending" },
    ),
    false,
  );
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: "first", scope: "pending" },
      { id: "first", scope: "inactive" },
    ),
    false,
  );
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: "first", scope: "pending" },
      { id: "first", scope: "complete-callback" },
    ),
    false,
  );
  assert.equal(
    preserveLocalAgeConfirmation(
      { id: "first", scope: "pending" },
      { id: null, scope: "new" },
    ),
    false,
  );
  assert.equal(signupAttemptScope(pending, "", now), "pending");
});
