import { toast } from 'sonner'
import { GeminiCore } from '@/services/gemini_core'
import { WorkoutPlan } from '@/lib/types'
import { z } from 'zod'

// Define Zod schemas for validation
// Enhanced to include 'rest' and 'tempo' for professional quality
const ExerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['reps', 'time']),
  category: z.string(),
  duration: z.number().optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  rest: z.number().optional().describe('Rest in seconds AFTER this exercise'),
  tempo: z.string().optional().describe('Tempo notation e.g., 3-0-1-0'),
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

export async function generateWorkoutPlan(
  workoutPrompt: string,
  onProgress?: (step: string) => void
): Promise<WorkoutPlan | null> {
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
      if (onProgress) onProgress('Analyzing request...')

      const promptText = `You are an Elite Strength & Conditioning Coach. Your task is to design a professional, scientifically-structured workout session based on this request: "${workoutPrompt}".

GOAL: Create a cohesive "One Session" flow that feels expertly programmed, not random.
STRATEGY: Use intelligent grouping (Supersets, Circuits) by manipulating the "rest" field.

--- LOGIC RULES ---
1. **Structuring**:
   - Start with a dynamic WARM-UP (2-3 exercises).
   - Move to PRIMARY STRENGTH/POWER (Compound movements).
   - Follow with ACCESSORY/HYPERTROPHY work.
   - Finish with METABOLIC CONDITIONING or CORE/COOL-DOWN.

2. **Supersets & Grouping**:
   - To create a SUPERSET: Set "rest": 0 for the first exercise, and "rest": 90 (or appropriate) for the second.
   - Example Superset: Bench Press (Rest: 0) -> Face Pulls (Rest: 90).
   - Use this extensively to keep intensity high and the session flowing efficiently.

3. **Professional Details**:
   - **Tempo**: Provide specific tempo prescriptions (e.g., "3-0-1-0" for control, "X-X-X-X" for explosive).
   - **Rest**: Be precise. Heavy compounds need 120-180s. Isolation needs 45-60s. Supersets need 0s between exercises.
   - **Sets/Reps**: Use standard hypertrophy ranges (3x8-12) or strength ranges (5x5) appropriately.

4. **Time Management**:
   - Calculate total volume to match the user's requested duration (default to ~45-60 mins if unspecified).
   - Time-based exercises: "duration" is in SECONDS.
   - Reps-based exercises: Est. 3s/rep + Rest.

--- OUPUT FORMAT ---
Return a valid JSON object matching this schema:

{
  "workoutPlan": {
    "name": "Professional Upper Body Power",
    "focus": "Strength & Hypertrophy",
    "difficulty": "advanced",
    "exercises": [
      {
        "name": "Barbell Bench Press",
        "type": "reps",
        "category": "Strength",
        "sets": 4,
        "reps": 6,
        "rest": 0,  <-- SUPERSET START
        "tempo": "3-1-X-0",
        "instructions": {
          "summary": "Explosive concentric, controlled eccentric.",
          "keyPoints": ["Retract scapula", "Drive feet into floor"]
        },
        "muscleGroups": ["chest", "triceps"]
      },
      {
        "name": "Band Pull-Aparts",
        "type": "reps",
        "category": "Accessory",
        "sets": 4,
        "reps": 15,
        "rest": 120, <-- SUPERSET END (Long rest after pair)
        "tempo": "2-0-2-0",
        "instructions": {
          "summary": "Rear delt activation.",
          "keyPoints": ["Keep elbows straight", "Squeeze shoulder blades"]
        },
        "muscleGroups": ["shoulders", "back"]
      }
    ]
  }
}

IMPORTANT:
- NO generic advice. Be specific.
- "type" must be "reps" or "time".
- "difficulty" must be "beginner", "intermediate", or "advanced".
- Ensure the logic flows linearly as one complete session.
`;

      console.log('[Workout Generation] Step 2: Calling AI')
      if (onProgress) onProgress('Designing professional programming...')
      
      const gemini = new GeminiCore();
      const result = await gemini.generateJSON(promptText, ResponseSchema);

      if (!result.success) {
        throw new Error(result.message || 'AI generation failed');
      }

      const data = result.data;
      
      console.log('[Workout Generation] Step 3: AI response received and validated')
      if (onProgress) onProgress('Finalizing plan...')

      // Calculate estimated duration
      const totalDuration = data.workoutPlan.exercises.reduce((acc, ex) => {
        let workTime = 0
        if (ex.type === 'time') {
          workTime = ex.duration || 0
        } else {
          // Estimate rep time (avg 3s per rep)
          workTime = (ex.reps || 0) * 3
        }
        const sets = ex.sets || 3
        const rest = ex.rest || 60
        // (Work + Rest) * Sets
        return acc + ((workTime + rest) * sets)
      }, 0)

      console.log('[Workout Generation] Step 5: Building workout plan object')
      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        name: data.workoutPlan.name || 'Custom Session',
        focus: data.workoutPlan.focus || 'General Fitness',
        exercises: data.workoutPlan.exercises.map((ex) => ({
          id: ex.id || `ex-${Math.random().toString(36).substr(2, 9)}`,
          name: ex.name || 'Exercise',
          type: ex.type as 'reps' | 'time',
          category: ex.category || 'Work',
          duration: ex.duration,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          rest: ex.rest,   // New Field
          tempo: ex.tempo, // New Field
          muscleGroups: ex.muscleGroups || [],
          difficulty: (ex.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
          instructions: ex.instructions || {
            summary: 'Perform with control.',
            keyPoints: ['Focus on form']
          },
          asset: ex.asset || ''
        })),
        estimatedDuration: Math.ceil(totalDuration / 60),
        difficulty: (data.workoutPlan.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        createdAt: new Date().toISOString()
      }

      console.log('[Workout Generation] Step 6: Cleanup and success')
      if (onProgress) onProgress('Done!')
      toast.success('Professional plan generated!')
      
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
