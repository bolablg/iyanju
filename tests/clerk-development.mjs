import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const env = parseEnv(await readFile(".env.local", "utf8"));
if (
  !env.CLERK_SECRET_KEY?.startsWith("sk_test_") ||
  !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") ||
  env.IYANJU_ENABLE_ACCOUNTS !== "true"
)
  throw new Error("Real development tests require enabled development keys");
const headers = { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` };
const instanceResponse = await fetch("https://api.clerk.com/v1/instance", {
  headers,
});
if (!instanceResponse.ok) throw new Error("Cannot verify development instance");
const instance = await instanceResponse.json();
if (
  instance.environment_type !== "development" ||
  instance.id !== "ins_3LDM4MBFiIWoOs8yDk40TfHx3RW"
)
  throw new Error("Refusing to test another instance");
const tokenResponse = await fetch("https://api.clerk.com/v1/testing_tokens", {
  method: "POST",
  headers,
});
if (!tokenResponse.ok)
  throw new Error("Cannot create development testing token");
const testing = await tokenResponse.json();
const suffix = Date.now().toString(36);
const username = `iyanju_age_${suffix}`;
const email = `${username}+clerk_test@example.com`;
const password = `Aa9${randomBytes(18).toString("hex")}!`;
const frontendApi = atob(
  env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice("pk_test_".length),
).replace(/\$$/, "");

const child = spawnSync(
  "rtk",
  [
    "proxy",
    process.env.IYANJU_TEST_PYTHON || ".venv/bin/python",
    "tests/clerk-development.py",
  ],
  {
    env: {
      ...process.env,
      IYANJU_TEST_USERNAME: username,
      IYANJU_TEST_EMAIL: email,
      IYANJU_TEST_PASSWORD: password,
      CLERK_TESTING_TOKEN: testing.token,
      CLERK_FRONTEND_API: frontendApi,
    },
    stdio: "inherit",
  },
);
if (child.status !== 0) process.exit(child.status ?? 1);
const query = new URLSearchParams({ email_address: email });
const usersResponse = await fetch(`https://api.clerk.com/v1/users?${query}`, {
  headers,
});
if (!usersResponse.ok)
  throw new Error("Cannot verify the development user's metadata");
const users = await usersResponse.json();
if (
  users.length !== 1 ||
  !users[0].email_addresses.some((address) => address.email_address === email)
)
  throw new Error("Expected exactly the unique test user");
const declaration = users[0].unsafe_metadata?.minimumAgeConfirmation;
if (
  !declaration ||
  declaration.confirmed !== true ||
  declaration.minimumAge !== 18 ||
  declaration.version !== 1 ||
  !Number.isFinite(Date.parse(declaration.confirmedAt))
)
  throw new Error("Clerk did not retain the minimum-age declaration");
if (
  Object.keys(declaration).sort().join(",") !==
  "confirmed,confirmedAt,minimumAge,version"
)
  throw new Error("Unexpected data in the minimum-age declaration");
const report = {
  instanceId: instance.id,
  environment: instance.environment_type,
  userId: users[0].id,
  testEmail: email,
  minimumAgeConfirmation: declaration,
  signup: "passed",
  signin: "passed",
  signout: "passed",
  birthdateRequested: false,
  googleButton: "visible",
  githubButton: "visible",
  oauthCompleted: false,
  verifiedAt: new Date().toISOString(),
};
await writeFile(
  "test-results/clerk-development-report.json",
  JSON.stringify(report, null, 2),
  { mode: 0o600 },
);
console.log(
  "PASS: real development signup, metadata, sign-in, sign-out and allowed application handoff. Detailed evidence is in ignored test-results/.",
);
