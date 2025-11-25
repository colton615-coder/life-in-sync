import { toast } from 'sonner'
import { callAIWithRetry, parseAIJsonResponse, validateAIResponse } from '@/lib/ai-utils'
import { WorkoutPlan } from '@/lib/types'

export async function generateWorkoutPlan(workoutPrompt: string): Promise<WorkoutPlan | null> {
    console.log('====================================')
    console.log('[Workout Generation] Starting new workout generation')
    console.log('[Workout Generation] User prompt:', workoutPrompt)
    console.log('====================================')
    
    if (!workoutPrompt.trim()) {
      console.warn('[Workout Generation] Empty prompt detected')
      toast.error('Please describe your workout')
      return null
    }

    try {
      console.log('[Workout Generation] Step 1: Creating LLM prompt')
      const promptText = `You are a fitness expert. Generate a complete workout plan based on this request: "${workoutPrompt}".

CRITICAL: If the user specifies a time duration (e.g., "15 minute", "30 min", etc.), you MUST create exercises that add up to approximately that duration.
- For time-based exercises (type: "time"), the "duration" field is in SECONDS
- For reps-based exercises (type: "reps"), estimate ~3 seconds per rep, so sets × reps × 3 = total seconds
- Calculate carefully to match the requested workout duration

Create a balanced workout with 6-10 exercises including warm-up, main work, and cool-down periods.

IMPORTANT: Return a valid JSON object (not an array) with the following structure. Ensure all fields are present:

{
  "workoutPlan": {
    "name": "30-Minute Full Body HIIT",
    "focus": "Full Body Conditioning",
    "difficulty": "intermediate",
    "exercises": [
      {
        "id": "jumping-jacks",
        "name": "Jumping Jacks",
        "type": "time",
        "category": "Warm-up",
        "duration": 60,
        "muscleGroups": ["legs", "cardio"],
        "difficulty": "beginner",
        "instructions": {
          "summary": "A dynamic full-body warm-up exercise",
          "keyPoints": ["Keep core engaged", "Land softly", "Maintain steady rhythm"]
        },
        "asset": "jumping-jacks"
      }
    ]
  }
}

For reps-based exercises, use: "type": "reps", "sets": 3, "reps": 12 (this equals ~108 seconds or ~2 minutes)
For time-based exercises, use: "type": "time", "duration": 60 (duration is in SECONDS, not minutes)

Examples:
- A 15-minute workout should have exercises totaling ~900 seconds (15 × 60)
- A 30-minute workout should have exercises totaling ~1800 seconds (30 × 60)

Muscle groups can include: chest, back, legs, arms, core, shoulders, cardio
Categories: "Warm-up", "Work", "Cool-down"
Difficulty levels: "beginner", "intermediate", "advanced"`

      console.log('[Workout Generation] Step 2: Calling AI with retry mechanism')
      
      const response = await callAIWithRetry(promptText, true)
      
      console.log('[Workout Generation] Step 3: AI response received')
      const data = parseAIJsonResponse<{ workoutPlan: Record<string, unknown> }>(response, 'workoutPlan structure')
      
      console.log('[Workout Generation] Step 6: Validating required fields')
      validateAIResponse(data, ['workoutPlan', 'workoutPlan.name', 'workoutPlan.exercises'])

      console.log('[Workout Generation] Step 7: Validating exercises array')
      if (!Array.isArray(data.workoutPlan.exercises)) {
        throw new Error('workoutPlan.exercises must be an array')
      }

      if (data.workoutPlan.exercises.length === 0) {
        throw new Error('workoutPlan.exercises cannot be empty')
      }

      console.log('[Workout Generation] Step 9: Calculating total duration')
      const totalDuration = data.workoutPlan.exercises.reduce((acc: number, ex: Record<string, unknown>) => {
        if (ex.type === 'time') {
          return acc + (ex.duration as number || 0)
        }
        if (ex.type === 'reps') {
          const sets = ex.sets as number || 3
          const reps = ex.reps as number || 10
          return acc + (sets * reps * 3)
        }
        return acc
      }, 0)

      console.log('[Workout Generation] Step 10: Building workout plan object')
      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        name: (data.workoutPlan.name as string) || 'Custom Workout',
        focus: (data.workoutPlan.focus as string) || 'General Fitness',
        exercises: data.workoutPlan.exercises.map((ex: Record<string, unknown>) => ({
          id: (ex.id as string) || `ex-${Math.random().toString(36).substr(2, 9)}`,
          name: (ex.name as string) || 'Exercise',
          type: (ex.type as 'reps' | 'time') || 'reps',
          category: (ex.category as string) || 'Work',
          duration: ex.duration as number,
          sets: (ex.sets as number) || 3,
          reps: (ex.reps as number) || 10,
          muscleGroups: (ex.muscleGroups as string[]) || [],
          difficulty: (ex.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
          instructions: (ex.instructions as { summary: string; keyPoints: string[] }) || {
            summary: 'Perform this exercise with proper form',
            keyPoints: ['Focus on form', 'Breathe steadily', 'Control the movement']
          },
          asset: ex.asset as string
        })),
        estimatedDuration: Math.ceil(totalDuration / 60),
        difficulty: (data.workoutPlan.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        createdAt: new Date().toISOString()
      }

      console.log('[Workout Generation] Step 13: Cleanup and success')
      toast.success('Workout generated successfully!')
      
      return workout
    } catch (error) {
      console.log('====================================')
      console.error('[Workout Generation] ❌ ERROR - Generation failed')
      console.error('[Workout Generation] Error message:', error instanceof Error ? error.message : String(error))
      console.log('====================================')
      
      let errorMessage = 'Failed to generate workout'
      let errorTitle = 'Generation Failed'
      
      if (error instanceof SyntaxError) {
        errorTitle = 'Server Error'
        errorMessage = 'The AI service returned an invalid response. This may be due to high server load or a temporary issue. Please try again in a moment.'
      } else if (error instanceof Error) {
        if (error.message.includes('AI service returned invalid response')) {
          errorTitle = 'Service Error'
          errorMessage = error.message
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorTitle = 'Network Error'
          errorMessage = 'Unable to reach the AI service. Please check your connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorTitle = 'Timeout Error'
          errorMessage = 'The request took too long. Please try again with a simpler workout description.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000
      })
      return null
    }
}
