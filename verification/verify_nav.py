from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_navigation(page: Page):
    # Inject mock window.spark object
    page.add_init_script("""
        window.spark = {
            llm: {
                generate: () => Promise.resolve({ text: "Mock response" })
            },
            storage: {
                get: () => Promise.resolve(null),
                set: () => Promise.resolve()
            }
        };
    """)

    # 1. Arrange: Go to the app
    page.goto("http://localhost:5173")

    # Wait for the app to load
    page.wait_for_selector("main#main-content", state="visible")

    # 2. Act: Check for Floating Dock and its contents
    # The dock container should have the scrolling classes we added
    dock = page.locator(".fixed.bottom-6")
    expect(dock).to_be_visible()

    # Check for specific icons/modules that were previously in the sidebar
    # "golf" module (Target icon)
    golf_btn = page.locator("button[aria-label='golf']")
    expect(golf_btn).to_be_visible()

    # "settings" module (Settings icon)
    settings_btn = page.locator("button[aria-label='settings']")
    expect(settings_btn).to_be_visible()

    # "knox" module (Bot icon)
    knox_btn = page.locator("button[aria-label='knox']")
    expect(knox_btn).to_be_visible()

    # 3. Assert: Ensure Sidebar is GONE
    # The "Menu" button that opened the sidebar should be gone.
    # It had aria-label="Menu" or similar, or we can check that there is no button that triggers the drawer.
    # The previous FloatingDock had a Menu icon. The new one does not.
    # We can check that the number of buttons in the dock is > 4 (it was 4 before).
    buttons = dock.locator("button")
    count = buttons.count()
    print(f"Found {count} buttons in the dock.")
    assert count > 4, "Expected more than 4 buttons in the dock (all modules should be present)"

    # Scroll the dock to the right to see hidden items
    # We can try to click the last item
    last_btn = buttons.last
    last_btn.scroll_into_view_if_needed()

    # 4. Screenshot
    page.screenshot(path="verification/nav_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_navigation(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise
        finally:
            browser.close()
