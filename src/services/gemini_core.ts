
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

/**
 * Core service for interacting with Google Gemini API.
 * Handles initialization, model configuration, and error handling.
 */
export class GeminiCore {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;
  private static readonly MODEL_NAME = 'gemini-2.5-pro';

  constructor() {
    this.apiKey = this.getApiKey();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: GeminiCore.MODEL_NAME,
      // Optional: Set safety settings here if needed globally
    });
  }

  /**
   * Retrieves the API key from environment variables.
   * Supports VITE_GEMINI_API_KEY (frontend) and GEMINI_API_KEY (script/backend).
   */
  private getApiKey(): string {
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;

    // Fallback for non-Vite environments (e.g. running scripts via tsx)
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
    prompt: string | Array<string | any>, // Part[] type loosely typed here to avoid deep imports in signatures
    config?: GenerationConfig
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.');
    }

    let retries = 3;
    let delay = 1000;

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
   * Exposes the underlying model instance if direct access is needed for streaming etc.
   */
  getModel(): GenerativeModel {
    return this.model;
  }
}
