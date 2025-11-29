import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

/**
 * Exercise Schema
 * Represents a single exercise within a workout block.
 * Unknown keys are automatically stripped.
 */
export const ExerciseSchema = z.object({
  id: z.string().default(() => uuidv4()),
  name: z.string(),
  type: z.enum(['strength', 'cardio', 'mobility', 'plyometric']),
  notes: z.string().optional(),
  sets: z.number().default(3),
  reps: z.number().optional(),
  durationSeconds: z.number().optional(), // For timed moves
  restSeconds: z.number().default(60),
  tempo: z.string().optional(), // e.g., "3-0-1-0"
  weight: z.number().optional(),
});

/**
 * Workout Block Schema
 * Represents a group of exercises (e.g., a circuit or superset).
 * Unknown keys are automatically stripped.
 */
export const WorkoutBlockSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.enum(['warmup', 'circuit', 'superset', 'strength', 'cooldown']),
  exercises: z.array(ExerciseSchema),
  rounds: z.number().default(1),
});

/**
 * Workout Session Schema
 * Represents a full workout session containing multiple blocks.
 * Unknown keys are automatically stripped.
 */
export const WorkoutSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  totalDurationMin: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  blocks: z.array(WorkoutBlockSchema),
});

// Export inferred TypeScript types
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutBlock = z.infer<typeof WorkoutBlockSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
