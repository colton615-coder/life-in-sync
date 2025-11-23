import { GeminiCore } from '../services/gemini_core';

// Instantiate a local core for these utilities
const gemini = new GeminiCore();

/**
 * @deprecated This function was a wrapper for window.spark.llm.
 * It is now redirected to use GeminiCore for production stability.
 */
async function safeSparkLLMCall(
  promptText: string,
  model: string = 'gemini-2.5-pro',
  jsonMode: boolean = false
): Promise<string> {
  console.log('[Safe LLM Call] Delegating to GeminiCore');
  
  try {
    if (jsonMode) {
      // If jsonMode is requested, we try to get JSON but return it as string to match signature
      // or just get content and let the caller parse it (since this function returns string)
      // Better: Just ask Gemini for the content, the caller handles parsing usually via parseAIJsonResponse
      // But we can add a system instruction for JSON if not present.
      const jsonPrompt = promptText + "\n\nIMPORTANT: Output strictly valid JSON.";
      return await gemini.generateContent(jsonPrompt);
    }
    
    return await gemini.generateContent(promptText);
  } catch (error) {
    console.error('[Safe LLM Call] Gemini Core failed:', error);
    throw error;
  }
}

/**
 * robust AI call with retries.
 * Now backed by GeminiCore which has its own retries, but we keep this wrapper
 * to maintain backward compatibility with existing calls.
 */
export async function callAIWithRetry(
  promptText: string,
  model: string = 'gemini-2.5-pro', // defaulted to supported model
  jsonMode: boolean = false,
  maxRetries: number = 3
): Promise<string> {
  // GeminiCore handles retries internally for 429/503.
  // We'll rely on that, but if we want to catch other errors or be extra safe:
  return safeSparkLLMCall(promptText, model, jsonMode);
}

/**
 * Helper to parse JSON responses from AI.
 * Re-implements the logic using standard JSON.parse after cleaning,
 * similar to GeminiCore's internal logic but exposed for external use.
 */
export function parseAIJsonResponse<T>(response: string, expectedStructure?: string): T {
  try {
    let cleanedResponse = response.trim();
    
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    cleanedResponse = cleanedResponse.trim();
    
    return JSON.parse(cleanedResponse) as T;
  } catch (error) {
    console.error('[JSON Parse] Failed:', error);
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates that the parsed data has the required fields.
 */
export function validateAIResponse(data: unknown, requiredFields: string[]): void {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const fieldPath = field.split('.');
    let current: any = data;
    let fieldExists = true;
    
    for (const part of fieldPath) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        fieldExists = false;
        break;
      }
    }
    
    if (!fieldExists) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`AI response missing required fields: ${missingFields.join(', ')}`);
  }
}
