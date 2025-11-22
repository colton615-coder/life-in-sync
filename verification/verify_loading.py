from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_loading_screen(page: Page):
    print("Navigating to app...")
    page.goto("http://localhost:5000")

    # Expect the loading screen to be present initially
    # (It might be too fast to catch, but let's try to see if it eventually disappears)

    print("Waiting for loading screen to disappear...")
    # "Loading your life together" is one of the messages
    # We just want to wait for the main content.
    # The App renders <Dashboard /> which likely has text "Dashboard" or similar.
    # Or we can look for the NavigationButton.

    # Wait for the dashboard to load (timeout of 10s should be enough with our fix)
    # The fix sets a 5s safety valve.
    try:
        page.wait_for_selector('text="Good"', timeout=10000) # "Good morning/afternoon/evening" usually
        # OR look for "Habits" or "Finance" which are modules
        print("Found 'Good' text, implies Dashboard loaded.")
    except:
        print("Could not find 'Good' text, trying to find 'Habits' or other content.")
        page.wait_for_selector('text="Habits"', timeout=10000)
        print("Found 'Habits'.")

    # Take a screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/dashboard_loaded.png")

    # Verify Loading Screen is GONE
    # The loading screen has text like "Loading your life together"
    # verify it is not visible
    visible = page.get_by_text("Loading your life together").is_visible()
    if visible:
        print("WARNING: Loading text still visible!")
    else:
        print("Loading text is not visible. Success.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_loading_screen(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
