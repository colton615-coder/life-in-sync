import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipBack, SkipForward } from '@phosphor-icons/react'
import { SwingPoseData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PoseOverlay } from '@/components/PoseOverlay'

interface TimelineMarker {
  id: string
  label: string
  timestamp: number
  position: 'address' | 'backswing' | 'impact' | 'followThrough'
  color: string
  description: string
}

interface VideoPlayerWithTimelineProps {
  videoUrl: string
  poseData?: SwingPoseData[]
  className?: string
  showPoseOverlay?: boolean
  showPoseControls?: boolean
}

function detectSwingPhase(frame: number, totalFrames: number): 'address' | 'backswing' | 'impact' | 'followThrough' {
  const progress = frame / totalFrames
  if (progress < 0.1) return 'address'
  if (progress < 0.4) return 'backswing'
  if (progress < 0.6) return 'impact'
  return 'followThrough'
}

function generateTimelineMarkers(poseData: SwingPoseData[], videoDuration: number): TimelineMarker[] {
  if (!poseData || poseData.length === 0) return []

  const markers: TimelineMarker[] = []
  const phases: Record<string, { found: boolean; frame: number }> = {
    address: { found: false, frame: 0 },
    backswing: { found: false, frame: 0 },
    impact: { found: false, frame: 0 },
    followThrough: { found: false, frame: 0 }
  }

  poseData.forEach((frame, index) => {
    const phase = detectSwingPhase(index, poseData.length)
    if (!phases[phase].found) {
      phases[phase].found = true
      phases[phase].frame = index
    }
  })

  const phaseConfig = {
    address: { label: 'Address', color: 'bg-chart-1', description: 'Setup position before swing' },
    backswing: { label: 'Top of Backswing', color: 'bg-chart-2', description: 'Maximum backswing rotation' },
    impact: { label: 'Impact', color: 'bg-chart-3', description: 'Club contact with ball' },
    followThrough: { label: 'Follow Through', color: 'bg-chart-4', description: 'Finish position' }
  }

  Object.entries(phases).forEach(([phase, data]) => {
    if (data.found) {
      const timestamp = (data.frame / poseData.length) * videoDuration
      markers.push({
        id: phase,
        label: phaseConfig[phase as keyof typeof phaseConfig].label,
        timestamp,
        position: phase as TimelineMarker['position'],
        color: phaseConfig[phase as keyof typeof phaseConfig].color,
        description: phaseConfig[phase as keyof typeof phaseConfig].description
      })
    }
  })

  return markers
}

export function VideoPlayerWithTimeline({ 
  videoUrl, 
  poseData, 
  className,
  showPoseOverlay = true
}: VideoPlayerWithTimelineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [markers, setMarkers] = useState<TimelineMarker[]>([])
  const [activeMarker, setActiveMarker] = useState<TimelineMarker | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<TimelineMarker | null>(null)
  const [showSkeleton] = useState(true)
  const [showKeypoints] = useState(true)
  const [lineWidth] = useState(3)
  const [keypointRadius] = useState(5)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (poseData && poseData.length > 0) {
        setMarkers(generateTimelineMarkers(poseData, video.duration))
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      const currentMarker = markers.find(marker => 
        Math.abs(marker.timestamp - video.currentTime) < 0.1
      )
      if (currentMarker && currentMarker.id !== activeMarker?.id) {
        setActiveMarker(currentMarker)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [poseData, markers, activeMarker])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const jumpToMarker = (marker: TimelineMarker) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = marker.timestamp
    setCurrentTime(marker.timestamp)
    setActiveMarker(marker)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 0.1)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(duration, video.currentTime + 0.1)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`
  }

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onClick={togglePlayPause}
          aria-label="Golf swing video player"
        />
        
        {poseData && poseData.length > 0 && showPoseOverlay && (
          <PoseOverlay 
            videoRef={videoRef} 
            poseData={poseData}
            showSkeleton={showSkeleton}
            showKeypoints={showKeypoints}
            lineWidth={lineWidth}
            keypointRadius={keypointRadius}
          />
        )}
        
        {activeMarker && (
          <div 
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border animate-in fade-in slide-in-from-top-2"
            role="status"
            aria-live="polite"
          >
            <div className="text-sm font-semibold">{activeMarker.label}</div>
            <div className="text-xs text-muted-foreground">{activeMarker.description}</div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={skipBackward}
            className="h-9 w-9"
            aria-label="Skip backward 0.1 seconds"
          >
            <SkipBack size={18} weight="fill" aria-hidden="true" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlayPause}
            className="h-11 w-11"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause size={20} weight="fill" aria-hidden="true" />
            ) : (
              <Play size={20} weight="fill" aria-hidden="true" />
            )}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={skipForward}
            className="h-9 w-9"
            aria-label="Skip forward 0.1 seconds"
          >
            <SkipForward size={18} weight="fill" aria-hidden="true" />
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono tabular-nums w-16">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.01}
                onValueChange={handleSeek}
                className="cursor-pointer"
                aria-label={`Video timeline: ${formatTime(currentTime)} of ${formatTime(duration)}`}
              />
              
              {markers.map((marker) => {
                const position = (marker.timestamp / duration) * 100
                return (
                  <button
                    key={marker.id}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all z-10",
                      marker.color,
                      "hover:scale-150 hover:ring-2 hover:ring-background",
                      activeMarker?.id === marker.id && "scale-150 ring-2 ring-background"
                    )}
                    style={{ left: `${position}%` }}
                    onClick={() => jumpToMarker(marker)}
                    onMouseEnter={() => setHoveredMarker(marker)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    onFocus={() => setHoveredMarker(marker)}
                    onBlur={() => setHoveredMarker(null)}
                    aria-label={`Jump to ${marker.label} at ${formatTime(marker.timestamp)}`}
                  >
                    <span className="sr-only">{marker.label}</span>
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-muted-foreground font-mono tabular-nums w-16 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {markers.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Swing Phases
            </div>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Swing phase markers">
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => jumpToMarker(marker)}
                  onMouseEnter={() => setHoveredMarker(marker)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  className={cn(
                    "group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    "hover:border-primary hover:bg-accent/10",
                    activeMarker?.id === marker.id 
                      ? "border-primary bg-accent/20" 
                      : "border-border bg-card"
                  )}
                  role="listitem"
                  aria-label={`${marker.label} at ${formatTime(marker.timestamp)}`}
                  aria-current={activeMarker?.id === marker.id ? 'true' : undefined}
                >
                  <div className={cn("w-2 h-2 rounded-full", marker.color)} aria-hidden="true" />
                  <span className="text-sm font-medium">{marker.label}</span>
                  <Badge variant="secondary" className="text-xs font-mono tabular-nums">
                    {formatTime(marker.timestamp)}
                  </Badge>
                  
                  {hoveredMarker?.id === marker.id && (
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg border shadow-lg whitespace-nowrap pointer-events-none z-50"
                      role="tooltip"
                    >
                      {marker.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-4 border-transparent border-t-popover" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
