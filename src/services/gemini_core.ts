import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';

/**
 * Core service for interacting with Google Gemini API.
 * Handles initialization, model configuration, and error handling.
 */
export class GeminiCore {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;
  private static readonly MODEL_NAME = 'gemini-2.5-pro';
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_RETRY_DELAY = 1000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? this.getApiKey();
    if (!this.apiKey) {
      console.error("Gemini API Key is not available. Connection will fail.");
      // throw new Error("API Key is missing."); // Or handle gracefully
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: GeminiCore.MODEL_NAME,
    });
  }

  /**
   * Retrieves the API key from environment variables.
   * Supports VITE_GEMINI_API_KEY (frontend) and GEMINI_API_KEY (script/backend).
   */
  private getApiKey(): string {
    // 1. Priority: LocalStorage (User overrides)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini-api-key');
      if (stored) {
        try {
          // useKV stores strings as JSON strings (e.g., "\"abc\"")
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'string' && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Fallback if not JSON stringified
          if (stored.length > 0) return stored;
        }
      }
    }

    // 2. Priority: Vite Environment Variable
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;

    // 3. Fallback for non-Vite environments (e.g. running scripts via tsx)
    if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }

    console.warn('Gemini API Key not found in environment variables (VITE_GEMINI_API_KEY or GEMINI_API_KEY). calls will fail.');
    return '';
  }

  /**
   * Generates content with retry logic for rate limits.
   */
  async generateContent(
    prompt: string | Array<string | Part>,
    config?: GenerationConfig
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.');
    }

    let retries = GeminiCore.MAX_RETRIES;
    let delay = GeminiCore.INITIAL_RETRY_DELAY;

    while (retries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        if (error.status === 429 || error.status === 503) {
          console.warn(`Gemini API rate limit/unavailable (${error.status}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
        } else {
          console.error('Gemini API Error:', error);
          throw error;
        }
      }
    }
    throw new Error('Gemini API request failed after retries.');
  }

  /**
   * Generates content and parses it as JSON, validating against a Zod schema if provided.
   * Handles markdown code block stripping and basic JSON repair.
   */
  async generateJSON<T>(
    prompt: string | Array<string | Part>,
    schema?: z.ZodType<T>,
    config?: GenerationConfig
  ): Promise<T> {
    const rawText = await this.generateContent(prompt, config);
    const cleanedJson = this.cleanJsonString(rawText);

    try {
      const parsed = JSON.parse(cleanedJson);

      if (schema) {
        return schema.parse(parsed);
      }
      return parsed as T;
    } catch (error) {
      console.error('Failed to parse or validate JSON from Gemini response:', error);
      console.debug('Raw response:', rawText);
      console.debug('Cleaned JSON:', cleanedJson);
      throw new Error(`Gemini response was not valid JSON${schema ? ' or did not match schema' : ''}: ${(error as Error).message}`);
    }
  }

  /**
   * Helper to clean markdown code blocks from JSON strings.
   */
  private cleanJsonString(text: string): string {
    let cleaned = text.trim();
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned.trim();
  }

  /**
   * Exposes the underlying model instance if direct access is needed for streaming etc.
   */
  getModel(): GenerativeModel {
    return this.model;
  }

  public static getModelName(): string {
    return GeminiCore.MODEL_NAME;
  }
}
