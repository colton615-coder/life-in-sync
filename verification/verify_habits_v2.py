
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
    # Based on the screenshot, there is a card with "HABITS" text.
    # I will try to click the text or the card containing it.
    page.get_by_text("HABITS", exact=True).click()

    time.sleep(2)

    # 3. Assert: Check if Habits page is loaded
    print("Checking for Habits header...")
    # The Habits page usually has a header "Habits" or "Fire Habits" based on the code I read (🔥 Habits)
    expect(page.get_by_text("Habits", exact=False)).to_be_visible()

    # Check for the "New" button
    print("Checking for New button...")
    expect(page.get_by_role("button", name="New")).to_be_visible()

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/habits_page_v2.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            verify_habits_page(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v2.png")
        finally:
            browser.close()
