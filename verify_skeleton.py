from playwright.sync_api import sync_playwright
import json
import time

def verify_skeleton():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # 1. Define Mock Data (T-Pose)
        landmarks = []
        for i in range(33):
            landmarks.append({"x": 0.5, "y": 0.5, "z": 0, "visibility": 0.0})

        def set_lm(idx, x, y):
            landmarks[idx] = {"x": x, "y": y, "z": 0, "visibility": 0.9}

        set_lm(0, 0.5, 0.2)   # Nose
        set_lm(11, 0.6, 0.3)  # L Shoulder
        set_lm(12, 0.4, 0.3)  # R Shoulder
        set_lm(13, 0.7, 0.3)  # L Elbow
        set_lm(14, 0.3, 0.3)  # R Elbow
        set_lm(15, 0.8, 0.3)  # L Wrist
        set_lm(16, 0.2, 0.3)  # R Wrist
        set_lm(23, 0.55, 0.6) # L Hip
        set_lm(24, 0.45, 0.6) # R Hip
        set_lm(25, 0.55, 0.8) # L Knee
        set_lm(26, 0.45, 0.8) # R Knee
        set_lm(27, 0.55, 0.9) # L Ankle
        set_lm(28, 0.45, 0.9) # R Ankle

        mock_metrics = {
            "phases": {},
            "headMovement": {"stability": "good", "lateral": 0, "vertical": 0},
            "tempo": {"ratio": 2.0}
        }

        def create_phase(name):
             return {
                 "name": name, "timestamp": 0, "score": 80, "status": "good",
                 "keyMetric": {"label": "Test", "value": "10"}, "valid": True
             }

        phases = {
            "address": create_phase("Address"),
            "takeaway": create_phase("Takeaway"),
            "backswing": create_phase("Backswing"),
            "top": create_phase("Top"),
            "downswing": create_phase("Downswing"),
            "impact": create_phase("Impact"),
            "followThrough": create_phase("Follow Through"),
            "finish": create_phase("Finish")
        }
        mock_metrics["phases"] = phases

        analysis = {
            "id": "test-analysis",
            "videoId": "test",
            "videoUrl": "",
            "club": "Driver",
            "status": "completed",
            "uploadedAt": "2023-10-27T10:00:00Z",
            "poseData": [
                {"timestamp": 0, "landmarks": landmarks},
                {"timestamp": 1, "landmarks": landmarks}
            ],
            "metrics": mock_metrics,
            "feedback": {"overallScore": 85}
        }

        analyses = [analysis]

        # 2. Start
        page.goto("http://localhost:5173/")
        page.wait_for_selector("main#main-content", state="attached")
        time.sleep(1)

        # 3. Inject Data
        js_script = f"""
            window.localStorage.setItem('golf-swing-analyses', '{json.dumps(analyses)}');
        """
        page.evaluate(js_script)

        # 4. Open Menu
        menu_btn = page.get_by_label("Open navigation menu")
        if menu_btn.is_visible():
            menu_btn.click()
        else:
            page.get_by_role("button").last.click()

        time.sleep(1)

        # 5. Navigate to Golf Swing
        page.get_by_text("Golf Swing").click()
        time.sleep(1)

        # 6. Open History Sheet
        # Click the first button in the header (History list icon)
        # We target the SWING ANALYZER header, then find buttons inside it.
        # This is robust enough for now.
        header = page.locator("div").filter(has_text="SWING ANALYZER").first
        buttons = header.get_by_role("button").all()

        if buttons:
            print(f"Found {len(buttons)} header buttons. Clicking first one...")
            buttons[0].click()

            # Wait for Sheet
            page.get_by_text("Mission History").wait_for()

            # Click Visible Driver
            # The filter(visible=True) is key because desktop list is hidden but present.
            driver_item = page.get_by_text("Driver").filter(has_text="Driver").locator("visible=true").first
            # Or simpler:
            # page.locator("text=Driver >> visible=true").first.click()

            # Let's use robust locator:
            visible_driver = page.locator("text=Driver").first # Try first, check visibility
            if not visible_driver.is_visible():
                print("First driver not visible, trying others...")
                visible_driver = page.locator("text=Driver >> visible=true").first

            visible_driver.click()

        else:
            print("Could not find header buttons!")

        time.sleep(2)

        # 7. Screenshot
        page.screenshot(path="/home/jules/verification/skeleton_verification.png")
        print("Screenshot captured.")

        browser.close()

if __name__ == "__main__":
    verify_skeleton()
