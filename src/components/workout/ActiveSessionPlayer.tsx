import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWorkout } from '@/context/WorkoutContext';
import { WorkoutSession } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function ActiveSessionPlayer() {
  const {
    sessionStatus,
    sessionQueue,
    currentStepIndex,
    secondsRemaining,
    isPaused,
    startSession,
    tickTimer,
    completeStep,
    togglePause,
  } = useWorkout();

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStatus === 'active' && !isPaused) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus, isPaused, tickTimer]);

  // Mock Data Construction
  const handleStartMock = () => {
    const mockSession: WorkoutSession = {
      id: uuidv4(),
      title: 'Mock Session',
      description: 'Test session for development',
      totalDurationMin: 5,
      difficulty: 'beginner',
      blocks: [
        {
          id: uuidv4(),
          type: 'strength',
          rounds: 1,
          exercises: [
            {
              id: uuidv4(),
              name: 'Push Ups',
              type: 'strength',
              sets: 1,
              reps: 10,
              restSeconds: 10,
            },
            {
              id: uuidv4(),
              name: 'Plank',
              type: 'strength',
              sets: 1,
              durationSeconds: 30,
              restSeconds: 10,
            },
          ],
        },
      ],
    };
    startSession(mockSession);
  };

  // Helper to format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render: Idle State
  if (sessionStatus === 'idle') {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-950 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Ready to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">Initialize the session player to begin.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartMock} className="w-full">
              Start Mock Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render: Completed State
  if (sessionStatus === 'completed') {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-950 border-emerald-500/50 text-white">
          <CardHeader>
            <CardTitle className="text-emerald-400">Workout Finished</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Great job! Session complete.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render: Active State
  const currentStep = sessionQueue[currentStepIndex];

  // Safety check
  if (!currentStep) {
    return (
       <div className="p-4 text-red-500">Error: Active session with no current step.</div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[50vh]">
      <Card className="w-full max-w-md bg-slate-900 border-white/10 text-white shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {currentStep.type === 'work' ? currentStep.exercise.name : 'Rest'}
          </CardTitle>
          {currentStep.type === 'work' && (
             <p className="text-slate-400 text-sm">
                {currentStep.target.type === 'reps'
                  ? `${currentStep.target.value} Reps`
                  : `${currentStep.target.value}s Hold`}
             </p>
          )}
        </CardHeader>

        <CardContent className="flex flex-col items-center py-8 gap-6">
          {/* Timer Display */}
          <div className="text-6xl font-mono font-bold tracking-widest text-white">
            {formatTime(secondsRemaining)}
          </div>

          <div className="flex gap-4 w-full">
             <Button
               variant="outline"
               className="flex-1 border-white/20 hover:bg-white/10 hover:text-white"
               onClick={togglePause}
             >
               {isPaused ? 'Resume' : 'Pause'}
             </Button>

             <Button
               className="flex-1 bg-white text-black hover:bg-slate-200"
               onClick={completeStep}
             >
               Next
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
