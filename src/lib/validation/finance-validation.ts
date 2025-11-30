import { z } from 'zod';

export const BudgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
});

export const BudgetSchema = z.object({
  items: z.array(BudgetItemSchema),
});

export const FinancialProfileSchema = z.object({
  monthlyIncome: z.number().positive(),
  partnerIncome: z.number().positive().optional(),
  location: z.string().min(1),
  dependents: z.number().min(0),
  housingType: z.string(),
  monthlyHousingCost: z.number().min(0),
  hasDebt: z.boolean(),
  debtTypes: z.array(z.string()).optional(),
  totalDebtAmount: z.number().min(0).optional(),
  monthlyDebtPayment: z.number().min(0).optional(),
  financialGoals: z.array(z.string()).min(1),
  riskTolerance: z.string(),
  emergencyFundMonths: z.number().min(0),
  currentSavings: z.number().min(0).optional(),
  hasRetirement: z.boolean(),
  spendingHabits: z.string(),
  majorExpenses: z.string().optional(),
  concerns: z.string().optional(),
  createdAt: z.string(), // Assuming ISO string
});

export const DetailedBudgetSchema = z.object({
  allocations: z.record(z.string(), z.object({
    total: z.number(),
    subCategories: z.array(z.object({
      name: z.string(),
      amount: z.number()
    }))
  })),
  recommendations: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    percentage: z.number(),
    reasoning: z.string(),
    tips: z.array(z.string()),
  })),
  savingsStrategy: z.object({
    emergencyFund: z.number(),
    shortTermSavings: z.number(),
    longTermSavings: z.number(),
    timeline: z.string(),
  }),
  debtStrategy: z.optional(z.object({
    payoffPlan: z.string(),
    monthlyPayment: z.number(),
    estimatedPayoffDate: z.string(),
    tips: z.array(z.string()),
  })),
  actionItems: z.array(z.string()),
});
