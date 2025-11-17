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
  | 'connections'
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

export interface Exercise {
  id: string
  name: string
  type: 'reps' | 'time'
  category: string
  sets?: number
  reps?: number
  duration?: number
  weight?: number
  muscleGroups: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: {
    summary: string
    keyPoints: string[]
  }
  asset?: string
}

export interface WorkoutPlan {
  id: string
  name: string
  focus: string
  exercises: Exercise[]
  estimatedDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
}

export interface CompletedWorkout {
  id: string
  workoutPlanId: string
  workoutName: string
  workoutFocus: string
  completedExercises: number
  totalExercises: number
  totalDuration: number
  calories: number
  date: string
  completedAt: string
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  maxWeight?: number
  maxReps?: number
  maxDuration?: number
  achievedAt: string
}

export interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  startTime?: string
  endTime?: string
  category: 'event' | 'plan' | 'reminder' | 'meeting'
  color?: string
  createdAt: string
}

export interface SwingLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

export interface SwingPoseData {
  timestamp: number
  landmarks: SwingLandmark[]
  worldLandmarks?: SwingLandmark[]
}

export interface SwingMetrics {
  spineAngle: {
    address: number
    backswing: number
    impact: number
    followThrough: number
  }
  hipRotation: {
    backswing: number
    impact: number
    total: number
  }
  shoulderRotation: {
    backswing: number
    impact: number
    total: number
  }
  headMovement: {
    lateral: number
    vertical: number
    stability: 'excellent' | 'good' | 'fair' | 'poor'
  }
  swingPlane: {
    backswingAngle: number
    downswingAngle: number
    consistency: number
  }
  tempo: {
    backswingTime: number
    downswingTime: number
    ratio: number
  }
  weightTransfer: {
    addressBalance: number
    backswingShift: number
    impactShift: number
    rating: 'excellent' | 'good' | 'fair' | 'poor'
  }
}

export interface SwingFeedback {
  overallScore: number
  strengths: string[]
  improvements: string[]
  drills: {
    title: string
    description: string
    focusArea: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }[]
  aiInsights: string
}

export type GolfClub = 
  | 'Driver' 
  | '3-Wood' 
  | '5-Wood'
  | '3-Hybrid'
  | '4-Hybrid'
  | '5-Hybrid'
  | '3-Iron'
  | '4-Iron'
  | '5-Iron'
  | '6-Iron'
  | '7-Iron'
  | '8-Iron'
  | '9-Iron'
  | 'PW'
  | 'GW'
  | 'SW'
  | 'LW'
  | 'Putter'

export interface SwingAnalysis {
  id: string
  videoId: string
  videoUrl?: string
  thumbnailUrl?: string
  club: GolfClub | null
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'failed'
  uploadedAt: string
  processedAt?: string
  poseData?: SwingPoseData[]
  metrics?: SwingMetrics
  feedback?: SwingFeedback
  error?: string
  processingProgress?: number
}
