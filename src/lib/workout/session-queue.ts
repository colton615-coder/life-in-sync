import { WorkoutPlan, Exercise } from '@/lib/types'

export type SessionStepType = 'work' | 'rest'

export interface BaseStep {
  id: string
  type: SessionStepType
  nextUp?: {
    name: string
    type: string // 'reps' | 'time'
    value: number
  }
}

export interface WorkStep extends BaseStep {
  type: 'work'
  exercise: Exercise
  setNumber: number
  totalSets: number
  target: {
    type: 'reps' | 'time'
    value: number
    weight: number
  }
}

export interface RestStep extends BaseStep {
  type: 'rest'
  duration: number
}

export type SessionStep = WorkStep | RestStep

export function generateSessionQueue(plan: WorkoutPlan): SessionStep[] {
  const queue: SessionStep[] = []

  // Flatten the workout plan
  // Default behavior: Sequential Sets (Exercise A: Set 1, Rest, Set 2, Rest...)
  // TODO: Add support for Circuits if needed in future

  plan.exercises.forEach((exercise, exIndex) => {
    const sets = exercise.sets || 3 // Default to 3 if not specified
    const restBetweenSets = 60 // Default 60s rest
    const restBetweenExercises = 90 // Default 90s rest

    for (let i = 1; i <= sets; i++) {
      // 1. Add Work Step
      const workStep: WorkStep = {
        id: `work-${exercise.id}-${i}`,
        type: 'work',
        exercise: exercise,
        setNumber: i,
        totalSets: sets,
        target: {
          type: exercise.type,
          value: exercise.type === 'time'
            ? (exercise.duration || 60)
            : (exercise.reps || 10),
          weight: exercise.weight || 0
        }
      }

      queue.push(workStep)

      // 2. Add Rest Step (if not the very last thing)
      const isLastSetOfExercise = i === sets
      const isLastExercise = exIndex === plan.exercises.length - 1

      if (!(isLastExercise && isLastSetOfExercise)) {
        const restDuration = isLastSetOfExercise ? restBetweenExercises : restBetweenSets

        const restStep: RestStep = {
          id: `rest-${exercise.id}-${i}`,
          type: 'rest',
          duration: restDuration
        }

        queue.push(restStep)
      }
    }
  })

  // Post-processing to fill in 'nextUp' data
  for (let i = 0; i < queue.length - 1; i++) {
    const nextStep = queue.find((step, idx) => idx > i && step.type === 'work') as WorkStep | undefined

    if (nextStep) {
      queue[i].nextUp = {
        name: nextStep.exercise.name,
        type: nextStep.target.type,
        value: nextStep.target.value
      }
    } else {
      queue[i].nextUp = {
        name: 'Finish',
        type: 'end',
        value: 0
      }
    }
  }

  // Handle the very last item
  if (queue.length > 0) {
    queue[queue.length - 1].nextUp = {
        name: 'Complete',
        type: 'end',
        value: 0
    }
  }

  return queue
}
