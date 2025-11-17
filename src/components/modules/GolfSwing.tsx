import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Video, 
  TrendUp,
  Target,
  CheckCircle,
  XCircle,
  Play,
  ChartBar,
  Sparkle,
  Lightning,
  ArrowRight,
  Trash
} from '@phosphor-icons/react'
import { SwingAnalysis } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { simulateVideoProcessing, analyzePoseData, generateFeedback } from '@/lib/golf/swing-analyzer'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GolfSwing() {
  const [analyses, setAnalyses] = useKV<SwingAnalysis[]>('golf-swing-analyses', [])
  const [activeAnalysis, setActiveAnalysis] = useState<SwingAnalysis | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (analyses && analyses.length > 0) {
        analyses.forEach(analysis => {
          if (analysis.videoUrl) {
            URL.revokeObjectURL(analysis.videoUrl)
          }
        })
      }
    }
  }, [])

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file too large (max 100MB)')
      return
    }

    const analysisId = `swing-${Date.now()}`
    const videoUrl = URL.createObjectURL(file)

    const newAnalysis: SwingAnalysis = {
      id: analysisId,
      videoId: analysisId,
      videoUrl,
      status: 'uploading',
      uploadedAt: new Date().toISOString(),
      processingProgress: 0
    }

    setAnalyses(current => [newAnalysis, ...(current || [])])
    setActiveAnalysis(newAnalysis)
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const poseData = await simulateVideoProcessing(file, (progress, status) => {
        setProcessingProgress(progress)
        setProcessingStatus(status)
        setAnalyses(current => 
          (current || []).map(a => 
            a.id === analysisId 
              ? { ...a, processingProgress: progress, status: progress < 100 ? 'processing' : 'analyzing' }
              : a
          )
        )
      })

      const metrics = analyzePoseData(poseData)
      const feedback = await generateFeedback(metrics)

      const completedAnalysis: SwingAnalysis = {
        ...newAnalysis,
        status: 'completed',
        processedAt: new Date().toISOString(),
        poseData,
        metrics,
        feedback,
        processingProgress: 100
      }

      setAnalyses(current => 
        (current || []).map(a => a.id === analysisId ? completedAnalysis : a)
      )
      setActiveAnalysis(completedAnalysis)
      toast.success('Swing analysis completed!', {
        description: `Overall score: ${feedback.overallScore}/100`
      })
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalyses(current => 
        (current || []).map(a => 
          a.id === analysisId 
            ? { ...a, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
            : a
        )
      )
      toast.error('Analysis failed', {
        description: 'Please try again with a different video'
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStatus('')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAnalysis = (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const analysisToDelete = analyses?.find(a => a.id === analysisId)
    if (!analysisToDelete) return

    setAnalyses(current => {
      const updated = (current || []).filter(a => a.id !== analysisId)
      
      if (activeAnalysis?.id === analysisId) {
        const remainingAnalyses = updated.filter(a => a.status === 'completed')
        if (remainingAnalyses.length > 0) {
          setActiveAnalysis(remainingAnalyses[0])
        } else if (updated.length > 0) {
          setActiveAnalysis(updated[0])
        } else {
          setActiveAnalysis(null)
        }
      }
      
      return updated
    })

    if (analysisToDelete.videoUrl) {
      URL.revokeObjectURL(analysisToDelete.videoUrl)
    }

    toast.success('Analysis deleted', {
      description: 'Swing analysis has been removed'
    })
  }

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <div className="glass-card rounded-3xl p-12 max-w-2xl">
        <motion.div
          animate={{ 
            rotateY: [0, 10, -10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <Video size={80} weight="duotone" className="text-primary mx-auto" />
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          AI-Powered Golf Swing Analysis
        </h2>
        
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Technology can't fix your slice, but at least it'll tell you exactly how bad it is
        </p>

        <Button
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 text-lg px-8 py-6 rounded-xl"
          aria-label="Upload your first golf swing video for analysis"
        >
          <Upload size={24} weight="bold" aria-hidden="true" />
          Upload Your First Swing
        </Button>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex flex-col gap-2">
            <Lightning size={32} weight="duotone" className="text-accent" />
            <h3 className="font-semibold">Instant Analysis</h3>
            <p className="text-sm text-muted-foreground">AI processes your swing in seconds</p>
          </div>
          <div className="flex flex-col gap-2">
            <Target size={32} weight="duotone" className="text-primary" />
            <h3 className="font-semibold">Pro-Level Metrics</h3>
            <p className="text-sm text-muted-foreground">Hip rotation, spine angle, tempo & more</p>
          </div>
          <div className="flex flex-col gap-2">
            <Sparkle size={32} weight="duotone" className="text-secondary" />
            <h3 className="font-semibold">Custom Drills</h3>
            <p className="text-sm text-muted-foreground">Personalized practice recommendations</p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderProcessingState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Analyzing your swing. {processingProgress}% complete. {processingStatus}
      </div>
      <Card className="w-full max-w-2xl glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkle size={24} weight="duotone" className="text-primary" aria-hidden="true" />
            </motion.div>
            Analyzing Your Swing
          </CardTitle>
          <CardDescription>{processingStatus}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={processingProgress} className="h-3" aria-label={`Analysis progress: ${processingProgress}%`} />
          <p className="text-center text-2xl font-bold text-primary" aria-hidden="true">
            {processingProgress}%
          </p>
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>• Extracting video frames</p>
            <p>• Running pose estimation model</p>
            <p>• Computing swing mechanics</p>
            <p>• Generating AI feedback</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderMetrics = () => {
    if (!activeAnalysis?.metrics) return null

    const { metrics } = activeAnalysis

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendUp size={18} className="text-accent" />
              Hip Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {metrics.hipRotation.total.toFixed(1)}°
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Backswing: {metrics.hipRotation.backswing.toFixed(1)}° → Impact: {metrics.hipRotation.impact.toFixed(1)}°
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target size={18} className="text-secondary" />
              Shoulder Turn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {metrics.shoulderRotation.total.toFixed(1)}°
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total rotation through swing
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ChartBar size={18} className="text-primary" />
              Head Stability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={
                metrics.headMovement.stability === 'excellent' ? 'default' :
                metrics.headMovement.stability === 'good' ? 'secondary' :
                'destructive'
              }
              className="text-lg px-3 py-1"
            >
              {metrics.headMovement.stability}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Lateral: {(metrics.headMovement.lateral * 100).toFixed(1)}cm
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightning size={18} className="text-accent" />
              Tempo Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {metrics.tempo.ratio.toFixed(2)}:1
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Ideal: 2.0:1 (backswing:downswing)
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendUp size={18} className="text-secondary" />
              Weight Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={
                metrics.weightTransfer.rating === 'excellent' ? 'default' :
                metrics.weightTransfer.rating === 'good' ? 'secondary' :
                'destructive'
              }
              className="text-lg px-3 py-1"
            >
              {metrics.weightTransfer.rating}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Impact shift: {metrics.weightTransfer.impactShift}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target size={18} className="text-primary" />
              Swing Plane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {(metrics.swingPlane.consistency * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Consistency rating
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFeedback = () => {
    if (!activeAnalysis?.feedback) return null

    const { feedback } = activeAnalysis

    return (
      <div className="space-y-6">
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Swing Score</span>
              <Badge variant="default" className="text-2xl px-4 py-2">
                {feedback.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-card border-success/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle size={24} weight="bold" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-success mt-0.5 flex-shrink-0" weight="fill" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Target size={24} weight="bold" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight size={18} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{feedback.aiInsights}</p>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target size={24} weight="bold" className="text-accent" />
            Recommended Drills
          </h3>
          <div className="grid gap-4">
            {feedback.drills.map((drill, idx) => (
              <Card key={idx} className="glass-card hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{drill.title}</CardTitle>
                      <CardDescription className="mt-1">{drill.focusArea}</CardDescription>
                    </div>
                    <Badge variant="outline">{drill.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {drill.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAnalysisList = () => (
    <ScrollArea className="h-[600px]">
      <div className="space-y-3" role="list" aria-label="Swing analysis history">
        {(analyses || []).map((analysis) => (
          <Card
            key={analysis.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 glass-card",
              activeAnalysis?.id === analysis.id && "border-primary"
            )}
            onClick={() => setActiveAnalysis(analysis)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveAnalysis(analysis)
              }
            }}
            tabIndex={0}
            role="listitem"
            aria-label={`Swing analysis from ${new Date(analysis.uploadedAt).toLocaleDateString()} at ${new Date(analysis.uploadedAt).toLocaleTimeString()}, status: ${analysis.status}${analysis.feedback ? `, score: ${analysis.feedback.overallScore} out of 100` : ''}`}
            aria-current={activeAnalysis?.id === analysis.id ? 'true' : undefined}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">
                    Swing Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(analysis.uploadedAt).toLocaleDateString()} at{' '}
                    {new Date(analysis.uploadedAt).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={
                      analysis.status === 'completed' ? 'default' :
                      analysis.status === 'failed' ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                    aria-label={`Status: ${analysis.status}`}
                  >
                    {analysis.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteAnalysis(analysis.id, e)}
                    aria-label={`Delete swing analysis from ${new Date(analysis.uploadedAt).toLocaleDateString()}`}
                  >
                    <Trash size={16} weight="bold" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {analysis.feedback && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Score:</span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.feedback.overallScore}/100
                  </Badge>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  )

  if (isProcessing) {
    return renderProcessingState()
  }

  if (!analyses || analyses.length === 0) {
    return (
      <>
        {renderEmptyState()}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
      </>
    )
  }

  return (
    <div className="pt-2 md:pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            ⛳ Golf Swing Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered swing analysis with professional feedback
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
          size="lg"
          aria-label="Upload new golf swing video for analysis"
        >
          <Upload size={20} weight="bold" aria-hidden="true" />
          New Analysis
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Your Analyses</h2>
          {renderAnalysisList()}
        </div>

        <div className="lg:col-span-2">
          {activeAnalysis ? (
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-2" aria-label="Analysis view options">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="feedback">Feedback & Drills</TabsTrigger>
              </TabsList>
              <TabsContent value="metrics" className="space-y-6 mt-6">
                {activeAnalysis.videoUrl && (
                  <Card className="glass-card overflow-hidden">
                    <video
                      src={activeAnalysis.videoUrl}
                      controls
                      className="w-full aspect-video bg-black"
                      aria-label="Your golf swing video recording"
                    />
                  </Card>
                )}
                {renderMetrics()}
              </TabsContent>
              <TabsContent value="feedback" className="space-y-6 mt-6">
                {renderFeedback()}
              </TabsContent>
            </Tabs>
          ) : (
            <Alert>
              <Play size={18} aria-hidden="true" />
              <AlertDescription>
                Select an analysis from the list to view details
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
    </div>
  )
}
