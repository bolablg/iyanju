"""Meaningful public journeys, accessibility, network privacy, and responsive checks.
Run against a separately running iyanju preview. Artifacts stay in ignored test-results/.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("IYANJU_TEST_URL", "http://127.0.0.1:3000").rstrip("/")
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)
ROUTES = ["/", "/tools", "/tools/kazi", "/about", "/privacy", "/contact", "/terms", "/account", "/account/sign-up", "/this-page-does-not-exist"]
WIDTHS = [320, 390, 768, 1024, 1440]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(permissions=["clipboard-read", "clipboard-write"], reduced_motion="reduce")
    page = context.new_page()
    external = set()
    errors = []
    page.on("request", lambda req: external.add(req.url) if urlparse(req.url).netloc != urlparse(BASE).netloc else None)
    page.on("pageerror", lambda error: errors.append(str(error)))
    reports = []
    for width in WIDTHS:
        page.set_viewport_size({"width": width, "height": 900})
        for route in ROUTES:
            response = page.goto(BASE + route)
            page.wait_for_load_state("networkidle")
            page.evaluate("document.fonts.ready")
            assert response.status == (404 if "does-not-exist" in route else 200), (width, route, response.status)
            expect(page.locator("main h1")).to_have_count(1)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), ("overflow", width, route)
            assert "iyanju" in page.title()
            if route in ["/privacy", "/terms", "/account", "/account/sign-up"]:
                assert "noindex" in page.locator('meta[name="robots"]').get_attribute("content")
            elif "does-not-exist" not in route:
                assert page.locator('link[rel="canonical"]').get_attribute("href") == "https://iyanju.com" + ("" if route == "/" else route)
            # axe checks include contrast, names, semantics, and WCAG 2.2 AA target-size rules.
            page.add_script_tag(path=str(ROOT / "node_modules/axe-core/axe.min.js"))
            result = page.evaluate("""async () => { const r = await axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}); return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})); }""")
            reports.append({"width": width, "route": route, "violations": result})
            if width in [390, 768, 1440] and route in ["/", "/tools/kazi", "/contact", "/privacy", "/account"]:
                slug = route.strip("/").replace("/", "-") or "home"
                page.screenshot(path=str(OUT / f"{slug}-{width}.png"), full_page=True)
    (OUT / "accessibility.json").write_text(json.dumps(reports, indent=2))
    failures = [r for r in reports if r["violations"]]
    assert not failures, json.dumps(failures, indent=2)

    # Keyboard-first mobile menu, escape recovery, route navigation, and skip link.
    page.set_viewport_size({"width":390,"height":844})
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    page.keyboard.press("Tab")
    expect(page.get_by_role("link", name="Skip to content")).to_be_focused()
    page.keyboard.press("Enter")
    expect(page.locator("main")).to_be_focused()
    menu = page.get_by_role("button", name="Menu")
    menu.focus()
    page.keyboard.press("Enter")
    expect(page.get_by_role("button", name="Close")).to_have_attribute("aria-expanded", "true")
    page.keyboard.press("Tab")
    expect(page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Applications")).to_be_focused()
    page.keyboard.press("Escape")
    expect(menu).to_be_focused()
    expect(menu).to_have_attribute("aria-expanded", "false")
    menu.click()
    page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Applications").click()
    expect(page).to_have_url(BASE + "/tools")
    expect(page.get_by_role("button", name="Menu")).to_have_attribute("aria-expanded", "false")
    page.get_by_role("link", name="Meet Kazi", exact=True).click()
    expect(page).to_have_url(BASE + "/tools/kazi")
    expect(page.get_by_role("link", name="Open Kazi", exact=True).first).to_have_attribute("href", "https://kazi.iyanju.com")
    expect(page.get_by_role("link", name="Read Kazi’s privacy notice")).to_have_attribute("href", "https://kazi.iyanju.com/privacy")
    # A real browser click is intercepted before leaving the local site; no Kazi state changes.
    page.route("https://kazi.iyanju.com/", lambda route: route.fulfill(body="<h1>Kazi destination verified</h1>",content_type="text/html"))
    page.get_by_role("link", name="Open Kazi", exact=True).first.click()
    expect(page).to_have_url("https://kazi.iyanju.com/")
    external.discard("https://kazi.iyanju.com/")
    page.unroute("https://kazi.iyanju.com/")

    page.goto(BASE + "/contact")
    page.wait_for_load_state("networkidle")
    expect(page.locator("a.email-address")).to_have_attribute("href", "mailto:bolajibalogoun@gmail.com?subject=Hello%20iyanju")
    page.get_by_role("button", name="Copy email address").click()
    expect(page.get_by_role("status")).to_have_text("Email address copied.")
    assert page.evaluate("navigator.clipboard.readText()") == "bolajibalogoun@gmail.com"
    page.evaluate("() => { navigator.clipboard.writeText = () => Promise.reject(new Error('Denied for test')); }")
    page.get_by_role("button", name="Copy email address").click()
    expect(page.get_by_role("status")).to_contain_text("Could not copy")

    for route in ["/privacy", "/terms", "/account", "/account/sign-up", "/tools/kazi"]:
        page.goto(BASE + route)
        page.reload()
        page.wait_for_load_state("networkidle")
        expect(page.locator("main h1")).to_be_visible()
    expect(page.get_by_role("link", name="Open Kazi", exact=True).first).to_be_visible()
    page.goto(BASE + "/account")
    expect(page.get_by_text("Accounts will be available soon.")).to_be_visible()
    assert not page.locator("iframe").count()
    assert not context.cookies(), "Public site unexpectedly set cookies"
    assert page.evaluate("localStorage.length") == 0
    assert not external, ("Unexpected external requests", external)
    assert not errors, ("Browser runtime errors", errors)

    sitemap = context.request.get(BASE + "/sitemap.xml").text()
    assert "https://iyanju.com/tools/kazi" in sitemap
    assert all(path not in sitemap for path in ["/privacy", "/terms", "/account"])
    response = context.request.get(BASE + "/opengraph-image")
    assert response.status == 200 and response.headers["content-type"].startswith("image/png")
    # Server-rendered public content and product links survive without JavaScript.
    plain = browser.new_context(java_script_enabled=False,viewport={"width":1440,"height":900})
    nojs = plain.new_page()
    for route in ["/", "/tools", "/tools/kazi", "/about", "/privacy", "/contact", "/terms"]:
        nojs.goto(BASE + route)
        expect(nojs.locator("main h1")).to_be_visible()
    plain.close()
    browser.close()
    print(f"PASS: {len(WIDTHS)*len(ROUTES)} responsive route checks; zero axe WCAG A/AA violations; keyboard, contact, navigation, 404, reload, no-JS, metadata, and no-tracker checks.")
