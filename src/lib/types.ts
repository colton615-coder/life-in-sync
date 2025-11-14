export type HabitIcon = string

export type Module = 
  | 'dashboard' 
  | 'habits' 
  | 'finance' 
  | 'tasks' 
  | 'knox' 
  | 'workouts'
  | 'shopping'
  | 'calendar'
  | 'vault'
  | 'settings'
  | 'history'

export type TrackingType = 'boolean' | 'numerical' | 'time'

export interface HabitEntry {
  date: string
  completed?: boolean
  value?: number
  minutes?: number
}

export interface Habit {
  id: string
  name: string
  icon?: HabitIcon
  description?: string
  trackingType?: TrackingType
  target?: number
  unit?: string
  targetCount?: number
  currentProgress?: number
  streak: number
  entries?: HabitEntry[]
  createdAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

export interface Budget {
  category: string
  limit: number
  spent: number
}

export interface FinancialProfile {
  monthlyIncome: number
  hasPartner: boolean
  partnerIncome?: number
  dependents: number
  location: string
  housingType: 'rent' | 'own' | 'mortgage'
  monthlyHousingCost: number
  hasDebt: boolean
  debtTypes?: string[]
  totalDebtAmount?: number
  monthlyDebtPayment?: number
  financialGoals: string[]
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  savingsGoal?: number
  emergencyFundMonths?: number
  hasRetirement: boolean
  currentSavings?: number
  spendingHabits: string
  majorExpenses?: string
  concerns?: string
  createdAt: string
}

export interface DetailedBudget {
  id: string
  profileId: string
  totalIncome: number
  allocations: {
    housing: number
    utilities: number
    food: number
    transportation: number
    insurance: number
    healthcare: number
    debtPayment: number
    savings: number
    retirement: number
    entertainment: number
    personal: number
    miscellaneous: number
  }
  recommendations: {
    category: string
    amount: number
    percentage: number
    reasoning: string
    tips: string[]
  }[]
  savingsStrategy: {
    emergencyFund: number
    shortTermSavings: number
    longTermSavings: number
    timeline: string
  }
  debtStrategy?: {
    payoffPlan: string
    monthlyPayment: number
    estimatedPayoffDate: string
    tips: string[]
  }
  actionItems: string[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
  duration: number
  date: string
}

export interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface PersonalRecord {
  exercise: string
  weight: number
  reps: number
  date: string
}
