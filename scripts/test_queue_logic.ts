
import { generateSessionQueue } from '../src/lib/workout/session-queue';
import { WorkoutSession, WorkoutBlock } from '../src/types/workout';

// Mock Data
const mockSupersetBlock: WorkoutBlock = {
  id: "block-1",
  type: "superset",
  rounds: 2,
  exercises: [
    {
      id: "ex-1",
      name: "Exercise A",
      type: "strength",
      sets: 3, // Ignored in circuit logic usually, but let's see
      reps: 10,
      restSeconds: 0,
    },
    {
      id: "ex-2",
      name: "Exercise B",
      type: "strength",
      sets: 3,
      reps: 10,
      restSeconds: 60,
    }
  ]
};

const mockSession: WorkoutSession = {
  id: "session-1",
  title: "Test Session",
  description: "Test",
  totalDurationMin: 30,
  difficulty: "intermediate",
  blocks: [mockSupersetBlock]
};

// Test
console.log("Generating Queue for Superset (2 Rounds)...");
const queue = generateSessionQueue(mockSession);

console.log(`Queue Length: ${queue.length}`);
queue.forEach((step, i) => {
    if (step.type === 'work') {
        // @ts-ignore
        console.log(`[${i}] WORK: ${step.exercise.name} (Round ${step.setNumber})`);
    } else {
        // @ts-ignore
        console.log(`[${i}] REST: ${step.duration}s`);
    }
});

// Verification Logic
// Expectation: A -> B -> Rest -> A -> B -> Rest (maybe last rest skipped)
// Steps:
// Round 1:
// 1. Work A
// 2. Work B
// 3. Rest 60s (End of Round)
// Round 2:
// 4. Work A
// 5. Work B
// 6. Rest 60s (Skipped if last?)

// Let's check the output.
