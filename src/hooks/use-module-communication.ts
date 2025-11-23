import { useEffect, useState, useCallback, useMemo } from 'react'
import { moduleBridge, ModuleEvent, ModuleEventType } from '@/lib/module-bridge'
import { Module } from '@/lib/types'

export function useModuleCommunication(moduleId: Module) {
  const [recentEvents, setRecentEvents] = useState<ModuleEvent[]>([])
  const [incomingEvents, setIncomingEvents] = useState<ModuleEvent[]>([])

  // Memoize the emit function to prevent re-creation
  const emit = useCallback((
    type: ModuleEventType,
    data: Record<string, unknown>,
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

  const broadcastCompletion = useCallback((itemType: string, itemName: string, metadata?: Record<string, unknown>) => {
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

  const shareData = useCallback((dataType: string, data: unknown, targetModule?: Module) => {
    emit('data_shared', {
      dataType,
      sharedData: data,
      sharedAt: new Date().toISOString()
    }, targetModule)
  }, [emit])

  const triggerCrossModule = useCallback((targetModule: Module, action: string, payload: unknown) => {
    emit('cross_module_trigger', {
      action,
      payload
    }, targetModule, { priority: 'high' })
  }, [emit])

  const celebrateMilestone = useCallback((milestone: string, details: Record<string, unknown>) => {
    emit('milestone_achieved', {
      milestone,
      details,
      celebrationType: details.streak ? 'streak' : 'achievement'
    })
  }, [emit])

  useEffect(() => {
    // Subscribe returns an unsubscription function
    const unsubscribe = moduleBridge.subscribeAll((event) => {
      // Filter events relevant to this module or broadcasts
      if (event.targetModule === moduleId || !event.targetModule) {
        setIncomingEvents(prev => {
          // Prevent duplicate events if using StrictMode (though bridge handles some)
          // Optimization: Limit buffer size
          return [event, ...prev].slice(0, 20)
        })
      }
      
      // Keep a log of all recent events for debugging/monitoring
      setRecentEvents(prev => [event, ...prev].slice(0, 50))
    })

    return () => {
      unsubscribe()
    }
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

  const clearIncoming = useCallback(() => {
    setIncomingEvents([])
  }, [])

  // Memoize the return object to prevent consumers from re-rendering unnecessarily
  return useMemo(() => ({
    emit,
    broadcastCompletion,
    shareData,
    triggerCrossModule,
    celebrateMilestone,
    recentEvents,
    incomingEvents,
    getModuleInsights,
    clearIncoming
  }), [
    emit,
    broadcastCompletion,
    shareData,
    triggerCrossModule,
    celebrateMilestone,
    recentEvents,
    incomingEvents,
    getModuleInsights,
    clearIncoming
  ])
}
