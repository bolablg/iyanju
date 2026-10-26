import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedBranch,
  validatePromotion,
} from "../.github/scripts/branch-policy.mjs";

test("accepts development and release branch names only", () => {
  for (const name of ["dev-bola", "dev-contact-update", "staging", "main"])
    assert.equal(isAllowedBranch(name), true);
  for (const name of [
    "master",
    "develop",
    "feature/example",
    "dev-bola/nested",
    "dev-",
    "",
  ])
    assert.equal(isAllowedBranch(name), false);
});
test("accepts staged promotion and development synchronization", () => {
  for (const [head, base] of [
    ["dev-bola", "staging"],
    ["dev-contact-update", "staging"],
    ["staging", "main"],
    ["main", "dev-bola"],
    ["dev-contact-update", "dev-bola"],
  ])
    assert.doesNotThrow(() =>
      validatePromotion({ head, base, sameRepository: true }),
    );
});
test("rejects skipped staging, reversed release flow, forks, and identical branches", () => {
  for (const [head, base] of [
    ["dev-bola", "main"],
    ["main", "staging"],
    ["main", "main"],
    ["feature", "staging"],
  ])
    assert.throws(() =>
      validatePromotion({ head, base, sameRepository: true }),
    );
  assert.throws(() =>
    validatePromotion({
      head: "dev-bola",
      base: "staging",
      sameRepository: false,
    }),
  );
});
