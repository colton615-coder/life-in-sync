from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def verify_golf_swing_upload(page: Page):
    # 1. Navigate to the app
    print("Navigating to app...")
    page.goto("http://localhost:5174")

    # Wait for app to load
    page.wait_for_load_state("networkidle")

    print("Checking navigation state...")

    # Check if Golf Swing button is already visible (Drawer open)
    golf_button = page.get_by_role("button", name="Golf Swing")

    if not golf_button.is_visible():
        print("Golf Swing button not visible. Attempting to open drawer...")

        # Try to find the toggle button
        toggle_btn = page.locator("button[aria-label*='navigation']").first

        # If it says "Close", the drawer is open but maybe the button is hidden?
        label = toggle_btn.get_attribute("aria-label")
        print(f"Toggle button label: {label}")

        if "Open" in label:
            toggle_btn.click()
            # Wait for drawer animation
            time.sleep(1)

    print("Clicking Golf Swing button...")
    # Force click if needed or scroll
    golf_button.scroll_into_view_if_needed()
    golf_button.click(force=True) # Force click in case of overlay issues

    # Wait for module to load
    print("Waiting for module to load...")
    # In empty state it shows "AI-Powered Golf Swing Analysis"
    expect(page.get_by_text("AI-Powered Golf Swing Analysis", exact=False)).to_be_visible(timeout=10000)
    print("Golf Swing module loaded.")

    # 3. Locate the file input and upload a dummy video
    # Create a dummy video file
    with open("verification/test_swing.mp4", "wb") as f:
        f.write(b"dummy video content" * 100000) # 1.6MB dummy

    # The input is hidden, so we need to handle the file chooser
    # We trigger the click on "Upload Your First Swing"
    print("Uploading video...")

    # Wait a beat for animations to settle
    time.sleep(1)

    # If there are multiple buttons (e.g. "New Analysis" vs "Upload Your First Swing"), handle both
    # Use aria-label as it's more robust per code inspection
    upload_btn = page.get_by_label("Upload your first golf swing video for analysis")

    # Fallback to text if label fails (or if we got the label wrong)
    if not upload_btn.is_visible():
        print("Button by label not found, trying text...")
        upload_btn = page.get_by_text("Upload Your First Swing")

    with page.expect_file_chooser() as fc_info:
        upload_btn.click()

    file_chooser = fc_info.value
    file_chooser.set_files("verification/test_swing.mp4")

    # 4. Verify Transition to Club Selection
    # The bug was that this step didn't happen.
    print("Waiting for club selection dialog...")
    # We expect "Select Club Used" dialog to appear.
    expect(page.get_by_role("heading", name="Select Club Used")).to_be_visible()

    # Take screenshot of Club Selection
    page.screenshot(path="verification/1_club_selection.png")
    print("Club selection dialog visible.")

    # 5. Select a Club
    print("Selecting club...")
    page.get_by_role("button", name="Driver").click()

    # 6. Verify Transition to Analysis (Processing)
    print("Waiting for analysis state...")
    # We expect "Analyzing Your Swing" card.
    # Use a more specific locator to avoid ambiguity with sr-only text
    expect(page.locator(".card-title, h3, div").filter(has_text="Analyzing Your Swing").first).to_be_visible()

    # Take screenshot of Analysis
    page.screenshot(path="verification/2_analyzing.png")
    print("Analysis processing visible.")

    # 7. Wait for Completion (Simulated is fast)
    print("Waiting for results...")
    # Expect we are in the Metrics view (default tab)
    # Verify "Hip Rotation" or other metric is visible, which confirms success
    expect(page.get_by_text("Hip Rotation", exact=False)).to_be_visible(timeout=20000)

    # Take screenshot of Result
    page.screenshot(path="verification/3_result.png")
    print("Analysis complete and results visible.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_golf_swing_upload(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
