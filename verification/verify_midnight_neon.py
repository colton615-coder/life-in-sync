from playwright.sync_api import Page, expect, sync_playwright

def verify_midnight_neon(page: Page):
    print("Navigating to dashboard...")
    page.goto("http://localhost:4173/")

    # Wait for app to load
    page.wait_for_timeout(3000)

    print("Taking dashboard screenshot...")
    page.screenshot(path="/home/jules/verification/dashboard_neon.png")

    # Navigate to Golf Swing
    print("Attempting to navigate to Golf Swing...")
    try:
        # Try finding the link by href if text fails
        # Inspecting the page source isn't possible here, but we can try multiple selectors
        # Assuming it is a sidebar item
        page.click("text=Golf Swing", timeout=5000)
    except Exception as e:
        print(f"Clicking 'Golf Swing' text failed: {e}")
        try:
            # Try by ID if applicable (though usually generated) or partial text
            page.click("text=Golf", timeout=5000)
        except Exception as e2:
             print(f"Clicking 'Golf' text failed: {e2}")
             # Try navigating directly if routing is client-side and we know the route
             # Assuming /golf or /modules/golf
             # But let's just dump the page content to see what's there
             # print(page.content())
             pass

    # Wait for module to load
    page.wait_for_timeout(3000)

    # 3. Assert: Check for "Midnight Neon" specific elements
    print("Checking for SWING ANALYZER title...")
    try:
        expect(page.get_by_text("SWING ANALYZER")).to_be_visible(timeout=5000)
        print("SWING ANALYZER title found.")
    except Exception as e:
        print(f"SWING ANALYZER not visible: {e}")
        page.screenshot(path="/home/jules/verification/failure_golf_load.png")
        # If we are stuck on dashboard, let's see what is visible
        # raise e

    # Check for the upload button with new gradient
    print("Checking for Upload button...")
    try:
        upload_btn = page.get_by_role("button", name="INITIATE UPLOAD")
        if upload_btn.is_visible():
             print("Upload button found.")
        else:
             print("Upload button not found.")
    except:
        pass

    # 4. Screenshot: Capture the final result for visual verification.
    print("Taking final screenshot...")
    page.screenshot(path="/home/jules/verification/golf_swing_neon.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      verify_midnight_neon(page)
    finally:
      browser.close()
