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
  Target,
  CheckCircle,
  ChartBar,
  Sparkle,
  Trash,
  ArrowsLeftRight,
  List,
  Warning
} from '@phosphor-icons/react'
import { SwingAnalysis, GolfClub, SwingMetrics } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'
import { toast } from 'sonner'
import { processVideo, analyzePoseData, generateFeedback } from '@/lib/golf/swing-analyzer'
import { validateVideoFile } from '@/lib/golf/video-utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VideoPlayerContainer } from '@/components/VideoPlayerContainer'
import { KnoxHUD } from '@/components/KnoxHUD'
import { SwingComparisonDialog } from '@/components/SwingComparisonDialog'
import { ClubSelectionDialog } from '@/components/ClubSelectionDialog'
import { GolfSwingState } from '@/lib/golf/state'
import { AnalysisCockpit } from '@/components/golf/AnalysisCockpit'

/**
 * MetricCard: High-density visualization for a single data point.
 * Refactored for Midnight Glass aesthetic.
 */
function MetricCard({
  label,
  value,
  subValue,
  score,
  type = 'value',
  delay = 0
}: {
  label: string
  value: string | number
  subValue?: string
  score: number | 'excellent' | 'good' | 'fair' | 'poor'
  type?: 'value' | 'rating'
  delay?: number
}) {
  const isGood = typeof score === 'number'
    ? score >= 70
    : ['excellent', 'good'].includes(score)

  const progressColor = isGood ? 'bg-[#2E8AF7]' : 'bg-orange-500' // Electric Blue vs Warning Orange

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:bg-white/10 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">{label}</span>
          {typeof score === 'string' && (
               <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-5 border-0 bg-black/20 backdrop-blur font-mono", isGood ? "text-[#2E8AF7]" : "text-orange-500")}>
                 {score.toUpperCase()}
               </Badge>
            )}
        </div>

        <div className="space-y-2">
          <div className={cn("text-2xl font-bold tabular-nums tracking-tight font-mono text-[#2E8AF7] drop-shadow-[0_0_8px_rgba(46,138,247,0.5)]")}>
            {value}
          </div>

          {type === 'value' && typeof score === 'number' && (
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, score)}%` }}
                 transition={{ duration: 1, delay: delay + 0.2, ease: "circOut" }}
                 className={cn("h-full shadow-[0_0_10px_currentColor]", progressColor)}
               />
             </div>
          )}

          {subValue && (
            <div className="text-[10px] text-slate-500 truncate font-mono opacity-80 group-hover:opacity-100 transition-opacity">
              {subValue}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MetricsGrid({ metrics }: { metrics: SwingMetrics }) {
  const hipScore = Math.min(100, (metrics.hipRotation.total / 90) * 100)
  const shoulderScore = Math.min(100, (metrics.shoulderRotation.total / 100) * 100)
  const tempoScore = Math.abs(metrics.tempo.ratio - 2.0) < 0.3 ? 100 : 40

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <MetricCard
        label="Hip Rot."
        value={`${metrics.hipRotation.total.toFixed(0)}°`}
        subValue={`Impact: ${metrics.hipRotation.impact.toFixed(0)}°`}
        score={hipScore}
        delay={0.1}
      />
      <MetricCard
        label="Shldr Turn"
        value={`${metrics.shoulderRotation.total.toFixed(0)}°`}
        subValue={`Back: ${metrics.shoulderRotation.backswing.toFixed(0)}°`}
        score={shoulderScore}
        delay={0.2}
      />
      <MetricCard
        label="Head Stab."
        value={metrics.headMovement.stability}
        subValue={`Lat: ${(metrics.headMovement.lateral * 100).toFixed(1)}cm`}
        score={metrics.headMovement.stability}
        type="rating"
        delay={0.3}
      />
      <MetricCard
        label="Tempo"
        value={`${metrics.tempo.ratio.toFixed(2)}`}
        subValue="Target 2.0:1"
        score={tempoScore}
        delay={0.4}
      />
      <MetricCard
        label="Weight Tr."
        value={metrics.weightTransfer.rating}
        subValue={`Shift: ${metrics.weightTransfer.impactShift}%`}
        score={metrics.weightTransfer.rating}
        type="rating"
        delay={0.5}
      />
      <MetricCard
        label="Plane"
        value={`${(metrics.swingPlane.consistency * 100).toFixed(0)}%`}
        subValue="Consistency"
        score={metrics.swingPlane.consistency * 100}
        delay={0.6}
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
        <Alert className="mt-6 bg-transparent border border-dashed border-white/10 text-slate-400">
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
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Score History</h3>
          <Select value={selectedClubFilter} onValueChange={setSelectedClubFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-white/5 border-white/10 text-white rounded-lg font-mono">
              <SelectValue placeholder="Filter Club" />
            </SelectTrigger>
            <SelectContent className="bg-[#151925] border-white/10 text-white">
              <SelectItem value="all">All Clubs</SelectItem>
              {availableClubs.map(club => (
                <SelectItem key={club} value={club}>{club}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 border border-white/5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Average</div>
            <div className="text-2xl font-bold text-[#2E8AF7] font-mono tracking-tight drop-shadow-[0_0_8px_rgba(46,138,247,0.5)]">{avgScore}</div>
          </div>
           <div className="glass-card p-4 border border-white/5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Total Swings</div>
            <div className="text-2xl font-bold text-[#2E8AF7] font-mono tracking-tight drop-shadow-[0_0_8px_rgba(46,138,247,0.5)]">{filteredAnalyses.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/5">
          {chartData.length > 0 ? (
              <div className="h-[150px] flex items-end justify-between gap-2 pt-4">
                {chartData.map((data, idx) => {
                  const height = (data.score / 100) * 100
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col items-center">
                        <div
                          className="w-full max-w-[20px] bg-[#2E8AF7]/80 rounded-t-sm transition-all group-hover:bg-[#2E8AF7] hover:shadow-[0_0_15px_rgba(46,138,247,0.5)]"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                         <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-[#151925]/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10 transition-opacity font-mono text-white">
                            {data.score} | {data.date}
                         </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-slate-500 text-xs font-mono">
                No data available
              </div>
            )}
        </div>
      </div>
    )
}

export function GolfSwing() {
  const [analyses, setAnalyses] = useKV<SwingAnalysis[]>('golf-swing-analyses', [])
  const [viewState, setViewState] = useState<GolfSwingState>({ status: 'IDLE' })
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false)
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('all')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

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
      const poseData = await processVideo(file, (progress, status) => {
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
    setHistoryOpen(false)
  }

  const renderProcessingState = () => {
    if (viewState.status !== 'ANALYZING') return null
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 justify-center mb-6">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
               <Sparkle size={24} weight="duotone" className="text-[#2E8AF7]" />
             </motion.div>
             <span className="text-[#2E8AF7] font-bold text-lg tracking-widest uppercase">
                 Systems Processing
             </span>
          </div>
          <div className="space-y-4">
             <Progress value={viewState.progress} className="h-1 bg-white/10" />
             <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{viewState.step}</span>
                <span className="text-[#2E8AF7]">{viewState.progress}%</span>
             </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderErrorState = () => {
    if (viewState.status !== 'ERROR') return null
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Warning size={48} className="text-red-500" />
        <h3 className="text-xl font-bold text-red-400">System Failure</h3>
        <p className="text-muted-foreground">{viewState.message}</p>
        <Button variant="outline" onClick={() => setViewState({ status: 'IDLE' })}>Reset Dashboard</Button>
      </div>
    )
  }

  // MASTER DIRECTIVE: HARDCODED TEXT CONTRAST & ANIMATION REMOVAL
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 md:px-6">
      <div className="glass-card rounded-3xl p-12 max-w-2xl w-full">
        <motion.div animate={{ rotateY: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mb-6">
          <Video size={80} weight="duotone" className="text-[#2E8AF7]/50 mx-auto" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-black mb-4 text-white">SWING ANALYZER <span className="text-[#2E8AF7]">PRO</span></h2>
        {/* Force slate-200 for readability */}
        <p className="text-slate-200 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
            Upload your swing to initialize the biometric engine.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => fileInputRef.current?.click()} className="gap-2 text-base md:text-lg px-8 py-6 rounded-full bg-[#2E8AF7] hover:bg-[#2E8AF7]/90 text-white font-bold shadow-[0_0_20px_rgba(46,138,247,0.4)] transition-all hover:scale-105 border-0">
                <Upload size={24} weight="bold" /> INITIATE UPLOAD
            </Button>
            {analyses && analyses.length > 0 && (
                <Button variant="outline" size="lg" onClick={() => setHistoryOpen(true)} className="lg:hidden gap-2 px-6 py-6 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
                   <List size={24} /> HISTORY
                </Button>
            )}
        </div>
      </div>
    </div>
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
                "cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between group",
                activeAnalysisId === analysis.id
                  ? "bg-[#2E8AF7]/10 border-[#2E8AF7]/30 shadow-[0_0_15px_rgba(46,138,247,0.1)]"
                  : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
              )}
              onClick={() => handleViewAnalysis(analysis)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate text-slate-200">
                    {analysis.club || 'Unknown Club'}
                  </span>
                  {analysis.feedback && (
                     <Badge variant="outline" className={cn("text-[10px] h-5 border-0 font-mono", analysis.feedback.overallScore >= 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400")}>
                       {analysis.feedback.overallScore}
                     </Badge>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {new Date(analysis.uploadedAt).toLocaleDateString()} • {new Date(analysis.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 hover:bg-red-400/10"
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

  // Refactor 2.0: If viewing result, show AnalysisCockpit
  if (viewState.status === 'VIEWING_RESULT' && viewState.analysis) {
    return (
      <AnalysisCockpit
        analysis={viewState.analysis}
        onBack={() => setViewState({ status: 'IDLE' })}
      />
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col pt-2 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 shrink-0">
        <h1 className="text-xl font-black flex items-center gap-2 tracking-tight text-white">
          <span className="text-[#2E8AF7]">///</span> SWING ANALYZER
        </h1>
        <div className="flex gap-2">
           <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <List size={20} />
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-[#0B0E14] border-r-white/10">
                <SheetHeader>
                    <SheetTitle className="text-left text-white">Mission History</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                    {renderAnalysisList()}
                </div>
             </SheetContent>
           </Sheet>

           <Button variant="outline" size="sm" onClick={() => setComparisonDialogOpen(true)} className="hidden md:flex border-white/10 hover:bg-white/5 bg-transparent text-slate-200">
             <ArrowsLeftRight size={16} className="mr-2" /> COMPARE
           </Button>
           <Button size="sm" onClick={() => fileInputRef.current?.click()} className="bg-white/10 hover:bg-white/20 text-white border-0">
             <Upload size={16} className="mr-2" /> UPLOAD
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 overflow-hidden min-h-0 pb-4">

        {/* Left/Top Panel: Media + Timeline (Hero) - Spans 8 cols on desktop */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto lg:overflow-visible no-scrollbar">
            <div className="aspect-video w-full rounded-2xl bg-white/5 backdrop-blur border border-dashed border-white/10 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p>Select mission data</p>
              </div>
            </div>
        </div>

        {/* Right Panel: History List - Spans 4 cols, scrollable */}
        <div className="hidden lg:block lg:col-span-4 h-full min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xs text-slate-400 tracking-[0.2em] uppercase">Archive</h3>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
             {renderAnalysisList()}
          </div>
        </div>

      </div>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
      <SwingComparisonDialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen} analyses={analyses || []} />
      <ClubSelectionDialog open={viewState.status === 'SELECTING_CLUB'} onOpenChange={handleDialogClose} onSelectClub={handleClubSelectionComplete} />
    </div>
  )
}
