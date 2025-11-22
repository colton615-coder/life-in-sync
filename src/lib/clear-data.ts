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
    'connections'
  ]

  if (typeof window.spark !== 'undefined' && window.spark.kv) {
    for (const key of keysToClear) {
      try {
        await window.spark.kv.delete(key)
      } catch (error) {
        console.warn(`Failed to delete key ${key}:`, error)
      }
    }
  }
}
