
import { GeminiCore } from '../services/gemini_core';

export class WorkoutAdapter {
  private core: GeminiCore;
  private static readonly SYSTEM_PROMPT = `
    You are an elite Personal Trainer and Physiologist.
    Create personalized workout routines.
    Focus on:
    1. Physiological safety (warm-up, cool-down, proper form).
    2. Progressive overload.
    3. Motivational but realistic goal setting.
    Ensure the routine matches the user's stats and available equipment.
  `;

  constructor(core: GeminiCore) {
    this.core = core;
  }

  async generate_routine(userStats: unknown, goals: unknown): Promise<string> {
    const statsStr = JSON.stringify(userStats);
    const goalsStr = JSON.stringify(goals);

    const prompt = [
      WorkoutAdapter.SYSTEM_PROMPT,
      `User Stats: ${statsStr}`,
      `Goals: ${goalsStr}`,
      "Generate a detailed workout routine for this user."
    ];

    return this.core.generateContent(prompt);
  }
}
