import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';
import { handleApiError, AppError } from './api-error-handler';
import { logger } from './logger';
import { cleanAndParseJSON } from '../lib/ai-utils';

/**
 * Core service for interacting with Google Gemini API.
 * Handles initialization, model configuration, and error handling.
 */
import { APP_CONFIG } from '@/lib/constants';

export class GeminiCore {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? this.getApiKey();
    if (!this.apiKey) {
      console.error("Gemini API Key is not available. Connection will fail.");
      throw new Error("API Key is missing. Please set it in the application settings or via the VITE_GEMINI_API_KEY environment variable.");
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: APP_CONFIG.AI.MODEL_NAME,
    });
  }

  /**
   * Returns the model name used by the core.
   */
  public static getModelName(): string {
    return APP_CONFIG.AI.MODEL_NAME;
  }

  /**
   * Retrieves the API key from environment variables.
   */
  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.GEMINI_API_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'string' && parsed.length > 0) {
            return parsed;
          }
        } catch {
          if (stored.length > 0) return stored;
        }
      }
    }
    // @ts-ignore
    // eslint-disable-next-line
    if (typeof process !== 'undefined' && process.env.VITE_GEMINI_API_KEY) {
      return process.env.VITE_GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
    return '';
  }

  /**
   * Generates content with retry logic.
   */
  async generateContent(
    prompt: string | Array<string | Part>,
    // @ts-expect-error - config is reserved for future use
    config?: GenerationConfig
  ): Promise<{ success: true; data: string } | AppError> {
    if (!this.apiKey) {
      return {
        success: false,
        code: 'MISSING_API_KEY',
        message: 'Gemini API Key is missing. Please configure it in Settings.',
      };
    }

    let retries = APP_CONFIG.AI.MAX_RETRIES;
    let delay = APP_CONFIG.AI.INITIAL_RETRY_DELAY;

    while (retries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return { success: true, data: response.text() };
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (error.status === 429 || error.status === 503) {
          console.warn(`Gemini API rate limit/unavailable (${error.status}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          return handleApiError(error, 'GeminiCore.generateContent');
        }
      }
    }
    const finalError = new Error('Gemini API request failed after multiple retries.');
    return handleApiError(finalError, 'GeminiCore.generateContent');
  }

  /**
   * Generates content and parses it as JSON.
   */
  async generateJSON<T>(
    prompt: string | Array<string | Part>,
    schema?: z.ZodType<T>,
    config?: GenerationConfig
  ): Promise<{ success: true; data: T } | AppError> {
    const contentResult = await this.generateContent(prompt, config);
    if (!contentResult.success) {
      return contentResult;
    }

    const rawText = contentResult.data;
    const parsed = cleanAndParseJSON(rawText);

    if (parsed === null) {
      logger.error('GeminiCore.generateJSON', 'Failed to extract or parse JSON from Gemini response.', {
        rawData: rawText,
      });
      return handleApiError(new Error('The response from the AI did not contain valid JSON.'), 'GeminiCore.generateJSON');
    }

    try {
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          logger.error('GeminiCore.generateJSON', 'Zod validation failed.', {
            issues: result.error.issues,
            rawData: rawText,
          });
          // Attach specific Zod error info for the repair mechanism to use
          const error = new Error('The data structure from the AI was invalid.');
          // @ts-expect-error - Attaching custom property for repair logic
          (error as any).zodError = result.error;
          return handleApiError(error, 'GeminiCore.generateJSON');
        }
        return { success: true, data: result.data };
      }
      return { success: true, data: parsed as T };
    } catch (error) {
      return handleApiError(error, 'GeminiCore.generateJSON');
    }
  }

  /**
   * Generates JSON with an automatic repair step if validation fails.
   */
  async generateJSONWithRepair<T>(
    prompt: string,
    schema: z.ZodType<T>,
    config?: GenerationConfig
  ): Promise<{ success: true; data: T } | AppError> {
    // 1. First Attempt
    const result = await this.generateJSON(prompt, schema, config);
    if (result.success) return result;

    // 2. Check if it's a validation/parsing error that we can try to fix
    // We assume generic 'handleApiError' returns a formatted AppError.
    // If it was a network error, we probably can't "repair" it by asking again.
    // But if it was a schema mismatch, we can.

    logger.warn('GeminiCore', 'First attempt failed, attempting repair...');

    const repairPrompt = `
      You previously generated a JSON response that failed validation.

      **Original Prompt:**
      ${prompt}

      **Your Invalid Response:**
      (See previous output)

      **Error:**
      The response did not match the required JSON schema or was malformed.

      **Requirement:**
      Please strictly adhere to the schema and correct the JSON.
      Ensure all required fields are present and types are correct.
      Return ONLY the valid JSON.
    `;

    return await this.generateJSON(repairPrompt, schema, config);
  }
}
