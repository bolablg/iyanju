import json
import os
import re
import sys
import traceback
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from playwright.sync_api import sync_playwright, expect

ROOT = Path.cwd()
OUT = ROOT / "test-results"
BASE = os.environ.get("IYANJU_TEST_BASE_URL", "http://127.0.0.1:49569")
EMAIL = os.environ["IYANJU_TEST_EMAIL"]
USERNAME = os.environ["IYANJU_TEST_USERNAME"]
PASSWORD = os.environ["IYANJU_TEST_PASSWORD"]
TOKEN = os.environ["CLERK_TESTING_TOKEN"]
FAPI = os.environ["CLERK_FRONTEND_API"]
SIGNED_IN = "You’re signed in to iYANJU."

def token_route(route):
    url = urlparse(route.request.url)
    params = [(k,v) for k,v in parse_qsl(url.query, keep_blank_values=True) if k != "__clerk_testing_token"]
    params.append(("__clerk_testing_token", TOKEN))
    route.continue_(url=urlunparse(url._replace(query=urlencode(params))))

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion="reduce", viewport={"width": 1440, "height": 1000})
        context.route(f"https://{FAPI}/v1/**", token_route)
        page = context.new_page()
        page.set_default_timeout(30000)
        handoffs = []
        def app_handoff(route):
            handoffs.append(route.request.url)
            route.fulfill(status=200, content_type="text/html", body="<h1>Application handoff</h1>")
        page.route("http://127.0.0.1:49570/**", app_handoff)
        try:
            response = page.goto(BASE + "/account/sign-up")
            assert response.status == 200, "Signup response failed"
            checkbox = page.get_by_role("checkbox", name="I confirm I am 18 or older.")
            expect(checkbox).not_to_be_checked()
            expect(page.get_by_role("button", name="Continue to signup", exact=True)).to_be_disabled()
            assert page.locator('input[type="date"]').count() == 0
            checkbox.check()
            page.get_by_role("button", name="Continue to signup", exact=True).click()
            expect(page.get_by_role("button", name="Google", exact=True)).to_be_visible()
            expect(page.get_by_role("button", name="GitHub", exact=True)).to_be_visible()
            page.get_by_label("Username", exact=True).fill(USERNAME)
            page.get_by_label("Email address", exact=True).fill(EMAIL)
            page.get_by_label("Password", exact=True).fill(PASSWORD)
            page.get_by_role("button", name="Continue", exact=True).click()
            otp = page.locator('input[autocomplete="one-time-code"]')
            otp.wait_for(state="visible")
            otp.fill("424242")
            signed_in = page.get_by_role("heading", name=SIGNED_IN, exact=True)
            expect(signed_in).to_be_visible(timeout=30000)
            expect(page).to_have_url(BASE + "/account")
            page.screenshot(path=str(OUT / "clerk-real-dev-signed-in.png"), full_page=True)
            print("Real Clerk development signup completed.")
            page.get_by_role("button", name="Sign out", exact=True).click()
            identifier = page.get_by_role("textbox", name=re.compile("Email address|Username", re.I)).first
            expect(identifier).to_be_visible()
            identifier.fill(EMAIL)
            password = page.get_by_label("Password", exact=True)
            if password.is_visible():
                password.fill(PASSWORD)
                page.get_by_role("button", name="Continue", exact=True).click()
            else:
                page.get_by_role("button", name="Continue", exact=True).click()
                challenge = password.or_(otp)
                challenge.wait_for(state="visible")
                if password.is_visible():
                    password.fill(PASSWORD)
                    page.get_by_role("button", name="Continue", exact=True).click()
                else:
                    otp.fill("424242")
            expect(page.get_by_role("heading", name=SIGNED_IN, exact=True)).to_be_visible(timeout=30000)
            # Existing sessions return only to an explicitly allowed local application.
            page.goto(BASE + "/account?redirect_url=" + urlencode({"x": "http://127.0.0.1:49570/complete?from=login"})[2:])
            expect(page.get_by_role("heading", name="Application handoff")).to_be_visible()
            assert handoffs == ["http://127.0.0.1:49570/complete?from=login"]
            page.goto(BASE + "/account?redirect_url=https%3A%2F%2Fevil.example")
            expect(page.get_by_role("heading", name=SIGNED_IN, exact=True)).to_be_visible()
            assert urlparse(page.url).netloc == urlparse(BASE).netloc
            page.get_by_role("button", name="Sign out", exact=True).click()
            expect(page.get_by_role("textbox", name=re.compile("Email address|Username", re.I)).first).to_be_visible()
            page.screenshot(path=str(OUT / "clerk-real-dev-signed-out.png"), full_page=True)
            print("Real Clerk development sign-in and sign-out completed.")
        except Exception:
            page.screenshot(path=str(OUT / "clerk-real-dev-failure.png"), full_page=True)
            body = page.locator("body").inner_text()
            for secret in [TOKEN, PASSWORD]:
                body = body.replace(secret, "[redacted]")
            (OUT / "clerk-real-dev-failure.txt").write_text(body)
            raise
        finally:
            context.close()
            browser.close()
except Exception:
    message = traceback.format_exc()
    for secret in [TOKEN, PASSWORD]:
        message = message.replace(secret, "[redacted]")
    print(message, file=sys.stderr)
    sys.exit(1)
