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
  description?: string
  trackingType: TrackingType
  target?: number
  unit?: string
  streak: number
  entries: HabitEntry[]
  createdAt: string
}

export interface Task {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
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
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface Workout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  date: string
  duration?: number
}

export interface PersonalRecord {
  exercise: string
  weight: number
  reps: number
  date: string
}

export interface ShoppingItem {
  id: string
  name: string
  checked: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  description?: string
}

export interface VaultEntry {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  content: string
  date: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

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
