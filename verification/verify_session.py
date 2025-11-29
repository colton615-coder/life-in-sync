
import json
from playwright.sync_api import sync_playwright

def verify_active_session():
    with sync_playwright() as p:
        # Launch browser with iPhone 16 Pro Max viewport (roughly)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 430, 'height': 932},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        # 1. Inject State to simulate having a saved workout plan
        # We need a plan to be able to "Start" it.
        # We also need to set 'has-completed-accountant-audit' to avoid redirection if that's a thing.
        # Based on memory, "Playwright tests for module-specific states... requires injecting state... then clicking... in FloatingDock"

        mock_plan = {
            "id": "test-plan-1",
            "name": "Test Circuit",
            "focus": "Full Body",
            "difficulty": "intermediate",
            "estimatedDuration": 30,
            "createdAt": "2023-01-01T00:00:00.000Z",
            "exercises": [
                {
                    "id": "ex-1",
                    "name": "Push-ups",
                    "type": "reps",
                    "category": "Strength",
                    "sets": 1,
                    "reps": 10,
                    "weight": 0,
                    "muscleGroups": ["Chest", "Triceps"],
                    "instructions": { "summary": "Keep body straight.", "keyPoints": [] }
                },
                {
                    "id": "ex-2",
                    "name": "Plank",
                    "type": "time",
                    "duration": 30,
                    "category": "Core",
                    "sets": 1,
                    "muscleGroups": ["Abs"],
                    "instructions": { "summary": "Hold tight.", "keyPoints": [] }
                }
            ]
        }

        # Navigate to root first
        page.goto("http://localhost:5173/")

        # Inject LocalStorage
        page.evaluate(f"""() => {{
            localStorage.setItem('workout-plans', JSON.stringify([{json.dumps(mock_plan)}]));
            localStorage.setItem('has-completed-accountant-audit', 'true'); // Bypass onboarding
        }}""")

        # Reload to apply storage
        page.reload()

        # 2. Navigate to Workouts Module
        # Memory: "Playwright selectors for FloatingDock navigation items must target lowercase aria-label"
        page.get_by_label("workouts").click()

        # Wait for Workouts to load
        page.wait_for_selector("text=Test Circuit")

        # 3. Start Workout (Enters 'Setup' stage)
        page.get_by_label("Start workout").click()
        page.wait_for_selector("text=Session Setup")
        page.screenshot(path="verification/1_setup.png")

        # 4. Start Session (Enters 'Active' stage)
        # Button: "START SESSION"
        page.get_by_text("START SESSION").click()

        # Verify Active State (Step 1: Push-ups)
        page.wait_for_selector("text=Push-ups")
        page.wait_for_selector("text=Target Reps")
        page.screenshot(path="verification/2_active_reps.png")

        # 5. Complete Set
        page.get_by_text("Set Complete").click()

        # Verify Rest State
        page.wait_for_selector("text=Rest & Prepare")
        page.wait_for_selector("text=Skip Rest")
        page.screenshot(path="verification/3_rest.png")

        # 6. Skip Rest
        page.get_by_text("Skip Rest").click()

        # Verify Next Active State (Step 2: Plank - Time based)
        page.wait_for_selector("text=Plank")
        page.wait_for_selector("text=Seconds") # Timer view
        page.screenshot(path="verification/4_active_timer.png")

        browser.close()

if __name__ == "__main__":
    verify_active_session()
