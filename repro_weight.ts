
import { ActiveWorkout } from './src/components/workout/ActiveWorkout'; // This won't work in node directly due to JSX
// Instead, I will test the adapter logic by extracting it or mocking the component.
// Actually, I can just test the generateSessionQueue logic with the new schema.

import { generateSessionQueue } from './src/lib/workout/session-queue';
import { WorkoutSession, WorkoutBlock, Exercise } from './src/types/workout';

const mockExercise: Exercise = {
    id: 'ex-1',
    name: 'Test Press',
    type: 'strength',
    sets: 3,
    reps: 10,
    restSeconds: 60,
    weight: 100 // This is the new field
};

const mockBlock: WorkoutBlock = {
    id: 'block-1',
    type: 'strength',
    rounds: 1,
    exercises: [mockExercise]
};

const mockSession: WorkoutSession = {
    id: 'session-1',
    title: 'Test Session',
    description: 'Testing weight prop',
    totalDurationMin: 60,
    difficulty: 'intermediate',
    blocks: [mockBlock]
};

const queue = generateSessionQueue(mockSession);
const firstWorkStep = queue.find(s => s.type === 'work');

if (firstWorkStep && firstWorkStep.type === 'work' && firstWorkStep.target.weight === 100) {
    console.log('SUCCESS: Weight property correctly propagated to session queue.');
} else {
    console.error('FAILURE: Weight property missing or incorrect.', firstWorkStep);
    process.exit(1);
}
