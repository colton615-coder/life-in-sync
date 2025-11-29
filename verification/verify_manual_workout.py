import time
from playwright.sync_api import sync_playwright

def verify_manual_workout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait for Loading Screen to disappear
        print("Waiting for app load...")
        try:
            # wait for specific app element to ensure fully loaded
            page.wait_for_selector('nav[aria-label="Main Navigation"]', timeout=30000)
        except:
            print("Loading screen didn't disappear or app crashed")
            page.screenshot(path="verification/debug_loading_stuck.png")
            browser.close()
            return

        # Navigate to Workouts
        print("Clicking Workouts...")
        try:
             page.get_by_label("workouts").click()
        except:
             print("Navigation failed")
             page.screenshot(path="verification/debug_nav.png")
             browser.close()
             return

        # Wait for Create Button
        print("Waiting for Create button...")
        try:
            create_btn = page.locator("button[aria-label='Create Manual Workout']")
            create_btn.wait_for(state="visible", timeout=10000)
            create_btn.click()
        except:
            print("Create button failed. Taking debug shot.")
            page.screenshot(path="verification/debug_create_fail.png")
            browser.close()
            return

        # Wait for Dialog
        print("Waiting for Dialog...")
        try:
            page.wait_for_selector("text=Create Custom Workout", timeout=5000)
        except:
            print("Dialog not found")
            page.screenshot(path="verification/debug_dialog_fail.png")
            browser.close()
            return

        page.screenshot(path="verification/1_create_dialog.png")

        # --- Add First Block ---
        print("Adding First Block...")
        try:
            # Try both possible buttons
            if page.get_by_text("Add New Block").is_visible():
                page.get_by_text("Add New Block").click()
            else:
                page.get_by_text("Add First Block").click()
        except Exception as e:
            print(f"Failed to click Add Block: {e}")
            page.screenshot(path="verification/debug_add_block_fail.png")
            browser.close()
            return

        # Wait for Picker
        print("Waiting for Picker...")
        try:
            # Match the Dialog Title or unique element
            page.wait_for_selector("text=Add Exercise", state="visible", timeout=5000)
        except:
            print("Picker didn't open")
            page.screenshot(path="verification/debug_picker_fail.png")
            browser.close()
            return

        # Search & Select
        print("Selecting 'Barbell Bench Press'...")
        page.get_by_placeholder("Search exercises...").fill("Barbell Bench Press")
        page.wait_for_timeout(1000) # Wait for search debounce

        # Click the first option
        try:
            page.locator("[role='option']").first.click()
        except:
             print("No options found for Bench Press")
             page.screenshot(path="verification/debug_search_fail.png")
             browser.close()
             return


        # Verify Block Created
        print("Verifying Block 1...")
        try:
            # Updated to match Master List name exactly
            page.wait_for_selector("text=Barbell Bench Press", timeout=5000)
        except:
             print("Block not created or name mismatch")
             page.screenshot(path="verification/debug_block_creation_fail.png")
             browser.close()
             return


        # --- Add Superset Exercise ---
        print("Adding Superset Exercise...")
        page.get_by_text("Add Exercise to Block").click()

        # Wait for Picker
        page.wait_for_selector("text=Add Exercise", state="visible")

        # Search & Select
        print("Selecting 'Push-Ups'...")
        page.get_by_placeholder("Search exercises...").fill("Push-Ups")
        page.wait_for_timeout(1000)
        page.locator("[role='option']").first.click()

        # Verify Superset UI
        print("Verifying Superset...")
        try:
            page.wait_for_selector("text=Superset", timeout=5000)
        except:
             print("Superset label not found")
             page.screenshot(path="verification/debug_superset_fail.png")
             browser.close()
             return

        page.screenshot(path="verification/3_superset_created.png")

        # Fill name
        print("Filling details...")
        page.get_by_placeholder("e.g., Leg Day Destroyer").fill("Chest Superset Blast")

        # Save
        print("Saving...")
        page.get_by_role("button", name="Create Workout").click()

        # Wait for list update
        print("Verifying List...")
        try:
            page.wait_for_selector("text=Chest Superset Blast", timeout=5000)
            page.screenshot(path="verification/4_final_list.png")
        except:
             print("Workout not saved to list")
             page.screenshot(path="verification/debug_save_fail.png")
             browser.close()
             return

        print("Done! Success.")
        browser.close()

if __name__ == "__main__":
    verify_manual_workout()
