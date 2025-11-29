import React, { useState } from 'react'
import { WorkoutPlan } from '@/lib/types'
import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Barbell, Play, Timer, X, CircleNotch, Info } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeminiCore } from '@/services/gemini_core'
import { toast } from 'sonner'

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
    sets: ex.sets || 3,
    instructionGuide: ex.instructionGuide
  })))

  const [generateInstructions, setGenerateInstructions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')

  const updateExercise = (index: number, field: string, value: number) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const handleStart = async () => {
    if (!generateInstructions) {
      const updatedPlan: WorkoutPlan = {
        ...plan,
        exercises: exercises
      }
      onStart(updatedPlan)
      return
    }

    // AI Generation Logic
    setIsGenerating(true)
    const gemini = new GeminiCore()
    const updatedExercises = [...exercises]

    try {
      for (let i = 0; i < updatedExercises.length; i++) {
        const ex = updatedExercises[i]
        setGenerationProgress(`Preparing Instructions for ${ex.name}... (${i + 1}/${updatedExercises.length})`)

        // Skip if already has instructions
        if (ex.instructionGuide) continue

        const result = await gemini.generateExerciseInstructions(ex.name)
        if (result.success) {
          updatedExercises[i] = {
            ...ex,
            instructionGuide: result.data
          }
        } else {
          console.warn(`Failed to generate instructions for ${ex.name}`)
        }
      }

      const updatedPlan: WorkoutPlan = {
        ...plan,
        exercises: updatedExercises
      }
      onStart(updatedPlan)

    } catch (error) {
      console.error("Generation failed", error)
      toast.error("Failed to generate some instructions. Starting session anyway.")
      const updatedPlan: WorkoutPlan = {
        ...plan,
        exercises: updatedExercises
      }
      onStart(updatedPlan)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[9999] flex flex-col p-4 md:p-6 overflow-hidden">

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[10000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
          >
             <div className="relative">
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="w-20 h-20 border-t-2 border-primary rounded-full"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Info weight="fill" className="text-primary animate-pulse" size={32} />
               </div>
             </div>
             <div className="text-center">
               <h3 className="text-xl font-bold text-white mb-2">Preparing Instructions</h3>
               <p className="text-muted-foreground font-mono text-sm">{generationProgress}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Setup</h2>
          <p className="text-muted-foreground text-sm">Review targets before you start</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={24} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-32 no-scrollbar">

        {/* Instruction Toggle */}
        <Card className="neumorphic-card p-4 flex items-center justify-between border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
               <Info weight="fill" size={20} />
             </div>
             <div>
               <h3 className="font-bold text-sm text-white">Detailed Instructions</h3>
               <p className="text-xs text-muted-foreground">Generate step-by-step guides</p>
             </div>
          </div>
          <Switch
            checked={generateInstructions}
            onCheckedChange={setGenerateInstructions}
            className="data-[state=checked]:bg-primary"
          />
        </Card>

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

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-[9998]">
        <Button
          onClick={handleStart}
          disabled={isGenerating}
          className="w-full h-14 text-lg font-bold button-glow gap-2 shadow-xl"
        >
          {isGenerating ? (
            <CircleNotch weight="bold" className="animate-spin" />
          ) : (
            <Play weight="fill" />
          )}
          {isGenerating ? "PREPARING..." : "START SESSION"}
        </Button>
      </div>
    </div>
  )
}
