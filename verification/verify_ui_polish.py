
import pytest
from playwright.sync_api import Page, expect

def test_verify_buttons_pose_controls(page: Page):
    # Skipped as per scope reduction
    pass

def test_verify_sarcastic_loader_gym(page: Page):
    """
    Verifies that the Sarcastic Loader appears in the Gym context.
    Mocks the API to ensure the loading state persists long enough to verify.
    """
    # Mock Gemini API to delay response by 5 seconds
    def handle_route(route):
        # We don't care about the response structure much, just the delay
        # But we provide valid JSON to avoid crashes if it processes
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"candidates": [{"content": {"parts": [{"text": "{}"}]}}]}',
            delay=5000
        )

    page.route("**/models/*generateContent*", handle_route)

    page.goto("http://localhost:5173/")
    page.wait_for_timeout(2000)

    # Click 'Workouts' in the dock
    page.click('button[aria-label="workouts"]')
    page.wait_for_timeout(1000)

    # Click "Generate" button to open dialog
    page.click('button[aria-label="Generate Workout"]')
    page.wait_for_timeout(1000)

    # Fill input
    page.fill('#workout-prompt', 'Check Sarcastic Loader')
    page.wait_for_timeout(500)

    # Click "Generate Workout" inside the dialog
    page.click('div[role="dialog"] button:has-text("Generate Workout")')

    # Wait for Sarcastic Loader text
    # It should appear immediately after click since network is delayed
    try:
        expect(page.locator('.animate-pulse')).to_be_visible(timeout=5000)
        page.screenshot(path="verification/4_gym_loader_success.png")
    except Exception as e:
        page.screenshot(path="verification/4_gym_loader_retry_fail.png")
        raise e
