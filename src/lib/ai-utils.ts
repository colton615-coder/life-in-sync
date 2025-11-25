import { GeminiCore } from '../services/gemini_core';

// Instantiate a local core for these utilities
const gemini = new GeminiCore();

/**
 * Robust AI call, backed by the GeminiCore service which includes built-in retries.
 */
export async function callAIWithRetry(
  promptText: string,
  jsonMode: boolean = false
): Promise<string> {
  try {
    if (jsonMode) {
      const jsonPrompt = `${promptText}\n\nIMPORTANT: Respond with only valid JSON.`;
      return await gemini.generateContent(jsonPrompt);
    }
    return await gemini.generateContent(promptText);
  } catch (error) {
    console.error('[callAIWithRetry] Gemini Core failed:', error);
    throw error; // Re-throw to be handled by the caller
  }
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
