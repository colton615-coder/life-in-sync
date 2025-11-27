// src/services/gemini_core.ts
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, Part } from '@google/generative-ai';
import { z } from 'zod';
import { FinancialAudit } from '../types/accountant';
import { FinancialReport } from '../types/financial_report';
import { handleApiError, AppError } from './api-error-handler';
import { logger } from './logger';

export interface AuditChatHistoryItem {
    sender: 'ai' | 'user';
    content: string;
}

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
    // Allow empty key for testing instantiation, but warn
    if (!this.apiKey) {
      console.warn("Gemini API Key is missing. Some features will fail.");
    }
    // We initiate even without key to allow graceful failure in methods
    // But GoogleGenerativeAI constructor requires a key, so we pass a dummy if missing to avoid crash,
    // and handle the error in generateContent.
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'dummy_key');
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

    // 2. Priority: Environment Variables (Vite or Node)
    // Direct access to import.meta is causing issues in Jest, so we fallback to process.env
    // or we'd need to assume the build system handles replacement.

    try {
        // @ts-expect-error - import.meta is not available in all environments (e.g. Node without ESM)
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
             // @ts-expect-error - import.meta is not available in all environments
             return import.meta.env.VITE_GEMINI_API_KEY;
        }
    } catch {
        // SyntaxError or ReferenceError in Jest
    }

    if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }

    return '';
  }

  /**
   * Generates content with retry logic for rate limits.
   */
  async generateContent(
    prompt: string | Array<string | Part>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config?: GenerationConfig
  ): Promise<{ success: true; data: string } | AppError> {
    if (!this.apiKey || this.apiKey === 'dummy_key') {
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
          delay *= 2; // Exponential backoff
        } else {
          return handleApiError(error, 'GeminiCore.generateContent');
        }
      }
    }
    const finalError = new Error('Gemini API request failed after multiple retries.');
    return handleApiError(finalError, 'GeminiCore.generateContent');
  }

  /**
   * Generates content and parses it as JSON, validating against a Zod schema if provided.
   * Handles markdown code block stripping and basic JSON repair.
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
    const cleanedJson = this.cleanJsonString(rawText);

    try {
      const parsed = JSON.parse(cleanedJson);

      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          logger.error('GeminiCore.generateJSON', 'Zod validation failed.', {
            issues: result.error.issues,
            rawData: rawText,
          });
          const validationError = new Error('The data structure from the AI was invalid.');
          return handleApiError(validationError, 'GeminiCore.generateJSON');
        }
        return { success: true, data: result.data };
      }

      return { success: true, data: parsed as T };
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      logger.error('GeminiCore.generateJSON', 'Failed to parse JSON from Gemini response.', {
        rawData: cleanedJson,
      });
      const parseError = new Error('The response from the AI was not valid JSON.');
      return handleApiError(parseError, 'GeminiCore.generateJSON');
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
    // NOTE: Because categories are dynamic now, we cannot enforce strict enum keys in Zod.
    // We trust the AI to return keys that match the Input IDs, or we handle mismatches in UI.
    const financialReportSchema = z.object({
      executiveSummary: z.string().min(50),
      spendingAnalysis: z.array(z.object({
        category: z.string(), // Flexible category ID or Label
        totalSpent: z.number(),
        aiSummary: z.string().min(20),
        healthScore: z.number().min(1).max(10),
      })),
      proposedBudget: z.record( // Flexible record for categories
        z.object({
          allocatedAmount: z.number(),
          subcategories: z.record(z.number()), // Flexible record for subcategories
        })
      ),
      moneyManagementAdvice: z.array(z.object({
        title: z.string(),
        description: z.string(),
        relatedCategory: z.string(),
      })),
      reportGeneratedAt: z.string().datetime(),
      version: z.literal('2.0'),
    });

    const prompt = this.constructFinancialReportPrompt(auditData);

    // Use generateJSON with the schema to get a validated object
    const reportResult = await this.generateJSON(prompt, financialReportSchema);

    if (!reportResult.success) {
      throw new Error(reportResult.message);
    }

    return reportResult.data;
  }

  private constructFinancialReportPrompt(auditData: FinancialAudit): string {
    const auditJson = JSON.stringify(auditData, null, 2);

    return `
      You are "The Accountant," an elite-level, direct, and analytical AI financial advisor.
      Your task is to analyze the user's financial audit data and generate a comprehensive, structured financial report.
      The tone must be professional, insightful, and highly analytical. Avoid generic encouragement.

      **User's Financial Audit Data:**
      ${auditJson}

      **Instructions:**
      1.  **Analyze Spending:** Scrutinize the user's income and expenses. Identify areas of high spending, potential savings, and financial strengths or weaknesses.
      2.  **Create a Budget:** Propose a detailed monthly budget. The total allocated budget must not exceed the user's monthly income. Be realistic but firm in your recommendations.
      3.  **Provide Advice:** Offer actionable, specific money management advice. Each piece of advice should be linked to a specific financial category ID.
      4.  **Format Output:** You MUST respond with a valid JSON object that strictly adheres to the defined 'FinancialReport' schema. Do not include any text, markdown, or commentary outside of the JSON object itself.

      **Output Schema (reminder):**
      \`\`\`json
      {
        "executiveSummary": "string",
        "spendingAnalysis": [
          {
            "category": "string (Use the Category ID/Label from input)",
            "totalSpent": "number",
            "aiSummary": "string",
            "healthScore": "number (1-10)"
          }
        ],
        "proposedBudget": {
          "category_id": {
             "allocatedAmount": number,
             "subcategories": { "subcategory_id": number }
          }
        },
        "moneyManagementAdvice": [
          {
            "title": "string",
            "description": "string",
            "relatedCategory": "string"
          }
        ],
        "reportGeneratedAt": "string (ISO 8601 format)",
        "version": "2.0"
      }
      \`\`\`

      Now, generate the financial report based on the user's data.
    `;
  }

  /**
   * Continues the "The Audit" conversation.
   * @param history The chat history so far.
   * @param newMessage The user's new message.
   * @param reportContext The full financial report for reference.
   */
  async continueAuditConversation(history: AuditChatHistoryItem[], newMessage: string, reportContext: FinancialReport): Promise<string> {
      const historyText = history.map(m => `${m.sender === 'ai' ? 'The Accountant' : 'User'}: ${m.content}`).join('\n');
      const context = JSON.stringify(reportContext, null, 2);

      const prompt = `
        You are "The Accountant," an elite-level, direct, and analytical AI financial advisor.
        You are currently in a "Audit Review Session" with the user.

        **Financial Report Context:**
        ${context}

        **Conversation History:**
        ${historyText}

        **User's New Message:**
        ${newMessage}

        **Instructions:**
        - Respond to the user's message directly.
        - Maintain the "Elite/Analytical" persona. Be concise, firm, but helpful.
        - Reference specific numbers from the report if relevant.
        - If the user asks for justification of the budget, explain the logic based on the analysis.
        - Do NOT include JSON or markdown code blocks in your response, just plain text (or markdown text formatting).
      `;

      const result = await this.generateContent(prompt);
      if (!result.success) {
          throw new Error(result.message);
      }
      return result.data;
  }
}
