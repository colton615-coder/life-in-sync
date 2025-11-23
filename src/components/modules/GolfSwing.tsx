import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Video, 
  TrendUp,
  Target,
  CheckCircle,
  Play,
  ChartBar,
  Sparkle,
  Lightning,
  Trash,
  ArrowsLeftRight,
  Backpack,
  Warning,
  List
} from '@phosphor-icons/react'
import { SwingAnalysis, GolfClub, SwingMetrics } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'
import { toast } from 'sonner'
import { simulateVideoProcessing, analyzePoseData, generateFeedback } from '@/lib/golf/swing-analyzer'
import { validateVideoFile, formatFileSize, getVideoCompressionTips } from '@/lib/golf/video-utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VideoPlayerWithTimeline } from '@/components/VideoPlayerWithTimeline'
import { SwingComparisonDialog } from '@/components/SwingComparisonDialog'
import { ClubSelectionDialog } from '@/components/ClubSelectionDialog'
import { GolfSwingState } from '@/lib/golf/state'

/**
 * MetricCard: High-density visualization for a single data point.
 * Uses color coding (Neon Green vs Red/Orange) and visual gauges (Progress bars).
 */
function MetricCard({
  label,
  value,
  subValue,
  score, // 0-100 or 'good'/'poor' logic
  type = 'value' // 'value' | 'rating'
}: {
  label: string
  value: string | number
  subValue?: string
  score: number | 'excellent' | 'good' | 'fair' | 'poor'
  type?: 'value' | 'rating'
}) {
  // Determine color based on score
  const isGood = typeof score === 'number'
    ? score >= 70
    : ['excellent', 'good'].includes(score)

  const accentColor = isGood ? 'text-emerald-400' : 'text-orange-500'
  const bgColor = isGood ? 'bg-emerald-400/10' : 'bg-orange-500/10'
  const progressColor = isGood ? 'bg-emerald-400' : 'bg-orange-500'

  return (
    <Card className={cn("border-0 glass-card relative overflow-hidden", bgColor)}>
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          {typeof score === 'string' && (
             <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-5 border-0 bg-background/50 backdrop-blur", accentColor)}>
               {score.toUpperCase()}
             </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className={cn("text-2xl font-black tabular-nums tracking-tight", accentColor)}>
            {value}
          </div>

          {type === 'value' && typeof score === 'number' && (
             <div className="h-1.5 w-full bg-background/20 rounded-full overflow-hidden">
               <div
                 className={cn("h-full transition-all duration-500", progressColor)}
                 style={{ width: `${Math.min(100, score)}%` }}
               />
             </div>
          )}

          {subValue && (
            <div className="text-[10px] text-muted-foreground truncate font-mono">
              {subValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricsGrid({ metrics }: { metrics: SwingMetrics }) {
  // Helpers to calculate scores for visuals
  const hipScore = Math.min(100, (metrics.hipRotation.total / 90) * 100) // Target ~90 deg
  const shoulderScore = Math.min(100, (metrics.shoulderRotation.total / 100) * 100) // Target ~100+
  const tempoScore = Math.abs(metrics.tempo.ratio - 2.0) < 0.3 ? 100 : 40

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <MetricCard
        label="Hip Rotation"
        value={`${metrics.hipRotation.total.toFixed(0)}°`}
        subValue={`Impact: ${metrics.hipRotation.impact.toFixed(0)}°`}
        score={hipScore}
      />
      <MetricCard
        label="Shoulder Turn"
        value={`${metrics.shoulderRotation.total.toFixed(0)}°`}
        subValue={`Back: ${metrics.shoulderRotation.backswing.toFixed(0)}°`}
        score={shoulderScore}
      />
      <MetricCard
        label="Head Stability"
        value={metrics.headMovement.stability}
        subValue={`Lat: ${(metrics.headMovement.lateral * 100).toFixed(1)}cm`}
        score={metrics.headMovement.stability}
        type="rating"
      />
      <MetricCard
        label="Tempo"
        value={`${metrics.tempo.ratio.toFixed(2)}:1`}
        subValue="Target 2.0:1"
        score={tempoScore}
      />
      <MetricCard
        label="Weight Trans"
        value={metrics.weightTransfer.rating}
        subValue={`Shift: ${metrics.weightTransfer.impactShift}%`}
        score={metrics.weightTransfer.rating}
        type="rating"
      />
      <MetricCard
        label="Swing Plane"
        value={`${(metrics.swingPlane.consistency * 100).toFixed(0)}%`}
        subValue="Consistency"
        score={metrics.swingPlane.consistency * 100}
      />
    </div>
  )
}

function ProgressChart({ analyses, selectedClubFilter, setSelectedClubFilter }: { analyses: SwingAnalysis[], selectedClubFilter: string, setSelectedClubFilter: (v: string) => void }) {
    const completedAnalyses = (analyses || []).filter(a => a.status === 'completed' && a.feedback)

    const filteredAnalyses = selectedClubFilter === 'all'
      ? completedAnalyses
      : completedAnalyses.filter(a => a.club === selectedClubFilter)

    const availableClubs = Array.from(new Set(
      completedAnalyses.map(a => a.club).filter((club): club is GolfClub => !!club)
    )).sort()

    if (completedAnalyses.length === 0) {
      return (
        <Alert className="mt-6">
          <ChartBar size={18} />
          <AlertDescription>
            Complete at least one swing analysis to see your progress over time
          </AlertDescription>
        </Alert>
      )
    }

    const chartData = filteredAnalyses
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
      .map((analysis, idx) => ({
        index: idx + 1,
        score: analysis.feedback!.overallScore,
        date: new Date(analysis.uploadedAt).toLocaleDateString(),
        club: analysis.club || 'Untagged'
      }))

    const avgScore = chartData.length > 0
      ? Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length)
      : 0

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Score History</h3>
          <Select value={selectedClubFilter} onValueChange={setSelectedClubFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Filter Club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {availableClubs.map(club => (
                <SelectItem key={club} value={club}>{club}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card p-3">
            <div className="text-xs text-muted-foreground">Average</div>
            <div className="text-2xl font-bold text-primary">{avgScore}</div>
          </Card>
           <Card className="glass-card p-3">
            <div className="text-xs text-muted-foreground">Total Swings</div>
            <div className="text-2xl font-bold text-primary">{filteredAnalyses.length}</div>
          </Card>
        </div>

        <Card className="glass-card p-4">
          {chartData.length > 0 ? (
              <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
                {chartData.map((data, idx) => {
                  const height = (data.score / 100) * 100
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col items-center">
                        <div
                          className="w-full max-w-[20px] bg-primary/80 rounded-t transition-all group-hover:bg-primary"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                         <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-popover px-2 py-1 rounded text-[10px] border whitespace-nowrap z-10 transition-opacity">
                            {data.score} - {data.date}
                         </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
                No data
              </div>
            )}
        </Card>
      </div>
    )
}

export function GolfSwing() {
  // Data Persistence
  const [analyses, setAnalyses] = useKV<SwingAnalysis[]>('golf-swing-analyses', [])

  // UI State Machine
  const [viewState, setViewState] = useState<GolfSwingState>({ status: 'IDLE' })

  // Local UI Filters/Modals
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false)
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('all')
  const [historyOpen, setHistoryOpen] = useState(false) // For mobile drawer
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectionMadeRef = useRef(false)
  const isMounted = useRef(true)

  useEffect(() => {
    return () => { isMounted.current = false }
  }, [])

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      event.preventDefault()
      const file = event.target.files?.[0]
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (!file) return

      const validation = validateVideoFile(file)
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid video file')
        return
      }

      selectionMadeRef.current = false
      setViewState({ status: 'SELECTING_CLUB', file: file })

    } catch (error) {
      console.error('Error handling video upload:', error)
      toast.error('Failed to load video file')
      setViewState({ status: 'IDLE' })
    }
  }

  const handleClubSelectionComplete = (club: GolfClub | null) => {
    if (viewState.status !== 'SELECTING_CLUB') return
    selectionMadeRef.current = true
    startAnalysis(viewState.file, club)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && viewState.status === 'SELECTING_CLUB' && !selectionMadeRef.current) {
      setViewState({ status: 'IDLE' })
    }
  }

  const startAnalysis = async (file: File, club: GolfClub | null) => {
    const analysisId = `swing-${Date.now()}`
    const videoUrl = URL.createObjectURL(file)

    const newAnalysis: SwingAnalysis = {
      id: analysisId,
      videoId: analysisId,
      videoUrl,
      club,
      status: 'uploading',
      uploadedAt: new Date().toISOString(),
      processingProgress: 0
    }

    setAnalyses(current => [newAnalysis, ...(current || [])])

    setViewState({
      status: 'ANALYZING',
      file,
      club,
      progress: 0,
      step: 'Initializing...'
    })

    try {
      const poseData = await simulateVideoProcessing(file, (progress, status) => {
        if (!isMounted.current) return
        setViewState(prev => prev.status === 'ANALYZING' ? { ...prev, progress, step: status } : prev)
        setAnalyses(current => (current || []).map(a => a.id === analysisId ? { ...a, processingProgress: progress, status: progress < 100 ? 'processing' : 'analyzing' } : a))
      })

      if (!isMounted.current) return
      setViewState(prev => prev.status === 'ANALYZING' ? { ...prev, step: 'Calculating metrics...' } : prev)
      const metrics = analyzePoseData(poseData)
      
      if (!isMounted.current) return
      setViewState(prev => prev.status === 'ANALYZING' ? { ...prev, step: 'Generating AI feedback...' } : prev)
      const feedback = await generateFeedback(metrics, club)

      if (!isMounted.current) return
      const completedAnalysis: SwingAnalysis = {
        ...newAnalysis,
        status: 'completed',
        processedAt: new Date().toISOString(),
        poseData,
        metrics,
        feedback,
        processingProgress: 100
      }

      setAnalyses(current => (current || []).map(a => a.id === analysisId ? completedAnalysis : a))
      setViewState({ status: 'VIEWING_RESULT', analysis: completedAnalysis })
      toast.success('Swing analysis completed!', { description: `Overall score: ${feedback.overallScore}/100` })

    } catch (error) {
      if (!isMounted.current) return
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setAnalyses(current => (current || []).map(a => a.id === analysisId ? { ...a, status: 'failed', error: errorMessage } : a))
      setViewState({ status: 'ERROR', message: 'Analysis failed', error })
      toast.error('Analysis failed', { description: errorMessage })
    }
  }

  const handleDeleteAnalysis = (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const analysisToDelete = analyses?.find(a => a.id === analysisId)
    if (!analysisToDelete) return

    setAnalyses(current => (current || []).filter(a => a.id !== analysisId))
    if (viewState.status === 'VIEWING_RESULT' && viewState.analysis.id === analysisId) {
      setViewState({ status: 'IDLE' })
    }
    if (analysisToDelete.videoUrl) URL.revokeObjectURL(analysisToDelete.videoUrl)
    toast.success('Analysis deleted')
  }

  const handleViewAnalysis = (analysis: SwingAnalysis) => {
    setViewState({ status: 'VIEWING_RESULT', analysis })
    setHistoryOpen(false) // Close mobile drawer on selection
  }

  const renderProcessingState = () => {
    if (viewState.status !== 'ANALYZING') return null
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Card className="w-full max-w-2xl glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Sparkle size={24} weight="duotone" className="text-primary" />
              </motion.div>
              Analyzing Your Swing
            </CardTitle>
            <CardDescription>{viewState.step}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={viewState.progress} className="h-3" />
            <p className="text-center text-2xl font-bold text-primary">{viewState.progress}%</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderErrorState = () => {
    if (viewState.status !== 'ERROR') return null
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Warning size={48} className="text-destructive" />
        <h3 className="text-xl font-bold">Something went wrong</h3>
        <p className="text-muted-foreground">{viewState.message}</p>
        <Button onClick={() => setViewState({ status: 'IDLE' })}>Return to Dashboard</Button>
      </div>
    )
  }

  const renderEmptyState = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 md:px-6">
      <div className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full">
        <motion.div animate={{ rotateY: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mb-6">
          <Video size={80} weight="duotone" className="text-primary mx-auto" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">AI-Powered Golf Swing Analysis</h2>
        <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">Technology can't fix your slice, but at least it'll tell you exactly how bad it is</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => fileInputRef.current?.click()} className="gap-2 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <Upload size={24} weight="bold" /> Upload Your First Swing
            </Button>
             {/* Mobile: Allow accessing history even from empty state via button if analyses exist */}
            {analyses && analyses.length > 0 && (
                <Button variant="outline" size="lg" onClick={() => setHistoryOpen(true)} className="lg:hidden gap-2 px-6 py-6 rounded-xl">
                   <List size={24} /> View History
                </Button>
            )}
        </div>
      </div>
    </motion.div>
  )

  const renderAnalysisList = () => {
    const activeAnalysisId = viewState.status === 'VIEWING_RESULT' ? viewState.analysis.id : null;
    return (
      <ScrollArea className="h-[400px] lg:h-[600px] w-full">
        <div className="space-y-2 pr-4">
          {(analyses || []).map((analysis) => (
            <div
              key={analysis.id}
              className={cn(
                "cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between group",
                activeAnalysisId === analysis.id
                  ? "bg-accent/10 border-accent"
                  : "bg-card border-border hover:border-primary/50"
              )}
              onClick={() => handleViewAnalysis(analysis)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {analysis.club || 'Golf Swing'}
                  </span>
                  {analysis.feedback && (
                     <Badge variant="outline" className={cn("text-[10px] h-5", analysis.feedback.overallScore >= 70 ? "text-emerald-400 border-emerald-400/30" : "text-orange-500 border-orange-500/30")}>
                       {analysis.feedback.overallScore}
                     </Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(analysis.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteAnalysis(analysis.id, e)}
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  // --- Main Dashboard Render ---

  if (viewState.status === 'ANALYZING') return renderProcessingState()
  if (viewState.status === 'ERROR') return renderErrorState()
  if (viewState.status === 'IDLE' && (!analyses || analyses.length === 0)) {
    return (
      <>
        {renderEmptyState()}
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
      </>
    )
  }

  const analysis = viewState.status === 'VIEWING_RESULT' ? viewState.analysis : null

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col pt-2 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          ⛳ Swing Analyzer
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">PRO</Badge>
        </h1>
        <div className="flex gap-2">
            {/* Mobile History Toggle */}
           <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <List size={20} />
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Analysis History</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                    {renderAnalysisList()}
                </div>
             </SheetContent>
           </Sheet>

           <Button variant="outline" size="sm" onClick={() => setComparisonDialogOpen(true)} className="hidden md:flex">
             <ArrowsLeftRight size={16} className="mr-2" /> Compare
           </Button>
           <Button size="sm" onClick={() => fileInputRef.current?.click()}>
             <Upload size={16} className="mr-2" /> New Upload
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 overflow-hidden min-h-0">

        {/* Left/Top Panel: Media + Timeline (Hero) - Spans 8 cols on desktop */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-y-auto lg:overflow-visible">
          {analysis && analysis.videoUrl ? (
            <VideoPlayerWithTimeline
              videoUrl={analysis.videoUrl}
              poseData={analysis.poseData}
              className="w-full aspect-video shadow-2xl rounded-xl border border-border/50 bg-black/50 backdrop-blur-sm"
            />
          ) : (
            <div className="aspect-video w-full rounded-xl bg-muted/20 border border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p>Select a swing to view analysis</p>
              </div>
            </div>
          )}

          {/* On Mobile, Tabs are below video. On Desktop, they are also below video but in the same col-span */}
          {analysis && analysis.metrics && analysis.feedback ? (
             <Tabs defaultValue="metrics" className="flex-1 flex flex-col min-h-0">
               <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 gap-6">
                 <TabsTrigger value="metrics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">
                   Metrics
                 </TabsTrigger>
                 <TabsTrigger value="analysis" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">
                   AI Analysis
                 </TabsTrigger>
                 <TabsTrigger value="trends" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">
                    Trends
                  </TabsTrigger>
                 <TabsTrigger value="drills" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">
                   Drills
                 </TabsTrigger>
               </TabsList>

               <div className="mt-4 flex-1 overflow-y-auto pr-1 pb-20 lg:pb-0">
                 <TabsContent value="metrics" className="mt-0">
                   <MetricsGrid metrics={analysis.metrics} />
                 </TabsContent>

                 <TabsContent value="analysis" className="mt-0 space-y-4">
                   <Card className="glass-card border-primary/20 bg-primary/5">
                     <CardHeader className="pb-2">
                       <CardTitle className="text-lg flex items-center gap-2">
                         <Sparkle className="text-primary" size={20} />
                         AI Diagnostic Report
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="prose prose-invert prose-sm">
                         <p className="leading-relaxed text-muted-foreground">
                           {analysis.feedback.aiInsights}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                         <CheckCircle weight="fill" /> Strengths
                       </h4>
                       <ul className="space-y-2">
                         {analysis.feedback.strengths.map((s, i) => (
                           <li key={i} className="text-xs bg-emerald-400/5 border border-emerald-400/10 p-2 rounded text-muted-foreground">
                             {s}
                           </li>
                         ))}
                       </ul>
                     </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                         <Target weight="fill" /> Focus Areas
                       </h4>
                       <ul className="space-y-2">
                         {analysis.feedback.improvements.map((s, i) => (
                           <li key={i} className="text-xs bg-orange-400/5 border border-orange-400/10 p-2 rounded text-muted-foreground">
                             {s}
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 </TabsContent>

                 <TabsContent value="trends" className="mt-0">
                    <ProgressChart
                      analyses={analyses || []}
                      selectedClubFilter={selectedClubFilter}
                      setSelectedClubFilter={setSelectedClubFilter}
                    />
                 </TabsContent>

                 <TabsContent value="drills" className="mt-0">
                   <div className="space-y-3">
                     {analysis.feedback.drills.map((drill, idx) => (
                       <Card key={idx} className="glass-card">
                         <CardHeader className="pb-2">
                           <div className="flex justify-between items-start">
                             <div>
                               <CardTitle className="text-sm font-bold">{drill.title}</CardTitle>
                               <CardDescription className="text-xs mt-1">{drill.focusArea}</CardDescription>
                             </div>
                             <Badge variant="outline" className="text-[10px]">{drill.difficulty}</Badge>
                           </div>
                         </CardHeader>
                         <CardContent>
                           <p className="text-xs text-muted-foreground">{drill.description}</p>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </TabsContent>
               </div>
             </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl bg-muted/5">
              Select an analysis to view metrics
            </div>
          )}
        </div>

        {/* Right Panel: History List - Spans 4 cols, scrollable */}
        <div className="hidden lg:block lg:col-span-4 h-full min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-muted-foreground">History</h3>
          </div>
          <Card className="flex-1 glass-card border-0 bg-black/20 overflow-hidden">
             {renderAnalysisList()}
          </Card>
        </div>

      </div>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
      <SwingComparisonDialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen} analyses={analyses || []} />
      <ClubSelectionDialog open={viewState.status === 'SELECTING_CLUB'} onOpenChange={handleDialogClose} onSelectClub={handleClubSelectionComplete} />
    </div>
  )
}
