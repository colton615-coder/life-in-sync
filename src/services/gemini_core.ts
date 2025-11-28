import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';
import { FinancialAudit, AuditFlag, Category } from '../types/accountant';
import { FinancialReport } from '../types/financial_report';
import { handleApiError, AppError } from './api-error-handler';
import { logger } from './logger';
import { cleanAndParseJSON } from '../lib/ai-utils';

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
      throw new Error("API Key is missing. Please set it in the application settings or via the VITE_GEMINI_API_KEY environment variable.");
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: GeminiCore.MODEL_NAME,
    });
  }

  /**
   * Returns the model name used by the core.
   */
  public static getModelName(): string {
    return GeminiCore.MODEL_NAME;
  }

  /**
   * Retrieves the API key from environment variables.
   */
  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini-api-key');
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
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (viteKey) return viteKey;
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
    config?: GenerationConfig
  ): Promise<{ success: true; data: string } | AppError> {
    if (!this.apiKey) {
      return {
        success: false,
        code: 'MISSING_API_KEY',
        message: 'Gemini API Key is missing. Please configure it in Settings.',
      };
    }

    let retries = GeminiCore.MAX_RETRIES;
    let delay = GeminiCore.INITIAL_RETRY_DELAY;

    while (retries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return { success: true, data: response.text() };
      } catch (error: any) {
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
          return handleApiError(new Error('The data structure from the AI was invalid.'), 'GeminiCore.generateJSON');
        }
        return { success: true, data: result.data };
      }
      return { success: true, data: parsed as T };
    } catch (error) {
      return handleApiError(error, 'GeminiCore.generateJSON');
    }
  }

  // --- Finance 2.0 Methods ---

  /**
   * Phase 1: The Audit (Review)
   * Analyzes the raw audit data and generates flags/critiques.
   */
  async performFinancialAudit(auditData: FinancialAudit): Promise<{ success: true; data: AuditFlag[] } | AppError> {
    // Schema for the Audit Flags
    const flagSchema = z.object({
      flags: z.array(z.object({
        categoryId: z.string(),
        subcategoryId: z.string().optional(),
        severity: z.enum(['critical', 'warning', 'observation', 'praise']),
        title: z.string(),
        message: z.string(),
        suggestedAction: z.string().optional()
      }))
    });

    const prompt = `
      You are "The Accountant," an elite-level financial auditor.
      Your job is to ruthlessly review the user's submitted financial data for a "Finance 2.0" audit.

      **Data to Review:**
      Income: ${auditData.monthlyIncome}
      Categories: ${JSON.stringify(auditData.categories, null, 2)}

      **Instructions:**
      1. Analyze the data for excessive spending, missing critical categories (like Savings/Investment), or impressive discipline.
      2. Generate "Flags" for items that require attention.
      3. Be specific. If they spend $500 on "Coffee", flag it as 'critical' or 'warning'.
      4. If the budget looks solid, provide 'praise' flags.
      5. The output must be a valid JSON object matching the schema.
      6. IMPORTANT: You MUST use the exact 'id' from the categories/subcategories provided in the data to link your flags.

      **Output Schema:**
      {
        "flags": [
          {
            "categoryId": "UUID from data",
            "subcategoryId": "UUID from data (optional)",
            "severity": "critical" | "warning" | "observation" | "praise",
            "title": "Short Title",
            "message": "Direct, professional critique.",
            "suggestedAction": "e.g., Reduce to $100"
          }
        ]
      }
    `;

    const result = await this.generateJSON(prompt, flagSchema);

    if (!result.success) return result;

    // Map the result to include IDs generated here (though the schema doesn't have ID, we need to add one for the frontend)
    // We can't add it in the Zod schema easily if it's not in the AI response, so we map after.
    const flagsWithIds: AuditFlag[] = result.data.flags.map((flag: any) => ({
      ...flag,
      id: crypto.randomUUID()
    }));

    return { success: true, data: flagsWithIds };
  }

  /**
   * Phase 2: Final Report Generation
   * Takes the audit data AND the resolutions (user's answers to flags) to build the final plan.
   */
  async generateFinalReport(auditData: FinancialAudit): Promise<{ success: true; data: FinancialReport } | AppError> {
    const reportSchema = z.object({
      executiveSummary: z.string(),
      spendingAnalysis: z.array(z.object({
        categoryId: z.string(),
        categoryName: z.string(),
        totalSpent: z.number(),
        aiSummary: z.string(),
        healthScore: z.number().min(1).max(10)
      })),
      proposedBudget: z.array(z.object({
        categoryId: z.string(),
        categoryName: z.string(),
        allocatedAmount: z.number(),
        subcategories: z.array(z.object({
          subcategoryId: z.string(),
          subcategoryName: z.string(),
          allocatedAmount: z.number()
        }))
      })),
      moneyManagementAdvice: z.array(z.object({
        title: z.string(),
        description: z.string(),
        relatedCategoryName: z.string().optional(),
        priority: z.enum(['high', 'medium', 'low'])
      })),
      reportGeneratedAt: z.string(),
      version: z.literal('2.0')
    });

    const prompt = `
      You are "The Accountant." The user has completed their financial audit and resolved any flagged issues.
      Now, generate the Final Financial Blueprint (Version 2.0).

      **User Data:**
      Income: ${auditData.monthlyIncome}
      Categories (Actual Spend): ${JSON.stringify(auditData.categories)}

      **Audit History:**
      Flags Raised: ${JSON.stringify(auditData.flags)}
      User Resolutions: ${JSON.stringify(auditData.resolutions)}

      **Instructions:**
      1. Create a Proposed Budget. Take the user's actuals and their resolutions into account. If they accepted a reduction, use that lower number.
      2. Ensure the total proposed budget is <= Monthly Income. If not, cut discretionary categories aggressively.
      3. IMPORTANT: Do not include any category named 'Transportation' or 'Public Transit' in the proposed budget, as these are deprecated.
      4. Generate the Executive Summary and Spending Analysis.
      5. Provide 3-5 high-impact Money Management Tips.

      **Output Schema:**
      (Must match FinancialReport interface strictly)
      {
        "executiveSummary": "...",
        "spendingAnalysis": [ ... ],
        "proposedBudget": [ ... ],
        "moneyManagementAdvice": [ ... ],
        "reportGeneratedAt": "${new Date().toISOString()}",
        "version": "2.0"
      }
    `;

    return await this.generateJSON(prompt, reportSchema);
  }
}
