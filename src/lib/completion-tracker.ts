import { getTodayKey } from './utils'

export interface CompletionStats {
  totalCompleted: number
  completionDates: string[]
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
}

export interface CompletableItem {
  id: string
  createdAt: string
  completedAt?: string
}

export function isCompletedToday<T extends CompletableItem>(item: T, checkField?: (item: T) => boolean): boolean {
  if (checkField) {
    return checkField(item)
  }
  
  if (!item.completedAt) return false
  
  const completedDate = new Date(item.completedAt).toISOString().split('T')[0]
  const today = getTodayKey()
  
  return completedDate === today
}

export function separateByCompletion<T extends CompletableItem>(
  items: T[],
  checkCompleted: (item: T) => boolean
): { active: T[]; completed: T[] } {
  const active: T[] = []
  const completed: T[] = []
  
  items.forEach(item => {
    if (checkCompleted(item)) {
      completed.push(item)
    } else {
      active.push(item)
    }
  })
  
  return { active, completed }
}

export function calculateCompletionStats(completionDates: string[]): CompletionStats {
  const uniqueDates = [...new Set(completionDates)].sort()
  
  if (uniqueDates.length === 0) {
    return {
      totalCompleted: 0,
      completionDates: [],
      currentStreak: 0,
      longestStreak: 0
    }
  }
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1
  
  const today = getTodayKey()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const currentDate = uniqueDates[i]
    
    if (i === uniqueDates.length - 1) {
      if (currentDate === today || currentDate === yesterday) {
        currentStreak = 1
      }
    } else {
      const nextDate = uniqueDates[i + 1]
      const daysDiff = Math.floor(
        (new Date(nextDate).getTime() - new Date(currentDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysDiff === 1) {
        if (currentStreak > 0) {
          currentStreak++
        }
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
  
  return {
    totalCompleted: uniqueDates.length,
    completionDates: uniqueDates,
    currentStreak,
    longestStreak,
    lastCompletedDate: uniqueDates[uniqueDates.length - 1]
  }
}

export function getCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getRecentCompletions(completionDates: string[], days: number = 7): number {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return completionDates.filter(date => date >= cutoffDate).length
}
