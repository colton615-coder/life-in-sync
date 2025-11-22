import { WorkoutPlan } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Confetti, Clock, Lightning, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface WorkoutSummaryProps {
  workout: WorkoutPlan
  completedCount: number
  onDone: () => void
}

export function WorkoutSummary({ workout, completedCount, onDone }: WorkoutSummaryProps) {
  const totalExercises = workout.exercises.filter(ex => ex.id !== 'rest').length
  const totalTime = workout.exercises.reduce((acc, ex) => acc + (ex.duration ?? (ex.reps! * ex.sets! * 3)), 0)
  const estimatedCalories = Math.round((totalTime / 60) * 8)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 text-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/20 flex items-center justify-center mb-3 neumorphic border-2 border-green-500/30"
            >
              <Confetti size={32} weight="duotone" className="text-green-500" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Workout Complete!
            </h1>
            <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                Great job finishing <span className="font-semibold bg-brand-gradient bg-clip-text text-transparent">{workout.name}</span>
            </p>
        </motion.div>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="elevated-card hover:scale-105 transition-all duration-300 bg-brand-primary/10 border-brand-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-brand-primary" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-2xl sm:text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  {Math.ceil(totalTime / 60)}
                </p>
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="elevated-card hover:scale-105 transition-all duration-300 bg-brand-secondary/10 border-brand-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                <Trophy className="h-4 w-4 text-brand-secondary" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-secondary to-brand-tertiary bg-clip-text text-transparent">
                  {completedCount}<span className="text-lg sm:text-xl">/{totalExercises}</span>
                </p>
                <span className="text-xs text-muted-foreground">exercises</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="elevated-card hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                <Lightning className="h-4 w-4 text-green-500" />
                Burned
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  {estimatedCalories}
                </p>
                <span className="text-xs text-muted-foreground">calories</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
         className="w-full max-w-2xl"
       >
         <Button 
           onClick={onDone} 
           className="w-full bg-success text-success-foreground hover:bg-success/90 shadow-xl shadow-success/30 text-sm sm:text-base h-10 sm:h-12 font-semibold"
         >
              Done
         </Button>
       </motion.div>
    </div>
  )
}
