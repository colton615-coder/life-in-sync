import { useState, useEffect } from 'react'
import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { moduleBridge, ModuleEvent, ModuleEventType } from '@/lib/module-bridge'
import { Module } from '@/lib/types'
import { 
  LinkSimple, 
  Lightning, 
  Clock, 
  ArrowsLeftRight,
  ChartLine,
  CheckCircle,
  Fire,
  Trophy,
  Pulse
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const moduleIcons: Record<Module, React.ElementType> = {
  dashboard: Pulse,
  habits: CheckCircle,
  workouts: Lightning,
  tasks: CheckCircle,
  finance: ChartLine,
  calendar: Clock,
  shopping: CheckCircle,
  knox: LinkSimple,
  vault: Trophy,
  connections: ArrowsLeftRight,
  settings: LinkSimple,
  history: Clock
}

const moduleColors: Record<Module, string> = {
  dashboard: 'text-primary',
  habits: 'text-chart-2',
  workouts: 'text-chart-1',
  tasks: 'text-chart-3',
  finance: 'text-chart-4',
  calendar: 'text-chart-5',
  shopping: 'text-primary',
  knox: 'text-chart-2',
  vault: 'text-chart-1',
  connections: 'text-primary',
  settings: 'text-muted-foreground',
  history: 'text-muted-foreground'
}

const eventTypeLabels: Record<ModuleEventType, string> = {
  habit_completed: 'Habit Complete',
  workout_completed: 'Workout Done',
  task_completed: 'Task Complete',
  milestone_achieved: 'Milestone',
  streak_milestone: 'Streak!',
  goal_reached: 'Goal Reached',
  data_shared: 'Data Shared',
  cross_module_trigger: 'Cross-Action'
}

interface ConnectionStats {
  totalEvents: number;
  byType: Record<ModuleEventType, number>;
  byModule: Record<Module, number>;
}

interface EventData {
  itemName?: string;
  milestone?: string;
}

export function Connections() {
  const [events, setEvents] = useState<ModuleEvent[]>([])
  const [stats, setStats] = useState<ConnectionStats | null>(null)
  const [liveMode, setLiveMode] = useState(true)

  useEffect(() => {
    const updateData = () => {
      setEvents(moduleBridge.getEventHistory())
      setStats(moduleBridge.getStats())
    }

    updateData()

    if (liveMode) {
      const unsubscribe = moduleBridge.subscribeAll(() => {
        updateData()
      })
      return unsubscribe
    }
  }, [liveMode])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getModuleName = (module: Module) => {
    return module.charAt(0).toUpperCase() + module.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient-cyan mb-2">Module Connections</h1>
          <p className="text-muted-foreground">See how your modules communicate and work together</p>
        </div>
        <Button
          variant={liveMode ? 'default' : 'outline'}
          onClick={() => setLiveMode(!liveMode)}
          className="gap-2"
        >
          <Lightning weight={liveMode ? 'fill' : 'regular'} />
          {liveMode ? 'Live' : 'Paused'}
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-circle-glow w-12 h-12">
                <ArrowsLeftRight size={24} weight="bold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold stat-number">{stats.totalEvents}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-circle w-12 h-12">
                <CheckCircle size={24} weight="bold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold stat-number">
                  {(stats.byType.habit_completed || 0) + 
                   (stats.byType.workout_completed || 0) + 
                   (stats.byType.task_completed || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-circle w-12 h-12">
                <Fire size={24} weight="bold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold stat-number">
                  {(stats.byType.milestone_achieved || 0) + (stats.byType.streak_milestone || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-circle w-12 h-12">
                <LinkSimple size={24} weight="bold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold stat-number">
                  {Object.keys(stats.byModule).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="map">Connection Map</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-3">
          <Card className="p-6">
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <LinkSimple size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No activity yet. Complete a habit or workout to see connections!</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {events.slice(0, 20).map((event, index) => {
                    const SourceIcon = moduleIcons[event.sourceModule]
                    const TargetIcon = event.targetModule ? moduleIcons[event.targetModule] : null
                    const eventData = event.data as EventData

                    return (
                      <motion.div
                        key={event.timestamp + index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="neumorphic-card p-4 hover:glow-border transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2">
                            <div className={cn('icon-circle w-10 h-10', moduleColors[event.sourceModule])}>
                              <SourceIcon size={20} weight="bold" />
                            </div>
                            {event.targetModule && TargetIcon && (
                              <>
                                <ArrowsLeftRight size={16} className="text-muted-foreground" />
                                <div className={cn('icon-circle w-10 h-10', moduleColors[event.targetModule])}>
                                  <TargetIcon size={20} weight="bold" />
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {eventTypeLabels[event.type]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm mb-2">
                              <span className="font-semibold">{getModuleName(event.sourceModule)}</span>
                              {event.targetModule && (
                                <> → <span className="font-semibold">{getModuleName(event.targetModule)}</span></>
                              )}
                            </p>

                            {eventData.itemName && (
                              <p className="text-sm text-foreground font-medium">
                                {eventData.itemName}
                              </p>
                            )}

                            {eventData.milestone && (
                              <p className="text-sm text-primary font-medium">
                                🎉 {eventData.milestone}
                              </p>
                            )}

                            {event.metadata?.priority && (
                              <Badge variant={event.metadata.priority === 'high' ? 'default' : 'secondary'} className="mt-2">
                                {event.metadata.priority} priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Module Network</h3>
              <p className="text-sm text-muted-foreground">
                Visual representation of how your modules are connected
              </p>
            </div>

            {stats && Object.keys(stats.byModule).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.entries(stats.byModule).map(([module, count]) => {
                  const Icon = moduleIcons[module as Module]
                  return (
                    <motion.div
                      key={module}
                      whileHover={{ scale: 1.05 }}
                      className="neumorphic-card p-6 text-center space-y-3"
                    >
                      <div className={cn('icon-circle-glow mx-auto', moduleColors[module as Module])}>
                        <Icon size={32} weight="bold" />
                      </div>
                      <div>
                        <p className="font-semibold">{getModuleName(module as Module)}</p>
                        <p className="text-sm text-muted-foreground">{count as number} events</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <LinkSimple size={48} className="mx-auto mb-4 opacity-50" />
                <p>No connections yet. Start using your modules!</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connection Insights</h3>
            
            {stats && stats.byType ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Event Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{eventTypeLabels[type as ModuleEventType]}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-muted rounded-full w-32">
                            <div 
                              className="h-2 bg-primary rounded-full transition-all"
                              style={{ width: `${(count as number / stats.totalEvents) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-muted-foreground w-8 text-right">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Most Active Modules</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.byModule)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([module, count]) => {
                        const Icon = moduleIcons[module as Module]
                        return (
                          <div key={module} className="flex items-center justify-between neumorphic-inset p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon size={20} className={moduleColors[module as Module]} weight="bold" />
                              <span className="text-sm font-medium">{getModuleName(module as Module)}</span>
                            </div>
                            <span className="text-sm font-mono">{count as number} events</span>
                          </div>
                        )
                      })}
                  </div>
                </div>

                <div className="neumorphic-card p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightning size={18} weight="fill" className="text-primary" />
                    System Status
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your modules are actively communicating. Keep completing tasks to strengthen connections!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                <p>No insights yet. Complete activities to generate insights!</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
