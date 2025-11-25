export async function clearAllAppData() {
  const keysToClear = [
    'habits',
    'expenses',
    'financial-profile',
    'detailed-budget',
    'tasks',
    'workout-plans',
    'completed-workouts',
    'personal-records',
    'knox-messages',
    'shopping-items',
    'calendar-events',
    'golf-swings',
    'connections',
    'daily-affirmation'
  ]

  if (typeof window !== 'undefined' && window.localStorage) {
    for (const key of keysToClear) {
      try {
        window.localStorage.removeItem(key)
        // Dispatch event for hooks
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue: null } }));
      } catch (error) {
        console.warn(`Failed to delete key ${key}:`, error)
      }
    }
  }
}
