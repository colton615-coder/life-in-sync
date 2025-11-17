import { Module } from './types'

export type ModuleEventType =
  | 'habit_completed'
  | 'workout_completed'
  | 'task_completed'
  | 'milestone_achieved'
  | 'streak_milestone'
  | 'goal_reached'
  | 'data_shared'
  | 'cross_module_trigger'

export interface ModuleEvent {
  type: ModuleEventType
  sourceModule: Module
  targetModule?: Module
  timestamp: string
  data: Record<string, any>
  metadata?: {
    triggerId?: string
    priority?: 'low' | 'medium' | 'high'
    silent?: boolean
  }
}

export interface ModuleConnection {
  id: string
  sourceModule: Module
  targetModule: Module
  eventType: ModuleEventType
  action: ModuleAction
  conditions?: ModuleCondition[]
  enabled: boolean
  createdAt: string
}

export interface ModuleAction {
  type: 'create_task' | 'log_habit' | 'create_event' | 'show_celebration' | 'custom'
  config: Record<string, any>
}

export interface ModuleCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface SharedData {
  moduleId: Module
  dataType: string
  data: any
  sharedAt: string
  expiresAt?: string
}

class ModuleBridge {
  private static instance: ModuleBridge
  private listeners: Map<ModuleEventType, Set<(event: ModuleEvent) => void>> = new Map()
  private eventHistory: ModuleEvent[] = []
  private maxHistorySize = 100

  private constructor() {}

  static getInstance(): ModuleBridge {
    if (!ModuleBridge.instance) {
      ModuleBridge.instance = new ModuleBridge()
    }
    return ModuleBridge.instance
  }

  subscribe(eventType: ModuleEventType, callback: (event: ModuleEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    this.listeners.get(eventType)!.add(callback)

    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  subscribeAll(callback: (event: ModuleEvent) => void): () => void {
    const unsubscribers: (() => void)[] = []
    
    const eventTypes: ModuleEventType[] = [
      'habit_completed',
      'workout_completed',
      'task_completed',
      'milestone_achieved',
      'streak_milestone',
      'goal_reached',
      'data_shared',
      'cross_module_trigger'
    ]

    eventTypes.forEach(type => {
      unsubscribers.push(this.subscribe(type, callback))
    })

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }

  emit(event: Omit<ModuleEvent, 'timestamp'>): void {
    const fullEvent: ModuleEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.eventHistory.unshift(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize)
    }

    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(fullEvent)
        } catch (error) {
          console.error(`Error in module bridge listener for ${event.type}:`, error)
        }
      })
    }
  }

  getEventHistory(filterType?: ModuleEventType, filterModule?: Module): ModuleEvent[] {
    let filtered = this.eventHistory

    if (filterType) {
      filtered = filtered.filter(e => e.type === filterType)
    }

    if (filterModule) {
      filtered = filtered.filter(e => 
        e.sourceModule === filterModule || e.targetModule === filterModule
      )
    }

    return filtered
  }

  clearHistory(): void {
    this.eventHistory = []
  }

  getStats() {
    const stats = {
      totalEvents: this.eventHistory.length,
      byType: {} as Record<ModuleEventType, number>,
      byModule: {} as Record<Module, number>,
      recentEvents: this.eventHistory.slice(0, 10)
    }

    this.eventHistory.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1
      stats.byModule[event.sourceModule] = (stats.byModule[event.sourceModule] || 0) + 1
    })

    return stats
  }
}

export const moduleBridge = ModuleBridge.getInstance()

export function useModuleBridge() {
  return {
    emit: (event: Omit<ModuleEvent, 'timestamp'>) => moduleBridge.emit(event),
    subscribe: (eventType: ModuleEventType, callback: (event: ModuleEvent) => void) => 
      moduleBridge.subscribe(eventType, callback),
    subscribeAll: (callback: (event: ModuleEvent) => void) => 
      moduleBridge.subscribeAll(callback),
    getHistory: (filterType?: ModuleEventType, filterModule?: Module) => 
      moduleBridge.getEventHistory(filterType, filterModule),
    getStats: () => moduleBridge.getStats()
  }
}
