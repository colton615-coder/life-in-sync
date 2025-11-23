import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowsOutSimple, CornersIn } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SwingPoseData } from '@/lib/types'
import { RotaryScrubber } from '@/components/RotaryScrubber'
import { OverlayCanvas } from '@/components/OverlayCanvas'

interface VideoPlayerContainerProps {
  videoUrl: string
  poseData?: SwingPoseData[]
  className?: string
  showOverlay: boolean
  onToggleOverlay: () => void
}

export function VideoPlayerContainer({
  videoUrl,
  poseData,
  className,
  showOverlay,
  onToggleOverlay
}: VideoPlayerContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      // Estimate frame index based on 30fps assumption if poseData exists
      // Or strictly map time to poseData timestamps if available
      if (poseData && poseData.length > 0) {
          const frame = Math.min(
              Math.floor((video.currentTime / video.duration) * poseData.length),
              poseData.length - 1
          )
          setCurrentFrameIndex(frame)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [poseData])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
    }
  }

  const handleScrubberChange = (delta: number) => {
    if (videoRef.current) {
        // Pause if scrubbing starts
        if (isPlaying) videoRef.current.pause()

        // Map rotation delta to time delta
        // Sensitivity: 1 full rotation (360 deg ~ delta sums) = 1 second?
        // Let's say delta is roughly degrees/pixels.
        // delta of 10 = move 0.05s
        const seekTime = videoRef.current.currentTime + (delta * 0.05)
        videoRef.current.currentTime = Math.max(0, Math.min(duration, seekTime))
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Sync fullscreen state listener
  useEffect(() => {
      const handleFSChange = () => {
          setIsFullscreen(!!document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', handleFSChange)
      return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])


  return (
    <div ref={containerRef} className={cn("flex flex-col gap-4", isFullscreen ? "bg-black p-4 h-screen justify-center" : "", className)}>
      {/* Main Video Area */}
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-black shadow-2xl aspect-video group">
        <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            controls={false} // Hide native controls
            onClick={togglePlayPause}
        />

        {/* Overlay Layer */}
        {poseData && (
            <OverlayCanvas
                poseData={poseData}
                currentFrame={currentFrameIndex}
                showOverlay={showOverlay}
            />
        )}

        {/* Floating Status Indicators */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
             <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/10 text-white font-mono text-xs">
                {isPlaying ? 'PLAYING' : 'PAUSED'}
             </Badge>
             <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/10 text-white font-mono text-xs tabular-nums">
                {currentTime.toFixed(2)}s
             </Badge>
             {showOverlay && (
                 <Badge variant="outline" className="bg-cyan-500/20 backdrop-blur border-cyan-500/50 text-cyan-400 font-mono text-xs">
                    ANALYSIS ON
                 </Badge>
             )}
        </div>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={toggleFullscreen} className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors">
                {isFullscreen ? <CornersIn size={20} /> : <ArrowsOutSimple size={20} />}
             </button>
        </div>

        {/* Central Play Button Overlay (only when paused) */}
        <AnimatePresence>
            {!isPlaying && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-glow-primary">
                        <Play weight="fill" size={32} className="ml-1" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </Card>

      {/* Cockpit Controls */}
      <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-4", isFullscreen ? "fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4" : "")}>

          {/* Left: Playback Toggle (Primary Action) */}
          <div className="flex justify-end">
              <button
                onClick={togglePlayPause}
                className="h-16 w-16 rounded-full neumorphic-convex active:neumorphic-concave flex items-center justify-center text-primary transition-all"
              >
                  {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
              </button>
          </div>

          {/* Center: The Jog Dial */}
          <div className="relative z-10">
             <RotaryScrubber
                onChange={handleScrubberChange}
                onEnd={() => { /* Optional snap logic */ }}
             />
          </div>

          {/* Right: Analysis Toggle */}
           <div className="flex justify-start">
              <button
                onClick={onToggleOverlay}
                className={cn(
                    "h-16 w-16 rounded-full neumorphic-convex flex items-center justify-center transition-all",
                    showOverlay ? "text-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.3)]" : "text-slate-500"
                )}
              >
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                      {showOverlay ? 'AI ON' : 'AI OFF'}
                  </span>
              </button>
           </div>
      </div>
    </div>
  )
}
