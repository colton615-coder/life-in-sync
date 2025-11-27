// src/types/accountant.ts

export const DEFAULT_ACCOUNTANT_CATEGORIES = {
  housing: {
    id: 'housing',
    label: 'Housing',
    subcategories: {
      rentMortgage: 'Rent/Mortgage',
      utilities: 'Utilities',
    },
  },
  transportation: {
    id: 'transportation',
    label: 'Transportation',
    subcategories: {
      carPayment: 'Car Payment',
      insurance: 'Insurance',
      fuel: 'Fuel',
      maintenance: 'Maintenance',
    },
  },
  food: {
    id: 'food',
    label: 'Food',
    subcategories: {
      groceries: 'Groceries',
      diningOut: 'Dining Out',
    },
  },
  household: {
    id: 'household',
    label: 'Household',
    subcategories: {
      supplies: 'Supplies',
      consumables: 'Consumables',
    },
  },
  healthAndSelf: {
    id: 'healthAndSelf',
    label: 'Health & Self',
    subcategories: {
      medical: 'Medical',
      grooming: 'Grooming',
      gym: 'Gym',
    },
  },
  techDigital: {
    id: 'techDigital',
    label: 'Tech/Digital',
    subcategories: {
      subscriptions: 'Subscriptions',
      services: 'Services',
    },
  },
  lifestyle: {
    id: 'lifestyle',
    label: 'Lifestyle',
    subcategories: {
      gifts: 'Gifts',
      vices: 'Vices',
      apparel: 'Apparel',
    },
  },
  recreation: {
    id: 'recreation',
    label: 'Recreation',
    subcategories: {
      hobbies: 'Hobbies',
      travel: 'Travel',
    },
  },
  growth: {
    id: 'growth',
    label: 'Growth',
    subcategories: {
      education: 'Education',
      business: 'Business',
    },
  },
  pets: {
    id: 'pets',
    label: 'Pets',
    subcategories: {
      vet: 'Vet',
      food: 'Food',
    },
  },
  debtAndFees: {
    id: 'debtAndFees',
    label: 'Debt/Fees',
    subcategories: {
      interest: 'Interest',
      loans: 'Loans',
      lateFees: 'Late Fees',
    },
  },
};

// --- New Dynamic Structure ---

export interface UserSubcategory {
  id: string;
  label: string;
}

export interface UserCategory {
  id: string;
  label: string;
  subcategories: UserSubcategory[];
}

// Represents a single logged transaction
export interface AccountantTransaction {
  id: string;
  amount: number;
  date: string; // ISO 8601
  description: string;
  category: string; // ID
  subcategory: string; // ID
}

/**
 * The flexible expenses object.
 * Key: Category ID
 * Value: Map of Subcategory ID -> Amount (or null if not set)
 */
export type UserExpenses = Record<string, Record<string, number | null>>;

// Represents the user's financial profile from the audit
export interface FinancialAudit {
  // Basic income info
  monthlyIncome: number | null;

  // The definitions of categories (including user-added ones)
  categories: UserCategory[];

  // Detailed expense breakdown
  expenses: UserExpenses;

  // Metadata
  auditCompletedAt: string | null; // ISO 8601, null if not completed
  version: '2.0';
}
