# Global Completion Tracking System

This document describes the completion tracking architecture used across all modules in the application.

## Overview

The completion tracking system provides a consistent way to:
- Separate completed items from active items
- Track completion statistics and analytics
- Maintain completion history
- Calculate streaks and completion rates

## Core Components

### 1. Completion Tracker (`src/lib/completion-tracker.ts`)

Provides utility functions for tracking completions:

```typescript
// Check if an item is completed today
isCompletedToday<T>(item: T, checkField?: (item: T) => boolean): boolean

// Separate items into active and completed
separateByCompletion<T>(items: T[], checkCompleted: (item: T) => boolean): { active: T[]; completed: T[] }

// Calculate completion statistics
calculateCompletionStats(completionDates: string[]): CompletionStats

// Get completion percentage
getCompletionPercentage(completed: number, total: number): number

// Get recent completions (last N days)
getRecentCompletions(completionDates: string[], days: number): number
```

### 2. Completable Items Hook (`src/hooks/use-completable-items.ts`)

React hook for managing items with completion tracking:

```typescript
const { 
  items,           // All items
  setItems,        // Update items
  active,          // Items not completed
  completed,       // Items completed
  filteredItems,   // Filtered based on filterType
  filterType,      // Current filter ('all' | 'active' | 'completed')
  setFilterType,   // Change filter
  stats            // Statistics object
} = useCompletableItems({
  storageKey: 'my-items',
  defaultValue: [],
  isCompleted: (item) => item.completed
})
```

### 3. Stats Card Component (`src/components/StatsCard.tsx`)

Reusable component for displaying completion statistics:

```typescript
<StatsCard
  title="Module Name"
  stats={{
    total: 10,
    active: 6,
    completed: 4,
    completionRate: 40,
    streak: 5  // Optional
  }}
/>
```

## Implementation by Module

### Habits Module

**Completion Logic:**
- Boolean habits: Completed when checked for today
- Numerical/Time habits: Completed when target is reached for today

**Data Structure:**
```typescript
interface Habit {
  entries: HabitEntry[]  // Daily completion tracking
  streak: number         // Current streak
}
```

**Separation:**
- Active: Habits not completed today
- Completed: Habits completed today

### Tasks Module

**Completion Logic:**
- Tasks have a `completed` boolean flag
- `completedAt` timestamp tracks when completed

**Data Structure:**
```typescript
interface Task {
  completed: boolean
  completedAt?: string
}
```

**Separation:**
- Active: Tasks where `completed === false`
- Completed: Tasks where `completed === true`

### Finance Module

**Note:** Finance tracks expenses, not completable items. Uses date-based filtering instead.

### Workouts Module

**Completion Logic:**
- Workouts are completed when logged
- Uses date field to track when workout was done

**Data Structure:**
```typescript
interface Workout {
  date: string  // When workout was completed
}
```

## Best Practices

### 1. Always Separate Active and Completed

When displaying items, separate them into active and completed groups:

```typescript
const { active, completed } = separateByCompletion(items, isCompleted)

// Display order: active items first, then completed
const displayItems = [...active, ...completed]
```

### 2. Use Tabs for Filtering

Provide tab filters for users to view:
- All items
- Active items only
- Completed items only

Include counts in tab labels:
```typescript
{ id: 'active', label: `Active (${active.length})` }
```

### 3. Track Completion Timestamps

Always store when an item was completed:

```typescript
completedAt: new Date().toISOString()
```

### 4. Show Visual Indicators

Use badges and visual cues to indicate completion:

```typescript
{completed && (
  <Badge variant="outline" className="border-primary/30 text-primary">
    ✓ Done today
  </Badge>
)}
```

### 5. Provide Analytics

Use the StatsCard component to show:
- Total items
- Active count
- Completed count
- Completion rate
- Streaks (where applicable)

## Future Enhancements

### Planned Features:
1. **History Tracking**: Store all completion dates for long-term analytics
2. **Completion Calendar**: Visual calendar showing completion patterns
3. **Streak Milestones**: Celebrate 7, 30, 100-day streaks
4. **Export/Import**: Allow users to backup and restore completion data
5. **Global Analytics Dashboard**: Cross-module completion insights
6. **Completion Reminders**: Notify users about incomplete items

### Modules to Add Completion Tracking:
- Shopping Lists (mark items as purchased)
- Calendar Events (mark as attended/completed)
- Notes (mark as archived/completed)
- Goals (track progress toward goals)

## Testing Completion Logic

When implementing completion tracking for a new module:

1. Test day boundary transitions (items completed just before/after midnight)
2. Test streak calculations across date changes
3. Test separation logic with mixed completed/active items
4. Verify statistics are accurate
5. Test filter persistence across page refreshes

## Migration Guide

To add completion tracking to an existing module:

1. Add completion fields to the type:
   ```typescript
   completedAt?: string
   ```

2. Update the toggle/complete function:
   ```typescript
   const completeItem = (id: string) => {
     setItems((current) =>
       current.map(item =>
         item.id === id 
           ? { ...item, completed: true, completedAt: new Date().toISOString() }
           : item
       )
     )
   }
   ```

3. Implement separation logic:
   ```typescript
   const { active, completed } = separateByCompletion(items, item => item.completed)
   ```

4. Add tab filters for all/active/completed

5. Add StatsCard component

6. Update display order to show active items first
