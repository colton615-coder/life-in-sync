import { SwingPoseData, SwingMetrics, SwingFeedback, GolfClub, PhaseMetric } from '@/lib/types'
import { SwingVideoProcessor } from './video-processor'
import { GeminiCore } from '@/services/gemini_core'
import { z } from 'zod'

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

// Zod Schema for Golf Feedback
const PhaseAnalysisSchema = z.object({
    analysis: z.string(),
    tips: z.array(z.string()),
    drills: z.array(z.string())
});

const FeedbackResponseSchema = z.object({
    aiInsights: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    phases: z.object({
        address: PhaseAnalysisSchema.optional(),
        takeaway: PhaseAnalysisSchema.optional(),
        backswing: PhaseAnalysisSchema.optional(),
        top: PhaseAnalysisSchema.optional(),
        downswing: PhaseAnalysisSchema.optional(),
        impact: PhaseAnalysisSchema.optional(),
        followThrough: PhaseAnalysisSchema.optional(),
        finish: PhaseAnalysisSchema.optional(),
    })
});


// Updated to 8 phases
function detectSwingPhase(frame: number, totalFrames: number): string {
  const progress = frame / totalFrames

  // Heuristic phase detection based on generic swing timing
  // TODO: In the future, this should use velocity/position triggers from the landmarks
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

  // --- Helper Calculation Functions ---

  // Use World Landmarks (meters) if available for accurate 3D angles, fallback to screen landmarks
  const getLandmarks = (frame: SwingPoseData) => frame.worldLandmarks && frame.worldLandmarks.length > 0 ? frame.worldLandmarks : frame.landmarks

  const calculateSpineAngle = (frame: SwingPoseData | null): number => {
    if (!frame) return 0
    const lm = getLandmarks(frame)
    const nose = lm[LANDMARK_INDICES.NOSE]
    const leftHip = lm[LANDMARK_INDICES.LEFT_HIP]
    const rightHip = lm[LANDMARK_INDICES.RIGHT_HIP]

    // Midpoint of hips
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2
    }

    // In 2D projection (X/Y), angle relative to vertical
    // Note: World y points down? MediaPipe World y points up?
    // MediaPipe World: Y is gravity aligned (up/down).
    // MediaPipe Screen: Y is down.
    // We'll stick to 2D projection logic for Spine Angle as it's usually viewed 'face on' or 'down line'.
    // If using World, Y is vertical.

    const dy = nose.y - midHip.y
    const dx = nose.x - midHip.x

    // Angle from vertical.
    // If upright, dx is 0.
    return Math.abs(Math.atan2(dx, dy) * 180 / Math.PI)
  }

  const calculateRotation = (frame: SwingPoseData | null, index1: number, index2: number): number => {
    if (!frame) return 0
    const lm = getLandmarks(frame)
    const p1 = lm[index1]
    const p2 = lm[index2]

    // Rotation in the transverse plane (top-down view)
    // We look at X and Z.
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
      // Ideal spine angle is slightly forward tilted, but variable.
      // Let's assume stability check.
      const score = angle > 5 && angle < 40 ? 95 : 60
      return { label: 'Spine Angle', value: `${angle.toFixed(1)}°`, score }
    }),
    takeaway: createPhaseMetric('Takeaway', frames.takeaway, () => {
      const rotation = calculateShoulderRotation(frames.takeaway)
      const score = rotation > 20 ? 90 : 50
      return { label: 'Shldr Rotation', value: `${rotation.toFixed(1)}°`, score }
    }),
    backswing: createPhaseMetric('Backswing', frames.backswing, () => {
      const rotation = calculateHipRotation(frames.backswing)
      const score = rotation > 30 ? 92 : 65
      return { label: 'Hip Turn', value: `${rotation.toFixed(1)}°`, score }
    }),
    top: createPhaseMetric('Top', frames.top, () => {
      const rotation = calculateShoulderRotation(frames.top)
      const score = rotation > 80 ? 95 : 70
      return { label: 'Max Rotation', value: `${rotation.toFixed(1)}°`, score }
    }),
    downswing: createPhaseMetric('Downswing', frames.downswing, () => {
      const score = 85 // Placeholder for velocity metric
      return { label: 'Sequence', value: 'Good', score }
    }),
    impact: createPhaseMetric('Impact', frames.impact, () => {
      const angle = calculateSpineAngle(frames.impact)
      const addressAngle = frames.address ? calculateSpineAngle(frames.address) : angle
      const diff = Math.abs(angle - addressAngle)
      const score = diff < 10 ? 95 : 60
      return { label: 'Spine Retention', value: `${angle.toFixed(1)}°`, score }
    }),
    followThrough: createPhaseMetric('Follow Through', frames.followThrough, () => {
      const rotation = calculateShoulderRotation(frames.followThrough)
      const score = rotation > 80 ? 90 : 60
      return { label: 'Extension', value: `${rotation.toFixed(1)}°`, score }
    }),
    finish: createPhaseMetric('Finish', frames.finish, () => {
       const balance = 95 // Placeholder
       return { label: 'Balance', value: 'Stable', score: balance }
    })
  }

  // Legacy Metrics
  const backswingHipRotation = calculateHipRotation(frames.backswing)
  const impactHipRotation = calculateHipRotation(frames.impact)
  const backswingShoulderRotation = calculateShoulderRotation(frames.backswing)
  const impactShoulderRotation = calculateShoulderRotation(frames.impact)

  const calculateHeadMovement = (): { lateral: number; vertical: number; stability: 'excellent' | 'good' | 'fair' | 'poor' } => {
    // Use raw landmarks for simple pixel-space or normalized movement check
    const nosePositions = poseData.map(frame => frame.landmarks[LANDMARK_INDICES.NOSE])
    const lateralMovement = Math.max(...nosePositions.map(p => p.x)) - Math.min(...nosePositions.map(p => p.x))
    const verticalMovement = Math.max(...nosePositions.map(p => p.y)) - Math.min(...nosePositions.map(p => p.y))
    
    // Thresholds need tuning for normalized coordinates (0-1)
    // 0.05 is 5% of screen width/height
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
    // Placeholder logic - requires pressure mat or complex kinematic inference
    return { addressBalance: 50, backswingShift: 60, impactShift: 40, rating: 'good' }
  }

  return {
    phases,
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
      backswingTime: poseData.length * 0.4 / 30, // Mock timing
      downswingTime: poseData.length * 0.2 / 30,
      ratio: 2.0
    },
    weightTransfer: calculateWeightTransfer()
  }
}

export interface PhaseDetails {
  aiAnalysis: string
  tips: string[]
  drills: string[]
}

export type PhaseFeedbackMap = Record<string, PhaseDetails>

export interface ExtendedFeedback {
  globalFeedback: SwingFeedback
  phaseDetails: PhaseFeedbackMap
}

export async function generateFeedback(metrics: SwingMetrics, club: GolfClub | null = null): Promise<ExtendedFeedback> {
  const strengths: string[] = []
  const improvements: string[] = []
  const drills: SwingFeedback['drills'] = []

  const overallScore = calculateOverallScore(metrics)

  // Basic Rule-Based Feedback
  if (metrics.headMovement.stability === 'excellent') strengths.push('Excellent head stability')
  if (metrics.phases.impact.score < 70) improvements.push('Loss of spine angle at impact')

  let aiInsights = 'AI analysis initialized.'
  let phaseDetails: PhaseFeedbackMap = {}

  try {
      const prompt = `You are an elite golf coach analyzing a student's swing.

      METRICS:
      - Club: ${club || 'Unknown'}
      - Overall Score: ${overallScore}/100
      - Head Stability: ${metrics.headMovement.stability}
      - Impact Score: ${metrics.phases.impact.score}

      PHASE DATA:
      1. Address: ${metrics.phases.address.keyMetric.label} = ${metrics.phases.address.keyMetric.value} (Score: ${metrics.phases.address.score})
      2. Takeaway: ${metrics.phases.takeaway.keyMetric.label} = ${metrics.phases.takeaway.keyMetric.value} (Score: ${metrics.phases.takeaway.score})
      3. Backswing: ${metrics.phases.backswing.keyMetric.label} = ${metrics.phases.backswing.keyMetric.value} (Score: ${metrics.phases.backswing.score})
      4. Top: ${metrics.phases.top.keyMetric.label} = ${metrics.phases.top.keyMetric.value} (Score: ${metrics.phases.top.score})
      5. Downswing: ${metrics.phases.downswing.keyMetric.label} = ${metrics.phases.downswing.keyMetric.value} (Score: ${metrics.phases.downswing.score})
      6. Impact: ${metrics.phases.impact.keyMetric.label} = ${metrics.phases.impact.keyMetric.value} (Score: ${metrics.phases.impact.score})
      7. Follow Through: ${metrics.phases.followThrough.keyMetric.label} = ${metrics.phases.followThrough.keyMetric.value} (Score: ${metrics.phases.followThrough.score})
      8. Finish: ${metrics.phases.finish.keyMetric.label} = ${metrics.phases.finish.keyMetric.value} (Score: ${metrics.phases.finish.score})

      TASK:
      Provide a JSON response with the following structure. NO markdown formatting, just raw JSON.
      {
        "aiInsights": "A concise, 2-sentence summary of the swing.",
        "strengths": ["string", "string"],
        "improvements": ["string", "string"],
        "phases": {
           "address": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "takeaway": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "backswing": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "top": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "downswing": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "impact": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "followThrough": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] },
           "finish": { "analysis": "string", "tips": ["string", "string"], "drills": ["string"] }
        }
      }`;

      const gemini = new GeminiCore();
      const parsed = await gemini.generateJSON(prompt, FeedbackResponseSchema);

      aiInsights = parsed.aiInsights || aiInsights
      if (Array.isArray(parsed.strengths)) strengths.push(...parsed.strengths)
      if (Array.isArray(parsed.improvements)) improvements.push(...parsed.improvements)

      if (parsed.phases) {
         // Map AI response keys to internal interface
         phaseDetails = Object.entries(parsed.phases).reduce((acc, [key, val]) => {
             if (val) {
                acc[key] = {
                    aiAnalysis: val.analysis || val.aiAnalysis || '',
                    tips: val.tips || [],
                    drills: val.drills || []
                }
             }
             return acc
         }, {} as PhaseFeedbackMap)
      }

  } catch (error) {
    console.warn('AI Feedback unavailable', error)
  }

  return {
    globalFeedback: {
        overallScore,
        strengths: Array.from(new Set(strengths)), // Dedup
        improvements: Array.from(new Set(improvements)),
        drills,
        aiInsights
    },
    phaseDetails
  }
}

function calculateOverallScore(metrics: SwingMetrics): number {
  const phaseScores = Object.values(metrics.phases).map(p => p.score)
  if (phaseScores.length === 0) return 0
  return Math.round(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length)
}

/**
 * processVideo
 *
 * Replaces the old simulation. Uses the real SwingVideoProcessor to
 * extract pose data from the video file.
 */
export async function processVideo(
  videoFile: File,
  onProgress: (progress: number, status: string) => void
): Promise<SwingPoseData[]> {
   const processor = new SwingVideoProcessor()
   return processor.processVideo(videoFile, onProgress)
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

  const lm = frame.worldLandmarks && frame.worldLandmarks.length > 0 ? frame.worldLandmarks : frame.landmarks
  const get = (idx: number) => lm[idx]

  const nose = get(LANDMARK_INDICES.NOSE)
  const leftHip = get(LANDMARK_INDICES.LEFT_HIP)
  const rightHip = get(LANDMARK_INDICES.RIGHT_HIP)
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2
  }

  // 2D Spine Angle
  const dy = nose.y - midHip.y
  const dx = nose.x - midHip.x
  const spineAngle = Math.abs(Math.atan2(dx, dy) * 180 / Math.PI)

  // 3D Rotations (Transverse Plane)
  const hipRotation = Math.abs(Math.atan2(rightHip.z - leftHip.z, rightHip.x - leftHip.x) * 180 / Math.PI)

  const leftShoulder = get(LANDMARK_INDICES.LEFT_SHOULDER)
  const rightShoulder = get(LANDMARK_INDICES.RIGHT_SHOULDER)
  const shoulderRotation = Math.abs(Math.atan2(rightShoulder.z - leftShoulder.z, rightShoulder.x - leftShoulder.x) * 180 / Math.PI)

  return {
    spineAngle,
    hipRotation,
    shoulderRotation,
    headPosition: { x: frame.landmarks[LANDMARK_INDICES.NOSE].x, y: frame.landmarks[LANDMARK_INDICES.NOSE].y }
  }
}
