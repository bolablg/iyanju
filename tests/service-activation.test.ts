import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAccountServicesHandler as createHandler,
  createAccountAccessHandler,
  parseKaziActivation,
  parseServiceActivation,
  serviceActivationSettings,
  validRootServiceSession,
  type ServiceActivationSettings,
} from "../src/lib/service-activation.ts";
const settings: ServiceActivationSettings = {
  environment: "production",
  issuer: "https://clerk.iyanju.com",
  rootOrigin: "https://iyanju.com",
  kaziEndpoint: "https://kazi.iyanju.com/api/account/service-activation",
  wlanEndpoint: "https://wlan.iyanju.com/api/account/service-activation",
};
// Ordinary control uses an authoritative directory result, not absent JWT claims.
const createAccountServicesHandler = (
  settings: Parameters<typeof createHandler>[0],
  authenticate: Parameters<typeof createHandler>[1],
  fetchService?: Parameters<typeof createHandler>[3],
) =>
  createHandler(
    settings,
    authenticate,
    async (subject) => ({ id: subject, publicMetadata: {} }),
    fetchService,
  );
const now = Date.now();
const session = {
  userId: "user_owner",
  sessionId: "sess_owner",
  claims: {
    iss: settings.issuer,
    sub: "user_owner",
    sid: "sess_owner",
    azp: settings.rootOrigin,
    aud: "convex",
    sts: "active",
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60,
  },
};
const summary = {
  version: 1,
  serviceId: "kazi",
  environment: "production",
  activation: { activatedAt: null, firstObservedAt: 12345 },
};
const request = (suffix = "", method = "GET") =>
  new Request(settings.rootOrigin + "/account/services" + suffix, {
    method,
    headers: {
      Authorization: "Bearer synthetic.payload.signature",
      Cookie: "different-account-cookie=1",
      Origin: "https://attacker.example",
      "X-Forwarded-Host": "attacker.example",
    },
  });
const config = (live = true) => ({
  IYANJU_ENABLE_ACCOUNTS: "true",
  IYANJU_AUTH_REVIEWED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_${live ? "live" : "test"}_${btoa((live ? "clerk.iyanju.com" : "funky-monitor-8635.clerk.accounts.dev") + "$")}`,
  CLERK_SECRET_KEY: `sk_${live ? "live" : "test"}_synthetic_fixture`,
  IYANJU_AUTHORIZED_PARTIES: live
    ? settings.rootOrigin
    : "http://127.0.0.1:49569",
});
test("service lookup settings select only the reviewed production/development tuples", () => {
  assert.deepEqual(serviceActivationSettings(config()), settings);
  assert.deepEqual(serviceActivationSettings(config(false)), {
    environment: "development",
    issuer: "https://funky-monitor-8635.clerk.accounts.dev",
    rootOrigin: "http://127.0.0.1:49569",
    kaziEndpoint: "http://127.0.0.1:5192/api/account/service-activation",
    wlanEndpoint: "http://127.0.0.1:49570/api/account/service-activation",
  });
  assert.equal(serviceActivationSettings({}), null);
  assert.equal(
    serviceActivationSettings({
      ...config(false),
      IYANJU_AUTHORIZED_PARTIES: "http://127.0.0.1:3000",
    }),
    null,
  );
  assert.equal(
    serviceActivationSettings({
      ...config(),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_live_${btoa("other.example$")}`,
    }),
    null,
  );
});
test("requires the verified default root session subject, origin, issuer, audience and temporal bounds", () => {
  assert.equal(validRootServiceSession(session, settings, now), true);
  for (const change of [
    { iss: "https://other.example" },
    { sub: "someone_else" },
    { azp: undefined },
    { azp: "https://kazi.iyanju.com" },
    { aud: "other" },
    { aud: ["convex", "other"] },
    { sid: undefined },
    { client_id: "oauth" },
    { sts: "pending" },
    { exp: now / 1000 - 1 },
    { iat: now / 1000 + 61 },
  ])
    assert.equal(
      validRootServiceSession(
        { ...session, claims: { ...session.claims, ...change } },
        settings,
        now,
      ),
      false,
    );
});
test("verifies and forwards the same bearer without cookies or user-controlled destinations", async () => {
  const calls: [string, RequestInit | undefined][] = [];
  const handler = createAccountServicesHandler(
    settings,
    async (headerOnly, scoped) => {
      assert.equal(scoped, settings);
      assert.equal(headerOnly.url, settings.rootOrigin + "/account/services");
      assert.deepEqual(Object.fromEntries(headerOnly.headers), {
        authorization: "Bearer synthetic.payload.signature",
      });
      return session;
    },
    async (url, init) => {
      calls.push([String(url), init]);
      return Response.json(summary);
    },
  );
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    version: 1,
    services: [
      { serviceId: "kazi", state: "activated", activation: summary.activation },
      { serviceId: "wlan", state: "unavailable" },
      { serviceId: "playkin", state: "unavailable" },
    ],
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[1][0], settings.wlanEndpoint);
  assert.equal(calls[0][0], settings.kaziEndpoint);
  assert.deepEqual(Object.fromEntries(new Headers(calls[0][1]?.headers)), {
    accept: "application/json",
    authorization: "Bearer synthetic.payload.signature",
  });
  assert.equal(calls[0][1]?.credentials, "omit");
  assert.equal(calls[0][1]?.redirect, "manual");
  assert.equal(calls[0][1]?.cache, "no-store");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
});
test("authoritative null alone means not activated; errors and unsupported products remain unavailable", async () => {
  for (const fixture of [
    Response.json({ ...summary, activation: null }),
    new Response(null, { status: 401 }),
    new Response(null, {
      status: 307,
      headers: { Location: "https://attacker.example" },
    }),
    new Response("error", { status: 503 }),
    Response.json({ ...summary, environment: "development" }),
    Response.json({ secret: "x".repeat(5000) }),
  ]) {
    const isNull =
      fixture.status === 200 &&
      (await fixture.clone().json()).activation === null;
    const responseBody = await fixture.clone().text();
    let calls = 0;
    const response = await createAccountServicesHandler(
      settings,
      async () => session,
      async () => {
        calls++;
        return new Response(responseBody, {
          status: fixture.status,
          headers: fixture.headers,
        });
      },
    )(request());
    const result = await response.json();
    assert.equal(
      result.services[0].state,
      isNull ? "not_activated" : "unavailable",
    );
    assert.equal(result.services[1].state, "unavailable");
    assert.equal(result.services[2].state, "unavailable");
    assert.equal(calls, 2);
  }
});
test("rejects selectors, missing auth, invalid sessions and verifier failures before product calls", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    return Response.json(summary);
  };
  const handler = createAccountServicesHandler(
    settings,
    async () => session,
    fetcher,
  );
  assert.equal((await handler(request("?subject=other"))).status, 400);
  assert.equal((await handler(request("", "POST"))).status, 405);
  assert.equal(
    (await handler(new Request(settings.rootOrigin + "/account/services")))
      .status,
    401,
  );
  assert.equal(
    (
      await createAccountServicesHandler(
        null,
        async () => session,
        fetcher,
      )(request())
    ).status,
    503,
  );
  assert.equal(
    (
      await createAccountServicesHandler(
        settings,
        async () => ({
          ...session,
          claims: { ...session.claims, azp: "https://other.example" },
        }),
        fetcher,
      )(request())
    ).status,
    401,
  );
  assert.equal(
    (
      await createAccountServicesHandler(
        settings,
        async () => {
          throw new Error("private verifier detail");
        },
        fetcher,
      )(request())
    ).status,
    503,
  );
  assert.equal(calls, 0);
});
test("minimal service schema rejects extra data, invalid dates, wrong service and environment", () => {
  assert.deepEqual(
    parseKaziActivation(summary, "production"),
    summary.activation,
  );
  assert.equal(
    parseKaziActivation({ ...summary, activation: null }, "production"),
    null,
  );
  for (const value of [
    { ...summary, actorId: "private" },
    { ...summary, serviceId: "wlan" },
    { ...summary, environment: "development" },
    { ...summary, activation: { activatedAt: null, firstObservedAt: -1 } },
    { ...summary, activation: { ...summary.activation, proof: "private" } },
  ])
    assert.equal(parseKaziActivation(value, "production"), undefined);
});

test("cancels the product lookup with the request and preserves unavailable semantics", async () => {
  const controller = new AbortController();
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const handler = createAccountServicesHandler(
    settings,
    async () => session,
    async (_url, init) => {
      assert.ok(init?.signal);
      return new Promise<Response>((_resolve, reject) => {
        init.signal!.addEventListener(
          "abort",
          () => reject(new Error("cancelled")),
          { once: true },
        );
        entered();
      });
    },
  );
  const pending = handler(
    new Request(settings.rootOrigin + "/account/services", {
      headers: { Authorization: "Bearer synthetic.payload.signature" },
      signal: controller.signal,
    }),
  );
  await started;
  controller.abort();
  const response = await pending;
  assert.equal((await response.json()).services[0].state, "unavailable");
});

test("Wlan receives only the root bearer and its minimal contract is isolated from other services", async () => {
  const calls: [string, RequestInit | undefined][] = [];
  const result = await createAccountServicesHandler(
    settings,
    async () => session,
    async (url, init) => {
      calls.push([String(url), init]);
      return String(url) === settings.wlanEndpoint
        ? Response.json({ ...summary, serviceId: "wlan" })
        : new Response(null, { status: 503 });
    },
  )(request());
  assert.deepEqual((await result.json()).services, [
    { serviceId: "kazi", state: "unavailable" },
    { serviceId: "wlan", state: "activated", activation: summary.activation },
    { serviceId: "playkin", state: "unavailable" },
  ]);
  const call = calls.find(([url]) => url === settings.wlanEndpoint)!;
  assert.deepEqual(Object.fromEntries(new Headers(call[1]?.headers)), {
    accept: "application/json",
    authorization: "Bearer synthetic.payload.signature",
  });
  assert.equal(call[1]?.credentials, "omit");
  assert.equal(call[1]?.redirect, "manual");
  assert.equal(
    parseServiceActivation(summary, "production", "wlan"),
    undefined,
  );
  assert.deepEqual(
    parseServiceActivation(
      { ...summary, serviceId: "wlan" },
      "production",
      "wlan",
    ),
    summary.activation,
  );
});

test("a confirmed unactivated Wlan account does not become activated by an overview read", async () => {
  const result = await createAccountServicesHandler(
    settings,
    async () => session,
    async (url) =>
      Response.json({
        ...summary,
        serviceId: String(url) === settings.wlanEndpoint ? "wlan" : "kazi",
        activation: null,
      }),
  )(request());
  assert.equal((await result.json()).services[1].state, "not_activated");
});

test("current Wlan-only policy forwards the proof only to Wlan, regardless of absent or stale claims", async () => {
  const calls: string[] = [];
  const restrictedUser = {
    id: session.userId,
    publicMetadata: {
      iyanju_service_restriction: { version: 1, services: ["wlan"] },
    },
  };
  for (const claims of [
    session.claims,
    {
      ...session.claims,
      iyanju_access: { version: 1, subject: session.userId, restriction: null },
    },
  ]) {
    calls.length = 0;
    const response = await createHandler(
      settings,
      async () => ({ ...session, claims }),
      async (subject) => {
        assert.equal(subject, session.userId);
        return restrictedUser;
      },
      async (url) => {
        calls.push(String(url));
        return Response.json({ ...summary, serviceId: "wlan" });
      },
    )(request());
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [settings.wlanEndpoint]);
    assert.deepEqual((await response.json()).services, [
      { serviceId: "kazi", state: "restricted" },
      { serviceId: "wlan", state: "activated", activation: summary.activation },
      { serviceId: "playkin", state: "restricted" },
    ]);
  }
});

test("directory failures and malformed or wrong-subject policy never forward a bearer", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    return Response.json(summary);
  };
  for (const user of [
    undefined,
    null,
    { id: "another", publicMetadata: {} },
    {
      id: session.userId,
      publicMetadata: { iyanju_service_restriction: null },
    },
    {
      id: session.userId,
      publicMetadata: {
        iyanju_service_restriction: { version: 1, services: ["unknown"] },
      },
    },
  ]) {
    assert.equal(
      (
        await createHandler(
          settings,
          async () => session,
          async () => user,
          fetcher,
        )(request())
      ).status,
      403,
    );
  }
  assert.equal(
    (
      await createHandler(
        settings,
        async () => session,
        async () => {
          throw new Error("private directory detail");
        },
        fetcher,
      )(request())
    ).status,
    503,
  );
  assert.equal(calls, 0);
});

test("private navigation policy is read-only, subject-bound and never contacts any service", async () => {
  const handler = createAccountAccessHandler(
    settings,
    async (headerOnly) => {
      assert.equal(headerOnly.url, settings.rootOrigin + "/account/access");
      assert.equal(headerOnly.headers.has("cookie"), false);
      return session;
    },
    async (subject) => ({
      id: subject,
      publicMetadata: {
        iyanju_service_restriction: { version: 1, services: ["wlan"] },
      },
    }),
  );
  const response = await handler(
    new Request(settings.rootOrigin + "/account/access", {
      headers: { Authorization: "Bearer synthetic.payload.signature" },
    }),
  );
  assert.deepEqual(await response.json(), { version: 1, services: ["wlan"] });
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal((await handler(request())).status, 400);
});

test("navigation checks current policy for a valid default session without a Convex audience", async () => {
  const ordinary = {
    ...session,
    claims: { ...session.claims, aud: undefined },
  };
  const accessRequest = () =>
    new Request(settings.rootOrigin + "/account/access", {
      headers: { Authorization: "Bearer synthetic.payload.signature" },
    });
  for (const restriction of [undefined, { version: 1, services: ["wlan"] }]) {
    const handler = createAccountAccessHandler(
      settings,
      async () => ordinary,
      async (subject) => ({
        id: subject,
        publicMetadata: restriction
          ? { iyanju_service_restriction: restriction }
          : {},
      }),
    );
    const response = await handler(accessRequest());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      version: 1,
      services: restriction ? ["wlan"] : ["kazi", "wlan", "playkin"],
    });
  }
  assert.equal(validRootServiceSession(ordinary, settings), false);
  let effects = 0;
  const forwarding = createHandler(
    settings,
    async () => ordinary,
    async () => {
      effects++;
      return { id: session.userId, publicMetadata: {} };
    },
    async () => {
      effects++;
      return Response.json(summary);
    },
  );
  assert.equal((await forwarding(request())).status, 401);
  assert.equal(effects, 0);
});

test("navigation without an audience still rejects wrong bindings and explicit unsupported audiences", async () => {
  let directoryReads = 0;
  for (const change of [
    { aud: null },
    { aud: "other" },
    { aud: ["convex", "other"] },
    { sid: undefined },
    { sub: "other" },
    { azp: "https://kazi.iyanju.com" },
    { iss: "https://other.invalid" },
    { client_id: "oauth-client" },
  ]) {
    const handler = createAccountAccessHandler(
      settings,
      async () => ({
        ...session,
        claims: { ...session.claims, aud: undefined, ...change },
      }),
      async (subject) => {
        directoryReads++;
        return { id: subject, publicMetadata: {} };
      },
    );
    const response = await handler(
      new Request(settings.rootOrigin + "/account/access", {
        headers: { Authorization: "Bearer synthetic.payload.signature" },
      }),
    );
    assert.equal(response.status, 401);
  }
  assert.equal(directoryReads, 0);
});
