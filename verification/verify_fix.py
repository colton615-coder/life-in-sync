
from playwright.sync_api import sync_playwright
import time
import json

def verify_fix(page):
    # Set up local storage with a mock workout plan
    mock_plan = {
        "id": "test-plan-1",
        "name": "Test Workout",
        "focus": "Strength",
        "exercises": [
            {
                "id": "ex-1",
                "name": "Test Press",
                "type": "reps",
                "category": "Chest",
                "sets": 3,
                "reps": 10,
                "weight": 135,
                "muscleGroups": ["chest"],
                "difficulty": "intermediate",
                "instructions": {
                    "summary": "Push the bar.",
                    "keyPoints": []
                }
            }
        ],
        "estimatedDuration": 30,
        "difficulty": "intermediate",
        "createdAt": "2023-01-01"
    }

    # Navigate to home
    page.goto("http://localhost:5173/")

    # Inject data
    page.evaluate(f"localStorage.setItem('workout-plans', '{json.dumps([mock_plan])}')")

    # Reload to pick up data
    page.reload()

    # Click on Workouts in FloatingDock
    # Assuming FloatingDock has aria-label="workouts"
    page.get_by_role("navigation", name="Main Navigation").get_by_label("workouts").click()

    # Wait for Workouts module to load
    page.wait_for_timeout(1000)

    # Find the workout card and click Start
    # Assuming "START ENGINE" button
    page.get_by_label("Start workout").click()

    # Now in SessionSetup (presumably)
    # Click START SESSION
    page.get_by_role("button", name="START SESSION").click()

    # Check if ActiveWorkout loaded without crash
    # It should show "Test Press"
    page.wait_for_selector("text=Test Press")

    # Take screenshot
    page.screenshot(path="verification/active_workout.png")
    print("Screenshot saved to verification/active_workout.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # iPhone 16 viewport
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 393, "height": 852}, device_scale_factor=3)
        page = context.new_page()
        try:
            verify_fix(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
