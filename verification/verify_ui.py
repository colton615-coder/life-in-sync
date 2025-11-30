
import os
import time
import json
from playwright.sync_api import sync_playwright

def verify_finance_ui():
    with sync_playwright() as p:
        # Use iPhone 16 viewport as per memory instructions
        iphone_16 = p.devices['iPhone 12 Pro'] # Close approximation for now or define custom
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()

        print("Navigating to app root...")
        page.goto("http://localhost:5173/")

        # Wait for app to load (Floating Dock visible)
        try:
            page.wait_for_selector('nav[aria-label="Main Navigation"]', timeout=10000)
        except:
             # Fallback if specific nav role isn't found, try generic
             print("Warning: Main nav not found quickly.")

        # 2. Inject Data to trigger the views
        print("Injecting 'finance-audit-v2' state for DataEntry...")
        audit_state = {
            "version": "2.0",
            "status": "data_entry",
            "monthlyIncome": 5000,
            "categories": [
                {
                    "id": "cat-1",
                    "name": "Housing",
                    "subcategories": [
                        {"id": "sub-1", "name": "Rent", "amount": 2500},
                        {"id": "sub-2", "name": "Utilities", "amount": 150}
                    ]
                },
                {
                    "id": "cat-2",
                    "name": "Food",
                    "subcategories": [
                        {"id": "sub-3", "name": "Groceries", "amount": 600},
                        {"id": "sub-4", "name": "Dining", "amount": None}
                    ]
                }
            ],
            "flags": [],
            "resolutions": []
        }

        # Must execute while on the page
        page.evaluate(f"localStorage.setItem('finance-audit-v2', '{json.dumps(audit_state)}');")
        page.reload()

        # Wait for reload
        page.wait_for_selector('nav[aria-label="Main Navigation"]', timeout=10000)

        # Click Finance in Floating Dock
        print("Clicking Finance module...")
        try:
             # Try user-facing locator first
             page.get_by_label("finance").click()
        except:
             # Fallback to selector if aria-label fails (e.g. if it's strictly 'Finance' or lowercase)
             # Memory said: "Playwright selectors for FloatingDock navigation items must target lowercase aria-label attributes"
             page.locator('[aria-label="finance"]').click()

        # Wait for "Expense Ledger" header
        try:
            page.wait_for_selector("text=Expense Ledger", timeout=5000)
            print("Expense Ledger found.")
            # Take screenshot of Expense Ledger
            page.screenshot(path="verification/expense_ledger.png")
        except Exception as e:
            print(f"Could not find Expense Ledger: {e}")
            page.screenshot(path="verification/expense_ledger_fail.png")

        # 3. Now verify Intake Form
        print("Injecting 'finance-audit-v2' state for IntakeForm...")
        intake_state = {
            "version": "2.0",
            "status": "intake",
            "monthlyIncome": None,
            "categories": [],
            "flags": [],
            "resolutions": []
        }
        page.evaluate(f"localStorage.setItem('finance-audit-v2', '{json.dumps(intake_state)}');")
        page.reload()

        # Wait for reload
        page.wait_for_selector('nav[aria-label="Main Navigation"]', timeout=10000)

        # Click Finance again
        try:
             page.get_by_label("finance").click()
        except:
             page.locator('[aria-label="finance"]').click()

        # The IntakeForm is hidden behind "System Offline" initially if isIntakeStarted is false.
        # Finance.tsx shows: <SystemOfflineView /> if !isIntakeStarted
        # We need to click "Initialize Financial Interview" button to see IntakeForm.

        try:
             print("Checking for System Offline View...")
             page.wait_for_selector("text=System Offline", timeout=3000)
             print("Found System Offline. Clicking Initialize...")
             page.get_by_role("button", name="Initialize Financial Interview").click()
        except:
             print("System Offline view not found, maybe already in Intake Form?")

        try:
            page.wait_for_selector("text=Income Verification", timeout=5000)
            print("Income Verification found.")
            page.screenshot(path="verification/intake_form.png")
        except Exception as e:
            print(f"Could not find Intake Form: {e}")
            page.screenshot(path="verification/intake_form_fail.png")

        browser.close()

if __name__ == "__main__":
    verify_finance_ui()
