import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ChevronLeft, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SwingAnalysis, SwingPoseData } from '@/lib/types'
import { VideoPlayerContainer, VideoPlayerController } from '@/components/VideoPlayerContainer'
import { calculateInstantaneousMetrics, InstantMetrics } from '@/lib/golf/swing-analyzer'
import { PhaseList } from '@/components/golf/PhaseList'

/**
 * AnalysisCockpit
 * The "Monolith" 2.0 UI for Golf Swing Analysis.
 *
 * Layout:
 * - Zone A (40%): Video Viewport
 * - Zone B (15%): Command Strip (Scrubber)
 * - Zone C (45%): Phase Card List (Sequential Flow)
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
        // The timestamp from PhaseMetric is relative (0.0 - 1.0) or absolute?
        // In swing-analyzer, timestamp is i/30 (seconds).
        // The video player expects seconds.
        // Let's check `swing-analyzer.ts`.
        // Yes, mock data uses `i / 30`. So it's absolute seconds.
        videoControllerRef.current.seek(timestamp)
    }
  }

  // -- RENDER --
  return (
    <div className="h-[100dvh] flex flex-col bg-[#0B0E14] text-slate-200 font-sans overflow-hidden relative">

      {/* Back Button (Absolute Overlay) */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {/* ZONE A: VISUAL VIEWPORT (40%) */}
      <section className="h-[40%] shrink-0 relative bg-black flex items-center justify-center border-b border-slate-800">
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

        {/* Minimal Playback Overlay (Center) */}
        <div className="absolute bottom-4 right-4 z-40">
            <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-[#2E8AF7]/10 backdrop-blur-md border border-[#2E8AF7]/30 text-[#2E8AF7] active:scale-95 transition-all hover:bg-[#2E8AF7]/20 shadow-[0_0_15px_rgba(46,138,247,0.2)]"
            >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
        </div>
      </section>

      {/* ZONE B: CONTROL RIBBON (15%) */}
      <section className="h-[15%] shrink-0 bg-[#0B0E14] border-b border-slate-800 flex flex-col justify-center px-4 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-30">

        {/* Scrubber Track */}
        <div
            className="relative w-full h-10 flex items-center mb-1 touch-none"
            ref={scrubberRef}
            onPointerDown={handleScrubStart}
        >
          {/* Track Background */}
          <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <motion.div
              className="h-full bg-[#2E8AF7] shadow-[0_0_10px_#2E8AF7]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Thumb / Scrubber Handle */}
          <motion.div
            className="absolute w-5 h-5 bg-slate-200 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-grab active:cursor-grabbing border-2 border-[#0B0E14] z-10 flex items-center justify-center"
            style={{ left: `${progress}%`, x: '-50%' }}
          >
              <div className="w-1.5 h-1.5 bg-[#0B0E14] rounded-full" />
          </motion.div>
        </div>

        {/* The Flattened "Jog Control" Interface */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span>{currentTime.toFixed(2)}s</span>

          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800 shadow-inner">
             <span className="text-[#2E8AF7] font-bold">JOG</span>
             {/* Visual-only jog strip for now */}
             <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-50" />
          </div>

          <span>{duration.toFixed(2)}s</span>
        </div>
      </section>

      {/* ZONE C: PHASE LIST (45%) */}
      <section className="flex-1 min-h-0 bg-[#0B0E14] flex flex-col">
        {/* Summary Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[#2E8AF7]" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Sequence Analysis</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">Overall Score</span>
                <span className={cn(
                    "text-sm font-mono font-bold px-2 py-0.5 rounded border bg-black/40",
                    (analysis.feedback?.overallScore || 0) >= 80 ? "text-emerald-400 border-emerald-500/30" : "text-[#2E8AF7] border-[#2E8AF7]/30"
                )}>
                    {analysis.feedback?.overallScore || 0}
                </span>
            </div>
        </div>

        {/* Phase List Component */}
        <div className="flex-1 min-h-0">
            {analysis.metrics ? (
                <PhaseList
                    metrics={analysis.metrics}
                    currentTimestamp={currentTime}
                    onSelectPhase={handlePhaseSelect}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    No metrics available
                </div>
            )}
        </div>
      </section>
    </div>
  )
}
