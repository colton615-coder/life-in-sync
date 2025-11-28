
import { GeminiCore } from '../src/services/gemini_core';
import { z } from 'zod';

// Polyfill window and localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key: string) {
      delete store[key];
    }
  };
})();

// Attach to global
(global as any).window = {
    localStorage: localStorageMock
};
(global as any).localStorage = localStorageMock;


// Polyfill crypto.randomUUID
if (!global.crypto) {
    global.crypto = {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7)
    } as any;
}

// Subclass to mock the API calls
class TestGeminiCore extends GeminiCore {
    private mockResponses: string[] = [];
    private callCount = 0;

    constructor(mockResponses: string[]) {
        super("dummy-key-for-test"); // Pass dummy key
        this.mockResponses = mockResponses;
    }

    // Override the method that calls the API
    async generateContent(prompt: any, config?: any): Promise<any> {
        if (this.callCount >= this.mockResponses.length) {
            throw new Error(`TestGeminiCore: No more mock responses available (called ${this.callCount + 1} times, had ${this.mockResponses.length})`);
        }
        const responseText = this.mockResponses[this.callCount++];
        return { success: true, data: responseText };
    }
}

async function runManualTest() {
    console.log("Starting GeminiCore Manual Verification...");

    // Set a dummy key in local storage just in case
    (global as any).window.localStorage.setItem('gemini-api-key', '"test-key"');

    const schema = z.object({ value: z.string() });

    // Test 1: Repair Malformed JSON
    console.log("\n--- Test 1: Repair Malformed JSON ---");
    const tester1 = new TestGeminiCore([
        "I am not a JSON object.",      // Response 1: Garbage
        JSON.stringify({ value: "Fixed" }) // Response 2: Good
    ]);

    const res1 = await tester1.generateJSONWithRepair("prompt", schema);
    if (res1.success && res1.data.value === "Fixed") {
        console.log("✅ Passed: Recovered from malformed JSON.");
    } else {
        console.error("❌ Failed Test 1:", res1);
        process.exit(1);
    }

    // Test 2: Repair Invalid Schema (Zod Error)
    console.log("\n--- Test 2: Repair Invalid Schema ---");
    const tester2 = new TestGeminiCore([
        JSON.stringify({ wrongField: 123 }), // Response 1: Wrong shape
        JSON.stringify({ value: "FixedSchema" }) // Response 2: Good
    ]);

    const res2 = await tester2.generateJSONWithRepair("prompt", schema);
    if (res2.success && res2.data.value === "FixedSchema") {
        console.log("✅ Passed: Recovered from schema validation error.");
    } else {
        console.error("❌ Failed Test 2:", res2);
        process.exit(1);
    }
}

runManualTest().catch(console.error);
