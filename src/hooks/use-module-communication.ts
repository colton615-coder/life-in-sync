import { useEffect, useState, useCallback } from 'react'
import { moduleBridge, ModuleEvent, ModuleEventType } from '@/lib/module-bridge'
import { Module } from '@/lib/types'

export function useModuleCommunication(moduleId: Module) {
  const [recentEvents, setRecentEvents] = useState<ModuleEvent[]>([])
  const [incomingEvents, setIncomingEvents] = useState<ModuleEvent[]>([])

  const emit = useCallback((
    type: ModuleEventType,
    data: Record<string, any>,
    targetModule?: Module,
    options?: { priority?: 'low' | 'medium' | 'high', silent?: boolean }
  ) => {
    moduleBridge.emit({
      type,
      sourceModule: moduleId,
      targetModule,
      data,
      metadata: options
    })
  }, [moduleId])

  const broadcastCompletion = useCallback((itemType: string, itemName: string, metadata?: Record<string, any>) => {
    const eventTypeMap: Record<string, ModuleEventType> = {
      habit: 'habit_completed',
      workout: 'workout_completed',
      task: 'task_completed'
    }

    const eventType = eventTypeMap[itemType] || 'milestone_achieved'

    emit(eventType, {
      itemType,
      itemName,
      completedAt: new Date().toISOString(),
      ...metadata
    })
  }, [emit])

  const shareData = useCallback((dataType: string, data: any, targetModule?: Module) => {
    emit('data_shared', {
      dataType,
      sharedData: data,
      sharedAt: new Date().toISOString()
    }, targetModule)
  }, [emit])

  const triggerCrossModule = useCallback((targetModule: Module, action: string, payload: any) => {
    emit('cross_module_trigger', {
      action,
      payload
    }, targetModule, { priority: 'high' })
  }, [emit])

  const celebrateMilestone = useCallback((milestone: string, details: Record<string, any>) => {
    emit('milestone_achieved', {
      milestone,
      details,
      celebrationType: details.streak ? 'streak' : 'achievement'
    })
  }, [emit])

  useEffect(() => {
    const unsubscribe = moduleBridge.subscribeAll((event) => {
      if (event.targetModule === moduleId || !event.targetModule) {
        setIncomingEvents(prev => [event, ...prev].slice(0, 20))
      }
      
      setRecentEvents(prev => [event, ...prev].slice(0, 50))
    })

    return unsubscribe
  }, [moduleId])

  const getModuleInsights = useCallback(() => {
    const stats = moduleBridge.getStats()
    const moduleEvents = moduleBridge.getEventHistory(undefined, moduleId)
    
    return {
      totalEvents: stats.totalEvents,
      moduleSpecificEvents: moduleEvents.length,
      recentActivity: moduleEvents.slice(0, 10),
      connectionStats: stats.byModule
    }
  }, [moduleId])

  return {
    emit,
    broadcastCompletion,
    shareData,
    triggerCrossModule,
    celebrateMilestone,
    recentEvents,
    incomingEvents,
    getModuleInsights,
    clearIncoming: () => setIncomingEvents([])
  }
}
