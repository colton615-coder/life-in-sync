import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Adjust the URL to your development server
        await page.goto("http://localhost:5173")

        # Wait for the loading screen to appear and then disappear.
        # This confirms the app is loading.
        try:
            await page.wait_for_selector(
                "text=/LiFE-iN-SYNC/",
                timeout=15000 # Increased timeout
            )
            print("Loading screen with new logo is visible.")
        except Exception as e:
            print(f"Error waiting for loading screen: {e}")
            await page.screenshot(path="debug_screenshots/error_loading_screen.png")
            await browser.close()
            return

        # Now, wait for the main dashboard to be visible.
        # This confirms the app has loaded.
        try:
            await page.wait_for_selector(
                "text=/Welcome Back, Colton/",
                timeout=10000
            )
            print("Dashboard is visible.")
        except Exception as e:
            print(f"Error waiting for dashboard: {e}")
            await page.screenshot(path="debug_screenshots/error_dashboard.png")
            await browser.close()
            return

        # Take a screenshot of the final state.
        screenshot_dir = 'debug_screenshots'
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        screenshot_path = os.path.join(screenshot_dir, 'final_state.png')
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
