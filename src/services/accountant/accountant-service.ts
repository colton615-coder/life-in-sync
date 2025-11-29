import { z } from 'zod';
import { FinancialAudit, AuditFlag, AuditResolution } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { GeminiCore } from '../gemini_core';
import { AppError } from '../api-error-handler';
import { logger } from '../logger';
import { hydrateReportIds } from '@/lib/finance_hydration';

export class AccountantService {
  private gemini: GeminiCore;

  constructor() {
    this.gemini = new GeminiCore();
  }

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
        categoryId: z.string().nullable().optional(),
        subcategoryId: z.string().nullable().optional(),
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

    const result = await this.gemini.generateJSONWithRepair(prompt, flagSchema);

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
    logger.info('AccountantService.generateFinalReport', 'Starting Report Generation', { auditId: auditData.lastUpdated });

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
        categoryId: z.string().nullable().optional(),
        categoryName: z.string(),
        totalSpent: z.number(),
        aiSummary: z.string(),
        healthScore: z.number().min(1).max(10)
      })),
      proposedBudget: z.array(z.object({
        categoryId: z.string().nullable().optional(),
        categoryName: z.string(),
        allocatedAmount: z.number(),
        subcategories: z.array(z.object({
          subcategoryId: z.string().nullable().optional(),
          subcategoryName: z.string(),
          allocatedAmount: z.number()
        }))
      })),
      // Robust Advice Schema: Handles both structured objects AND simple string arrays
      moneyManagementAdvice: z.preprocess((val) => {
        if (!Array.isArray(val)) return val;

        return val.map((item: any) => {
          // Case 1: Simple string
          if (typeof item === 'string') {
            const parts = item.split(':');
            if (parts.length > 1) {
              return {
                title: parts[0].trim(),
                description: parts.slice(1).join(':').trim(),
                priority: 'medium'
              };
            }
            return {
              title: 'Financial Tip',
              description: item,
              priority: 'medium'
            };
          }

          // Case 2: Object but missing keys or using wrong keys (from AI hallucinations)
          if (typeof item === 'object' && item !== null) {
            // Map common aliases to 'description'
            const description = item.description || item.advice || item.text || item.body || item.message || '';

            // Default priority if missing
            const priority = item.priority || 'medium';

            return {
              ...item,
              description,
              priority
            };
          }

          return item;
        });
      }, z.array(z.object({
        title: z.string(),
        description: z.string(),
        relatedCategoryName: z.string().nullable().optional(),
        priority: z.enum(['high', 'medium', 'low'])
      }))),
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
        "moneyManagementAdvice": [
          {
            "title": "Tip Title",
            "description": "Actionable advice...",
            "priority": "high"
          }
        ],
        "reportGeneratedAt": "${new Date().toISOString()}",
        "version": "2.0"
      }
    `;

    const result = await this.gemini.generateJSONWithRepair(prompt, looseReportSchema);

    if (!result.success) {
      logger.error('AccountantService.generateFinalReport', 'Failed to generate valid JSON Report', { error: result });
      return result;
    }

    // Post-Processing: Hydrate Missing IDs
    // We map the Names back to the original UUIDs from 'auditData' to ensure the application works correctly.
    const hydratedReport = hydrateReportIds(result.data, auditData);

    logger.info('AccountantService.generateFinalReport', 'Report Generation Completed Successfully');
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

    return await this.gemini.generateJSONWithRepair(prompt, schema);
  }
}
