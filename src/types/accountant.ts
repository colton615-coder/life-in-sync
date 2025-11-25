// src/types/accountant.ts

export const ACCOUNTANT_CATEGORIES = {
  housing: {
    label: 'Housing',
    subcategories: {
      rentMortgage: 'Rent/Mortgage',
      utilities: 'Utilities',
    },
  },
  transportation: {
    label: 'Transportation',
    subcategories: {
      carPayment: 'Car Payment',
      insurance: 'Insurance',
      fuel: 'Fuel',
      maintenance: 'Maintenance',
    },
  },
  food: {
    label: 'Food',
    subcategories: {
      groceries: 'Groceries',
      diningOut: 'Dining Out',
    },
  },
  household: {
    label: 'Household',
    subcategories: {
      supplies: 'Supplies',
      consumables: 'Consumables',
    },
  },
  healthAndSelf: {
    label: 'Health & Self',
    subcategories: {
      medical: 'Medical',
      grooming: 'Grooming',
      gym: 'Gym',
    },
  },
  techDigital: {
    label: 'Tech/Digital',
    subcategories: {
      subscriptions: 'Subscriptions',
      services: 'Services',
    },
  },
  lifestyle: {
    label: 'Lifestyle',
    subcategories: {
      gifts: 'Gifts',
      vices: 'Vices',
      apparel: 'Apparel',
    },
  },
  recreation: {
    label: 'Recreation',
    subcategories: {
      hobbies: 'Hobbies',
      travel: 'Travel',
    },
  },
  growth: {
    label: 'Growth',
    subcategories: {
      education: 'Education',
      business: 'Business',
    },
  },
  pets: {
    label: 'Pets',
    subcategories: {
      vet: 'Vet',
      food: 'Food',
    },
  },
  debtAndFees: {
    label: 'Debt/Fees',
    subcategories: {
      interest: 'Interest',
      loans: 'Loans',
      lateFees: 'Late Fees',
    },
  },
} as const; // 'as const' makes it readonly and specific

// Type definitions based on the categories object
export type AccountantCategory = keyof typeof ACCOUNTANT_CATEGORIES;
export type AccountantSubcategory<T extends AccountantCategory> = keyof (typeof ACCOUNTANT_CATEGORIES)[T]['subcategories'];

// Represents a single logged transaction after the audit
export interface AccountantTransaction {
  id: string;
  amount: number;
  date: string; // ISO 8601
  description: string;
  category: AccountantCategory;
  subcategory: string; // This can't be strongly typed easily here, string is fine.
}

// Dynamically create the audit expense structure from the categories object
type AuditExpenses = {
  [K in AccountantCategory]: {
    [SK in AccountantSubcategory<K>]: number | null; // Use null for unanswered
  };
};


// Represents the user's financial profile from the initial audit
export interface FinancialAudit {
  // Basic income info
  monthlyIncome: number | null;

  // Detailed expense breakdown based on the audit
  expenses: AuditExpenses;

  // Metadata
  auditCompletedAt: string | null; // ISO 8601, null if not completed
  version: '1.0'; // For future migrations
}
