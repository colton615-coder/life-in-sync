// src/types/accountant.ts

// --- Data Model 2.0: Dynamic & Flexible ---

// A single expense subcategory (e.g., "Rent", "Groceries")
export interface Subcategory {
  id: string; // Unique ID (UUID)
  name: string; // User-defined or template name
  amount: number | null; // Monthly spend (null if not yet entered)
}

// A main category containing subcategories (e.g., "Housing", "Food")
export interface Category {
  id: string; // Unique ID (UUID)
  name: string; // User-defined or template name
  subcategories: Subcategory[];
}

// --- The Audit Process Types ---

// The severity of an issue identified by The Accountant
export type AuditSeverity = 'critical' | 'warning' | 'observation' | 'praise';

// A specific critique or question from the AI about a line item
export interface AuditFlag {
  id: string;
  categoryId: string; // ID of the category being flagged
  subcategoryId?: string; // ID of the specific subcategory (optional)
  severity: AuditSeverity;
  title: string; // e.g., "Excessive Dining Spend"
  message: string; // The AI's direct comment
  suggestedAction?: string; // e.g., "Reduce to $400"
}

// The user's response to an Audit Flag
export interface AuditResolution {
  flagId: string;
  action: 'accept' | 'justify' | 'ignore';
  justification?: string; // If 'justify' is chosen
  adjustedAmount?: number; // If 'accept' involves a value change
}

// --- The Core Financial Document ---

export interface FinancialAudit {
  // Metadata
  version: '2.0';
  lastUpdated: string; // ISO 8601
  status: 'intake' | 'data_entry' | 'audit_review' | 'completed';

  // Core Data
  monthlyIncome: number | null;
  liquidAssets?: number; // Added for V3.0 (The CFO) - Cash on Hand/Liquidity
  categories: Category[]; // Dynamic list

  // The Audit Phase
  flags: AuditFlag[]; // Issues raised by AI
  resolutions: AuditResolution[]; // User responses
}

// --- Initial Templates ---
// Helper to generate the initial "Option A" structure
export const INITIAL_TEMPLATE_CATEGORIES = [
  { name: 'Housing', subcategories: ['Rent/Mortgage', 'Utilities', 'Maintenance'] },
  { name: 'Food', subcategories: ['Groceries', 'Dining Out', 'Coffee/Snacks'] },
  { name: 'Health & Self', subcategories: ['Medical', 'Gym/Fitness', 'Personal Care'] },
  { name: 'Subscriptions', subcategories: ['Streaming', 'Software', 'Memberships'] },
  { name: 'Lifestyle', subcategories: ['Shopping', 'Entertainment', 'Hobbies'] },
  { name: 'Savings & Debt', subcategories: ['Emergency Fund', 'Investments', 'Loan Repayment'] },
];
