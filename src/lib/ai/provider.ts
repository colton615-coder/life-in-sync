import type { AIRequest, AIResponse } from './types';
import { GeminiCore } from '@/services/gemini_core';

export class AIRouter {
  private gemini: GeminiCore;

  constructor() {
    this.gemini = new GeminiCore();
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      // Force Gemini provider
      return await this.callGemini(request);
    } catch (error: unknown) {
      console.error(`AI provider failed:`, error);
      const e = error as Error;
      throw new Error(`AI provider failed: ${e.message}`);
    }
  }

  private async callGemini(
    request: AIRequest
  ): Promise<AIResponse> {
    const response = await this.gemini.generateContent(request.prompt);

    // Attempt to parse JSON if requested, though this simplified router returns text.
    // The GeminiCore.generateJSON method should be used directly if typed JSON is needed.
    // If request.jsonMode is true, we assume the caller handles parsing or the prompt ensures JSON.

    return {
      text: response,
      provider: 'gemini',
      model: 'gemini-2.5-pro',
    };
  }
}

export const ai = new AIRouter();
