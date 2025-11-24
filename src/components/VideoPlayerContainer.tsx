import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, CornersIn, ArrowsOutSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SwingPoseData } from '@/lib/types'
import { RotaryScrubber } from '@/components/RotaryScrubber'
import { OverlayCanvas } from '@/components/OverlayCanvas'

export interface VideoPlayerController {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
}

interface VideoPlayerContainerProps {
  videoUrl: string
  poseData?: SwingPoseData[]
  className?: string
  showOverlay: boolean
  onToggleOverlay: () => void
  controls?: boolean
  isPlaying?: boolean
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlaybackStatusChange?: (isPlaying: boolean) => void
  controllerRef?: React.RefObject<VideoPlayerController | null>
}

export function VideoPlayerContainer({
  videoUrl,
  poseData,
  className,
  showOverlay,
  onToggleOverlay,
  controls = true,
  isPlaying: externalIsPlaying,
  onTimeUpdate,
  onPlaybackStatusChange,
  controllerRef
}: VideoPlayerContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({})

  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying

  // Expose controller methods
  useEffect(() => {
    if (controllerRef) {
      // @ts-ignore - rewriting ref current
      controllerRef.current = {
        play: () => videoRef.current?.play(),
        pause: () => videoRef.current?.pause(),
        seek: (time: number) => {
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, time))
          }
        },
        getCurrentTime: () => videoRef.current?.currentTime || 0
      }
    }
  }, [controllerRef])

  // Sync external isPlaying prop with video element
  useEffect(() => {
    if (externalIsPlaying !== undefined && videoRef.current) {
      if (externalIsPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(e => console.warn("Play interrupted", e))
      } else if (!externalIsPlaying && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
  }, [externalIsPlaying])

  // Canvas Alignment Logic
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateCanvas = () => {
        if (!video.videoWidth || !video.videoHeight) return

        const containerW = video.offsetWidth
        const containerH = video.offsetHeight
        const videoRatio = video.videoWidth / video.videoHeight
        const containerRatio = containerW / containerH

        let renderW, renderH, top, left

        if (containerRatio > videoRatio) {
            // Pillarbox (black bars left/right) - Video is height-limited
            renderH = containerH
            renderW = renderH * videoRatio
            top = 0
            left = (containerW - renderW) / 2
        } else {
            // Letterbox (black bars top/bottom) - Video is width-limited
            renderW = containerW
            renderH = renderW / videoRatio
            left = 0
            top = (containerH - renderH) / 2
        }

        setCanvasStyle({
            width: `${renderW}px`,
            height: `${renderH}px`,
            top: `${top}px`,
            left: `${left}px`,
            position: 'absolute'
        })
    }

    // Observers
    const resizeObserver = new ResizeObserver(updateCanvas)
    resizeObserver.observe(video)
    video.addEventListener('resize', updateCanvas)
    window.addEventListener('resize', updateCanvas)

    // Initial call
    updateCanvas()

    return () => {
        resizeObserver.disconnect()
        video.removeEventListener('resize', updateCanvas)
        window.removeEventListener('resize', updateCanvas)
    }
  }, [videoUrl]) // Re-run if source changes

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      onTimeUpdate?.(video.currentTime, video.duration)
      // Set playback rate to 0.5x
      video.playbackRate = 0.5
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime, video.duration)

      if (poseData && poseData.length > 0) {
          const frame = Math.min(
              Math.floor((video.currentTime / video.duration) * poseData.length),
              poseData.length - 1
          )
          setCurrentFrameIndex(frame)
      }
    }

    const handlePlay = () => {
      setInternalIsPlaying(true)
      onPlaybackStatusChange?.(true)
    }
    const handlePause = () => {
      setInternalIsPlaying(false)
      onPlaybackStatusChange?.(false)
    }
    const handleEnded = () => {
      setInternalIsPlaying(false)
      onPlaybackStatusChange?.(false)
    }

    // Force playback rate on play (sometimes it resets)
    const enforceSpeed = () => {
         video.playbackRate = 0.5
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('play', enforceSpeed)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('play', enforceSpeed)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [poseData, onTimeUpdate, onPlaybackStatusChange])

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
         Refactor: Removed 'aspect-video' forced ratio. Now uses 'flex-1' or 'h-full' from parent.
         Added 'flex flex-col' to ensure it takes available space.
      */}
      <div className={cn(
          "relative group overflow-hidden bg-black flex items-center justify-center",
          // Use a class to force fill if not in a flex container, but ideally parent controls this.
          // We remove 'aspect-video' so it can grow vertically.
          "w-full h-full min-h-0",
          controls ? "rounded-2xl border border-[#2E8AF7]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]" : ""
      )}>

        {/* Scanline Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none scanlines opacity-50 mix-blend-overlay" />

        {/* Video Element */}
        <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain relative z-10"
            playsInline
            autoPlay
            loop
            muted // Required for autoplay usually
            controls={false}
            onClick={togglePlayPause}
        />

        {/* AI Overlay Canvas - Positioned via calculated styles */}
        {poseData && (
            <div style={canvasStyle} className="z-10 pointer-events-none">
                <OverlayCanvas
                    poseData={poseData}
                    currentFrame={currentFrameIndex}
                    showOverlay={showOverlay}
                    className="w-full h-full"
                />
            </div>
        )}

        {/* Status HUD (Top Left) - Minimal status */}
        {controls && (
          <div className="absolute top-6 left-6 flex gap-3 pointer-events-none z-30">
              <Badge variant="outline" className="bg-black/40 backdrop-blur border-white/10 text-white font-mono text-[10px] tracking-wider">
                  {isPlaying ? 'REC ●' : 'PAUSED'}
              </Badge>
              <Badge variant="outline" className="bg-black/40 backdrop-blur border-white/10 text-[#2E8AF7] font-mono text-[10px] tabular-nums tracking-wider shadow-[0_0_10px_rgba(46,138,247,0.2)]">
                  T: {currentTime.toFixed(2)}s
              </Badge>
          </div>
        )}

        {/* Fullscreen Trigger (Top Right) */}
        <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={toggleFullscreen} className="p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-white/10 transition-colors border border-white/10">
                {isFullscreen ? <CornersIn size={16} /> : <ArrowsOutSimple size={16} />}
             </button>
        </div>

        {/* REMOVED: Central Play Button Overlay (per user request) */}
      </div>

      {/*
          THE CONTROL DECK
          Master Directive: Neumorphic controls, physical scrubber.
      */}
      {controls && (
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
      )}
    </div>
  )
}
