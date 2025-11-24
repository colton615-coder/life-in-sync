import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ChevronLeft, BarChart3, SkipForward, SkipBack } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SwingAnalysis, SwingPoseData } from '@/lib/types'
import { VideoPlayerContainer, VideoPlayerController } from '@/components/VideoPlayerContainer'
import { calculateInstantaneousMetrics, InstantMetrics } from '@/lib/golf/swing-analyzer'
import { PhaseList } from '@/components/golf/PhaseList'

/**
 * AnalysisCockpit
 * Redesigned for iPhone 16 Vertical Layout (No Scroll).
 *
 * Layout:
 * - Full Screen Container (100dvh)
 * - Zone A: Video (Flex Grow - Dominant)
 *   - Video fills available space above the fold.
 *   - Scrubber overlay at bottom of video or immediately below.
 * - Zone B: Data (Compact)
 *   - Phase list takes remaining space.
 *   - Internal scrolling only.
 */

interface AnalysisCockpitProps {
  analysis: SwingAnalysis
  onBack: () => void
}

export function AnalysisCockpit({ analysis, onBack }: AnalysisCockpitProps) {
  // -- STATE --
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // We still calculate instant metrics for internal logic if needed,
  // but the primary display is now the PhaseList
  const [instantMetrics, setInstantMetrics] = useState<InstantMetrics | null>(null)

  const videoControllerRef = useRef<VideoPlayerController>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  // -- DERIVED --
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // -- HANDLERS --
  const handleTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time)
    setDuration(dur)

    if (analysis.poseData) {
      const frameIndex = Math.min(
        Math.floor((time / dur) * analysis.poseData.length),
        analysis.poseData.length - 1
      )
      const frame = analysis.poseData[frameIndex]
      if (frame) {
        setInstantMetrics(calculateInstantaneousMetrics(frame))
      }
    }
  }

  const handleScrubStart = (e: React.PointerEvent) => {
    setIsPlaying(false)
    handleScrubMove(e)
    // Add global listeners for drag
    window.addEventListener('pointermove', handleGlobalScrub)
    window.addEventListener('pointerup', handleScrubEnd)
  }

  const handleGlobalScrub = (e: PointerEvent) => {
    if (!scrubberRef.current) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const pct = x / rect.width
    if (videoControllerRef.current && duration) {
      videoControllerRef.current.seek(pct * duration)
    }
  }

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!scrubberRef.current) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const pct = x / rect.width
    if (videoControllerRef.current && duration) {
      videoControllerRef.current.seek(pct * duration)
    }
  }

  const handleScrubEnd = () => {
    window.removeEventListener('pointermove', handleGlobalScrub)
    window.removeEventListener('pointerup', handleScrubEnd)
  }

  const handlePhaseSelect = (timestamp: number) => {
    if (videoControllerRef.current && duration) {
        videoControllerRef.current.seek(timestamp)
    }
  }

  // Skip buttons
  const skip = (seconds: number) => {
      if (videoControllerRef.current) {
          const t = videoControllerRef.current.getCurrentTime() + seconds
          videoControllerRef.current.seek(t)
      }
  }

  // -- RENDER --
  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#0B0E14] text-slate-200 font-sans overflow-hidden">

      {/* HEADER / NAV (Absolute Top Left) */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white hover:bg-white/10 transition-colors shadow-lg"
      >
        <ChevronLeft size={20} />
      </button>

      {/* ZONE A: VISUAL VIEWPORT (Dominant) */}
      <section className="flex-1 min-h-0 bg-black relative flex flex-col">
        {analysis.videoUrl && (
            <VideoPlayerContainer
                videoUrl={analysis.videoUrl}
                poseData={analysis.poseData}
                showOverlay={true}
                onToggleOverlay={() => {}}
                controls={false}
                className="w-full h-full"
                isPlaying={isPlaying}
                onPlaybackStatusChange={setIsPlaying}
                onTimeUpdate={handleTimeUpdate}
                controllerRef={videoControllerRef}
            />
        )}

        {/* Floating Minimal Controls (Bottom of Video) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-40">
             {/* Scrubber */}
            <div
                className="relative w-full h-8 flex items-center mb-2 touch-none cursor-pointer group"
                ref={scrubberRef}
                onPointerDown={handleScrubStart}
            >
                {/* Track Background */}
                <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm transition-all group-hover:h-1.5">
                    {/* Progress Fill */}
                    <motion.div
                    className="h-full bg-[#2E8AF7] shadow-[0_0_10px_#2E8AF7]"
                    style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Thumb */}
                <motion.div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-grab active:cursor-grabbing border-2 border-[#0B0E14] z-10 flex items-center justify-center top-1/2 -translate-y-1/2"
                    style={{ left: `${progress}%`, x: '-50%' }}
                />
            </div>

            {/* Transport Row */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{currentTime.toFixed(2)}s</span>

                <div className="flex items-center gap-6">
                    <button onClick={() => skip(-1)} className="p-2 hover:text-white transition-colors"><SkipBack size={16} /></button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 rounded-full bg-[#2E8AF7] text-white shadow-[0_0_20px_rgba(46,138,247,0.4)] active:scale-95 transition-transform"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                    <button onClick={() => skip(1)} className="p-2 hover:text-white transition-colors"><SkipForward size={16} /></button>
                </div>

                <span>{duration.toFixed(2)}s</span>
            </div>
        </div>
      </section>

      {/* ZONE B: PHASE LIST (Remaining Vertical Space) */}
      {/*
         On iPhone 16, vertical space is premium.
         We cap height at roughly 35-40% max to ensure video stays large,
         or just let flex take over but ensure min-height for usability.
      */}
      <section className="h-[40%] flex-shrink-0 bg-[#0B0E14] border-t border-white/10 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30">

        {/* Header */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#151925]/50 backdrop-blur">
            <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-[#2E8AF7]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Swing Phases</span>
            </div>
            {/* Overall Score Badge */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">Score</span>
                <span className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded border bg-black/40",
                    (analysis.feedback?.overallScore || 0) >= 80 ? "text-emerald-400 border-emerald-500/30" : "text-[#2E8AF7] border-[#2E8AF7]/30"
                )}>
                    {analysis.feedback?.overallScore || 0}
                </span>
            </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {analysis.metrics ? (
                <PhaseList
                    metrics={analysis.metrics}
                    currentTimestamp={currentTime}
                    onSelectPhase={handlePhaseSelect}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    Processing Swing Data...
                </div>
            )}
        </div>
      </section>
    </div>
  )
}
