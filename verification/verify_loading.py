import time
from playwright.sync_api import sync_playwright

def verify_loading_screen():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with iPhone 16 viewport as often requested by this user
        context = browser.new_context(viewport={"width": 393, "height": 852}, device_scale_factor=3)
        page = context.new_page()

        # Navigate to home. Loading screen appears immediately.
        try:
            page.goto("http://localhost:5173", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")
            # Try capturing anyway in case it's just a load event timeout
            page.screenshot(path="verification/loading_screen_error.png")
            return

        # Give it a moment to render the initial frame, but catch it before 3.5s
        time.sleep(1)

        # Take screenshot
        output_path = "verification/loading_screen.png"
        page.screenshot(path=output_path)
        print(f"Screenshot saved to {output_path}")

        browser.close()

if __name__ == "__main__":
    verify_loading_screen()
