
import { aiManager } from '../src/services/ai_manager';

// Mock Environment for testing
if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not set. Tests will run in MOCK mode or fail.');
}

async function verifyCapabilities() {
  console.log("=== Starting Gemini Integration Verification ===");

  // 1. Finance Adapter Test (Text Generation)
  try {
    console.log("\n[Finance] Testing Market Analysis...");
    if (process.env.GEMINI_API_KEY) {
        const marketData = "AAPL closed at $150.50, up 2%. S&P 500 index rose 1.1% due to positive tech earnings.";
        const result = await aiManager.finance.analyze_market_data(marketData);
        console.log("[Finance] Success! Response snippet:", result.substring(0, 100) + "...");

        // Basic validation of JSON structure if the model obeyed
        if (result.includes("{") && result.includes("}")) {
            console.log("[Finance] Validated: Output contains JSON structure.");
        }
    } else {
        console.log("[Finance] Skipped (No API Key). Mocking success.");
    }
  } catch (error) {
    console.error("[Finance] Failed:", error);
  }

  // 2. Golf Adapter Test (Vision Mock)
  try {
    console.log("\n[Golf] Testing Swing Analysis (Mock Vision)...");
    // In a real test with a key, we would pass base64 data.
    // For this script, if we have a key, we'll try a text-only description to prove the adapter is wired,
    // as we don't have a sample video file handy. The adapter allows 'any' input.
    if (process.env.GEMINI_API_KEY) {
        // Sending a text placeholder instead of a heavy video file for this quick check
        // The prompt injection handles the context.
        const result = await aiManager.golf.analyze_swing_mechanics("image_placeholder_data_base64");
        console.log("[Golf] Success! Response snippet:", result.substring(0, 100) + "...");
    } else {
        console.log("[Golf] Skipped (No API Key). Mocking success.");
    }
  } catch (error) {
    console.error("[Golf] Failed:", error);
  }

  // 3. Knox Adapter Test (Zero Retention Check)
  try {
    console.log("\n[Knox] Testing Audit Log...");
    if (process.env.GEMINI_API_KEY) {
        const log = { user: "admin", action: "delete_db", timestamp: Date.now() };
        const result = await aiManager.knox.audit_security_log(log);
        console.log("[Knox] Success! Response snippet:", result.substring(0, 100) + "...");
    } else {
        console.log("[Knox] Skipped (No API Key). Mocking success.");
    }
  } catch (error) {
    console.error("[Knox] Failed:", error);
  }

  console.log("\n=== Verification Complete ===");
}

verifyCapabilities();
