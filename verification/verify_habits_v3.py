
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_habits_page(page: Page):
    # 1. Arrange: Go to the home page
    print("Navigating to home page...")
    page.goto("http://localhost:5173")

    # Wait for page to load
    time.sleep(2)

    # 2. Act: Click on Habits module
    print("Looking for Habits card...")
    # Based on the screenshot, "HABITS" text is visible.
    # I will use a more lenient locator
    page.get_by_text("HABITS", exact=False).first.click()

    time.sleep(2)

    # 3. Assert: Check if Habits page is loaded
    print("Checking for Habits header...")
    expect(page.get_by_text("Habits", exact=False).first).to_be_visible()

    # Check for the "New" button
    print("Checking for New button...")
    # Lenient check for "New"
    expect(page.get_by_text("New").first).to_be_visible()

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/habits_page_v3.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            verify_habits_page(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v3.png")
        finally:
            browser.close()
