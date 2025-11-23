import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SwingAnalysis, SwingPoseData } from '@/lib/types'
import { VideoPlayerContainer, VideoPlayerController } from '@/components/VideoPlayerContainer'
import { calculateInstantaneousMetrics, InstantMetrics } from '@/lib/golf/swing-analyzer'

/**
 * AnalysisCockpit
 * The "Monolith" 2.0 UI for Golf Swing Analysis.
 *
 * Layout:
 * - Zone A (40%): Video Viewport
 * - Zone B (15%): Command Strip
 * - Zone C (45%): Telemetry Grid
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
  const [metrics, setMetrics] = useState<InstantMetrics | null>(null)

  const videoControllerRef = useRef<VideoPlayerController>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  // -- DERIVED --
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Mock faults if not present in analysis (using static zones for demo "2.0 feel")
  // In a real app, these would come from analysis.feedback.faults with timestamps
  const faults = useMemo(() => [
    { start: 0.4, end: 0.5, type: 'critical' as const, label: 'Early Ext.' },
    { start: 0.6, end: 0.7, type: 'warning' as const, label: 'Head Dip' }
  ], [])

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
        setMetrics(calculateInstantaneousMetrics(frame))
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

  // Determine if we are in a fault zone
  const activeFault = faults.find(f => {
    const t = currentTime / duration
    return t >= f.start && t <= f.end
  })

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
            {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
            </button>
        </div>
      </section>

      {/* ZONE B: CONTROL RIBBON (15%) */}
      <section className="h-[15%] shrink-0 bg-[#0B0E14] border-b border-slate-800 flex flex-col justify-center px-4 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-30">

        {/* The "Fault Line" Scrubber Track */}
        <div
            className="relative w-full h-10 flex items-center mb-1 touch-none"
            ref={scrubberRef}
            onPointerDown={handleScrubStart}
        >
          {/* Track Background */}
          <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full overflow-hidden">
            {/* Dynamic Fault Injection */}
            {faults.map((fault, idx) => (
              <div
                key={idx}
                className={cn("absolute h-full opacity-80", fault.type === 'critical' ? 'bg-red-500' : 'bg-orange-400')}
                style={{
                  left: `${fault.start * 100}%`,
                  width: `${(fault.end - fault.start) * 100}%`
                }}
              />
            ))}
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

      {/* ZONE C: TELEMETRY GRID (45%) */}
      <section className="flex-1 min-h-0 bg-[#0B0E14] overflow-y-auto no-scrollbar">
        {/* The "Bento Box" Grid - Zero Gaps */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 border-b border-slate-800">

          <DataCell
            label="Hip Rotation"
            value={metrics ? `${metrics.hipRotation.toFixed(0)}°` : '--'}
            status="neutral"
          />

          <DataCell
            label="Shoulder Turn"
            value={metrics ? `${metrics.shoulderRotation.toFixed(0)}°` : '--'}
            status={metrics && metrics.shoulderRotation > 90 ? 'good' : 'neutral'}
          />

          {/* Contextual Fault Display */}
          <div className={cn(
              "p-4 flex flex-col justify-center h-24 transition-colors duration-300",
              activeFault?.type === 'critical' ? "bg-red-500/10" : ""
          )}>
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">System Status</span>
             {activeFault ? (
                 <span className={cn("text-lg font-mono font-bold animate-pulse", activeFault.type === 'critical' ? "text-red-500" : "text-orange-400")}>
                     ⚠ {activeFault.label}
                 </span>
             ) : (
                 <span className="text-lg font-mono text-emerald-500">NOMINAL</span>
             )}
          </div>

          <DataCell
            label="Tempo"
            value={analysis.metrics ? `${analysis.metrics.tempo.ratio.toFixed(1)}:1` : '--'}
            status="neutral"
          />

          <DataCell
             label="Spine Angle"
             value={metrics ? `${metrics.spineAngle.toFixed(0)}°` : '--'}
             status="neutral"
          />

          <DataCell
             label="Est. Power"
             value={metrics ? `${(Math.abs(metrics.hipRotation * 1.5)).toFixed(0)}` : '--'}
             status="neutral"
          />

          {/* Full Width AI Insight */}
          <div className="col-span-2 p-5 flex items-start gap-4 bg-slate-900/30 border-t border-slate-800">
             <div className="w-1 self-stretch bg-[#2E8AF7] rounded-full" />
             <div>
               <h4 className="text-[10px] font-bold text-[#2E8AF7] mb-2 uppercase tracking-widest flex items-center gap-2">
                   AI Diagnostic Log
               </h4>
               <p className="text-xs text-slate-400 leading-relaxed font-mono">
                 {analysis.feedback?.aiInsights || "Awaiting Swing Data..."}
               </p>
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function DataCell({ label, value, status }: { label: string, value: string | number, status: 'neutral' | 'good' | 'critical' }) {
  const statusColor = {
    neutral: 'text-slate-200',
    good: 'text-emerald-400',
    critical: 'text-red-500'
  };

  return (
    <div className="p-4 flex flex-col justify-center h-24 hover:bg-white/5 transition-colors">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{label}</span>
      <span className={cn("text-3xl font-mono tracking-tighter", statusColor[status])}>
        {value}
      </span>
    </div>
  );
}
