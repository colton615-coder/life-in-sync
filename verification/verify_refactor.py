from playwright.sync_api import sync_playwright

def verify_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device to verify the responsiveness as well if needed,
        # but here we just want to see the header/loader.
        page = browser.new_page(viewport={'width': 393, 'height': 852})

        try:
            # Navigate to the app (assuming dev server is running on 5173)
            page.goto("http://localhost:5173/")

            # Wait for the loading screen (it appears initially)
            # Take a screenshot immediately to catch the loading screen
            page.screenshot(path="verification/loading_screen.png")

            # Wait for the app to load (LoadingScreen disappears)
            # The "LiFE-iN-SYNC" text should NOT be present in the header anymore.
            # We can check for the header element which is LifeCore.

            # Wait for LifeCore component to be visible (it has the logo)
            # We look for the div with the brain background image.
            # Since we removed the text, we can't search for "LiFE-iN-SYNC".

            # Let's wait a bit for animation to finish
            page.wait_for_timeout(4000)

            # Take a screenshot of the dashboard
            page.screenshot(path="verification/dashboard.png")

            print("Screenshots captured.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_refactor()
