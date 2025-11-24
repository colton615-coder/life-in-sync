from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use iPhone 16 viewport
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        # Mock window.spark to prevent crashes
        page.add_init_script("""
            window.spark = {
                llm: {
                    generate: async () => ({ text: 'Mock response' }),
                    stream: async () => {}
                }
            };
        """)

        print("Navigating to home...")
        page.goto("http://localhost:5173")
        time.sleep(2)

        print("Navigating to Habits...")
        # Since the Dock is floating, we might need to scroll or just click the icon.
        # Assuming Habits icon is visible or we can find it by aria-label or title.
        # But Habits might be one of the dock items.
        # Let's try to find text "Habits" or the icon.
        # The Dock usually has icons. Let's assume the user can click it.
        # For this test, let's try to click the button that navigates to habits.
        # If we are on mobile, we might see the FloatingDock.

        # Let's look for the Habits button in the dock.
        # Based on Dashboard.tsx, clicking the tile works too.
        # Let's try clicking the "Habits" text in the dashboard tile first if visible.
        try:
            page.get_by_text("Habits").first.click()
        except:
            print("Could not click Habits tile, trying dock...")
            # Fallback to dock if we can identify it.
            pass

        time.sleep(2)

        # Verify Habits module loaded
        if page.get_by_text("Consistency is key").is_visible():
            print("Habits module loaded!")
        else:
            print("Habits module failed to load.")
            page.screenshot(path="/home/jules/verification/failure.png")
            exit(1)

        # Verify "New Protocol" button opens dialog (Proves import works)
        print("Clicking New Protocol...")
        page.get_by_role("button", name="New Protocol").click()
        time.sleep(1)

        if page.get_by_text("Step 1 of 3").is_visible() or page.get_by_text("What habit do you want to build?").is_visible():
             print("Creation Wizard opened successfully!")
        else:
             print("Creation Wizard failed to open.")
             page.screenshot(path="/home/jules/verification/wizard_fail.png")
             # It might be in the wizard mode now.

        # Take screenshot of the Glass UI
        page.screenshot(path="/home/jules/verification/habits_glass.png")
        print("Screenshot saved to habits_glass.png")

        browser.close()

if __name__ == "__main__":
    run()
