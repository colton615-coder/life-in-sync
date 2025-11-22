import { GolfClub, SwingAnalysis } from '@/lib/types'

export type GolfSwingState =
  | { status: 'IDLE' }
  | { status: 'SELECTING_CLUB'; file: File }
  | { status: 'ANALYZING'; file: File; club: GolfClub | null; progress: number; step: string }
  | { status: 'VIEWING_RESULT'; analysis: SwingAnalysis }
  | { status: 'ERROR'; message: string; error?: unknown }
