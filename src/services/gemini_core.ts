import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';
import { FinancialAudit, AuditFlag } from '../types/accountant';
import { FinancialReport } from '../types/financial_report';
import { handleApiError, AppError } from './api-error-handler';
import { logger } from './logger';
import { cleanAndParseJSON } from '../lib/ai-utils';
import { hydrateReportIds } from '../lib/finance_hydration';

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
    // @ts-expect-error - config is reserved for future use
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
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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
          // Attach specific Zod error info for the repair mechanism to use
          const error = new Error('The data structure from the AI was invalid.');
          // @ts-expect-error - Attaching custom property for repair logic
          (error as any).zodError = result.error;
          return handleApiError(error, 'GeminiCore.generateJSON');
        }
        return { success: true, data: result.data };
      }
      return { success: true, data: parsed as T };
    } catch (error) {
      return handleApiError(error, 'GeminiCore.generateJSON');
    }
  }

  /**
   * Generates JSON with an automatic repair step if validation fails.
   */
  async generateJSONWithRepair<T>(
    prompt: string,
    schema: z.ZodType<T>,
    config?: GenerationConfig
  ): Promise<{ success: true; data: T } | AppError> {
    // 1. First Attempt
    const result = await this.generateJSON(prompt, schema, config);
    if (result.success) return result;

    // 2. Check if it's a validation/parsing error that we can try to fix
    // We assume generic 'handleApiError' returns a formatted AppError.
    // If it was a network error, we probably can't "repair" it by asking again.
    // But if it was a schema mismatch, we can.

    logger.warn('GeminiCore', 'First attempt failed, attempting repair...');

    const repairPrompt = `
      You previously generated a JSON response that failed validation.

      **Original Prompt:**
      ${prompt}

      **Your Invalid Response:**
      (See previous output)

      **Error:**
      The response did not match the required JSON schema or was malformed.

      **Requirement:**
      Please strictly adhere to the schema and correct the JSON.
      Ensure all required fields are present and types are correct.
      Return ONLY the valid JSON.
    `;

    return await this.generateJSON(repairPrompt, schema, config);
  }

  // --- Finance 2.0 Methods ---

  /**
   * Phase 1: The Audit (Review)
   * Analyzes the raw audit data and generates flags/critiques.
   */
  async performFinancialAudit(auditData: FinancialAudit): Promise<{ success: true; data: AuditFlag[] } | AppError> {
    // Filter out empty categories to avoid confusing the AI
    const cleanCategories = auditData.categories
      .map(cat => ({
        ...cat,
        subcategories: cat.subcategories.filter(sub => sub.amount !== null && sub.amount > 0)
      }))
      .filter(cat => cat.subcategories.length > 0);

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
      Categories: ${JSON.stringify(cleanCategories, null, 2)}

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

    const result = await this.generateJSONWithRepair(prompt, flagSchema);

    if (!result.success) return result;

    // @ts-expect-error - We need to cast the result to any to map the IDs because Zod schema doesn't output IDs
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
    logger.info('GeminiCore.generateFinalReport', 'Starting Report Generation', { auditId: auditData.lastUpdated });

    // Clean data again for the final report
    const cleanCategories = auditData.categories
      .map(cat => ({
        ...cat,
        subcategories: cat.subcategories.filter(sub => sub.amount !== null && sub.amount > 0)
      }))
      .filter(cat => cat.subcategories.length > 0);

    // Loose Schema: Allows missing IDs during initial generation to prevent validation failure
    // IDs will be hydrated in post-processing
    const looseReportSchema = z.object({
      executiveSummary: z.string(),
      spendingAnalysis: z.array(z.object({
        categoryId: z.string().optional(),
        categoryName: z.string(),
        totalSpent: z.number(),
        aiSummary: z.string(),
        healthScore: z.number().min(1).max(10)
      })),
      proposedBudget: z.array(z.object({
        categoryId: z.string().optional(),
        categoryName: z.string(),
        allocatedAmount: z.number(),
        subcategories: z.array(z.object({
          subcategoryId: z.string().optional(),
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
      Categories (Actual Spend): ${JSON.stringify(cleanCategories)}

      **Audit History:**
      Flags Raised: ${JSON.stringify(auditData.flags)}
      User Resolutions: ${JSON.stringify(auditData.resolutions)}

      **Instructions:**
      1. Create a Proposed Budget. Take the user's actuals and their resolutions into account. If they accepted a reduction, use that lower number.
      2. Ensure the total proposed budget is <= Monthly Income. If not, cut discretionary categories aggressively.
      3. Generate the Executive Summary and Spending Analysis.
      4. Provide 3-5 high-impact Money Management Tips.
      5. IMPORTANT: You MUST output the exact 'categoryName' and 'subcategoryName' from the provided data.
      6. Try to include the 'categoryId' and 'subcategoryId' from the data if possible, but matching the NAME is the most important requirement.

      **Output Schema:**
      {
        "executiveSummary": "...",
        "spendingAnalysis": [
          {
            "categoryId": "UUID (optional but preferred)",
            "categoryName": "Housing",
            "totalSpent": 2000,
            "aiSummary": "...",
            "healthScore": 8
          }
        ],
        "proposedBudget": [
          {
            "categoryId": "UUID (optional but preferred)",
            "categoryName": "Housing",
            "allocatedAmount": 1800,
            "subcategories": [
              {
                 "subcategoryId": "UUID (optional but preferred)",
                 "subcategoryName": "Rent",
                 "allocatedAmount": 1800
              }
            ]
          }
        ],
        "moneyManagementAdvice": [ ... ],
        "reportGeneratedAt": "${new Date().toISOString()}",
        "version": "2.0"
      }
    `;

    const result = await this.generateJSONWithRepair(prompt, looseReportSchema);

    if (!result.success) {
      logger.error('GeminiCore.generateFinalReport', 'Failed to generate valid JSON Report', { error: result });
      return result;
    }

    // Post-Processing: Hydrate Missing IDs
    // We map the Names back to the original UUIDs from 'auditData' to ensure the application works correctly.
    const hydratedReport = hydrateReportIds(result.data, auditData);

    logger.info('GeminiCore.generateFinalReport', 'Report Generation Completed Successfully');
    return { success: true, data: hydratedReport };
  }

  /**
   * Chat Interface for Accountant Consultation
   */
  async consultAccountant(
    history: { role: 'user' | 'model', text: string }[],
    auditData: FinancialAudit
  ): Promise<{ success: true; data: { reply: string; intent?: { type: 'log_transaction', category: string, amount: number, item: string } } } | AppError> {
     // Clean data
    const cleanCategories = auditData.categories
      .map(cat => ({
        ...cat,
        subcategories: cat.subcategories.filter(sub => sub.amount !== null && sub.amount > 0)
      }))
      .filter(cat => cat.subcategories.length > 0);

    const schema = z.object({
        reply: z.string(),
        intent: z.object({
            type: z.literal('log_transaction'),
            category: z.string(),
            amount: z.number(),
            item: z.string()
        }).optional()
    });

    const prompt = `
        You are "The Accountant".

        **Context:**
        User's Financial Data: ${JSON.stringify(cleanCategories)}
        User's Income: ${auditData.monthlyIncome}

        **Conversation History:**
        ${JSON.stringify(history)}

        **Instructions:**
        1. Answer the user's financial questions with direct, analytical advice.
        2. If the user mentions spending money (e.g., "I just spent $50 on Gas"), identify the 'intent' to log a transaction.
        3. Match the transaction to an existing category if possible, or suggest a new one.

        **Output Schema:**
        {
            "reply": "Your response text...",
            "intent": { "type": "log_transaction", "category": "Housing", "amount": 100, "item": "Rent" } // Optional
        }
    `;

    return await this.generateJSONWithRepair(prompt, schema);
  }
}
