import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createMinimumAgeConfirmation,
  readMinimumAgeConfirmation,
} from "../src/lib/account-eligibility.ts";

const now = new Date("2026-10-26T06:00:00.000Z");

test("signup requires an affirmative minimum-age declaration", () => {
  assert.equal(createMinimumAgeConfirmation(false, now), null);
  assert.deepEqual(createMinimumAgeConfirmation(true, now), {
    confirmed: true,
    minimumAge: 18,
    confirmedAt: now.toISOString(),
    version: 1,
  });
});

test("a signup can resume its declaration after a verification redirect", () => {
  const declaration = createMinimumAgeConfirmation(true, now);
  assert.deepEqual(readMinimumAgeConfirmation(declaration), declaration);
});

test("missing, negative, and malformed declarations cannot skip confirmation", () => {
  const valid = createMinimumAgeConfirmation(true, now)!;
  for (const value of [
    undefined,
    null,
    true,
    "true",
    {},
    { ...valid, confirmed: false },
    { ...valid, confirmed: "true" },
    { ...valid, minimumAge: 13 },
    { ...valid, version: 0 },
    { ...valid, confirmedAt: "not a date" },
    { ...valid, confirmedAt: "2026-02-30T06:00:00.000Z" },
    { ...valid, confirmedAt: undefined },
  ])
    assert.equal(readMinimumAgeConfirmation(value), null);
});

test("the saved declaration contains no birthdate or actual age", () => {
  const declaration = createMinimumAgeConfirmation(true, now)!;
  assert.deepEqual(
    readMinimumAgeConfirmation({ ...declaration, birthdate: "unneeded" }),
    declaration,
  );
  assert.deepEqual(Object.keys(declaration).sort(), [
    "confirmed",
    "confirmedAt",
    "minimumAge",
    "version",
  ]);
});
