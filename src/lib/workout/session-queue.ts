import { WorkoutSession, Exercise } from '@/types/workout';

export type SessionStepType = 'work' | 'rest';

export interface BaseStep {
  id: string;
  type: SessionStepType;
  // Metadata for "Next Up" displays
  nextUp?: {
    name: string;
    type: string; // 'reps' | 'time'
    value: number;
  };
}

export interface WorkStep extends BaseStep {
  type: 'work';
  exercise: Exercise;
  setNumber: number;
  totalSets: number; // In a circuit, this might represent the Round number
  target: {
    type: 'reps' | 'time';
    value: number;
    weight?: number;
  };
}

export interface RestStep extends BaseStep {
  type: 'rest';
  duration: number;
}

export type SessionStep = WorkStep | RestStep;

export function generateSessionQueue(session: WorkoutSession): SessionStep[] {
  const queue: SessionStep[] = [];

  session.blocks.forEach((block, blockIndex) => {
    // Determine block behavior
    const isCircuitLike = block.type === 'circuit' || block.type === 'superset';

    if (isCircuitLike) {
      // CIRCUIT/SUPERSET LOGIC: Iterate Rounds -> Exercises
      const totalRounds = block.rounds || 1;

      for (let r = 1; r <= totalRounds; r++) {
        block.exercises.forEach((exercise, exIndex) => {
          // Add Work Step
          // For circuits, we usually do 1 set per exercise per round.
          // We'll ignore 'exercise.sets' inside a circuit and rely on 'block.rounds'.

          const workStep: WorkStep = {
            id: `work-b${blockIndex}-r${r}-ex${exIndex}`,
            type: 'work',
            exercise: exercise,
            setNumber: r,
            totalSets: totalRounds,
            target: resolveTarget(exercise)
          };
          queue.push(workStep);

          // Add Rest Step
          // 1. Rest between exercises in a circuit? Usually minimal or 0, but let's check `restSeconds`.
          //    If it's a superset, maybe 0. If circuit, maybe transition time.
          //    For now, we'll use exercise.restSeconds if provided, but maybe override logic is needed.
          //    Let's assume exercise.restSeconds applies AFTER the exercise.

          const isLastExerciseInRound = exIndex === block.exercises.length - 1;
          const isLastRound = r === totalRounds;

          if (!isLastExerciseInRound) {
            // Intral-round rest (between stations)
            // If restSeconds is 0, we might skip adding a rest step, or add a minimal one.
            // Let's add it if > 0.
            if (exercise.restSeconds > 0) {
               queue.push({
                 id: `rest-b${blockIndex}-r${r}-ex${exIndex}`,
                 type: 'rest',
                 duration: exercise.restSeconds
               });
            }
          } else {
             // End of Round Rest
             // If not the very last round of the block, we might want a longer "Round Rest".
             // We don't have a specific "roundRest" field in Schema yet.
             // We will use the last exercise's restSeconds for now.
             if (!isLastRound && exercise.restSeconds > 0) {
                queue.push({
                 id: `rest-b${blockIndex}-r${r}-end`,
                 type: 'rest',
                 duration: exercise.restSeconds
               });
             }
          }
        });
      }

    } else {
      // STANDARD/STRENGTH LOGIC: Iterate Exercises -> Sets
      block.exercises.forEach((exercise, exIndex) => {
        const sets = exercise.sets || 3;

        for (let s = 1; s <= sets; s++) {
           // Add Work Step
           const workStep: WorkStep = {
             id: `work-b${blockIndex}-ex${exIndex}-s${s}`,
             type: 'work',
             exercise: exercise,
             setNumber: s,
             totalSets: sets,
             target: resolveTarget(exercise)
           };
           queue.push(workStep);

           // Add Rest Step
           // If not the last set, use restSeconds.
           // If last set of exercise, use restSeconds (transition to next exercise).
           // If last set of last exercise of block, maybe skip if it's the end of session?
           // The queue generation usually includes trailing rest until the very end.

           // We will add rest after every set, unless it is the ABSOLUTE last step of the session.
           // But here we are just in a block loop. We'll filter trailing rest at the very end of generation.

           if (exercise.restSeconds > 0) {
             queue.push({
               id: `rest-b${blockIndex}-ex${exIndex}-s${s}`,
               type: 'rest',
               duration: exercise.restSeconds
             });
           }
        }
      });
    }
  });

  // Post-processing:
  // 1. Remove the very last Rest step if it exists (no need to rest after workout finishes)
  if (queue.length > 0 && queue[queue.length - 1].type === 'rest') {
    queue.pop();
  }

  // 2. Populate 'nextUp'
  for (let i = 0; i < queue.length - 1; i++) {
    const nextWorkStep = queue.slice(i + 1).find(s => s.type === 'work') as WorkStep | undefined;

    if (nextWorkStep) {
      queue[i].nextUp = {
        name: nextWorkStep.exercise.name,
        type: nextWorkStep.target.type,
        value: nextWorkStep.target.value
      };
    } else {
      queue[i].nextUp = {
        name: 'Finish',
        type: 'end',
        value: 0
      };
    }
  }

  // Handle last item
  if (queue.length > 0) {
    queue[queue.length - 1].nextUp = {
      name: 'Complete',
      type: 'end',
      value: 0
    };
  }

  return queue;
}

function resolveTarget(exercise: Exercise): { type: 'reps' | 'time', value: number, weight?: number } {
  // Prioritize explicit duration for time-based
  if (exercise.durationSeconds && exercise.durationSeconds > 0) {
    return {
      type: 'time',
      value: exercise.durationSeconds,
      weight: exercise.weight || 0
    };
  }

  // Fallback to reps
  return {
    type: 'reps',
    value: exercise.reps || 0,
    weight: exercise.weight || 0
  };
}
