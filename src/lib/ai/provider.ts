import { gemini } from '../gemini/client';
import type { AIProvider, AIRequest, AIResponse } from './types';
import { DEFAULT_GEMINI_MODEL } from '../gemini/config';

export class AIRouter {
  async generate(request: AIRequest): Promise<AIResponse> {
    let provider: AIProvider | undefined = request.provider;
    if (!provider || provider === 'auto') {
      try {
        provider = await this.getOptimalProvider(request);
      } catch (e) {
        console.error('Failed to get optimal provider, defaulting to spark', e);
        provider = 'spark';
      }
    }

    try {
      return await this.callProvider(provider, request);
    } catch (primaryError: unknown) {
      console.error(`${provider} failed:`, primaryError);

      const fallbackProvider: AIProvider =
        provider === 'gemini' ? 'spark' : 'gemini';

      try {
        console.log(`Falling back to ${fallbackProvider}...`);
        return await this.callProvider(fallbackProvider, request);
      } catch (fallbackError: unknown) {
        console.error(`${fallbackProvider} also failed:`, fallbackError);
        const pError = primaryError as Error;
        const fError = fallbackError as Error;
        throw new Error(
          `All AI providers failed. Primary: ${pError.message}, Fallback: ${fError.message}`
        );
      }
    }
  }

  private async callProvider(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    if (provider === 'gemini') {
      const isConfigured = await gemini.isConfigured();
      if (!isConfigured) {
        throw new Error('Gemini is not configured');
      }

      if (request.jsonMode) {
        const result = await gemini.generateJSON(request.prompt, {
          model: request.model,
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens,
        });
        return {
          text: JSON.stringify(result),
          provider: 'gemini',
          model: request.model || DEFAULT_GEMINI_MODEL,
        };
      } else {
        const result = await gemini.generate(request.prompt, {
          model: request.model,
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens,
        });
        return {
          text: result.text,
          provider: 'gemini',
          model: result.model,
        };
      }
    }

    // Fallback to spark
    const sparkModel = request.model || 'gpt-4o';
    const prompt = window.spark.llmPrompt`${request.prompt}`;
    const response = await window.spark.llm(prompt, sparkModel, request.jsonMode);

    return {
      text: response,
      provider: 'spark',
      model: sparkModel,
    };
  }

  private async getOptimalProvider(request: AIRequest): Promise<AIProvider> {
    const preferred = await window.spark.kv.get<AIProvider>('preferred-ai-provider');
    if (preferred && preferred !== 'auto') {
      const isGeminiConfigured = await gemini.isConfigured();
      if (preferred === 'gemini' && !isGeminiConfigured) {
        return 'spark';
      }
      return preferred;
    }

    const isGeminiConfigured = await gemini.isConfigured();
    if (!isGeminiConfigured) {
      return 'spark';
    }

    // Simple logic: use Gemini for longer prompts, otherwise Spark
    if (request.prompt.length > 1000) {
      return 'gemini';
    }

    return 'spark';
  }
}

export const ai = new AIRouter();
