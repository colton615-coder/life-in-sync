import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Eye, EyeSlash, GitBranch, Circle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PoseOverlayControlsProps {
  showSkeleton: boolean
  showKeypoints: boolean
  lineWidth: number
  keypointRadius: number
  onShowSkeletonChange: (value: boolean) => void
  onShowKeypointsChange: (value: boolean) => void
  onLineWidthChange: (value: number) => void
  onKeypointRadiusChange: (value: number) => void
  className?: string
}

export function PoseOverlayControls({
  showSkeleton,
  showKeypoints,
  lineWidth,
  keypointRadius,
  onShowSkeletonChange,
  onShowKeypointsChange,
  onLineWidthChange,
  onKeypointRadiusChange,
  className
}: PoseOverlayControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isVisible = showSkeleton || showKeypoints

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch size={20} weight="duotone" className="text-primary" />
              Pose Overlay Controls
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Customize skeleton visualization
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isVisible ? (
              <Eye size={16} className="text-success" />
            ) : (
              <EyeSlash size={16} className="text-muted-foreground" />
            )}
            <Label htmlFor="visibility-toggle" className="text-sm font-medium cursor-pointer">
              Overlay Visible
            </Label>
          </div>
          <Switch
            id="visibility-toggle"
            checked={isVisible}
            onCheckedChange={(checked) => {
              onShowSkeletonChange(checked)
              onShowKeypointsChange(checked)
            }}
          />
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-primary" />
                  <Label htmlFor="skeleton-toggle" className="text-sm cursor-pointer">
                    Show Skeleton
                  </Label>
                </div>
                <Switch
                  id="skeleton-toggle"
                  checked={showSkeleton}
                  onCheckedChange={onShowSkeletonChange}
                />
              </div>

              {showSkeleton && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="line-width" className="text-muted-foreground">
                      Line Width
                    </Label>
                    <span className="text-foreground font-mono tabular-nums">
                      {lineWidth}px
                    </span>
                  </div>
                  <Slider
                    id="line-width"
                    value={[lineWidth]}
                    min={1}
                    max={8}
                    step={0.5}
                    onValueChange={(values) => onLineWidthChange(values[0])}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-chart-2" weight="fill" />
                  <Label htmlFor="keypoints-toggle" className="text-sm cursor-pointer">
                    Show Keypoints
                  </Label>
                </div>
                <Switch
                  id="keypoints-toggle"
                  checked={showKeypoints}
                  onCheckedChange={onShowKeypointsChange}
                />
              </div>

              {showKeypoints && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="keypoint-radius" className="text-muted-foreground">
                      Keypoint Size
                    </Label>
                    <span className="text-foreground font-mono tabular-nums">
                      {keypointRadius}px
                    </span>
                  </div>
                  <Slider
                    id="keypoint-radius"
                    value={[keypointRadius]}
                    min={2}
                    max={10}
                    step={0.5}
                    onValueChange={(values) => onKeypointRadiusChange(values[0])}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLineWidthChange(3)
                  onKeypointRadiusChange(5)
                  onShowSkeletonChange(true)
                  onShowKeypointsChange(true)
                }}
                className="w-full text-xs"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
