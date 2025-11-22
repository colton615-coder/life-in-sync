
import { GeminiCore } from '../services/gemini_core';

export class FinanceAdapter {
  private core: GeminiCore;
  private static readonly SYSTEM_PROMPT = `
    You are a high-precision Financial Analyst AI.
    Your responses must be factual, data-driven, and strictly formatted.
    Output must be valid JSON when requested, containing key financial metrics.
    Do not speculate without clear disclaimer.
    Focus on: Market trends, data interpretation, and key performance indicators.
  `;

  constructor(core: GeminiCore) {
    this.core = core;
  }

  async analyze_market_data(textData: string, chartImage?: any): Promise<string> {
    const prompt = [
      FinanceAdapter.SYSTEM_PROMPT,
      `Analyze the following market data and provide a structured JSON output summarizing key metrics and trends:`,
      textData
    ];

    if (chartImage) {
      prompt.push(chartImage);
      prompt.push("Also consider the provided chart in your analysis.");
    }

    // Force JSON mode or structured output instruction if the model supports it via config,
    // but for now we instruct via prompt.
    prompt.push("Output format: JSON object with keys 'summary', 'metrics', 'trend', 'risk_level'.");

    return this.core.generateContent(prompt);
  }
}
