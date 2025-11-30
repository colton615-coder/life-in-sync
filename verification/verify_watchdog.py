
import json
from playwright.sync_api import sync_playwright, expect

def verify_watchdog(page):
    audit_data = {
        "version": "2.0",
        "lastUpdated": "2024-05-20T12:00:00Z",
        "status": "completed",
        "monthlyIncome": 5000,
        "liquidAssets": 1000,
        "categories": [
             {
                "id": "1",
                "name": "Food",
                "subcategories": []
             }
        ],
        "flags": [],
        "resolutions": []
    }

    report_data = {
        "executiveSummary": "test",
        "spendingAnalysis": [],
        "proposedBudget": [],
        "moneyManagementAdvice": [],
        "reportGeneratedAt": "2024-05-20T12:00:00Z",
        "version": "2.0"
    }

    page.goto("http://localhost:5173/")

    # Inject data
    page.evaluate(f"""() => {{
        localStorage.setItem('finance-audit-v2', '{json.dumps(audit_data)}');
        localStorage.setItem('finance-report-v2', '{json.dumps(report_data)}');
        localStorage.setItem('gemini-api-key', 'dummy-key');
        // Clear cooldowns to ensure test runs
        localStorage.removeItem('watchdog-cooldown-Runway');
    }}""")

    page.reload()

    page.wait_for_selector('nav[role="navigation"]')
    page.get_by_label("finance").click()

    expect(page.get_by_text("The Blueprint")).to_be_visible(timeout=10000)

    # Trigger Watchdog
    # Note: Double triggering might cause strict mode violation if we are not careful,
    # but the service should debounce or we just check .first()
    page.evaluate("window.triggerWatchdog({ type: 'Runway' })")

    expect(page.get_by_role("heading", name="The Accountant")).to_be_visible()

    # Use .first() just in case, though logically it should be one unless I triggered twice
    expect(page.get_by_text("TEST ALERT: Runway is critically low").first).to_be_visible()

    page.screenshot(path="verification/watchdog_trigger.png")
    print("Verification screenshot saved to verification/watchdog_trigger.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 393, "height": 852}, device_scale_factor=3)
        page = context.new_page()
        try:
            verify_watchdog(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
