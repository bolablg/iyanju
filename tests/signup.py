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
    (APP / "app/account/sign-up").mkdir(parents=True, exist_ok=True)
    if not (APP / "public").exists() and not (APP / "public").is_symlink():
        (APP / "public").symlink_to(ROOT / "public", target_is_directory=True)
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
import { accountReturnUrl } from '../../../src/lib/account-routing';
export default async function Preview({ searchParams }) {
  const params = await searchParams;
  const signUp = params.mode !== 'sign-in';
  return <>
    <PageIntro eyebrow="SIGNUP PREVIEW" title={signUp ? 'Join iyanju.' : 'Sign in to iyanju.'}>
      <p>Local preview. No account will be created.</p>
    </PageIntro>
    <section className="container account-content">
      <Suspense><AccountControls signUp={signUp} returnUrl={accountReturnUrl(params.return_to || params.redirect_url, ['https://kazi.iyanju.com'])} /></Suspense>
    </section>
  </>;
}
""")
    (APP / "clerk-stub.jsx").write_text("""
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export function ClerkLoaded({ children }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  return loaded ? children : null;
}
export function ClerkLoading() { return null; }
export function Show({ when, children }) {
  const params = useSearchParams();
  const signedIn = params.get('signed-in') === 'true';
  return when === (signedIn ? 'signed-in' : 'signed-out') ? children : null;
}
export function useClerk() { return { signOut: async () => {} }; }
export function useUser() {
  const params = useSearchParams();
  const [user, setUser] = useState({ id: 'fixture-user-A', unsafeMetadata: {} });
  useEffect(() => {
    const change = event => setUser({ id: event.detail.id, unsafeMetadata: {} });
    window.addEventListener('fixture:user-change', change);
    return () => window.removeEventListener('fixture:user-change', change);
  }, []);
  return { user: { ...user, update: async ({ unsafeMetadata }) => {
    const currentId = user.id;
    if (params.get('save') === 'fail') throw new Error('Synthetic save failure');
    if (params.get('save') === 'delayed') await new Promise(resolve => setTimeout(resolve, 350));
    setUser(current => current.id === currentId ? { ...current, unsafeMetadata } : current);
  } } };
}
export function UserButton() { return <button>User</button>; }
export function useSignIn() {
  const params = useSearchParams();
  return {
    fetchStatus: params.get('fetching') ? 'fetching' : 'idle',
    signIn: {
      status: 'needs_identifier',
      firstFactorVerification: {
        status: params.get('no-account') ? 'transferable' : null,
        error: params.get('no-account') ? { code: params.get('error') || 'external_account_not_found' } : null,
        strategy: 'oauth_' + (params.get('provider') || 'google'),
        expireAt: new Date(Date.now() + 60000),
      },
      create: () => { window.__fixtureCreatedAccounts = (window.__fixtureCreatedAccounts || 0) + 1; },
    },
  };
}
export function useSignUp() {
  const params = useSearchParams();
  const [signUp, setSignUp] = useState(() => ({
    id: params.get('no-id') ? undefined : 'fixture-attempt-A',
    status: params.get('no-id') ? null : params.get('status') || 'missing_requirements',
    abandonAt: Date.now() + (params.get('expired') ? -60000 : 60000),
    unsafeMetadata: {
      source: 'preserved',
      minimumAgeConfirmation: params.get('resume') ? {
        confirmed: params.get('resume') === 'valid', minimumAge: 18,
        confirmedAt: '2026-10-26T06:00:00.000Z', version: 1,
      } : undefined,
    },
  }));
  useEffect(() => {
    const update = event => setSignUp(current => ({ ...current, ...event.detail }));
    window.addEventListener('fixture:signup-attempt', update);
    window.__signupFixtureReady = true;
    return () => {
      window.__signupFixtureReady = false;
      window.removeEventListener('fixture:signup-attempt', update);
    };
  }, []);
  return { signUp: { ...signUp, create: () => { window.__fixtureCreatedAccounts = (window.__fixtureCreatedAccounts || 0) + 1; } } };
}
export function SignUp({ unsafeMetadata }) {
  return <div data-testid="signup-controls">
    <h2>Account service test fixture</h2>
    <button>Continue with Google</button>
    <button>Continue with GitHub</button>
    <label>Email <input type="email" /></label>
    <output data-testid="signup-metadata">{JSON.stringify(unsafeMetadata)}</output>
  </div>;
}
export function SignIn(props) {
  return <output data-testid="signin-props">{JSON.stringify(props)}</output>;
}
""")
    (APP / "app/account/page.jsx").write_text("""
import Preview from '../page';
export default function SignInPreview({ searchParams }) {
  return <Preview searchParams={searchParams.then(params => ({ ...params, mode: 'sign-in' }))} />;
}
""")
    (APP / "app/account/sign-up/page.jsx").write_text("""
import Preview from '../../page';
export default function SignUpPreview({ searchParams }) {
  return <Preview searchParams={searchParams.then(params => ({ ...params, mode: 'sign-up' }))} />;
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

    # The current Clerk resource can hydrate after the age form first mounts.
    confirmation = {"confirmed": True, "minimumAge": 18, "confirmedAt": "2026-10-26T06:00:00.000Z", "version": 1}
    def update_attempt(detail):
        page.wait_for_function("window.__signupFixtureReady === true")
        page.evaluate("detail => window.dispatchEvent(new CustomEvent('fixture:signup-attempt', {detail}))", detail)
    page.goto(BASE)
    expect(page.get_by_role("checkbox")).not_to_be_checked()
    update_attempt({"unsafeMetadata": {"source": "preserved", "minimumAgeConfirmation": confirmation}})
    expect(page.get_by_test_id("signup-controls")).to_be_visible()

    # Local consent survives binding its first id, even before saved metadata arrives.
    page.goto(BASE + "/?no-id=true")
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Continue to signup").click()
    expect(page.get_by_test_id("signup-controls")).to_be_visible()
    update_attempt({"id": "fixture-attempt-first", "status": "missing_requirements", "abandonAt": 9999999999999})
    expect(page.get_by_test_id("signup-controls")).to_be_visible()
    # A different concrete id must not inherit that checkbox's local intent.
    update_attempt({"id": "fixture-attempt-replacement"})
    expect(page.get_by_role("checkbox")).not_to_be_checked()
    expect(page.get_by_test_id("signup-controls")).to_have_count(0)
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Continue to signup").click()
    update_attempt({"status": "abandoned"})
    expect(page.get_by_role("checkbox")).not_to_be_checked()
    expect(page.get_by_test_id("signup-controls")).to_have_count(0)

    # Google and GitHub use the same callback/age flow and preserve app destinations.
    from urllib.parse import urlencode, urlparse, parse_qs
    return_url = 'https://kazi.iyanju.com/account/link/central'
    for provider in ['google', 'github']:
        page.goto(BASE + '/?' + urlencode({'mode': 'sign-in', 'no-account': 'true', 'provider': provider, 'return_to': return_url}) + '#/sso-callback')
        expect(page.get_by_role('heading', name='Create your iYANJU account.')).to_be_visible()
        assert page.evaluate('window.__fixtureCreatedAccounts || 0') == 0
        signup = page.get_by_role('link', name='Continue to signup', exact=True)
        assert parse_qs(urlparse(signup.get_attribute('href')).query)['redirect_url'] == [return_url]
        retry = page.get_by_role('link', name='Try another sign-in method', exact=True)
        assert '#' not in retry.get_attribute('href')
        signup.click()
        expect(page.get_by_role('checkbox')).not_to_be_checked()
        expect(page.get_by_test_id('signup-controls')).to_have_count(0)
        assert parse_qs(urlparse(page.url).query)['redirect_url'] == [return_url]
        assert page.evaluate('window.__fixtureCreatedAccounts || 0') == 0
        page.get_by_role('checkbox').check()
        page.get_by_role('button', name='Continue to signup').click()
        expect(page.get_by_test_id('signup-controls')).to_be_visible()
        # A full OAuth return can be complete before the prebuilt UI finalizes it.
        page.goto(BASE + '/?' + urlencode({'resume': 'valid', 'status': 'complete', 'provider': provider, 'return_to': return_url}) + '#/sso-callback')
        expect(page.get_by_test_id('signup-controls')).to_be_visible()
        page.goto(BASE + '/?' + urlencode({'status': 'complete', 'provider': provider}) + '#/sso-callback')
        expect(page.get_by_role('checkbox')).not_to_be_checked()
        expect(page.get_by_test_id('signup-controls')).to_have_count(0)
    page.goto(BASE + '/?resume=valid&expired=true#/sso-callback')
    expect(page.get_by_role('checkbox')).not_to_be_checked()
    expect(page.get_by_test_id('signup-controls')).to_have_count(0)
    page.goto(BASE + '/?resume=valid&status=abandoned#/sso-callback')
    expect(page.get_by_role('checkbox')).not_to_be_checked()

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
    # A late save for user A must not confirm eligibility for a switched user B.
    page.goto(BASE + '/?signed-in=true&save=delayed')
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Continue', exact=True).click()
    page.evaluate("window.dispatchEvent(new CustomEvent('fixture:user-change', {detail: {id: 'fixture-user-B'}}))")
    expect(page.get_by_role('checkbox')).not_to_be_checked()
    page.wait_for_timeout(450)
    expect(page.get_by_role('checkbox')).not_to_be_checked()
    expect(page.get_by_role('button', name='Sign out', exact=True)).to_have_count(0)
    assert not errors, errors
    browser.close()
    print("PASS: Google/GitHub explicit recovery, app return destinations, reactive age metadata, first-id binding, attempt replacement, expiry, abandonment, user switching, keyboard, mobile, axe, and sign-in props checked with a local Clerk test double.")
