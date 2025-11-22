
import { GeminiCore } from './gemini_core';
import { GolfSwingAdapter } from '../ai_adapters/GolfSwingAdapter';
import { FinanceAdapter } from '../ai_adapters/FinanceAdapter';
import { WorkoutAdapter } from '../ai_adapters/WorkoutAdapter';
import { KnoxAdapter } from '../ai_adapters/KnoxAdapter';

/**
 * Central Manager for AI Services.
 * Implements the Service & Adapter pattern to provide easy access to domain-specific AI capabilities.
 */
export class AIManager {
  private core: GeminiCore;

  public readonly golf: GolfSwingAdapter;
  public readonly finance: FinanceAdapter;
  public readonly workout: WorkoutAdapter;
  public readonly knox: KnoxAdapter;

  constructor() {
    this.core = new GeminiCore();

    this.golf = new GolfSwingAdapter(this.core);
    this.finance = new FinanceAdapter(this.core);
    this.workout = new WorkoutAdapter(this.core);
    this.knox = new KnoxAdapter(this.core);
  }
}

// Export a singleton instance for global usage
export const aiManager = new AIManager();
