
import { GeminiCore } from '../services/gemini_core';

export class GolfSwingAdapter {
  private core: GeminiCore;
  private static readonly SYSTEM_PROMPT = `
    You are an expert Golf Biomechanics Analyst.
    Your goal is to analyze golf swings from video or images.
    Focus on:
    1. Biomechanical angles (spine angle, knee flex, hip rotation).
    2. Club path and plane.
    3. Tempo and balance.
    Provide actionable feedback for improvement.
    Do not give generic advice; be specific to the visual data provided.
  `;

  constructor(core: GeminiCore) {
    this.core = core;
  }

  /**
   * Analyzes swing mechanics from a video or image.
   * @param mediaInput Can be a File object (browser), Blob, or a base64 string representation/object for the API.
   *                   For this adapter, we assume the caller handles file-to-generative-part conversion
   *                   if it's complex, or passes the Part object directly.
   *                   However, to keep it simple for the caller, we'll accept a standardized object or description.
   */
  async analyze_swing_mechanics(mediaInput: any): Promise<string> {
    // In a real app, we would convert File/Blob to the format Gemini expects (inlineData with mimeType and base64)
    // For now, we assume mediaInput is properly formatted or we wrap it.
    // If mediaInput is just a string (path) for testing, we handle that.

    const prompt = [
      GolfSwingAdapter.SYSTEM_PROMPT,
      "Analyze the attached swing mechanics.",
      mediaInput
    ];

    return this.core.generateContent(prompt);
  }
}
