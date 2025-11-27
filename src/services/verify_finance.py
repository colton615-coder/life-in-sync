from playwright.sync_api import sync_playwright

def verify_finance_module():
    with sync_playwright() as p:
        # iPhone 16 viewport configuration
        iphone_16 = {
            "viewport": {"width": 393, "height": 852},
            "device_scale_factor": 3,
            "is_mobile": True,
            "has_touch": True,
            "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        }

        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone_16)
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for Loading Screen (min 3.5s per memory)
        print("Waiting for Loading Screen...")
        page.wait_for_timeout(5000)

        # Wait for Dashboard to appear (look for "Welcome Back" or generic dashboard text)
        try:
             # Try to find something on the dashboard
             print("Waiting for Dashboard...")
             page.wait_for_selector('text=Welcome Back', timeout=5000)
        except:
             print("Dashboard text not found, assuming loaded.")

        # 1. Verify Floating Dock Navigation to Finance
        print("Clicking Finance in Dock...")
        page.screenshot(path="verification/0_dashboard.png")

        # Try finding the button by aria-label
        finance_btn = page.locator('button[aria-label="finance"]')
        if finance_btn.count() > 0:
            finance_btn.click()
        else:
            # Fallback: maybe it's "the accountant" or just look for the icon's parent
            print("Could not find Finance button by aria-label, trying by index (assuming it's near the middle)...")
            # This is risky, but let's try finding the navigation element
            dock = page.locator('nav[aria-label="Main Navigation"]')
            if dock.count() > 0:
                # Click the 3rd button?
                dock.locator('button').nth(2).click()
            else:
                 print("Dock not found.")

        page.wait_for_timeout(2000)

        # 2. Verify Intake Form
        print("Verifying Intake Form...")
        page.screenshot(path="verification/1_intake_form.png")

        # Fill Income
        income_input = page.locator('input[type="number"]')
        if income_input.is_visible():
            income_input.fill("8500")
            # Click "Begin Audit"
            page.get_by_role("button", name="Begin Audit").click()
        else:
            print("Intake form input not found.")

        page.wait_for_timeout(2000)

        # 3. Verify Data Entry
        print("Verifying Data Entry...")
        page.screenshot(path="verification/2_data_entry.png")

        # Check if "Housing" exists
        housing = page.get_by_text("Housing")
        if housing.count() > 0:
            # Expand Housing
            housing.first.click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/3_data_entry_expanded.png")

            # Submit
            # We need to scroll to bottom potentially?
            submit_btn = page.get_by_role("button", name="Submit for Audit")
            if submit_btn.is_visible():
                submit_btn.click()
        else:
             print("Housing category not found.")

        page.wait_for_timeout(3000) # Wait for "Analyzing"

        # 4. Verify Audit Review
        print("Verifying Audit/Error State...")
        page.screenshot(path="verification/4_audit_state.png")

        browser.close()

if __name__ == "__main__":
    verify_finance_module()
