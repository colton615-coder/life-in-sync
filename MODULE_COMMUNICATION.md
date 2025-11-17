# Module Communication Blueprint 🏠

## Overview

Your Command Center modules are no longer isolated rooms—they're now part of a connected home. The Module Communication System provides a **pub/sub event architecture** that allows modules to:

- **Broadcast achievements** (habits completed, workouts finished, tasks done)
- **Share data** across module boundaries
- **Trigger cross-module actions** (e.g., completing a workout creates a calendar event)
- **Celebrate milestones** together (streak achievements, goal completions)
- **Track activity** across your entire ecosystem

## Architecture

```
┌─────────────┐
│   Habits    │──┐
└─────────────┘  │
                 │    ┌──────────────────┐
┌─────────────┐  ├───→│  Module Bridge   │
│  Workouts   │──┤    │  (Event System)  │
└─────────────┘  │    └──────────────────┘
                 │              │
┌─────────────┐  │              ↓
│   Tasks     │──┤      ┌──────────────┐
└─────────────┘  │      │  All Modules │
                 │      │   Subscribe  │
┌─────────────┐  │      └──────────────┘
│  Calendar   │──┘
└─────────────┘
```

## Quick Start

### 1. Import the Hook

```typescript
import { useModuleCommunication } from '@/hooks/use-module-communication'
```

### 2. Initialize in Your Module

```typescript
export function YourModule() {
  const comm = useModuleCommunication('your-module-id')
  
  // Your module code...
}
```

### 3. Broadcast Events

```typescript
// When a user completes something
comm.broadcastCompletion('habit', 'Morning Meditation', {
  streak: 7,
  value: 15 // minutes
})

// When reaching a milestone
comm.celebrateMilestone('7 Day Streak!', {
  habitName: 'Morning Meditation',
  streak: 7
})
```

## Event Types

### 1. **habit_completed**
Fired when a user completes a habit

```typescript
comm.broadcastCompletion('habit', 'Drink Water', {
  value: 8, // glasses
  streak: 3
})
```

### 2. **workout_completed**
Fired when a workout session finishes

```typescript
comm.broadcastCompletion('workout', 'Upper Body Strength', {
  duration: 45, // minutes
  calories: 320,
  exercises: 8
})
```

### 3. **task_completed**
Fired when a task is marked done

```typescript
comm.broadcastCompletion('task', 'Review PRs', {
  priority: 'high',
  completedAt: new Date().toISOString()
})
```

### 4. **milestone_achieved**
Fired for significant achievements

```typescript
comm.celebrateMilestone('First Week Complete!', {
  type: 'habit_streak',
  habitId: 'abc123',
  streak: 7
})
```

### 5. **streak_milestone**
Special celebration for streaks (3, 7, 14, 30, 100 days)

```typescript
comm.emit('streak_milestone', {
  streakDays: 30,
  habitName: 'Daily Journal',
  message: '30 days strong! 🔥'
})
```

### 6. **goal_reached**
Fired when a measurable goal is achieved

```typescript
comm.emit('goal_reached', {
  goalType: 'workout_count',
  target: 100,
  achieved: 100,
  celebration: '💯 100 Workouts!'
})
```

### 7. **data_shared**
Share data between modules

```typescript
comm.shareData('workout_stats', {
  totalWorkouts: 42,
  totalMinutes: 1890,
  caloriesBurned: 12600
}, 'dashboard') // optional target module
```

### 8. **cross_module_trigger**
Trigger an action in another module

```typescript
comm.triggerCrossModule('calendar', 'create_event', {
  title: 'Post-Workout Recovery',
  date: new Date().toISOString(),
  category: 'health'
})
```

## Listening to Events

### Subscribe to All Events

```typescript
useEffect(() => {
  const unsubscribe = comm.subscribeAll((event) => {
    console.log('Event received:', event)
    
    if (event.type === 'habit_completed') {
      toast.success(`${event.data.itemName} completed!`)
    }
  })
  
  return unsubscribe
}, [])
```

### Access Recent Events

```typescript
// All recent events across the system
const { recentEvents } = comm

// Events targeted to this module
const { incomingEvents } = comm
```

## Real-World Examples

### Example 1: Habits Module Broadcasting

```typescript
// In Habits.tsx
export function Habits() {
  const comm = useModuleCommunication('habits')
  
  const completeHabit = (habit: Habit) => {
    // ... update habit state ...
    
    // Broadcast the completion
    comm.broadcastCompletion('habit', habit.name, {
      streak: habit.streak,
      value: habit.currentProgress,
      habitId: habit.id
    })
    
    // Check for streak milestones
    if ([3, 7, 14, 30, 100].includes(habit.streak)) {
      comm.celebrateMilestone(`${habit.streak} Day Streak!`, {
        habitName: habit.name,
        streak: habit.streak,
        celebration: true
      })
    }
  }
  
  return (/* ... */)
}
```

### Example 2: Dashboard Listening

```typescript
// In Dashboard.tsx
export function Dashboard({ onNavigate }: Props) {
  const comm = useModuleCommunication('dashboard')
  const [recentActivity, setRecentActivity] = useState<string[]>([])
  
  useEffect(() => {
    const unsubscribe = comm.subscribeAll((event) => {
      // Show recent activity in the dashboard
      const activityText = formatActivityText(event)
      setRecentActivity(prev => [activityText, ...prev].slice(0, 5))
      
      // Show celebration for milestones
      if (event.type === 'milestone_achieved') {
        showConfetti()
        toast.success(event.data.milestone, {
          description: 'Keep up the great work!'
        })
      }
    })
    
    return unsubscribe
  }, [])
  
  return (
    <div>
      <h2>Recent Activity</h2>
      {recentActivity.map((activity, i) => (
        <div key={i}>{activity}</div>
      ))}
    </div>
  )
}
```

### Example 3: Workout → Calendar Integration

```typescript
// In Workouts.tsx
export function Workouts() {
  const comm = useModuleCommunication('workouts')
  
  const finishWorkout = (workout: CompletedWorkout) => {
    // ... save workout ...
    
    // Broadcast completion
    comm.broadcastCompletion('workout', workout.workoutName, {
      duration: workout.totalDuration,
      calories: workout.calories
    })
    
    // Auto-create recovery event in calendar
    comm.triggerCrossModule('calendar', 'create_recovery_event', {
      workoutName: workout.workoutName,
      scheduledFor: addHours(new Date(), 24) // next day
    })
  }
  
  return (/* ... */)
}
```

### Example 4: Cross-Module Data Sharing

```typescript
// Share stats from Habits to Dashboard
const shareHabitStats = () => {
  const stats = {
    totalHabits: habits.length,
    activeStreaks: habits.filter(h => h.streak > 0).length,
    longestStreak: Math.max(...habits.map(h => h.streak))
  }
  
  comm.shareData('habit_summary', stats, 'dashboard')
}

// In Dashboard, receive the data
useEffect(() => {
  const unsubscribe = comm.subscribe('data_shared', (event) => {
    if (event.data.dataType === 'habit_summary') {
      setHabitStats(event.data.sharedData)
    }
  })
  
  return unsubscribe
}, [])
```

## Viewing Connections

Navigate to the **Connections** module to see:

- **Activity Feed**: Real-time stream of all module interactions
- **Connection Map**: Visual representation of active modules
- **Insights**: Analytics on module communication patterns

## Best Practices

### 1. **Be Descriptive**
Use clear, human-readable event names and data properties

```typescript
// ✅ Good
comm.broadcastCompletion('habit', 'Morning Meditation', {
  duration: 15,
  streak: 7
})

// ❌ Avoid
comm.emit('evt', { t: 'h', v: 15 })
```

### 2. **Include Context**
Always provide enough context in event data

```typescript
comm.emit('milestone_achieved', {
  milestone: '100 Workouts Completed',
  moduleName: 'Workouts',
  achievement: 'century_club',
  unlockedAt: new Date().toISOString()
})
```

### 3. **Don't Spam**
Batch updates or debounce frequent events

```typescript
// Instead of emitting on every keystroke
// Emit only on meaningful state changes
if (habit.completed && !previouslyCompleted) {
  comm.broadcastCompletion(...)
}
```

### 4. **Clean Up Subscriptions**
Always return cleanup functions from useEffect

```typescript
useEffect(() => {
  const unsubscribe = comm.subscribeAll(handleEvent)
  return unsubscribe // ← Important!
}, [])
```

### 5. **Use Silent Mode for Background Actions**
Avoid notification fatigue

```typescript
comm.emit('data_shared', data, undefined, {
  priority: 'low',
  silent: true // Won't trigger UI notifications
})
```

## API Reference

### useModuleCommunication(moduleId: Module)

Returns an object with:

- **emit**(type, data, targetModule?, options?) - Emit any event
- **broadcastCompletion**(itemType, itemName, metadata?) - Broadcast a completion
- **shareData**(dataType, data, targetModule?) - Share data across modules
- **triggerCrossModule**(targetModule, action, payload) - Trigger action in another module
- **celebrateMilestone**(milestone, details) - Celebrate an achievement
- **recentEvents** - Array of recent events (all modules)
- **incomingEvents** - Array of events targeting this module
- **getModuleInsights**() - Get analytics for this module
- **clearIncoming**() - Clear incoming event queue

## Future Enhancements

Potential additions to the system:

- **Automation Rules**: "When workout completes, create recovery task"
- **Cross-Module Triggers**: Visual automation builder
- **Event Filtering**: Module-specific event preferences
- **Analytics Dashboard**: Deep insights into patterns
- **Event Replay**: Debug and understand past interactions

---

## Summary

The Module Communication Blueprint transforms your app from isolated features into an integrated ecosystem. Modules can now:

✅ Share achievements and celebrations  
✅ Coordinate actions across boundaries  
✅ Build upon each other's data  
✅ Create a unified experience  
✅ Track holistic progress

**Your modules are now a home, not just rooms.** 🏠✨
