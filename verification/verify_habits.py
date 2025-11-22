
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_habits_page(page: Page):
    # 1. Arrange: Go to the home page
    print("Navigating to home page...")
    page.goto("http://localhost:5173")

    # Wait for page to load
    time.sleep(2)

    # 2. Act: Click on Habits module
    # Note: This assumes there is a way to navigate to Habits.
    # Based on the file structure, Habits is a module. I need to find how to access it.
    # Usually these dashboards have a sidebar or grid.
    # I'll look for text "Habits" or an icon.

    print("Looking for Habits link...")
    # Trying to find the Habits card/link on the dashboard
    habits_link = page.get_by_text("Habits", exact=False).first
    if habits_link.is_visible():
        habits_link.click()
    else:
        print("Could not find 'Habits' text, trying to find icon...")
        # Fallback or maybe it's already on the page if it's a single page app with sections
        pass

    time.sleep(2)

    # 3. Assert: Check if Habits page is loaded
    print("Checking for Habits header...")
    expect(page.get_by_text("Habits", exact=True)).to_be_visible()

    # Check if "Create Your First Habit" button or "New" button is visible
    # This confirms the module loaded and didn't crash due to missing icons
    print("Checking for New button...")
    expect(page.get_by_text("New").or_(page.get_by_text("Create Your First Habit"))).to_be_visible()

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/habits_verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_habits_page(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()
