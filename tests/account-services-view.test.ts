import assert from "node:assert/strict";
import test from "node:test";
import {
  accountServiceDisplay,
  accountServiceOpenUrl,
  activationDateLabel,
  hasConvexAudience,
  parseAccountServices,
} from "../src/lib/account-services-view.ts";

const summary = {
  version: 1,
  services: [
    {
      serviceId: "kazi",
      state: "activated",
      activation: { activatedAt: null, firstObservedAt: 1_800_000_000_000 },
    },
    { serviceId: "wlan", state: "unavailable" },
    { serviceId: "playkin", state: "not_activated" },
  ],
};

test("display parsing preserves confirmed activation, unavailable, and non-activation as distinct states", () => {
  const parsed = parseAccountServices(summary);
  assert.deepEqual(parsed, summary);
  assert.equal(
    parsed?.services.filter((item) => item.state === "activated").length,
    1,
  );
  assert.equal(
    activationDateLabel({
      activatedAt: null,
      firstObservedAt: 1_800_000_000_000,
    }),
    "First-use date unknown",
  );
  assert.equal(accountServiceDisplay.kazi.name, "Kazi");
});

test("malformed or incomplete summaries never become an empty activated-services list", () => {
  for (const value of [
    null,
    { version: 2, services: summary.services },
    { version: 1, services: [] },
    {
      version: 1,
      services: [summary.services[0], summary.services[0], summary.services[2]],
    },
    {
      version: 1,
      services: [
        { serviceId: "unknown", state: "activated" },
        ...summary.services.slice(1),
      ],
    },
    {
      version: 1,
      services: [
        { serviceId: "kazi", state: "activated" },
        ...summary.services.slice(1),
      ],
    },
    {
      version: 1,
      services: [
        {
          serviceId: "kazi",
          state: "activated",
          activation: { activatedAt: -1, firstObservedAt: 10 },
        },
        ...summary.services.slice(1),
      ],
    },
  ])
    assert.equal(parseAccountServices(value), null);
});

test("summary parsing allowlists fields and service launch URLs use only reviewed environment mappings", () => {
  const value = {
    ...summary,
    services: summary.services.map((item) => ({
      ...item,
      url: "https://untrusted.example",
      owner: "not-needed",
    })),
  };
  const parsed = parseAccountServices(value);
  assert.deepEqual(parsed, summary);
  assert.equal(
    accountServiceOpenUrl("kazi", "https://iyanju.com"),
    "https://kazi.iyanju.com",
  );
  assert.equal(
    accountServiceOpenUrl("kazi", "http://127.0.0.1:49569"),
    "http://127.0.0.1:5192",
  );
  assert.equal(accountServiceOpenUrl("wlan", "http://127.0.0.1:49569"), null);
  assert.equal(
    accountServiceOpenUrl("kazi", "https://unreviewed.vercel.app"),
    null,
  );
  assert.equal(
    accountServiceOpenUrl("playkin", "https://iyanju.com"),
    "https://playkin.iyanju.com",
  );
});

test("only default session audiences for Convex enable the private service request", () => {
  assert.equal(hasConvexAudience("convex"), true);
  assert.equal(hasConvexAudience(["convex"]), true);
  for (const audience of [
    undefined,
    null,
    "another",
    ["another"],
    ["another", "convex"],
    { aud: "convex" },
  ])
    assert.equal(hasConvexAudience(audience), false);
});
