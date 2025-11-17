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

  for (const key of keysToClear) {
    await window.spark.kv.delete(key)
  }
}
