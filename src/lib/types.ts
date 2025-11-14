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
