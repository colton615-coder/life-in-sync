
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_app_loads(page: Page):
    # Navigate to the app
    page.goto("http://localhost:5173")

    # Wait for the dashboard to load
    # The screenshot showed "Dashboard" as the main heading
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)

    # Take a screenshot of Dashboard to confirm
    page.screenshot(path="verification/dashboard_verified.png")

    # Check if settings page works (which uses useKV and Spark shim)
    page.goto("http://localhost:5173/settings")

    # Look for "Settings" heading
    expect(page.get_by_role("heading", name="Settings")).to_be_visible()

    # Take a screenshot of Settings to verify it didn't crash
    page.screenshot(path="verification/settings_verified.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app_loads(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error_retry.png")
        finally:
            browser.close()
