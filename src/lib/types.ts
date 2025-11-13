export type HabitIcon = 'droplet' | 'book' | 'dumbbell' | 'apple' | 'moon' | 'heart'

export interface Habit {
  id: string
  name: string
  icon: HabitIcon
  targetCount: number
  currentProgress: number
  streak: number
}
