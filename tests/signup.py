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
    <PageIntro eyebrow="ACCOUNT PREVIEW" title="Your iYANJU account.">
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
import { useEffect, useState, useSyncExternalStore } from 'react';
export function ClerkLoaded({ children }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  return loaded ? <><span hidden data-testid="fixture-clerk-ready" />{children}</> : null;
}
export function ClerkLoading() { return null; }
export function Show({ when, children }) {
  const params = useSearchParams();
  const signedIn = params.get('signed-in') === 'true';
  return when === (signedIn ? 'signed-in' : 'signed-out') ? children : null;
}
export function useClerk() { return { signOut: async () => {} }; }
const fixtureDeclaration = {
  confirmed: true, minimumAge: 18, confirmedAt: '2026-10-26T06:00:00.000Z', version: 1,
};
let fixtureUser = null;
const userSubscribers = new Set();
function publishFixtureUser(user) {
  fixtureUser = user;
  for (const notify of userSubscribers) notify();
}
function changeFixtureUser(event) {
  publishFixtureUser({
    id: event.detail.id, fullName: 'Next Fixture User', primaryEmailAddress: {emailAddress: 'next@example.test'},
    unsafeMetadata: event.detail.eligible ? {minimumAgeConfirmation: fixtureDeclaration} : {},
  });
}
function subscribeFixtureUser(notify) {
  userSubscribers.add(notify);
  if (userSubscribers.size === 1) window.addEventListener('fixture:user-change', changeFixtureUser);
  window.__userFixtureReady = true;
  return () => {
    userSubscribers.delete(notify);
    if (userSubscribers.size === 0) {
      window.__userFixtureReady = false;
      window.removeEventListener('fixture:user-change', changeFixtureUser);
    }
  };
}
const readFixtureUser = () => fixtureUser;
const serverFixtureUser = () => null;
export function useUser() {
  const params = useSearchParams();
  if (fixtureUser === null && typeof window !== 'undefined') fixtureUser = {
    id: 'fixture-user-A', fullName: 'Fixture User', primaryEmailAddress: {emailAddress: 'fixture@example.test'},
    unsafeMetadata: params.get('eligible') ? {minimumAgeConfirmation: fixtureDeclaration} : {},
  };
  const user = useSyncExternalStore(subscribeFixtureUser, readFixtureUser, serverFixtureUser);
  return { user: user && { ...user, update: async ({ unsafeMetadata }) => {
    const currentId = user.id;
    if (params.get('save') === 'fail') throw new Error('Synthetic save failure');
    if (params.get('save') === 'delayed') await new Promise(resolve => setTimeout(resolve, 350));
    if (fixtureUser?.id === currentId) publishFixtureUser({ ...fixtureUser, unsafeMetadata });
  } } };
}
export function UserButton() { return <button>User</button>; }
export function UserAvatar() { return <span aria-hidden="true">FU</span>; }
export function UserProfile(props) { return <div data-testid="embedded-profile"><h2>Profile &amp; security</h2><output data-testid="profile-routing">{props.routing}</output></div>; }
const fixtureGetToken = async options => {
  window.__fixtureTokenOptions = [...(window.__fixtureTokenOptions || []), options];
  return 'fixture-session';
};
export function useAuth() {
  const params = useSearchParams();
  return { getToken: fixtureGetToken, sessionClaims: { aud: params.get('bad-audience') ? undefined : 'convex' } };
}
export function useSignIn() {
  const params = useSearchParams();
  return {
    fetchStatus: params.get('fetching') ? 'fetching' : 'idle',
    signIn: {
      status: 'needs_identifier',
      firstFactorVerification: {
        status: params.get('no-account') ? (params.get('verification') || 'transferable') : null,
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
    service_requests = []
    services = {"version": 1, "services": [
        {"serviceId": "kazi", "state": "activated", "activation": {"activatedAt": None, "firstObservedAt": 1800000000000}},
        {"serviceId": "wlan", "state": "unavailable"},
        {"serviceId": "playkin", "state": "unavailable"},
    ]}
    service_status = 200
    hold_service_request = False
    held_service_routes = []
    def service_response(route):
        service_requests.append(route.request)
        if hold_service_request:
            held_service_routes.append(route)
            return
        route.fulfill(status=service_status, json=services)
    page.expose_function('__fixtureHeldServiceReady', lambda: len(held_service_routes) == 1)
    page.route("**/account/services", service_response)
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
    def switch_user(detail):
        page.wait_for_function("window.__userFixtureReady === true")
        page.evaluate("detail => window.dispatchEvent(new CustomEvent('fixture:user-change', {detail}))", detail)
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
    for provider, verification in [('google', 'transferable'), ('google', 'verified'), ('github', 'transferable'), ('github', 'verified')]:
        page.goto(BASE + '/?' + urlencode({'mode': 'sign-in', 'no-account': 'true', 'provider': provider, 'verification': verification, 'return_to': return_url}) + '#/sso-callback')
        expect(page.get_by_role('heading', name='Create your iYANJU account.')).to_be_visible()
        assert page.evaluate('window.__fixtureCreatedAccounts || 0') == 0
        signup = page.get_by_role('link', name='Continue to signup', exact=True)
        assert parse_qs(urlparse(signup.get_attribute('href')).query)['redirect_url'] == [return_url]
        retry = page.get_by_role('link', name='Try another sign-in method', exact=True)
        assert '#' not in retry.get_attribute('href')
        signup.click()
        page.get_by_test_id('fixture-clerk-ready').wait_for(state='attached')
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
    # No private service lookup is made for anonymous users or before eligibility.
    assert not service_requests
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
    expect(page.get_by_role("heading", name="Your services")).to_be_visible()
    # A late save for user A must not confirm eligibility for a switched user B.
    page.goto(BASE + '/?signed-in=true&save=delayed')
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Continue', exact=True).click()
    switch_user({'id': 'fixture-user-B'})
    expect(page.get_by_role('checkbox')).not_to_be_checked()
    page.wait_for_timeout(450)
    expect(page.get_by_role('checkbox')).not_to_be_checked()
    expect(page.get_by_role('button', name='Sign out', exact=True)).to_have_count(0)
    # The account entry is neutral and only confirmed service records become rows.
    assert service_requests, 'eligible account must request the owner-only summary'
    page.goto(BASE + '/?signed-in=true&eligible=true')
    expect(page.get_by_role('heading', level=1)).to_have_text('Your iYANJU account.')
    expect(page.get_by_role('link', name='Account', exact=True)).to_be_visible()
    expect(page.get_by_role('list', name='Activated services').get_by_role('heading', name='Kazi', exact=True)).to_be_visible()
    expect(page.get_by_text('First-use date unknown', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='Wlan', exact=True)).to_have_count(0)
    expect(page.get_by_role('heading', name='PlayKin', exact=True)).to_have_count(0)
    for options in page.evaluate('window.__fixtureTokenOptions || []'):
        assert options == {'skipCache': True}
    assert service_requests[-1].headers['authorization'] == 'Bearer fixture-session'
    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if width in [390, 1440]: page.screenshot(path=str(OUT / f'account-services-{width}.png'), full_page=True)
    page.set_viewport_size({'width': 1440, 'height': 900})
    requests_before_profile = len(service_requests)
    page.goto(BASE + '/?signed-in=true&eligible=true&view=profile')
    expect(page.get_by_test_id('embedded-profile')).to_be_visible()
    expect(page.get_by_test_id('profile-routing')).to_have_text('hash')
    assert len(service_requests) == requests_before_profile
    page.screenshot(path=str(OUT / 'account-profile-1440.png'), full_page=True)
    services = {'version': 1, 'services': [{'serviceId': id, 'state': 'not_activated'} for id in ['kazi', 'wlan', 'playkin']]}
    page.goto(BASE + '/?signed-in=true&eligible=true')
    expect(page.get_by_role('heading', name='No activated services yet.')).to_be_visible()
    services = {'version': 1, 'services': [{'serviceId': id, 'state': 'unavailable'} for id in ['kazi', 'wlan', 'playkin']]}
    page.reload()
    expect(page.get_by_text('Some service checks are unavailable.', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='No activated services yet.')).to_have_count(0)
    service_status = 503
    page.reload()
    expect(page.get_by_text('Your service list is unavailable right now.', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='No activated services yet.')).to_have_count(0)
    service_status = 200
    requests_before_bad_audience = len(service_requests)
    page.goto(BASE + '/?signed-in=true&eligible=true&bad-audience=true')
    expect(page.get_by_text('Your service list is unavailable right now.', exact=True)).to_be_visible()
    assert len(service_requests) == requests_before_bad_audience
    # Two already-eligible identities cannot share an in-flight private summary.
    hold_service_request = True
    page.goto(BASE + '/?signed-in=true&eligible=true')
    page.wait_for_function('async () => await window.__fixtureHeldServiceReady()')
    assert len(held_service_routes) == 1
    hold_service_request = False
    date_a, date_b = 1577923200000, 1735776000000
    services = {'version': 1, 'services': [
        {'serviceId': 'kazi', 'state': 'activated', 'activation': {'activatedAt': date_b, 'firstObservedAt': date_b}},
        {'serviceId': 'wlan', 'state': 'unavailable'}, {'serviceId': 'playkin', 'state': 'unavailable'},
    ]}
    switch_user({'id': 'fixture-eligible-B', 'eligible': True})
    expect(page.get_by_text('Next Fixture User', exact=True)).to_be_visible()
    label_b = 'First used ' + page.evaluate("date => new Intl.DateTimeFormat('en', {dateStyle:'medium'}).format(date)", date_b)
    label_a = 'First used ' + page.evaluate("date => new Intl.DateTimeFormat('en', {dateStyle:'medium'}).format(date)", date_a)
    expect(page.get_by_text(label_b, exact=True)).to_be_visible()
    try:
        held_service_routes[0].fulfill(status=200, json={'version': 1, 'services': [
            {'serviceId': 'kazi', 'state': 'activated', 'activation': {'activatedAt': date_a, 'firstObservedAt': date_a}},
            {'serviceId': 'wlan', 'state': 'unavailable'}, {'serviceId': 'playkin', 'state': 'unavailable'},
        ]})
    except Exception as error:
        # Aborting the old owner's request is the expected safe outcome.
        if 'interception' not in str(error).lower() and 'invalid' not in str(error).lower() and 'closed' not in str(error).lower(): raise
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text(label_b, exact=True)).to_be_visible()
    expect(page.get_by_text(label_a, exact=True)).to_have_count(0)
    # Completing a reviewed return handoff never fans out to the service list.
    requests_before_handoff = len(service_requests)
    page.route('**/tools', lambda route: route.fulfill(content_type='text/html', body='<p>Fixture application handoff</p>'))
    page.goto(BASE + '/?signed-in=true&eligible=true&return_to=%2Ftools')
    expect(page.get_by_text('Fixture application handoff', exact=True)).to_be_visible()
    assert len(service_requests) == requests_before_handoff
    assert not errors, errors
    browser.close()
    print("PASS: Google/GitHub explicit recovery, app return destinations, reactive age metadata, first-id binding, attempt replacement, expiry, abandonment, user switching, keyboard, mobile, axe, and sign-in props checked with a local Clerk test double.")
