
import os
from playwright.sync_api import sync_playwright

def verify_golf_swing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate iPhone 16 (Use iPhone 14 Pro Max or similar if 16 not in list, or custom viewport)
        # 393x852 is iPhone 15/16 Pro width/height approx
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            device_scale_factor=3
        )
        page = context.new_page()

        try:
            # 1. Start App
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            # Wait for hydration
            page.wait_for_timeout(2000)

            # 2. Inject state to bypass onboarding/auth if needed or directly access module
            # Navigating to Golf module via floating dock
            # The ID is 'golf', so aria-label is 'golf'
            print("Clicking Golf module (aria-label='golf')...")
            page.get_by_label("golf", exact=True).click()

            # 3. Wait for Golf module to load
            print("Waiting for Golf module...")
            # Wait for the text "SWING ANALYZER" which is in the header
            page.wait_for_selector("text=SWING ANALYZER", timeout=10000)

            # 4. Take screenshot of Initial State
            page.screenshot(path="verification/golf_swing_initial.png")
            print("Screenshot saved: verification/golf_swing_initial.png")

            # 5. Verify no crash
            content = page.content()
            if "System Failure" in content or "Can't find variable" in content:
                 print("CRITICAL: Crash detected on load!")
                 exit(1)
            else:
                 print("SUCCESS: Golf module loaded without crash.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_golf_swing()
