import type { AIProvider, AIRequest, AIResponse } from './types';

export class AIRouter {
  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      return await this.callProvider('spark', request);
    } catch (error: unknown) {
      console.error(`Spark provider failed:`, error);
      const e = error as Error;
      throw new Error(`AI provider failed: ${e.message}`);
    }
  }

  private async callProvider(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
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
}

export const ai = new AIRouter();

