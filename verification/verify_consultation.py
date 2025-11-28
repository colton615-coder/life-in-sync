
import json
from playwright.sync_api import sync_playwright, expect

def verify_consultation_modal(page):
    # 1. Setup Data
    audit_data = {
        "version": "2.0",
        "status": "completed",
        "monthlyIncome": 5000,
        "categories": [
            { "id": "c1", "name": "Housing", "subcategories": [{ "id": "s1", "name": "Rent", "amount": 2000 }] }
        ],
        "flags": [],
        "resolutions": [],
        "lastUpdated": "2024-01-01T00:00:00.000Z"
    }

    report_data = {
        "version": "2.0",
        "executiveSummary": "You are doing okay.",
        "spendingAnalysis": [
             { "categoryId": "c1", "categoryName": "Housing", "totalSpent": 2000, "aiSummary": "High.", "healthScore": 5 }
        ],
        "proposedBudget": [
             { "categoryId": "c1", "categoryName": "Housing", "allocatedAmount": 1800, "subcategories": [] }
        ],
        "moneyManagementAdvice": [
             { "title": "Save More", "description": "Do it.", "priority": "high" }
        ],
        "reportGeneratedAt": "2024-01-01T00:00:00.000Z"
    }

    # 2. Inject Data via localStorage BEFORE loading the app logic
    # We navigate to a blank page on the same origin first to set storage
    page.goto("http://localhost:5173/")

    page.evaluate(f"""
        localStorage.setItem('finance-audit-v2', '{json.dumps(audit_data)}');
        localStorage.setItem('finance-report-v2', '{json.dumps(report_data)}');
    """)

    # 3. Reload to pick up state
    page.reload()

    # 4. Navigate to Finance Module
    # The app likely starts on Dashboard. We need to click "Finance" in the FloatingDock.
    # FloatingDock items usually have aria-label equal to the module ID.
    # Finance ID is usually 'finance' or 'accountant'?
    # Checking file list... 'Finance.tsx'. The ID in App.tsx mapping is what matters.
    # Assuming 'finance' based on file name.

    # Wait for dock to appear
    page.wait_for_selector("nav[role='navigation']")

    # Click Finance icon.
    # Try aria-label "finance" or text if available.
    # Memory says: "Playwright selectors for `FloatingDock` navigation items must target lowercase `aria-label` attributes (e.g., `aria-label="workouts"`), which correspond to the module IDs."
    # So I will try 'finance'.

    finance_btn = page.get_by_label("finance")
    if not finance_btn.is_visible():
        # Fallback: maybe it's 'accountant'?
        finance_btn = page.get_by_label("accountant")

    finance_btn.click()

    # 5. Verify Budget Manager is loaded
    expect(page.get_by_text("The Blueprint")).to_be_visible()

    # 6. Click "Consult The Accountant"
    consult_btn = page.get_by_role("button", name="Consult The Accountant")
    expect(consult_btn).to_be_visible()
    consult_btn.click()

    # 7. Verify Modal
    expect(page.get_by_text("Consultation Mode")).to_be_visible()

    # 8. Take Screenshot
    page.screenshot(path="verification/consultation_modal.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # iPhone 16 Viewport
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 393, "height": 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()
        try:
            verify_consultation_modal(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
