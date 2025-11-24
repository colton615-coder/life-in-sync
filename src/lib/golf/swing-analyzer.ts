import { callAIWithRetry } from '@/lib/ai-utils'
import { SwingPoseData, SwingMetrics, SwingFeedback, GolfClub, PhaseMetric } from '@/lib/types'

interface MediaPipeLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
}

// Updated to 8 phases
function detectSwingPhase(frame: number, totalFrames: number): string {
  const progress = frame / totalFrames

  // Heuristic phase detection based on generic swing timing
  if (progress < 0.10) return 'address'
  if (progress < 0.20) return 'takeaway'
  if (progress < 0.40) return 'backswing'
  if (progress < 0.45) return 'top'
  if (progress < 0.55) return 'downswing'
  if (progress < 0.60) return 'impact'
  if (progress < 0.75) return 'followThrough'
  return 'finish'
}

export function analyzePoseData(poseData: SwingPoseData[]): SwingMetrics {
  if (!poseData || poseData.length === 0) {
    throw new Error('No pose data available for analysis')
  }

  const phaseFrames: Record<string, SwingPoseData[]> = {
    address: [],
    takeaway: [],
    backswing: [],
    top: [],
    downswing: [],
    impact: [],
    followThrough: [],
    finish: []
  }

  poseData.forEach((frame, index) => {
    const phase = detectSwingPhase(index, poseData.length)
    if (phaseFrames[phase]) {
      phaseFrames[phase].push(frame)
    }
  })

  const getRepresentativeFrame = (frames: SwingPoseData[]) => {
    if (frames.length === 0) return null
    // Use the middle frame of the phase as representative
    return frames[Math.floor(frames.length / 2)]
  }

  const frames = {
    address: getRepresentativeFrame(phaseFrames.address),
    takeaway: getRepresentativeFrame(phaseFrames.takeaway),
    backswing: getRepresentativeFrame(phaseFrames.backswing),
    top: getRepresentativeFrame(phaseFrames.top),
    downswing: getRepresentativeFrame(phaseFrames.downswing),
    impact: getRepresentativeFrame(phaseFrames.impact),
    followThrough: getRepresentativeFrame(phaseFrames.followThrough),
    finish: getRepresentativeFrame(phaseFrames.finish)
  }

  // Helper Calculation Functions
  const calculateSpineAngle = (frame: SwingPoseData | null): number => {
    if (!frame) return 0
    const nose = frame.landmarks[LANDMARK_INDICES.NOSE]
    const leftHip = frame.landmarks[LANDMARK_INDICES.LEFT_HIP]
    const rightHip = frame.landmarks[LANDMARK_INDICES.RIGHT_HIP]
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2,
      visibility: 1
    }
    // Invert to standard vertical spine angle (0 = vertical)
    return Math.abs(Math.atan2(nose.x - midHip.x, nose.y - midHip.y) * 180 / Math.PI)
  }

  const calculateRotation = (frame: SwingPoseData | null, index1: number, index2: number): number => {
    if (!frame) return 0
    const p1 = frame.landmarks[index1]
    const p2 = frame.landmarks[index2]
    // Simple 2D projection rotation
    return Math.abs(Math.atan2(p2.z - p1.z, p2.x - p1.x) * 180 / Math.PI)
  }

  const calculateHipRotation = (frame: SwingPoseData | null) =>
    calculateRotation(frame, LANDMARK_INDICES.LEFT_HIP, LANDMARK_INDICES.RIGHT_HIP)

  const calculateShoulderRotation = (frame: SwingPoseData | null) =>
    calculateRotation(frame, LANDMARK_INDICES.LEFT_SHOULDER, LANDMARK_INDICES.RIGHT_SHOULDER)

  // --- Phase Metric Generators ---

  const createPhaseMetric = (
    name: string,
    frame: SwingPoseData | null,
    metricFn: () => { label: string, value: string, score: number }
  ): PhaseMetric => {
    if (!frame) {
      return {
        name,
        timestamp: 0,
        score: 0,
        status: 'poor',
        keyMetric: { label: 'No Data', value: '--' },
        valid: false
      }
    }

    const metric = metricFn()
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'poor'
    if (metric.score >= 90) status = 'excellent'
    else if (metric.score >= 75) status = 'good'
    else if (metric.score >= 60) status = 'fair'

    return {
      name,
      timestamp: frame.timestamp,
      score: metric.score,
      status,
      keyMetric: {
        label: metric.label,
        value: metric.value
      },
      valid: true
    }
  }

  const phases = {
    address: createPhaseMetric('Address', frames.address, () => {
      const angle = calculateSpineAngle(frames.address)
      const score = angle > 10 && angle < 30 ? 95 : 60
      return { label: 'Spine Angle', value: `${angle.toFixed(1)}°`, score }
    }),
    takeaway: createPhaseMetric('Takeaway', frames.takeaway, () => {
      const rotation = calculateShoulderRotation(frames.takeaway)
      const score = rotation > 20 ? 90 : 50
      return { label: 'Shldr Rotation', value: `${rotation.toFixed(1)}°`, score }
    }),
    backswing: createPhaseMetric('Backswing', frames.backswing, () => {
      const rotation = calculateHipRotation(frames.backswing)
      const score = rotation > 35 ? 92 : 65
      return { label: 'Hip Turn', value: `${rotation.toFixed(1)}°`, score }
    }),
    top: createPhaseMetric('Top', frames.top, () => {
      const rotation = calculateShoulderRotation(frames.top)
      const score = rotation > 85 ? 95 : 70
      return { label: 'Max Rotation', value: `${rotation.toFixed(1)}°`, score }
    }),
    downswing: createPhaseMetric('Downswing', frames.downswing, () => {
      const score = 85 // Mock score for acceleration
      return { label: 'Sequence', value: 'Good', score }
    }),
    impact: createPhaseMetric('Impact', frames.impact, () => {
      const angle = calculateSpineAngle(frames.impact)
      const score = Math.abs(angle - (frames.address ? calculateSpineAngle(frames.address) : 0)) < 5 ? 95 : 60
      return { label: 'Spine Retention', value: `${angle.toFixed(1)}°`, score }
    }),
    followThrough: createPhaseMetric('Follow Through', frames.followThrough, () => {
      const rotation = calculateShoulderRotation(frames.followThrough)
      const score = rotation > 80 ? 90 : 60
      return { label: 'Extension', value: `${rotation.toFixed(1)}°`, score }
    }),
    finish: createPhaseMetric('Finish', frames.finish, () => {
       const balance = 95 // Mock balance score
       return { label: 'Balance', value: 'Stable', score: balance }
    })
  }

  // Legacy Metrics (Recalculated or Mapped)
  const backswingHipRotation = calculateHipRotation(frames.backswing)
  const impactHipRotation = calculateHipRotation(frames.impact)
  const backswingShoulderRotation = calculateShoulderRotation(frames.backswing)
  const impactShoulderRotation = calculateShoulderRotation(frames.impact)

  const calculateHeadMovement = (): { lateral: number; vertical: number; stability: 'excellent' | 'good' | 'fair' | 'poor' } => {
    const nosePositions = poseData.map(frame => frame.landmarks[LANDMARK_INDICES.NOSE])
    const lateralMovement = Math.max(...nosePositions.map(p => p.x)) - Math.min(...nosePositions.map(p => p.x))
    const verticalMovement = Math.max(...nosePositions.map(p => p.y)) - Math.min(...nosePositions.map(p => p.y))
    
    const totalMovement = lateralMovement + verticalMovement
    let stability: 'excellent' | 'good' | 'fair' | 'poor'
    if (totalMovement < 0.05) stability = 'excellent'
    else if (totalMovement < 0.1) stability = 'good'
    else if (totalMovement < 0.15) stability = 'fair'
    else stability = 'poor'

    return { lateral: lateralMovement, vertical: verticalMovement, stability }
  }

  const headMovement = calculateHeadMovement()

  const calculateWeightTransfer = (): SwingMetrics['weightTransfer'] => {
    const addressBalance = 50
    const backswingShift = frames.backswing ? 60 : 50
    const impactShift = frames.impact ? 40 : 50
    
    const transferQuality = Math.abs(backswingShift - 50) + Math.abs(impactShift - 50)
    let rating: 'excellent' | 'good' | 'fair' | 'poor'
    if (transferQuality > 20) rating = 'excellent'
    else if (transferQuality > 15) rating = 'good'
    else if (transferQuality > 10) rating = 'fair'
    else rating = 'poor'

    return { addressBalance, backswingShift, impactShift, rating }
  }

  return {
    phases, // New Logic
    spineAngle: {
      address: calculateSpineAngle(frames.address),
      backswing: calculateSpineAngle(frames.backswing),
      impact: calculateSpineAngle(frames.impact),
      followThrough: calculateSpineAngle(frames.followThrough)
    },
    hipRotation: {
      backswing: backswingHipRotation,
      impact: impactHipRotation,
      total: Math.abs(backswingHipRotation - impactHipRotation)
    },
    shoulderRotation: {
      backswing: backswingShoulderRotation,
      impact: impactShoulderRotation,
      total: Math.abs(backswingShoulderRotation - impactShoulderRotation)
    },
    headMovement,
    swingPlane: {
      backswingAngle: 45,
      downswingAngle: 47,
      consistency: 0.92
    },
    tempo: {
      backswingTime: poseData.length * 0.4 / 30,
      downswingTime: poseData.length * 0.2 / 30,
      ratio: 2.0
    },
    weightTransfer: calculateWeightTransfer()
  }
}

export async function generateFeedback(metrics: SwingMetrics, club: GolfClub | null = null): Promise<SwingFeedback> {
  const strengths: string[] = []
  const improvements: string[] = []
  const drills: SwingFeedback['drills'] = []

  // Use new Phase Metrics for simplified feedback logic
  const phaseValues = Object.values(metrics.phases)
  const lowScorePhases = phaseValues.filter(p => p.score < 70)

  if (metrics.headMovement.stability === 'excellent' || metrics.headMovement.stability === 'good') {
    strengths.push('Excellent head stability throughout the swing')
  } else {
    improvements.push('Excessive head movement detected')
  }

  if (metrics.phases.top.score > 90) {
    strengths.push('Excellent shoulder rotation at the top of the backswing')
  }

  if (metrics.phases.impact.score < 70) {
    improvements.push('Spine angle loss at impact detected')
    drills.push({
      title: 'Impact Bag Drill',
      description: 'Hit an impact bag to feel the proper body position at impact without worrying about ball flight.',
      focusArea: 'Impact',
      difficulty: 'beginner'
    })
  }

  const overallScore = calculateOverallScore(metrics)
  const clubContext = club ? `\nClub Used: ${club}` : ''
  let aiInsights = 'AI insights unavailable at this time.'

  try {
    if (window.spark && window.spark.llm && window.spark.llmPrompt) {
      const prompt = window.spark.llmPrompt`You are an elite-level golf biomechanics coach analyzing a student's swing data. Be direct, analytical, and concise.
Based on these technical metrics:
- Top Rotation Score: ${metrics.phases.top.score}/100
- Impact Position Score: ${metrics.phases.impact.score}/100
- Head Stability: ${metrics.headMovement.stability}
- Tempo Ratio: ${metrics.tempo.ratio.toFixed(2)}:1

Provide a 2-3 sentence technical diagnosis of the primary mechanical flaw.${clubContext}`

      const response = await callAIWithRetry(prompt, 'gpt-4o', false)
      if (response) {
        aiInsights = response
      }
    }
  } catch (error) {
    console.error('Failed to generate AI insights:', error)
  }

  return {
    overallScore,
    strengths,
    improvements,
    drills,
    aiInsights
  }
}

function calculateOverallScore(metrics: SwingMetrics): number {
  // Average of all phase scores
  const phaseScores = Object.values(metrics.phases).map(p => p.score)
  const avgPhaseScore = phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length

  // Weighted slightly by stability
  let stabilityBonus = 0
  if (metrics.headMovement.stability === 'excellent') stabilityBonus = 5

  return Math.min(100, Math.round(avgPhaseScore + stabilityBonus))
}

export async function simulateVideoProcessing(
  videoBlob: Blob,
  onProgress: (progress: number, status: string) => void
): Promise<SwingPoseData[]> {
  onProgress(10, 'Uploading video...')
  await new Promise(resolve => setTimeout(resolve, 800))

  onProgress(30, 'Extracting frames...')
  await new Promise(resolve => setTimeout(resolve, 800))

  onProgress(50, 'Identifying swing phases...')
  await new Promise(resolve => setTimeout(resolve, 800))

  onProgress(70, 'Analyzing kinematics...')
  await new Promise(resolve => setTimeout(resolve, 800))

  onProgress(90, 'Generating report cards...')
  await new Promise(resolve => setTimeout(resolve, 800))

  const mockPoseData: SwingPoseData[] = generateMockPoseData()
  
  onProgress(100, 'Analysis complete!')
  return mockPoseData
}

function generateMockPoseData(): SwingPoseData[] {
  const frames: SwingPoseData[] = []
  const totalFrames = 120 // Increased frame count for better phase resolution

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames
    const landmarks: MediaPipeLandmark[] = []

    for (let j = 0; j < 33; j++) {
      landmarks.push({
        x: 0.5 + Math.sin(progress * Math.PI * 2 + j) * 0.2,
        y: 0.5 + Math.cos(progress * Math.PI * 2 + j) * 0.2,
        z: Math.sin(progress * Math.PI + j) * 0.1,
        visibility: 0.9 + Math.random() * 0.1
      })
    }

    frames.push({
      timestamp: i / 30, // 30fps assumption
      landmarks
    })
  }

  return frames
}

export interface InstantMetrics {
  spineAngle: number
  hipRotation: number
  shoulderRotation: number
  headPosition: { x: number, y: number }
}

export function calculateInstantaneousMetrics(frame: SwingPoseData): InstantMetrics {
  if (!frame || !frame.landmarks) {
    return { spineAngle: 0, hipRotation: 0, shoulderRotation: 0, headPosition: { x: 0, y: 0 } }
  }

  const landmarks = frame.landmarks
  const get = (idx: number) => landmarks[idx]

  const nose = get(LANDMARK_INDICES.NOSE)
  const leftHip = get(LANDMARK_INDICES.LEFT_HIP)
  const rightHip = get(LANDMARK_INDICES.RIGHT_HIP)
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  }
  const spineAngle = Math.abs(Math.atan2(nose.x - midHip.x, nose.y - midHip.y) * 180 / Math.PI)
  const hipRotation = Math.abs(Math.atan2(rightHip.z - leftHip.z, rightHip.x - leftHip.x) * 180 / Math.PI)

  const leftShoulder = get(LANDMARK_INDICES.LEFT_SHOULDER)
  const rightShoulder = get(LANDMARK_INDICES.RIGHT_SHOULDER)
  const shoulderRotation = Math.abs(Math.atan2(rightShoulder.z - leftShoulder.z, rightShoulder.x - leftShoulder.x) * 180 / Math.PI)

  return {
    spineAngle,
    hipRotation,
    shoulderRotation,
    headPosition: { x: nose.x, y: nose.y }
  }
}
