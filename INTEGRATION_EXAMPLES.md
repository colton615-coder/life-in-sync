# Integration Examples

## How to Add Module Communication to Your Existing Modules

### Step 1: Import the Hook

Add this import at the top of your module file:

```typescript
import { useModuleCommunication } from '@/hooks/use-module-communication'
```

### Step 2: Initialize in Your Component

```typescript
export function YourModule() {
  const comm = useModuleCommunication('your-module-id')  // Use the actual module ID from types.ts
  
  // Rest of your component code...
}
```

### Step 3: Emit Events at Key Moments

#### For Habits Module:

```typescript
// When marking a habit as complete
const toggleHabitComplete = (habit: Habit) => {
  const isNowComplete = !todayEntry?.completed
  
  // ... your existing logic to update the habit ...
  
  if (isNowComplete) {
    // Broadcast to other modules
    comm.broadcastCompletion('habit', habit.name, {
      habitId: habit.id,
      streak: habit.streak,
      trackingType: habit.trackingType,
      value: habit.currentProgress
    })
    
    // Check for milestone streaks
    if ([3, 7, 14, 30, 100].includes(habit.streak)) {
      comm.celebrateMilestone(`${habit.streak} Day Streak! 🔥`, {
        habitName: habit.name,
        habitId: habit.id,
        streak: habit.streak,
        type: 'streak'
      })
    }
  }
}
```

#### For Workouts Module:

```typescript
// When finishing a workout
const handleWorkoutComplete = (completedWorkout: CompletedWorkout) => {
  // ... your existing logic to save workout ...
  
  // Broadcast the completion
  comm.broadcastCompletion('workout', completedWorkout.workoutName, {
    workoutId: completedWorkout.id,
    duration: completedWorkout.totalDuration,
    calories: completedWorkout.calories,
    exercisesCompleted: completedWorkout.completedExercises
  })
  
  // Check for milestones
  if (allCompletedWorkouts.length === 10) {
    comm.celebrateMilestone('10 Workouts Complete! 💪', {
      totalWorkouts: 10,
      type: 'workout_milestone'
    })
  }
}
```

#### For Tasks Module:

```typescript
// When completing a task
const completeTask = (task: Task) => {
  // ... your existing logic to update task ...
  
  comm.broadcastCompletion('task', task.title, {
    taskId: task.id,
    priority: task.priority,
    hadDueDate: !!task.dueDate
  })
  
  // Check for daily goals
  const completedToday = tasks.filter(t => 
    t.completed && 
    isToday(new Date(t.completedAt!))
  ).length
  
  if (completedToday === 5) {
    comm.celebrateMilestone('5 Tasks Today! 🎯', {
      completedToday,
      type: 'daily_goal'
    })
  }
}
```

### Step 4: Listen for Events (Optional)

If your module wants to react to events from other modules:

```typescript
// In Dashboard to show recent activity
useEffect(() => {
  const unsubscribe = comm.subscribeAll((event) => {
    switch (event.type) {
      case 'habit_completed':
        setRecentActivity(prev => [
          `✓ Completed: ${event.data.itemName}`,
          ...prev
        ].slice(0, 5))
        break
        
      case 'workout_completed':
        setRecentActivity(prev => [
          `💪 Workout: ${event.data.itemName} (${event.data.duration}min)`,
          ...prev
        ].slice(0, 5))
        break
        
      case 'milestone_achieved':
        showConfetti()
        toast.success(event.data.milestone)
        break
    }
  })
  
  return unsubscribe
}, [])
```

### Step 5: Share Summary Data

Modules can share their stats with others:

```typescript
// In Habits module, share summary stats
useEffect(() => {
  const shareStats = () => {
    comm.shareData('habits_summary', {
      totalHabits: habits.length,
      activeStreaks: habits.filter(h => h.streak > 0).length,
      completedToday: habits.filter(h => {
        const todayEntry = h.entries?.find(e => e.date === today)
        return todayEntry?.completed
      }).length,
      longestStreak: Math.max(...habits.map(h => h.streak), 0)
    })
  }
  
  // Share every time habits change
  shareStats()
}, [habits])

// In Dashboard, receive the stats
useEffect(() => {
  const unsubscribe = comm.subscribe('data_shared', (event) => {
    if (event.data.dataType === 'habits_summary') {
      setHabitsSummary(event.data.sharedData)
    }
  })
  
  return unsubscribe
}, [])
```

## Complete Example: Adding to Habits Module

Here's how you'd add communication to the existing Habits module:

```typescript
import { useModuleCommunication } from '@/hooks/use-module-communication'

export function Habits() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const comm = useModuleCommunication('habits')  // ← ADD THIS
  
  // ... existing state ...

  const completeHabit = (habit: Habit) => {
    // Existing habit completion logic
    setHabits((currentHabits) => 
      currentHabits.map(h => {
        if (h.id === habit.id) {
          const updatedHabit = { ...h, /* your updates */ }
          
          // ← ADD THIS: Broadcast the completion
          comm.broadcastCompletion('habit', h.name, {
            habitId: h.id,
            streak: updatedHabit.streak,
            value: updatedHabit.currentProgress
          })
          
          // ← ADD THIS: Check for streak milestones
          const streakMilestones = [3, 7, 14, 30, 100]
          if (streakMilestones.includes(updatedHabit.streak)) {
            comm.celebrateMilestone(
              `${updatedHabit.streak} Day Streak!`,
              {
                habitName: h.name,
                streak: updatedHabit.streak,
                icon: h.icon
              }
            )
          }
          
          return updatedHabit
        }
        return h
      })
    )
  }

  // ← ADD THIS: Share habit summary with other modules
  useEffect(() => {
    if (habits.length > 0) {
      comm.shareData('habits_overview', {
        totalHabits: habits.length,
        activeToday: habits.filter(h => {
          const todayEntry = h.entries?.find(e => e.date === today)
          return todayEntry?.completed
        }).length,
        longestStreak: Math.max(...habits.map(h => h.streak), 0)
      })
    }
  }, [habits])

  // Rest of your component...
}
```

## Testing Your Integration

1. Complete a habit/workout/task
2. Open the **Connections** module from the navigation
3. Watch the Activity Feed populate with events
4. Check the Insights tab for statistics

## Common Patterns

### Pattern 1: Milestone Detection

```typescript
const checkMilestones = (count: number, type: string) => {
  const milestones = [10, 25, 50, 100, 500, 1000]
  
  if (milestones.includes(count)) {
    comm.celebrateMilestone(
      `${count} ${type}s Complete! 🎉`,
      { count, type, achievement: `${type}_${count}` }
    )
  }
}
```

### Pattern 2: Cross-Module Triggers

```typescript
// When a workout finishes, suggest logging water intake
comm.triggerCrossModule('habits', 'suggest_water', {
  reason: 'post_workout',
  workoutCalories: 350
})
```

### Pattern 3: Streaks and Consistency

```typescript
const checkConsistency = (entries: HabitEntry[]) => {
  const last7Days = entries.slice(-7)
  const allComplete = last7Days.every(e => e.completed)
  
  if (allComplete) {
    comm.celebrateMilestone('Perfect Week! 🔥', {
      period: '7_days',
      type: 'consistency'
    })
  }
}
```

## Next Steps

1. ✅ Add `useModuleCommunication` to your module
2. ✅ Emit events on key actions
3. ✅ Test in the Connections module
4. ✅ Optionally subscribe to events from other modules
5. ✅ Share summary data for dashboard widgets

Your modules are now part of a connected ecosystem! 🏠✨
