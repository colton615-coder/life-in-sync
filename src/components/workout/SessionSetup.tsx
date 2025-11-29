import React, { useState } from 'react'
import { WorkoutPlan } from '@/lib/types'
import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Barbell, Play, Timer, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SessionSetupProps {
  plan: WorkoutPlan
  onStart: (updatedPlan: WorkoutPlan) => void
  onCancel: () => void
}

export function SessionSetup({ plan, onStart, onCancel }: SessionSetupProps) {
  const [exercises, setExercises] = useState(plan.exercises.map(ex => ({
    ...ex,
    weight: ex.weight || 0,
    reps: ex.reps || 10,
    duration: ex.duration || 60,
    sets: ex.sets || 3
  })))

  const updateExercise = (index: number, field: string, value: number) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const handleStart = () => {
    const updatedPlan: WorkoutPlan = {
      ...plan,
      exercises: exercises
    }
    onStart(updatedPlan)
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[9999] flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Setup</h2>
          <p className="text-muted-foreground text-sm">Review targets before you start</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={24} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20 no-scrollbar">
        {exercises.map((exercise, idx) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="neumorphic-card p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 uppercase">
                  {exercise.type}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sets</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                      className="neumorphic-inset font-mono text-center h-12 text-lg"
                    />
                  </div>
                </div>

                {exercise.type === 'reps' ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Target Reps</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                          className="neumorphic-inset font-mono text-center h-12 text-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight (lbs)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(idx, 'weight', parseInt(e.target.value) || 0)}
                          className="neumorphic-inset font-mono text-center h-12 text-lg text-primary font-bold"
                        />
                        <Barbell className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Duration (sec)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={exercise.duration}
                        onChange={(e) => updateExercise(idx, 'duration', parseInt(e.target.value) || 0)}
                        className="neumorphic-inset font-mono text-center h-12 text-lg text-amber-500"
                      />
                      <Timer className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleStart}
          className="w-full h-14 text-lg font-bold button-glow gap-2 shadow-xl"
        >
          <Play weight="fill" />
          START SESSION
        </Button>
      </div>
    </div>
  )
}
