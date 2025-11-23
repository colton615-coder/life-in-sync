import os
from playwright.sync_api import sync_playwright, expect

def verify_golf_dashboard():
    with sync_playwright() as p:
        # Use a larger viewport to see the cockpit
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            record_video_dir="videos/"
        )
        page = context.new_page()

        try:
            # 1. Navigate to the app (wait for it to load)
            page.goto("http://localhost:5173/")
            page.wait_for_load_state("networkidle")

            # Wait for lazy loading
            page.wait_for_timeout(5000)

            # Screenshot initial load
            if not os.path.exists("/home/jules/verification"):
                os.makedirs("/home/jules/verification")
            page.screenshot(path="/home/jules/verification/initial_load.png")

            # Check if we are already on Golf (due to previous state) or need to navigate
            # The previous failure screenshot suggests we might be on the old version or caching issues?
            # Or simply "SWING ANALYZER" text changed in my update and I am looking for the wrong thing.
            # In my update: <h1 ...><span ...>///</span> SWING ANALYZER</h1>
            # The text is " SWING ANALYZER" (with space? or spans split it)

            # Let's try to find the navigation drawer button if we are not there.
            # The failure screenshot showed "Golf Swing Analyzer" title.
            # Wait! The failure screenshot looks like the OLD version!
            # "Golf Swing Analyzer" with "AI-powered swing analysis..." subtitle.
            # My NEW version has "/// SWING ANALYZER" and "SWING ANALYZER PRO" in empty state.

            # This implies the code update didn't take effect in the browser?
            # Vite HMR might not have triggered or I need to refresh.
            # Or I am looking at a cached version.

            print("Navigating to Golf module...")
            # Try to find the Golf icon/text in the sidebar/drawer
            # Based on the previous screenshot, there is a hamburger menu bottom left?
            # Let's try to click "Golf" text.
            try:
                page.get_by_text("Golf", exact=False).first.click()
            except:
                print("Golf link click failed, assuming we are on page or trying URL")

            page.wait_for_timeout(2000)

            # 3. Verify Empty State (NEW DESIGN)
            print("Verifying Empty State...")
            # Look for the new text "INITIATE UPLOAD" button
            expect(page.get_by_text("INITIATE UPLOAD")).to_be_visible()

            # Take screenshot of Empty State
            page.screenshot(path="/home/jules/verification/1_empty_state.png")
            print("Captured empty state.")

            # 4. Verify Upload & Analysis Simulation
            # We need a dummy video file
            with open("dummy_swing.mp4", "wb") as f:
                f.write(b"fake video content")

            # Find the hidden file input
            file_input = page.locator("input[type='file']")
            file_input.set_input_files("dummy_swing.mp4")

            print("File uploaded. Waiting for Club Selection...")

            # 5. Club Selection Dialog
            # Wait for dialog to appear
            expect(page.get_by_text("Select Club")).to_be_visible(timeout=5000)
            page.screenshot(path="/home/jules/verification/2_club_selection.png")

            # Select a club (e.g., Driver)
            page.get_by_text("Driver").click()

            print("Club selected. Waiting for Analysis...")

            # 6. Wait for Analysis Progress
            # The simulation takes about 6 seconds (10, 30, 50, 70, 90, 100 steps with delays)
            # We should see the progress screen with "Processing Swing Telemetry"
            page.wait_for_timeout(2000)
            page.screenshot(path="/home/jules/verification/3_analysis_progress.png")

            # Wait for completion (approx 5-7s more)
            # We look for the result view elements
            # "AI DIAGNOSTICS" tab is now capitalized in my code
            expect(page.get_by_text("AI DIAGNOSTICS")).to_be_visible(timeout=15000)

            print("Analysis complete. Verifying Cockpit...")
            page.wait_for_timeout(1000) # Let animations settle

            # 7. Verify Cockpit Elements
            # Video Player
            expect(page.locator("video")).to_be_visible()

            # Jog Dial (Rotary Scrubber)
            expect(page.get_by_label("Video scrubber control")).to_be_visible()

            # AI Toggle Button
            expect(page.get_by_text("AI ON")).to_be_visible()

            # Knox HUD (should be visible if critical faults exist - mock data generates some)
            # The mock data in swing-analyzer.ts has some hardcoded metrics.
            # Metrics: Hip ~ 90 (might be good), Head (calculated from mock nose pos).
            # We'll check if any HUD alert is visible.
            if page.locator(".text-amber-400").count() > 0 or page.locator(".text-red-400").count() > 0:
                print("Knox HUD Alert detected.")

            # Metrics Grid
            expect(page.get_by_text("Hip Rot.")).to_be_visible()
            expect(page.get_by_text("Shldr Turn")).to_be_visible()

            # Take final screenshot
            page.screenshot(path="/home/jules/verification/4_cockpit_result.png")
            print("Verification complete.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error_state_v2.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_golf_dashboard()
