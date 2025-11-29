import { Exercise } from './types'

// Helper to create master exercises
// We use a partial type for definition, then cast to Exercise for compatibility
// The ID will be overwritten when added to a workout
type MasterExerciseDef = Omit<Exercise, 'id' | 'sets' | 'reps' | 'rest' | 'tempo'> & {
  defaultSets?: number
  defaultReps?: number
  defaultRest?: number
}

export const MASTER_EXERCISES_DATA: MasterExerciseDef[] = [
  // --- CHEST ---
  {
    name: "Barbell Bench Press",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Pectorals", "Triceps", "Front Delts"],
    difficulty: "intermediate",
    instructions: {
      summary: "The king of upper body pressing exercises.",
      keyPoints: ["Keep feet flat on floor", "Retract shoulder blades", "Lower bar to mid-chest", "Drive up explosively"]
    },
    defaultSets: 4,
    defaultReps: 8,
    defaultRest: 120
  },
  {
    name: "Dumbbell Bench Press",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Pectorals", "Triceps", "Stabilizers"],
    difficulty: "intermediate",
    instructions: {
      summary: "Chest press allowing for greater range of motion.",
      keyPoints: ["Control the descent", "Feel the stretch at the bottom", "Press slightly inwards"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Incline Barbell Press",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Upper Pectorals", "Front Delts"],
    difficulty: "intermediate",
    instructions: {
      summary: "Targets the upper portion of the chest.",
      keyPoints: ["Set bench to 30-45 degrees", "Lower to upper chest", "Keep elbows tucked slightly"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Incline Dumbbell Press",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Upper Pectorals", "Front Delts"],
    difficulty: "intermediate",
    instructions: {
      summary: "Upper chest isolation with independent limb movement.",
      keyPoints: ["Control the weight", "Squeeze at the top"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Push-Ups",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Pectorals", "Core", "Triceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Classic bodyweight pressing movement.",
      keyPoints: ["Keep body in straight line", "Chest to floor", "Elbows at 45 degrees"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Cable Flys",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Pectorals"],
    difficulty: "intermediate",
    instructions: {
      summary: "Constant tension isolation for the chest.",
      keyPoints: ["Slight bend in elbows", "Focus on the squeeze", "Control the negative"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Dips",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Lower Pectorals", "Triceps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Bodyweight press targeting lower chest and triceps.",
      keyPoints: ["Lean forward for chest focus", "Lower until shoulders below elbows"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Dumbbell Pullover",
    category: "Chest",
    type: "reps",
    muscleGroups: ["Pectorals", "Lats", "Serratus"],
    difficulty: "intermediate",
    instructions: {
      summary: "Stretches the chest and lats.",
      keyPoints: ["Keep hips low", "Slight bend in elbows", "Focus on the stretch"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },

  // --- BACK ---
  {
    name: "Deadlift",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lower Back", "Hamstrings", "Glutes", "Traps"],
    difficulty: "advanced",
    instructions: {
      summary: "Total body power movement.",
      keyPoints: ["Keep back flat", "Bar close to shins", "Drive with legs", "Hinge at hips"]
    },
    defaultSets: 3,
    defaultReps: 5,
    defaultRest: 180
  },
  {
    name: "Pull-Ups",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lats", "Biceps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Vertical pulling for back width.",
      keyPoints: ["Full range of motion", "Chin over bar", "Control the descent"]
    },
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Barbell Row",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Horizontal pulling for back thickness.",
      keyPoints: ["Torso at 45 degrees", "Pull bar to lower chest", "Squeeze shoulder blades"]
    },
    defaultSets: 4,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lats", "Biceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Machine alternative to pull-ups.",
      keyPoints: ["Lean back slightly", "Pull to upper chest", "Drive elbows down"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Seated Cable Row",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lats", "Rhomboids"],
    difficulty: "beginner",
    instructions: {
      summary: "Horizontal row for mid-back thickness.",
      keyPoints: ["Keep chest up", "Don't swing torso", "Squeeze back at contraction"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Single-Arm Dumbbell Row",
    category: "Back",
    type: "reps",
    muscleGroups: ["Lats", "Biceps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Unilateral back exercise.",
      keyPoints: ["Support on bench", "Keep back flat", "Pull elbow to hip"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Face Pulls",
    category: "Back",
    type: "reps",
    muscleGroups: ["Rear Delts", "Rotator Cuff", "Traps"],
    difficulty: "beginner",
    instructions: {
      summary: "Postural health and rear delt isolation.",
      keyPoints: ["Pull to forehead", "External rotation at end", "Squeeze rear delts"]
    },
    defaultSets: 4,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "T-Bar Row",
    category: "Back",
    type: "reps",
    muscleGroups: ["Mid Back", "Lats"],
    difficulty: "intermediate",
    instructions: {
      summary: "Heavy rowing movement.",
      keyPoints: ["Maintain spine neutrality", "Pull weight to chest", "Avoid momentum"]
    },
    defaultSets: 4,
    defaultReps: 8,
    defaultRest: 90
  },

  // --- LEGS (QUADS/GLUTES) ---
  {
    name: "Barbell Back Squat",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    difficulty: "advanced",
    instructions: {
      summary: "The primary lower body compound movement.",
      keyPoints: ["Feet shoulder width", "Keep chest up", "Break parallel", "Drive knees out"]
    },
    defaultSets: 4,
    defaultReps: 6,
    defaultRest: 120
  },
  {
    name: "Front Squat",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Core", "Upper Back"],
    difficulty: "advanced",
    instructions: {
      summary: "Squat variation focusing on quads and core.",
      keyPoints: ["High elbows (rack position)", "Vertical torso", "Sit straight down"]
    },
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Leg Press",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "beginner",
    instructions: {
      summary: "Heavy leg loading with back support.",
      keyPoints: ["Don't lock knees", "Lower until 90 degrees", "Press through heels"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Goblet Squat",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Core"],
    difficulty: "beginner",
    instructions: {
      summary: "Great squat variation for beginners.",
      keyPoints: ["Hold weight at chest", "Keep torso upright", "Elbows inside knees"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Walking Lunges",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Glutes", "Balance"],
    difficulty: "intermediate",
    instructions: {
      summary: "Dynamic unilateral leg training.",
      keyPoints: ["Step far enough", "Back knee almost touches floor", "Torso upright"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Bulgarian Split Squat",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "advanced",
    instructions: {
      summary: "Powerful unilateral leg builder.",
      keyPoints: ["Rear foot elevated", "Descend straight down", "Keep weight on front heel"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Leg Extensions",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Quadriceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Isolation for the quadriceps.",
      keyPoints: ["Control the movement", "Squeeze quads at top", "Slow eccentric"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },

  // --- LEGS (HAMSTRINGS/GLUTES) ---
  {
    name: "Romanian Deadlift",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    difficulty: "intermediate",
    instructions: {
      summary: "Hip hinge focusing on posterior chain.",
      keyPoints: ["Slight knee bend", "Hinge at hips", "Back flat", "Feel hamstring stretch"]
    },
    defaultSets: 4,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Seated Leg Curl",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Hamstrings"],
    difficulty: "beginner",
    instructions: {
      summary: "Isolation for hamstrings.",
      keyPoints: ["Lock legs in pad", "Curl fully", "Control return"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Lying Leg Curl",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Hamstrings"],
    difficulty: "beginner",
    instructions: {
      summary: "Hamstring isolation.",
      keyPoints: ["Hips down on bench", "Curl heels to glutes"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Hip Thrusts",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Glutes"],
    difficulty: "intermediate",
    instructions: {
      summary: "The best glute isolation exercise.",
      keyPoints: ["Back on bench", "Bar on hips", "Drive hips up", "Squeeze glutes hard"]
    },
    defaultSets: 4,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Glute Bridges",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Glutes"],
    difficulty: "beginner",
    instructions: {
      summary: "Bodyweight glute activation.",
      keyPoints: ["Feet flat", "Drive hips up", "Squeeze at top"]
    },
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 45
  },
  {
    name: "Calf Raises (Standing)",
    category: "Legs",
    type: "reps",
    muscleGroups: ["Calves"],
    difficulty: "beginner",
    instructions: {
      summary: "Calf isolation.",
      keyPoints: ["Full stretch at bottom", "Drive up on toes", "Pause at top"]
    },
    defaultSets: 4,
    defaultReps: 15,
    defaultRest: 45
  },

  // --- SHOULDERS ---
  {
    name: "Overhead Barbell Press",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Front Delts", "Triceps", "Core"],
    difficulty: "intermediate",
    instructions: {
      summary: "Compound shoulder strength.",
      keyPoints: ["Core tight", "Press vertically", "Head through at top"]
    },
    defaultSets: 4,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Seated Dumbbell Press",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Front Delts", "Side Delts", "Triceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Stable shoulder pressing.",
      keyPoints: ["Back flat against bench", "Press overhead", "Don't clang weights"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Lateral Raises",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Side Delts"],
    difficulty: "beginner",
    instructions: {
      summary: "Width-building isolation.",
      keyPoints: ["Lead with elbows", "Slight forward lean", "Control the negative"]
    },
    defaultSets: 4,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Front Raises",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Front Delts"],
    difficulty: "beginner",
    instructions: {
      summary: "Front deltoid isolation.",
      keyPoints: ["Lift to eye level", "No swinging", "Control descent"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Reverse Flys",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Rear Delts"],
    difficulty: "beginner",
    instructions: {
      summary: "Rear shoulder isolation.",
      keyPoints: ["Hinge forward", "Fly arms out to side", "Squeeze rear delts"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Arnold Press",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Deltoids (All heads)"],
    difficulty: "intermediate",
    instructions: {
      summary: "Rotational press for full shoulder development.",
      keyPoints: ["Start palms facing you", "Rotate as you press", "End palms facing forward"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Upright Row",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Side Delts", "Traps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Pulling movement for shoulders.",
      keyPoints: ["Wide grip preferred", "Pull to chest level", "Elbows high"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Shrugs",
    category: "Shoulders",
    type: "reps",
    muscleGroups: ["Traps"],
    difficulty: "beginner",
    instructions: {
      summary: "Trap isolation.",
      keyPoints: ["Elevate shoulders to ears", "Hold at top", "Do not roll shoulders"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },

  // --- ARMS (BICEPS) ---
  {
    name: "Barbell Curl",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Biceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Mass builder for biceps.",
      keyPoints: ["Elbows tucked at sides", "No swinging", "Squeeze at top"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Dumbbell Curl",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Biceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Standard bicep curl.",
      keyPoints: ["Supinate wrists (turn up)", "Full range of motion"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Hammer Curl",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Brachialis", "Forearms"],
    difficulty: "beginner",
    instructions: {
      summary: "Thickness and forearm focus.",
      keyPoints: ["Palms facing each other", "Keep elbows fixed"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Preacher Curl",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Biceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Strict isolation removing momentum.",
      keyPoints: ["Armpits over pad", "Full extension", "Curl to chin"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },

  // --- ARMS (TRICEPS) ---
  {
    name: "Tricep Pushdowns",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Triceps"],
    difficulty: "beginner",
    instructions: {
      summary: "Cable isolation for triceps.",
      keyPoints: ["Elbows pinned to sides", "Push down fully", "Squeeze at bottom"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Skull Crushers",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Triceps"],
    difficulty: "intermediate",
    instructions: {
      summary: "Extension movement for triceps mass.",
      keyPoints: ["Lower bar to forehead", "Keep elbows tight", "Extend fully"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Overhead Tricep Extension",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Triceps (Long Head)"],
    difficulty: "beginner",
    instructions: {
      summary: "Overhead stretch for triceps.",
      keyPoints: ["Keep elbows pointing up", "Lower behind head", "Extend fully"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Close-Grip Bench Press",
    category: "Arms",
    type: "reps",
    muscleGroups: ["Triceps", "Chest"],
    difficulty: "intermediate",
    instructions: {
      summary: "Compound movement for triceps.",
      keyPoints: ["Hands shoulder-width", "Elbows tucked", "Press mainly with triceps"]
    },
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },

  // --- CORE ---
  {
    name: "Plank",
    category: "Core",
    type: "time",
    muscleGroups: ["Abs", "Core Stabilizers"],
    difficulty: "beginner",
    instructions: {
      summary: "Static hold for core stability.",
      keyPoints: ["Straight line head to heels", "Glutes squeezed", "Abs tight"]
    },
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Crunches",
    category: "Core",
    type: "reps",
    muscleGroups: ["Abs"],
    difficulty: "beginner",
    instructions: {
      summary: "Upper ab isolation.",
      keyPoints: ["Lower back on floor", "Curl shoulders up", "Exhale on crunch"]
    },
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 45
  },
  {
    name: "Leg Raises",
    category: "Core",
    type: "reps",
    muscleGroups: ["Lower Abs", "Hip Flexors"],
    difficulty: "intermediate",
    instructions: {
      summary: "Lower ab focus.",
      keyPoints: ["Legs straight", "Lift to 90 degrees", "Control the drop"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Russian Twists",
    category: "Core",
    type: "reps",
    muscleGroups: ["Obliques"],
    difficulty: "intermediate",
    instructions: {
      summary: "Rotational core work.",
      keyPoints: ["Feet off ground", "Rotate shoulders", "Touch floor each side"]
    },
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 45
  },
  {
    name: "Bicycle Crunches",
    category: "Core",
    type: "reps",
    muscleGroups: ["Abs", "Obliques"],
    difficulty: "intermediate",
    instructions: {
      summary: "Dynamic core movement.",
      keyPoints: ["Opposite elbow to knee", "Extend other leg fully"]
    },
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 45
  },
  {
    name: "Cable Woodchoppers",
    category: "Core",
    type: "reps",
    muscleGroups: ["Obliques", "Core"],
    difficulty: "intermediate",
    instructions: {
      summary: "Functional rotational power.",
      keyPoints: ["Pull across body", "Rotate with hips/core", "Control return"]
    },
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Ab Wheel Rollout",
    category: "Core",
    type: "reps",
    muscleGroups: ["Core", "Lats"],
    difficulty: "advanced",
    instructions: {
      summary: "Anti-extension core strength.",
      keyPoints: ["Kneel on pad", "Roll out as far as possible", "Keep back neutral", "Pull back with abs"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },

  // --- CARDIO / HIIT ---
  {
    name: "Burpees",
    category: "Cardio",
    type: "reps",
    muscleGroups: ["Full Body"],
    difficulty: "intermediate",
    instructions: {
      summary: "Full body metabolic conditioning.",
      keyPoints: ["Drop to chest", "Jump feet in", "Jump up"]
    },
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Mountain Climbers",
    category: "Cardio",
    type: "time",
    muscleGroups: ["Core", "Cardio"],
    difficulty: "beginner",
    instructions: {
      summary: "Dynamic plank variation.",
      keyPoints: ["Plank position", "Drive knees to chest", "Fast pace"]
    },
    defaultSets: 3,
    defaultReps: 1, // time based
    defaultRest: 45
  },
  {
    name: "Jump Rope",
    category: "Cardio",
    type: "time",
    muscleGroups: ["Calves", "Cardio"],
    difficulty: "beginner",
    instructions: {
      summary: "Classic conditioning.",
      keyPoints: ["Stay on toes", "Use wrists to turn rope"]
    },
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Box Jumps",
    category: "Plyometrics",
    type: "reps",
    muscleGroups: ["Legs", "Power"],
    difficulty: "intermediate",
    instructions: {
      summary: "Explosive leg power.",
      keyPoints: ["Land soft", "Stand up fully at top", "Step down"]
    },
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Kettlebell Swing",
    category: "Cardio",
    type: "reps",
    muscleGroups: ["Posterior Chain", "Cardio"],
    difficulty: "intermediate",
    instructions: {
      summary: "Hinge-based power endurance.",
      keyPoints: ["Hike bell back", "Snap hips forward", "Arms are just hooks"]
    },
    defaultSets: 4,
    defaultReps: 20,
    defaultRest: 60
  }
]

export function getMasterExercises(): MasterExerciseDef[] {
  return MASTER_EXERCISES_DATA.sort((a, b) => a.name.localeCompare(b.name))
}
