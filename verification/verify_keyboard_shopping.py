from playwright.sync_api import sync_playwright

def verify_shopping_input(page):
    # Navigate to the app (Shopping module)
    # Assuming user is starting fresh or has local storage data.
    # To reliably test the module, we might need to click the nav.
    page.goto("http://localhost:5173")

    # Wait for the app to load
    page.wait_for_timeout(2000)

    # Click the Shopping navigation item
    # Assuming aria-label is used as per code review
    page.get_by_role("button", name="shopping").click()

    # Wait for module to load
    page.wait_for_timeout(1000)

    # Find the input field
    input_field = page.get_by_placeholder("What do you need to buy?")
    input_field.fill("Test Item")
    input_field.focus()

    # Simulate viewport resize (keyboard open)
    # Initial height is likely standard mobile (e.g. 852 for iPhone 16)
    # We shrink it to simulate keyboard

    # Original viewport
    original_height = page.viewport_size['height']

    # Shrink viewport to simulate keyboard (approx 300px keyboard)
    page.set_viewport_size({"width": 393, "height": 450})

    # Trigger resize event manually if needed, but set_viewport_size does it
    page.evaluate("window.dispatchEvent(new Event('resize'))")

    # Wait for effects (dock hiding, scroll)
    page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path="verification/shopping_keyboard_open.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # iPhone 16 viewport
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 393, "height": 852},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()
        try:
            verify_shopping_input(page)
        finally:
            browser.close()
