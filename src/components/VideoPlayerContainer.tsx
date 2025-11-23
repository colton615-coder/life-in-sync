import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, CornersIn, ArrowsOutSimple } from '@phosphor-icons/react'
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
        if (isPlaying) videoRef.current.pause()

        // delta comes in degrees (or pixels mapped to degrees).
        // Let's say 360 degrees = 5 seconds of video scrub for precision
        // So 1 degree = 5/360 seconds.
        const sensitivity = 5 / 360;
        const seekTime = videoRef.current.currentTime + (delta * sensitivity)
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

  useEffect(() => {
      const handleFSChange = () => {
          setIsFullscreen(!!document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', handleFSChange)
      return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])


  return (
    <div ref={containerRef} className={cn("flex flex-col gap-6", isFullscreen ? "bg-black p-4 h-screen justify-center" : "", className)}>

      {/*
         VIEWFINDER CONTAINER
         Master Directive: "Rounded-2xl container with a thick, glowing border."
      */}
      <div className="relative group rounded-2xl overflow-hidden border border-[#2E8AF7]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black aspect-video">

        {/* Scanline Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none scanlines opacity-50 mix-blend-overlay" />

        {/* Corner Reticles */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40 z-20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40 z-20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40 z-20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40 z-20 pointer-events-none" />

        {/* Video Element */}
        <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain relative z-10"
            playsInline
            controls={false}
            onClick={togglePlayPause}
        />

        {/* AI Overlay Canvas */}
        {poseData && (
            <OverlayCanvas
                poseData={poseData}
                currentFrame={currentFrameIndex}
                showOverlay={showOverlay}
                className="z-10"
            />
        )}

        {/* Status HUD (Top Left) */}
        <div className="absolute top-6 left-6 flex gap-3 pointer-events-none z-30">
             <Badge variant="outline" className="bg-black/40 backdrop-blur border-white/10 text-white font-mono text-[10px] tracking-wider">
                {isPlaying ? 'REC ●' : 'PAUSED'}
             </Badge>
             <Badge variant="outline" className="bg-black/40 backdrop-blur border-white/10 text-[#2E8AF7] font-mono text-[10px] tabular-nums tracking-wider shadow-[0_0_10px_rgba(46,138,247,0.2)]">
                T: {currentTime.toFixed(2)}s
             </Badge>
        </div>

        {/* Fullscreen Trigger (Top Right) */}
        <div className="absolute top-4 right-14 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={toggleFullscreen} className="p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-white/10 transition-colors border border-white/10">
                {isFullscreen ? <CornersIn size={16} /> : <ArrowsOutSimple size={16} />}
             </button>
        </div>

        {/* Central Play Button Overlay */}
        <AnimatePresence>
            {!isPlaying && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                >
                    <div className="w-20 h-20 rounded-full bg-[#2E8AF7]/10 backdrop-blur-sm border border-[#2E8AF7]/50 flex items-center justify-center text-[#2E8AF7] shadow-[0_0_30px_rgba(46,138,247,0.3)]">
                        <Play weight="fill" size={32} className="ml-1" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/*
          THE CONTROL DECK
          Master Directive: Neumorphic controls, physical scrubber.
      */}
      <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-8 px-4", isFullscreen ? "fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 glass-panel rounded-3xl p-6" : "")}>

          {/* Left: Transport Controls */}
          <div className="flex justify-end">
              <button
                onClick={togglePlayPause}
                className="h-14 w-14 rounded-full neumorphic-convex active:neumorphic-concave flex items-center justify-center text-[#2E8AF7] transition-all hover:shadow-[0_0_15px_rgba(46,138,247,0.2)] hover:text-white"
              >
                  {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
              </button>
          </div>

          {/* Center: The Jog Dial (Physical Scrubber) */}
          <div className="relative z-10 flex flex-col items-center gap-2">
             <div className="text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase">Jog Shuttle</div>
             <RotaryScrubber
                onChange={handleScrubberChange}
                sensitivity={1} // 1 degree visual = 1 unit delta
             />
          </div>

          {/* Right: Analysis Toggle */}
           <div className="flex justify-start">
              <button
                onClick={onToggleOverlay}
                className={cn(
                    "h-14 w-14 rounded-full neumorphic-convex flex items-center justify-center transition-all active:neumorphic-concave",
                    showOverlay ? "text-[#2E8AF7] shadow-[inset_0_0_15px_rgba(46,138,247,0.15)] border-[#2E8AF7]/30" : "text-slate-500"
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
