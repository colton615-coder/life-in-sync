import { toast } from 'sonner'
import { GeminiCore } from '@/services/gemini_core'
import { WorkoutPlan } from '@/lib/types'
import { z } from 'zod'

// Define Zod schemas for validation
const ExerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['reps', 'time']),
  category: z.string(),
  duration: z.number().optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  muscleGroups: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  instructions: z.object({
    summary: z.string(),
    keyPoints: z.array(z.string())
  }),
  asset: z.string().optional()
})

const WorkoutPlanSchema = z.object({
  name: z.string(),
  focus: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  exercises: z.array(ExerciseSchema)
})

const ResponseSchema = z.object({
  workoutPlan: WorkoutPlanSchema
})

export async function generateWorkoutPlan(workoutPrompt: string): Promise<WorkoutPlan | null> {
    console.log('====================================')
    console.log('[Workout Generation] Starting new workout generation (Gemini)')
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
Difficulty levels: "beginner", "intermediate", "advanced"`;

      console.log('[Workout Generation] Step 2: Calling AI')
      
      // Use generateJSON with Zod schema validation
      const gemini = new GeminiCore();
      const data = await gemini.generateJSON(promptText, ResponseSchema);
      
      console.log('[Workout Generation] Step 3: AI response received and validated')

      console.log('[Workout Generation] Step 4: Calculating total duration')
      const totalDuration = data.workoutPlan.exercises.reduce((acc, ex) => {
        if (ex.type === 'time') {
          return acc + (ex.duration || 0)
        }
        if (ex.type === 'reps') {
          const sets = ex.sets || 3
          const reps = ex.reps || 10
          return acc + (sets * reps * 3)
        }
        return acc
      }, 0)

      console.log('[Workout Generation] Step 5: Building workout plan object')
      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        name: data.workoutPlan.name || 'Custom Workout',
        focus: data.workoutPlan.focus || 'General Fitness',
        exercises: data.workoutPlan.exercises.map((ex) => ({
          id: ex.id || `ex-${Math.random().toString(36).substr(2, 9)}`,
          name: ex.name || 'Exercise',
          type: ex.type as 'reps' | 'time',
          category: ex.category || 'Work',
          duration: ex.duration,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          muscleGroups: ex.muscleGroups || [],
          difficulty: (ex.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
          instructions: ex.instructions || {
            summary: 'Perform this exercise with proper form',
            keyPoints: ['Focus on form', 'Breathe steadily', 'Control the movement']
          },
          asset: ex.asset || ''
        })),
        estimatedDuration: Math.ceil(totalDuration / 60),
        difficulty: (data.workoutPlan.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        createdAt: new Date().toISOString()
      }

      console.log('[Workout Generation] Step 6: Cleanup and success')
      toast.success('Workout generated successfully!')
      
      return workout
    } catch (error) {
      console.log('====================================')
      console.error('[Workout Generation] ❌ ERROR - Generation failed')
      console.error('[Workout Generation] Error message:', error instanceof Error ? error.message : String(error))
      console.log('====================================')
      
      let errorMessage = 'Failed to generate workout'
      let errorTitle = 'Generation Failed'
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
            errorTitle = 'AI Busy'
            errorMessage = 'The AI service is currently busy. Please try again in a moment.'
        } else if (error.message.includes('JSON')) {
             errorTitle = 'Data Error'
             errorMessage = 'The AI response was invalid. Please try again.'
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
