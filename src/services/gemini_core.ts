import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';
import { FinancialAudit, ACCOUNTANT_CATEGORIES } from '../types/accountant';
import { FinancialReport } from '../types/financial_report';

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
   * Retrieves the API key from environment variables.
   * Supports VITE_GEMINI_API_KEY (frontend) and GEMINI_API_KEY (script/backend).
   */
  private getApiKey(): string {
    // 1. Priority: LocalStorage (User overrides)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini-api-key');
      if (stored) {
        try {
          // useKV stores strings as JSON strings (e.g., "\"abc\"")
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'string' && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Fallback if not JSON stringified
          if (stored.length > 0) return stored;
        }
      }
    }

    // 2. Priority: Vite Environment Variable
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (viteKey) return viteKey;
    }

    // 3. Fallback for non-Vite environments (e.g. running scripts via tsx)
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
    prompt: string | Array<string | Part>
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.');
    }

    let retries = GeminiCore.MAX_RETRIES;
    let delay = GeminiCore.INITIAL_RETRY_DELAY;

    while (retries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: unknown) {
        const apiError = error as { status?: number };
        if (apiError.status === 429 || apiError.status === 503) {
          console.warn(`Gemini API rate limit/unavailable (${apiError.status}). Retrying in ${delay}ms...`);
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
   * Generates content and parses it as JSON, validating against a Zod schema if provided.
   * Handles markdown code block stripping and basic JSON repair.
   */
  async generateJSON<T>(
    prompt: string | Array<string | Part>,
    schema?: z.ZodType<T>,
    config?: GenerationConfig
  ): Promise<T> {
    const rawText = await this.generateContent(prompt, config);
    const cleanedJson = this.cleanJsonString(rawText);

    try {
      const parsed = JSON.parse(cleanedJson);

      if (schema) {
        return schema.parse(parsed);
      }
      return parsed as T;
    } catch (error) {
      console.error('Failed to parse or validate JSON from Gemini response:', error);
      console.debug('Raw response:', rawText);
      console.debug('Cleaned JSON:', cleanedJson);
      throw new Error(`Gemini response was not valid JSON${schema ? ' or did not match schema' : ''}: ${(error as Error).message}`);
    }
  }

  /**
   * Helper to clean markdown code blocks from JSON strings.
   */
  private cleanJsonString(text: string): string {
    let cleaned = text.trim();
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned.trim();
  }

  /**
   * Exposes the underlying model instance if direct access is needed for streaming etc.
   */
  getModel(): GenerativeModel {
    return this.model;
  }

  public static getModelName(): string {
    return GeminiCore.MODEL_NAME;
  }

  /**
   * Generates a comprehensive financial report using "The Accountant" persona.
   * @param auditData The user's completed financial audit.
   * @returns A structured FinancialReport object.
   */
  async generateFinancialReport(auditData: FinancialAudit): Promise<FinancialReport> {
    // Dynamically create a Zod schema for the report for runtime validation.
    const financialReportSchema = z.object({
      executiveSummary: z.string().min(50),
      spendingAnalysis: z.array(z.object({
        category: z.nativeEnum(Object.keys(ACCOUNTANT_CATEGORIES)),
        totalSpent: z.number(),
        aiSummary: z.string().min(20),
        healthScore: z.number().min(1).max(10),
      })),
      proposedBudget: z.object(
        Object.keys(ACCOUNTANT_CATEGORIES).reduce((acc, cat) => {
          acc[cat] = z.object({
            allocatedAmount: z.number(),
            subcategories: z.object(
              Object.keys(ACCOUNTANT_CATEGORIES[cat].subcategories).reduce((subAcc, subCat) => {
                subAcc[subCat] = z.number();
                return subAcc;
              }, {})
            ),
          });
          return acc;
        }, {})
      ),
      moneyManagementAdvice: z.array(z.object({
        title: z.string(),
        description: z.string(),
        relatedCategory: z.nativeEnum(Object.keys(ACCOUNTANT_CATEGORIES)),
      })),
      reportGeneratedAt: z.string().datetime(),
      version: z.literal('1.0'),
    });

    const prompt = this.constructFinancialReportPrompt(auditData);

    // Use generateJSON with the schema to get a validated object
    return this.generateJSON(prompt, financialReportSchema);
  }

  private constructFinancialReportPrompt(auditData: FinancialAudit): string {
    const auditJson = JSON.stringify(auditData, null, 2);
    const categoriesJson = JSON.stringify(ACCOUNTANT_CATEGORIES, null, 2);

    return `
      You are "The Accountant," an elite-level, direct, and analytical AI financial advisor.
      Your task is to analyze the user's financial audit data and generate a comprehensive, structured financial report.
      The tone must be professional, insightful, and highly analytical. Avoid generic encouragement.

      **User's Financial Audit Data:**
      ${auditJson}

      **Budgeting Categories:**
      Use the following category structure for your analysis and budget proposal.
      ${categoriesJson}

      **Instructions:**
      1.  **Analyze Spending:** Scrutinize the user's income and expenses. Identify areas of high spending, potential savings, and financial strengths or weaknesses.
      2.  **Create a Budget:** Propose a detailed monthly budget. The total allocated budget must not exceed the user's monthly income. Be realistic but firm in your recommendations.
      3.  **Provide Advice:** Offer actionable, specific money management advice. Each piece of advice should be linked to a specific financial category.
      4.  **Format Output:** You MUST respond with a valid JSON object that strictly adheres to the defined 'FinancialReport' schema. Do not include any text, markdown, or commentary outside of the JSON object itself.

      **Output Schema (reminder):**
      \`\`\`json
      {
        "executiveSummary": "string",
        "spendingAnalysis": [
          {
            "category": "string (must be a key from ACCOUNTANT_CATEGORIES)",
            "totalSpent": "number",
            "aiSummary": "string",
            "healthScore": "number (1-10)"
          }
        ],
        "proposedBudget": {
          // Dynamically structured based on ACCOUNTANT_CATEGORIES
        },
        "moneyManagementAdvice": [
          {
            "title": "string",
            "description": "string",
            "relatedCategory": "string (must be a key from ACCOUNTANT_CATEGORIES)"
          }
        ],
        "reportGeneratedAt": "string (ISO 8601 format)",
        "version": "1.0"
      }
      \`\`\`

      Now, generate the financial report based on the user's data.
    `;
  }
}
