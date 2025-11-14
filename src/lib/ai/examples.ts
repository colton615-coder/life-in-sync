import { ai } from './provider'

export async function generateMotivationalQuote(theme?: string): Promise<string> {
  const themeText = theme ? `about ${theme}` : ""
  const prompt = `Generate an inspiring and motivational quote ${themeText}. Make it uplifting and memorable. Return only the quote, no attribution.`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    temperature: 0.9,
  })

  return response.text
}

export async function generateHabitSuggestions(
  existingHabits: string[]
): Promise<string[]> {
  const prompt = `Based on these existing habits: ${existingHabits.join(', ')}

Suggest 5 complementary habits that would work well with these. Focus on habits that:
1. Fill gaps in their routine
2. Support their existing habits
3. Are realistic and achievable
4. Cover different life areas (health, productivity, mindfulness, etc.)

Return as a JSON array of habit names (strings only, no descriptions).`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    jsonMode: true,
    temperature: 0.7,
  })

  const parsed = JSON.parse(response.text)
  return Array.isArray(parsed) ? parsed : parsed.habits || []
}

export async function analyzeSpendingPattern(expenses: {
  category: string
  amount: number
  date: string
}[]): Promise<{
  insights: string[]
  warnings: string[]
  suggestions: string[]
}> {
  const prompt = `Analyze this spending data and provide insights:

${JSON.stringify(expenses, null, 2)}

Provide:
1. Key insights about spending patterns
2. Any warning signs or concerns
3. Actionable suggestions for improvement

Return as JSON with three arrays: insights, warnings, suggestions`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    jsonMode: true,
    temperature: 0.4,
  })

  return JSON.parse(response.text)
}

export async function generateWorkoutPlan(
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  focus: string,
  duration: number
): Promise<{
  exercises: Array<{
    name: string
    sets: number
    reps: string
    notes: string
  }>
  warmup: string
  cooldown: string
}> {
  const prompt = `Create a ${duration}-minute ${focus} workout for a ${fitnessLevel} level.

Include:
- 5-7 exercises with sets, reps, and form notes
- Warmup routine
- Cooldown/stretching routine

Return as JSON with structure:
{
  "exercises": [{"name": "...", "sets": 3, "reps": "10-12", "notes": "..."}],
  "warmup": "...",
  "cooldown": "..."
}`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    jsonMode: true,
    temperature: 0.6,
  })

  return JSON.parse(response.text)
}
