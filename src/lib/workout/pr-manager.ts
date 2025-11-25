import { PersonalRecord, Exercise, WorkoutSet } from '@/lib/types'

const KEY = 'personal-records'

// Epley Formula: 1RM = Weight * (1 + Reps/30)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function updatePersonalRecords(
  currentRecords: PersonalRecord[],
  exerciseId: string,
  exerciseName: string,
  sets: WorkoutSet[],
  date: string
): PersonalRecord[] {
  // Find best set in this workout
  let bestSet1RM = 0
  let totalVolume = 0

  sets.forEach(set => {
    if (set.completed && set.weight && set.reps) {
      const oneRepMax = calculateOneRepMax(set.weight, set.reps)
      if (oneRepMax > bestSet1RM) {
        bestSet1RM = oneRepMax
      }
      totalVolume += set.weight * set.reps
    }
  })

  if (bestSet1RM === 0 && totalVolume === 0) return currentRecords

  const existingRecordIndex = currentRecords.findIndex(r => r.exerciseName.toLowerCase() === exerciseName.toLowerCase())

  if (existingRecordIndex === -1) {
    // New Record
    const newRecord: PersonalRecord = {
      id: crypto.randomUUID(),
      exerciseName,
      oneRepMax: bestSet1RM,
      maxVolume: totalVolume,
      lastUpdated: date,
      history: [{
        date,
        oneRepMax: bestSet1RM,
        volume: totalVolume
      }]
    }
    return [...currentRecords, newRecord]
  }

  // Update Existing Record
  const existingRecord = currentRecords[existingRecordIndex]
  const isNewMax = bestSet1RM > existingRecord.oneRepMax
  const isNewVolume = totalVolume > existingRecord.maxVolume

  // Add to history
  const newHistory = [
    ...existingRecord.history,
    { date, oneRepMax: bestSet1RM, volume: totalVolume }
  ]

  const updatedRecord: PersonalRecord = {
    ...existingRecord,
    oneRepMax: isNewMax ? bestSet1RM : existingRecord.oneRepMax,
    maxVolume: isNewVolume ? totalVolume : existingRecord.maxVolume,
    lastUpdated: date,
    history: newHistory
  }

  const newRecords = [...currentRecords]
  newRecords[existingRecordIndex] = updatedRecord
  return newRecords
}

export function getPersonalRecord(records: PersonalRecord[], exerciseName: string): PersonalRecord | undefined {
  return records.find(r => r.exerciseName.toLowerCase() === exerciseName.toLowerCase())
}
