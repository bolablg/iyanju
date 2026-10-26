"""Exercise the actual account controls with a local Clerk test double.

Run with --prepare to write the isolated preview app under test-results/.
Then start that app on a separate port and run this script against it.
No Clerk credentials, users, Google permissions, or production settings change.
"""

import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-results"
APP = OUT / "signup-preview"
parser = argparse.ArgumentParser()
parser.add_argument("--prepare", action="store_true")
parser.add_argument("--url", default="http://127.0.0.1:3002")
args = parser.parse_args()

if args.prepare:
    (APP / "app").mkdir(parents=True, exist_ok=True)
    (APP / "package.json").write_text(json.dumps({"private": True, "name": "signup-preview"}))
    (APP / "next.config.mjs").write_text("""
import path from 'node:path';
export default {
  webpack(config) {
    config.resolve.alias['@'] = path.resolve('../../src');
    config.resolve.alias['@clerk/nextjs$'] = path.resolve('clerk-stub.jsx');
    return config;
  },
};
""")
    (APP / "app/layout.jsx").write_text("""
export { default, metadata, viewport } from '../../../src/app/layout';
""")
    (APP / "app/page.jsx").write_text("""
import { Suspense } from 'react';
import { AccountControls } from '../../../src/components/account-controls';
import { PageIntro } from '../../../src/components/ui';
export default async function Preview({ searchParams }) {
  const params = await searchParams;
  const signUp = params.mode !== 'sign-in';
  return <>
    <PageIntro eyebrow="SIGNUP PREVIEW" title={signUp ? 'Join iyanju.' : 'Sign in to iyanju.'}>
      <p>Local preview. No account will be created.</p>
    </PageIntro>
    <section className="container account-content">
      <Suspense><AccountControls signUp={signUp} /></Suspense>
    </section>
  </>;
}
""")
    (APP / "clerk-stub.jsx").write_text("""
'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
export function ClerkLoaded({ children }) { return children; }
export function ClerkLoading() { return null; }
export function Show({ when, children }) {
  const params = useSearchParams();
  const signedIn = params.get('signed-in') === 'true';
  return when === (signedIn ? 'signed-in' : 'signed-out') ? children : null;
}
export function useClerk() { return { signOut: async () => {} }; }
export function useUser() {
  const params = useSearchParams();
  const [metadata, setMetadata] = useState({});
  return { user: { unsafeMetadata: metadata, update: async ({ unsafeMetadata }) => {
    if (params.get('save') === 'fail') throw new Error('Synthetic save failure');
    setMetadata(unsafeMetadata);
  } } };
}
export function UserButton() { return <button>User</button>; }
export function useSignUp() {
  const params = useSearchParams();
  const confirmation = params.get('resume') ? {
    confirmed: params.get('resume') === 'valid', minimumAge: 18,
    confirmedAt: '2026-10-26T06:00:00.000Z', version: 1,
  } : undefined;
  return { signUp: {
    status: params.get('status') || 'missing_requirements',
    unsafeMetadata: { source: 'preserved', minimumAgeConfirmation: confirmation },
  } };
}
export function SignUp({ unsafeMetadata }) {
  return <div data-testid="signup-controls">
    <h2>Account service test fixture</h2>
    <button>Continue with Google</button>
    <label>Email <input type="email" /></label>
    <output data-testid="signup-metadata">{JSON.stringify(unsafeMetadata)}</output>
  </div>;
}
export function SignIn(props) {
  return <output data-testid="signin-props">{JSON.stringify(props)}</output>;
}
""")
    print(f"Prepared isolated signup preview: {APP}")
    raise SystemExit(0)

BASE = args.url.rstrip("/")
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({"width": width, "height": 900})
        page.goto(BASE)
        page.wait_for_load_state("networkidle")
        checkbox = page.get_by_role("checkbox", name="I confirm I am 18 or older.")
        button = page.get_by_role("button", name="Continue to signup")
        expect(checkbox).not_to_be_checked()
        expect(button).to_be_disabled()
        expect(page.get_by_test_id("signup-controls")).to_have_count(0)
        assert page.locator('input[type="date"]').count() == 0
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        # A synthetic submit must not bypass the checkbox either.
        page.get_by_role("form", name="Before you sign up.").dispatch_event("submit")
        expect(page.get_by_test_id("signup-controls")).to_have_count(0)
        checkbox.focus()
        page.keyboard.press("Space")
        expect(button).to_be_enabled()
        page.keyboard.press("Space")
        expect(button).to_be_disabled()
        page.keyboard.press("Space")
        page.add_script_tag(path=str(ROOT / "node_modules/axe-core/axe.min.js"))
        violations = page.evaluate("""async () => {
          const r = await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
          return r.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)}));
        }""")
        assert not violations, (width, violations)
        if width in [390, 1440]:
            page.screenshot(path=str(OUT / f"signup-age-{width}.png"), full_page=True)
        page.keyboard.press("Tab")
        expect(button).to_be_focused()
        page.keyboard.press("Enter")
        expect(page.get_by_test_id("signup-controls")).to_be_visible()
        metadata = json.loads(page.get_by_test_id("signup-metadata").inner_text())
        declaration = metadata["minimumAgeConfirmation"]
        assert declaration["confirmed"] is True and declaration["minimumAge"] == 18
        assert declaration["version"] == 1 and declaration["confirmedAt"].endswith("Z")
        assert metadata["source"] == "preserved"
        assert set(declaration) == {"confirmed", "minimumAge", "confirmedAt", "version"}
        assert not context.cookies() and page.evaluate("localStorage.length") == 0

    # An existing confirmation travels on the Clerk attempt, not browser storage.
    page.goto(BASE + "/?resume=valid")
    expect(page.get_by_test_id("signup-controls")).to_be_visible()
    metadata = json.loads(page.get_by_test_id("signup-metadata").inner_text())
    assert metadata["minimumAgeConfirmation"]["confirmedAt"] == "2026-10-26T06:00:00.000Z"
    for query in ["resume=invalid", "resume=valid&status=abandoned", "resume=valid&status=complete"]:
        page.goto(BASE + "/?" + query)
        expect(page.get_by_role("checkbox")).not_to_be_checked()
        expect(page.get_by_test_id("signup-controls")).to_have_count(0)

    # Google sign-in cannot automatically transfer into an unconfirmed signup.
    page.goto(BASE + "/?mode=sign-in")
    signin = json.loads(page.get_by_test_id("signin-props").inner_text())
    assert signin["withSignUp"] is False and signin["transferable"] is False
    assert signin["signUpUrl"] == "/account/sign-up"
    expect(page.get_by_role("checkbox")).to_have_count(0)
    # A signed-in account without a declaration must save it before continuing.
    page.goto(BASE + "/?signed-in=true&save=fail")
    expect(page.get_by_role("heading", name="Confirm your account eligibility.")).to_be_visible()
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Continue", exact=True).click()
    expect(page.get_by_role("form", name="Confirm your account eligibility.").get_by_role("alert")).to_have_text("We couldn’t save your confirmation. Please try again.")
    expect(page.get_by_role("button", name="Sign out", exact=True)).to_have_count(0)
    page.goto(BASE + "/?signed-in=true")
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Continue", exact=True).click()
    expect(page.get_by_role("heading", name="You’re signed in to iYANJU.")).to_be_visible()
    assert not errors, errors
    browser.close()
    print("PASS: signup blocks unchecked declarations; keyboard, mobile, axe, metadata, redirect recovery, abandoned attempts, and sign-in props checked with a local Clerk test double.")
