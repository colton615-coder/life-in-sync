import time
from playwright.sync_api import sync_playwright

def verify_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate iPhone 16
        iphone_16 = p.devices['iPhone 14 Pro Max'] # Close enough approximation
        # Override viewport in the device dict if needed, or pass explicitly
        # device_dict already has viewport, so we shouldn't pass it again as kwarg

        context = browser.new_context(**iphone_16)
        page = context.new_page()

        # Navigate
        page.goto("http://localhost:5173")

        # Wait for load
        page.wait_for_load_state('domcontentloaded')

        # Go to Settings
        page.click('button[aria-label="settings"]')

        # Scroll to Module Data section - use a more specific selector
        # The CardTitle has "Module Data"
        page.locator('div', has_text="Module Data").first.scroll_into_view_if_needed()

        # Wait a bit for animations
        time.sleep(1)

        # Screenshot
        page.screenshot(path="verification/settings_module_reset.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_settings()
