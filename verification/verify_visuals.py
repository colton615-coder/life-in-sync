import os
from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Emulate iPhone 16 explicitly without spreading the device dict which causes collision
        # iPhone 16 is 393x852, DPR 3.
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()

        # 1. Verify Loading Screen
        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait a moment for the loading screen to fully render its animation
        page.wait_for_timeout(1000)

        # Take screenshot of Loading Screen
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/loading_screen_v2.png")
        print("Captured loading_screen_v2.png")

        # 2. Verify LifeCore Header (Dashboard)
        # Wait for loading screen to disappear (it has a minimum 3.5s timer)
        print("Waiting for dashboard...")
        try:
            # Let's wait specifically for the FloatingDock to appear, which indicates the dashboard is active
            # The loading screen takes at least 3.5s + 0.5s fade out.
            page.wait_for_selector('nav[aria-label="Main Navigation"]', timeout=10000)
        except Exception as e:
            print(f"Timed out waiting for dashboard: {e}")

        # Take screenshot of Dashboard
        page.screenshot(path="verification/dashboard_header_v2.png")
        print("Captured dashboard_header_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_visuals()
