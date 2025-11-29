import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { WorkoutSession, WorkoutSessionSchema } from '@/types/workout';
import { SessionStep, generateSessionQueue } from '@/lib/workout/session-queue';

// --- State Interface ---
interface WorkoutState {
  activePlan: WorkoutSession | null;
  sessionQueue: SessionStep[];
  currentStepIndex: number;
  isPaused: boolean;
  secondsRemaining: number;
  sessionStatus: 'idle' | 'active' | 'completed';
}

// --- Actions Interface ---
interface WorkoutContextType extends WorkoutState {
  startSession: (plan: WorkoutSession) => void;
  togglePause: () => void;
  completeStep: () => void;
  tickTimer: () => void;
  cancelSession: () => void;
}

// --- Initial State ---
const initialState: WorkoutState = {
  activePlan: null,
  sessionQueue: [],
  currentStepIndex: 0,
  isPaused: false,
  secondsRemaining: 0,
  sessionStatus: 'idle',
};

// --- Action Types ---
type Action =
  | { type: 'START_SESSION'; payload: { plan: WorkoutSession; queue: SessionStep[]; initialSeconds: number } }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'PROCEED_STEP' }
  | { type: 'TICK_TIMER' }
  | { type: 'CANCEL_SESSION' };

// --- Reducer ---
function workoutReducer(state: WorkoutState, action: Action): WorkoutState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        activePlan: action.payload.plan,
        sessionQueue: action.payload.queue,
        currentStepIndex: 0,
        isPaused: false,
        secondsRemaining: action.payload.initialSeconds,
        sessionStatus: 'active',
      };

    case 'TOGGLE_PAUSE':
      if (state.sessionStatus !== 'active') return state;
      return {
        ...state,
        isPaused: !state.isPaused,
      };

    case 'PROCEED_STEP': {
      // Calculate next state
      const nextIndex = state.currentStepIndex + 1;

      // Check completion
      if (nextIndex >= state.sessionQueue.length) {
        return {
          ...state,
          sessionStatus: 'completed',
          currentStepIndex: nextIndex,
          secondsRemaining: 0,
        };
      }

      // Get next step info for timer
      const nextStep = state.sessionQueue[nextIndex];
      let nextSeconds = 0;
      if (nextStep.type === 'rest') {
        nextSeconds = nextStep.duration;
      } else if (nextStep.type === 'work' && nextStep.target.type === 'time') {
        nextSeconds = nextStep.target.value;
      }

      return {
        ...state,
        currentStepIndex: nextIndex,
        secondsRemaining: nextSeconds,
        // Auto-unpause on step change to keep flow moving
        isPaused: false,
      };
    }

    case 'TICK_TIMER':
      if (state.isPaused || state.sessionStatus !== 'active' || state.secondsRemaining <= 0) {
        return state;
      }
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
      };

    case 'CANCEL_SESSION':
      return initialState;

    default:
      return state;
  }
}

// --- Context ---
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// --- Provider ---
export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const startSession = useCallback((plan: WorkoutSession) => {
    // 1. Validate Input
    const parseResult = WorkoutSessionSchema.safeParse(plan);
    if (!parseResult.success) {
      console.error('Failed to start session: Invalid WorkoutSession data', parseResult.error);
      return;
    }

    // 2. Generate Queue
    const queue = generateSessionQueue(plan);
    if (queue.length === 0) {
      console.error('Failed to start session: Generated queue is empty');
      return;
    }

    // 3. Determine initial timer
    const firstStep = queue[0];
    let initialSeconds = 0;
    if (firstStep.type === 'rest') {
      initialSeconds = firstStep.duration;
    } else if (firstStep.type === 'work' && firstStep.target.type === 'time') {
      initialSeconds = firstStep.target.value;
    }

    dispatch({
      type: 'START_SESSION',
      payload: { plan, queue, initialSeconds },
    });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const completeStep = useCallback(() => {
    dispatch({ type: 'PROCEED_STEP' });
  }, []);

  const tickTimer = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, []);

  const cancelSession = useCallback(() => {
    dispatch({ type: 'CANCEL_SESSION' });
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        startSession,
        togglePause,
        completeStep,
        tickTimer,
        cancelSession,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

// --- Hook ---
export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
