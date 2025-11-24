import time
from playwright.sync_api import sync_playwright

def verify_ux_improvements():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with iPhone 16 viewport dimensions to test mobile responsiveness
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        # Inject mock object to prevent AI service timeouts
        page.add_init_script("""
            window.spark = {
                llm: async () => "Mock response",
                llmPrompt: (strings, ...values) => "Mock prompt"
            };
        """)

        print("Navigating to app (preview build)...")
        # Use port 4173 for preview
        page.goto("http://localhost:4173")

        # Wait for app to load - wait for anything that isn't the loader
        try:
             page.wait_for_selector(".glass-card", timeout=15000)
             print("Dashboard loaded.")
        except:
             # Fallback
             print("Waiting for text...")
             page.wait_for_selector("text=Dashboard", timeout=5000)


        # --- 1. Verify Finance Quick Add ---
        print("Verifying Finance Quick Add...")
        # Navigate to Finance - use aria-label
        page.get_by_label("finance").click()
        time.sleep(1)

        # Open Quick Add Drawer
        page.get_by_text("Quick Add").click()
        time.sleep(1)

        # Screenshot the Category Selection
        page.screenshot(path="verification/finance_quick_add_categories.png")
        print("Captured Category Grid")

        # Select 'Food' category
        page.get_by_text("Food").first.click()
        time.sleep(0.5)

        # Verify Keypad appears
        page.screenshot(path="verification/finance_glass_keypad.png")
        print("Captured Glass Keypad")

        # Type amount using keypad
        page.get_by_text("1", exact=True).click()
        page.get_by_text("2", exact=True).click()
        page.get_by_text("5", exact=True).click()
        page.get_by_text("Confirm").click()
        time.sleep(1)

        # Verify toast or updated list (screenshot main finance page)
        page.screenshot(path="verification/finance_after_add.png")

        # --- 2. Verify Workouts Power Slider ---
        print("Verifying Workouts Power Slider...")
        # Navigate to Workouts
        page.get_by_label("workouts").click()
        time.sleep(1)

        # Use localstorage injection to seed a workout plan
        page.evaluate("""
            const plan = {
                id: 'test-plan',
                name: 'Test Plan',
                difficulty: 'beginner',
                focus: 'Strength',
                estimatedDuration: 30,
                exercises: [
                    { name: 'Pushups', category: 'Strength', sets: 3, reps: 10, type: 'reps', instructions: { summary: 'Push up', keyPoints: [] } }
                ]
            };
            const current = JSON.parse(localStorage.getItem('workout-plans') || '[]');
            localStorage.setItem('workout-plans', JSON.stringify([...current, plan]));
        """)
        # Force reload to pick up localstorage?
        # Actually in SPA, we rely on React state.
        # The useKV hook syncs with localStorage on mount.
        # But if we inject AFTER mount, it might not pick it up unless we reload.
        page.reload()

        # Wait for workouts to load
        time.sleep(2)

        # Debug screenshot if failure
        page.screenshot(path="verification/debug_workouts_list.png")

        # Click Start on the first workout
        # use aria-label
        try:
            page.wait_for_selector('[aria-label="Start workout"]', timeout=5000)
            page.get_by_label("Start workout").first.click()
            time.sleep(1)

            # Check for Power Slider
            # locator by text "Slide to Complete Set"
            slider_text = page.get_by_text("Slide to Complete Set")
            if slider_text.count() > 0:
                print("Power Slider found")
                page.screenshot(path="verification/workout_power_slider.png")
            else:
                print("Power Slider NOT found")
                page.screenshot(path="verification/workout_failed.png")
        except:
             print("Failed to find start button")

        # --- 3. Verify Golf Swing Jog Dial ---
        print("Verifying Golf Swing Jog Dial...")
        # Navigate to Golf
        page.get_by_label("golf").click()
        time.sleep(1)

        # Need to be in "Viewing Result" mode.
        # Inject analysis data
        page.evaluate("""
            const analysis = {
                id: 'test-swing',
                videoId: 'test',
                videoUrl: 'blob:fake', // Video won't play but UI should load
                status: 'completed',
                uploadedAt: new Date().toISOString(),
                club: 'Driver',
                feedback: { overallScore: 85 }
            };
            const current = JSON.parse(localStorage.getItem('golf-swing-analyses') || '[]');
            localStorage.setItem('golf-swing-analyses', JSON.stringify([analysis]));
        """)
        page.reload()
        time.sleep(2)

        # Click the analysis to view
        # The list might be empty initially if reloaded on the same page?
        # Ensure we are on Golf page

        # Click first item
        try:
             page.locator(".cursor-pointer").first.click()
             time.sleep(1)

             # Check for Toggle Scan Button
             scan_btn = page.get_by_label("Toggle Precision Jog Dial") # Aria label added in diff
             if scan_btn.count() > 0:
                 scan_btn.click()
                 time.sleep(0.5)
                 page.screenshot(path="verification/golf_jog_dial.png")
                 print("Jog Dial Captured")
             else:
                  print("Scan button not found")
                  page.screenshot(path="verification/golf_failed.png")
        except:
            print("Failed to click analysis")

        browser.close()

if __name__ == "__main__":
    verify_ux_improvements()
