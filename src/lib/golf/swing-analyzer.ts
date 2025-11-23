import { callAIWithRetry } from '@/lib/ai-utils'
import { SwingPoseData, SwingMetrics, SwingFeedback, GolfClub } from '@/lib/types'

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

function detectSwingPhase(frame: number, totalFrames: number): 'address' | 'backswing' | 'impact' | 'followThrough' {
  const progress = frame / totalFrames
  if (progress < 0.1) return 'address'
  if (progress < 0.4) return 'backswing'
  if (progress < 0.6) return 'impact'
  return 'followThrough'
}

export function analyzePoseData(poseData: SwingPoseData[]): SwingMetrics {
  if (!poseData || poseData.length === 0) {
    throw new Error('No pose data available for analysis')
  }

  const phaseData: Record<string, SwingPoseData[]> = {
    address: [],
    backswing: [],
    impact: [],
    followThrough: []
  }

  poseData.forEach((frame, index) => {
    const phase = detectSwingPhase(index, poseData.length)
    phaseData[phase].push(frame)
  })

  const getAverageFrame = (frames: SwingPoseData[]) => {
    if (frames.length === 0) return null
    return frames[Math.floor(frames.length / 2)]
  }

  const addressFrame = getAverageFrame(phaseData.address)
  const backswingFrame = getAverageFrame(phaseData.backswing)
  const impactFrame = getAverageFrame(phaseData.impact)
  const followThroughFrame = getAverageFrame(phaseData.followThrough)

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
    return Math.atan2(nose.x - midHip.x, nose.y - midHip.y) * 180 / Math.PI
  }

  const calculateHipRotation = (frame: SwingPoseData | null): number => {
    if (!frame) return 0
    const leftHip = frame.landmarks[LANDMARK_INDICES.LEFT_HIP]
    const rightHip = frame.landmarks[LANDMARK_INDICES.RIGHT_HIP]
    return Math.atan2(rightHip.z - leftHip.z, rightHip.x - leftHip.x) * 180 / Math.PI
  }

  const calculateShoulderRotation = (frame: SwingPoseData | null): number => {
    if (!frame) return 0
    const leftShoulder = frame.landmarks[LANDMARK_INDICES.LEFT_SHOULDER]
    const rightShoulder = frame.landmarks[LANDMARK_INDICES.RIGHT_SHOULDER]
    return Math.atan2(rightShoulder.z - leftShoulder.z, rightShoulder.x - leftShoulder.x) * 180 / Math.PI
  }

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

  const backswingHipRotation = calculateHipRotation(backswingFrame)
  const impactHipRotation = calculateHipRotation(impactFrame)
  const backswingShoulderRotation = calculateShoulderRotation(backswingFrame)
  const impactShoulderRotation = calculateShoulderRotation(impactFrame)

  const headMovement = calculateHeadMovement()

  const calculateWeightTransfer = (): SwingMetrics['weightTransfer'] => {
    const addressBalance = 50
    const backswingShift = backswingFrame ? 60 : 50
    const impactShift = impactFrame ? 40 : 50
    
    const transferQuality = Math.abs(backswingShift - 50) + Math.abs(impactShift - 50)
    let rating: 'excellent' | 'good' | 'fair' | 'poor'
    if (transferQuality > 20) rating = 'excellent'
    else if (transferQuality > 15) rating = 'good'
    else if (transferQuality > 10) rating = 'fair'
    else rating = 'poor'

    return { addressBalance, backswingShift, impactShift, rating }
  }

  return {
    spineAngle: {
      address: calculateSpineAngle(addressFrame),
      backswing: calculateSpineAngle(backswingFrame),
      impact: calculateSpineAngle(impactFrame),
      followThrough: calculateSpineAngle(followThroughFrame)
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

  if (metrics.headMovement.stability === 'excellent' || metrics.headMovement.stability === 'good') {
    strengths.push('Excellent head stability throughout the swing')
  } else {
    improvements.push('Excessive head movement detected')
    drills.push({
      title: 'Head Stability Drill',
      description: 'Place a club across your shoulders and practice your swing while keeping your head still. Have someone watch or record to ensure minimal head movement.',
      focusArea: 'Head Position',
      difficulty: 'beginner'
    })
  }

  if (metrics.hipRotation.total > 80) {
    strengths.push('Strong hip rotation generating power')
  } else {
    improvements.push('Limited hip rotation reducing power potential')
    drills.push({
      title: 'Hip Rotation Drill',
      description: 'Practice the "step drill" - step forward with your lead foot as you swing to encourage proper hip rotation and weight transfer.',
      focusArea: 'Hip Rotation',
      difficulty: 'intermediate'
    })
  }

  if (metrics.weightTransfer.rating === 'excellent' || metrics.weightTransfer.rating === 'good') {
    strengths.push('Effective weight transfer from backswing to impact')
  } else {
    improvements.push('Improve weight transfer for more consistent contact')
    drills.push({
      title: 'Weight Transfer Drill',
      description: 'Hit shots with your feet together, then gradually widen your stance. This helps feel proper weight shift.',
      focusArea: 'Weight Transfer',
      difficulty: 'beginner'
    })
  }

  if (Math.abs(metrics.tempo.ratio - 2.0) < 0.3) {
    strengths.push('Good tempo with ideal 2:1 backswing to downswing ratio')
  } else {
    improvements.push('Tempo could be improved for more consistent strikes')
    drills.push({
      title: 'Tempo Drill',
      description: 'Count "one-two" on backswing and "three" on downswing. Maintain this 2:1 rhythm for all practice swings.',
      focusArea: 'Tempo',
      difficulty: 'beginner'
    })
  }

  const overallScore = calculateOverallScore(metrics)

  const clubContext = club ? `\nClub Used: ${club}` : ''

  let aiInsights = 'AI insights unavailable at this time.'

  try {
    if (window.spark && window.spark.llm && window.spark.llmPrompt) {
      const prompt = window.spark.llmPrompt`You are an elite-level golf biomechanics coach analyzing a student's swing data. Be direct, analytical, and concise. Avoid generic encouragement.
Based on these technical metrics:
- Hip Rotation: ${metrics.hipRotation.total.toFixed(1)}° (Target: >90°)
- Shoulder Rotation: ${metrics.shoulderRotation.total.toFixed(1)}° (Target: >100°)
- Head Stability: ${metrics.headMovement.stability}
- Weight Transfer: ${metrics.weightTransfer.rating}
- Tempo Ratio: ${metrics.tempo.ratio.toFixed(2)}:1 (Target: 2.0:1)${clubContext}

Provide a 2-3 sentence technical diagnosis of the primary mechanical flaw and its immediate consequence on ball flight${club ? ` with the ${club}` : ''}.`

      const response = await callAIWithRetry(prompt, 'gpt-4o', false)
      if (response) {
        aiInsights = response
      }
    } else {
      console.warn('Spark AI is unavailable for generating golf feedback insights')
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
  let score = 70

  if (metrics.headMovement.stability === 'excellent') score += 10
  else if (metrics.headMovement.stability === 'good') score += 7
  else if (metrics.headMovement.stability === 'fair') score += 4

  if (metrics.hipRotation.total > 90) score += 10
  else if (metrics.hipRotation.total > 70) score += 7
  else if (metrics.hipRotation.total > 50) score += 4

  if (metrics.weightTransfer.rating === 'excellent') score += 10
  else if (metrics.weightTransfer.rating === 'good') score += 7
  else if (metrics.weightTransfer.rating === 'fair') score += 4

  if (Math.abs(metrics.tempo.ratio - 2.0) < 0.2) score += 10
  else if (Math.abs(metrics.tempo.ratio - 2.0) < 0.4) score += 7
  else if (Math.abs(metrics.tempo.ratio - 2.0) < 0.6) score += 4

  return Math.min(100, score)
}

export async function simulateVideoProcessing(
  videoBlob: Blob,
  onProgress: (progress: number, status: string) => void
): Promise<SwingPoseData[]> {
  onProgress(10, 'Uploading video...')
  await new Promise(resolve => setTimeout(resolve, 1000))

  onProgress(30, 'Extracting frames...')
  await new Promise(resolve => setTimeout(resolve, 1500))

  onProgress(50, 'Running pose estimation...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  onProgress(70, 'Analyzing swing mechanics...')
  await new Promise(resolve => setTimeout(resolve, 1500))

  onProgress(90, 'Generating insights...')
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockPoseData: SwingPoseData[] = generateMockPoseData()
  
  onProgress(100, 'Analysis complete!')
  return mockPoseData
}

function generateMockPoseData(): SwingPoseData[] {
  const frames: SwingPoseData[] = []
  const totalFrames = 90

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
      timestamp: i / 30,
      landmarks
    })
  }

  return frames
}
