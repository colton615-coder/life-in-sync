import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { SwingAnalysis } from '@/lib/types'
import { cn } from '@/lib/utils'
import { callAIWithRetry, parseAIJsonResponse, validateAIResponse } from '@/lib/ai-utils'
import { 
  Sparkle, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  TrendUp,
  Target,
  Lightning,
  Info,
  Backpack
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ComparisonReport {
  summary: string
  improvements: {
    metric: string
    change: string
    impact: string
    reason: string
  }[]
  regressions: {
    metric: string
    change: string
    impact: string
    reason: string
  }[]
  unchanged: {
    metric: string
    note: string
  }[]
  recommendations: string[]
  progressScore: number
  keyTakeaway: string
}

interface SwingComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analyses: SwingAnalysis[]
}

const toRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null

const VALID_IMPACT_VALUES = new Set(['High', 'Medium', 'Low'])

const normalizeMetricChanges = (items: unknown): ComparisonReport['improvements'] => {
  if (!Array.isArray(items)) return []

  return items.map((item) => {
    const record = toRecord(item)
    const rawImpact = typeof record?.impact === 'string' ? record.impact : null
    const impact = rawImpact && VALID_IMPACT_VALUES.has(rawImpact) ? rawImpact : 'Medium'

    return {
      metric: typeof record?.metric === 'string' ? record.metric : 'Metric',
      change: typeof record?.change === 'string' ? record.change : 'N/A',
      impact,
      reason: typeof record?.reason === 'string' ? record.reason : 'Details unavailable.'
    }
  })
}

const normalizeUnchangedMetrics = (items: unknown): ComparisonReport['unchanged'] => {
  if (!Array.isArray(items)) return []

  return items.map((item) => {
    const record = toRecord(item)

    return {
      metric: typeof record?.metric === 'string' ? record.metric : 'Metric',
      note: typeof record?.note === 'string' ? record.note : 'No additional notes.'
    }
  })
}

const normalizeRecommendations = (items: unknown): string[] => {
  if (!Array.isArray(items)) return []
  return items
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
}

const normalizeProgressScore = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function SwingComparisonDialog({ open, onOpenChange, analyses }: SwingComparisonDialogProps) {
  const [selectedSwing1, setSelectedSwing1] = useState<SwingAnalysis | null>(null)
  const [selectedSwing2, setSelectedSwing2] = useState<SwingAnalysis | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null)
  const [comparisonProgress, setComparisonProgress] = useState(0)

  const completedAnalyses = analyses.filter(a => a.status === 'completed' && a.metrics && a.feedback)

  useEffect(() => {
    if (!open) {
      setSelectedSwing1(null)
      setSelectedSwing2(null)
      setComparisonReport(null)
      setComparisonProgress(0)
    }
  }, [open])

  const handleCompare = async () => {
    if (!selectedSwing1 || !selectedSwing2) return

    setIsComparing(true)
    setComparisonProgress(0)

    const progressInterval = setInterval(() => {
      setComparisonProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      if (!window.spark || !window.spark.llm || !window.spark.llmPrompt) {
        throw new Error('Spark AI is unavailable. Please reload the page and try again.')
      }

      const prompt = window.spark.llmPrompt`You are an expert golf instructor analyzing two golf swings to provide detailed, actionable feedback on progress.

Swing 1 (Earlier):
- Upload Date: ${selectedSwing1.uploadedAt}
- Club: ${selectedSwing1.club || 'Not specified'}
- Overall Score: ${selectedSwing1.feedback!.overallScore}/100
- Metrics:
  * Hip Rotation: Backswing ${selectedSwing1.metrics!.hipRotation.backswing.toFixed(1)}°, Impact ${selectedSwing1.metrics!.hipRotation.impact.toFixed(1)}°, Total ${selectedSwing1.metrics!.hipRotation.total.toFixed(1)}°
  * Shoulder Rotation: Backswing ${selectedSwing1.metrics!.shoulderRotation.backswing.toFixed(1)}°, Impact ${selectedSwing1.metrics!.shoulderRotation.impact.toFixed(1)}°, Total ${selectedSwing1.metrics!.shoulderRotation.total.toFixed(1)}°
  * Head Movement: Lateral ${(selectedSwing1.metrics!.headMovement.lateral * 100).toFixed(1)}cm, Vertical ${(selectedSwing1.metrics!.headMovement.vertical * 100).toFixed(1)}cm, Stability: ${selectedSwing1.metrics!.headMovement.stability}
  * Spine Angle: Address ${selectedSwing1.metrics!.spineAngle.address.toFixed(1)}°, Backswing ${selectedSwing1.metrics!.spineAngle.backswing.toFixed(1)}°, Impact ${selectedSwing1.metrics!.spineAngle.impact.toFixed(1)}°
  * Tempo: Ratio ${selectedSwing1.metrics!.tempo.ratio.toFixed(2)}:1, Backswing ${selectedSwing1.metrics!.tempo.backswingTime.toFixed(2)}s, Downswing ${selectedSwing1.metrics!.tempo.downswingTime.toFixed(2)}s
  * Weight Transfer: ${selectedSwing1.metrics!.weightTransfer.rating}, Impact Shift ${selectedSwing1.metrics!.weightTransfer.impactShift}%
  * Swing Plane: Consistency ${(selectedSwing1.metrics!.swingPlane.consistency * 100).toFixed(0)}%
- AI Feedback: ${selectedSwing1.feedback!.aiInsights}
- Strengths: ${selectedSwing1.feedback!.strengths.join(', ')}
- Areas to Improve: ${selectedSwing1.feedback!.improvements.join(', ')}

Swing 2 (Later):
- Upload Date: ${selectedSwing2.uploadedAt}
- Club: ${selectedSwing2.club || 'Not specified'}
- Overall Score: ${selectedSwing2.feedback!.overallScore}/100
- Metrics:
  * Hip Rotation: Backswing ${selectedSwing2.metrics!.hipRotation.backswing.toFixed(1)}°, Impact ${selectedSwing2.metrics!.hipRotation.impact.toFixed(1)}°, Total ${selectedSwing2.metrics!.hipRotation.total.toFixed(1)}°
  * Shoulder Rotation: Backswing ${selectedSwing2.metrics!.shoulderRotation.backswing.toFixed(1)}°, Impact ${selectedSwing2.metrics!.shoulderRotation.impact.toFixed(1)}°, Total ${selectedSwing2.metrics!.shoulderRotation.total.toFixed(1)}°
  * Head Movement: Lateral ${(selectedSwing2.metrics!.headMovement.lateral * 100).toFixed(1)}cm, Vertical ${(selectedSwing2.metrics!.headMovement.vertical * 100).toFixed(1)}cm, Stability: ${selectedSwing2.metrics!.headMovement.stability}
  * Spine Angle: Address ${selectedSwing2.metrics!.spineAngle.address.toFixed(1)}°, Backswing ${selectedSwing2.metrics!.spineAngle.backswing.toFixed(1)}°, Impact ${selectedSwing2.metrics!.spineAngle.impact.toFixed(1)}°
  * Tempo: Ratio ${selectedSwing2.metrics!.tempo.ratio.toFixed(2)}:1, Backswing ${selectedSwing2.metrics!.tempo.backswingTime.toFixed(2)}s, Downswing ${selectedSwing2.metrics!.tempo.downswingTime.toFixed(2)}s
  * Weight Transfer: ${selectedSwing2.metrics!.weightTransfer.rating}, Impact Shift ${selectedSwing2.metrics!.weightTransfer.impactShift}%
  * Swing Plane: Consistency ${(selectedSwing2.metrics!.swingPlane.consistency * 100).toFixed(0)}%
- AI Feedback: ${selectedSwing2.feedback!.aiInsights}
- Strengths: ${selectedSwing2.feedback!.strengths.join(', ')}
- Areas to Improve: ${selectedSwing2.feedback!.improvements.join(', ')}

${selectedSwing1.club && selectedSwing2.club && selectedSwing1.club !== selectedSwing2.club ? `Note: These swings used different clubs (${selectedSwing1.club} vs ${selectedSwing2.club}), so some differences may be expected due to club selection rather than swing mechanics.` : ''}

Provide a detailed comparison report in JSON format with the following structure:
{
  "summary": "A brief 2-3 sentence overview of the overall progress between the two swings",
  "improvements": [
    {
      "metric": "Name of the metric that improved",
      "change": "Specific numeric change (e.g., '+10.5°' or 'Fair → Excellent')",
      "impact": "High/Medium/Low",
      "reason": "Detailed explanation of what specifically improved and why this change occurred (be specific about biomechanics)"
    }
  ],
  "regressions": [
    {
      "metric": "Name of the metric that regressed",
      "change": "Specific numeric change (e.g., '-5.2°')",
      "impact": "High/Medium/Low",
      "reason": "Detailed explanation of what specifically got worse and the likely biomechanical cause"
    }
  ],
  "unchanged": [
    {
      "metric": "Name of stable metric",
      "note": "Brief note about consistency"
    }
  ],
  "recommendations": [
    "Specific, actionable recommendation based on the comparison",
    "Another recommendation",
    "Third recommendation"
  ],
  "progressScore": 85,
  "keyTakeaway": "One powerful sentence summarizing the most important finding from this comparison"
}

Focus on biomechanical relationships - explain HOW one change affects another (e.g., "The 12° increase in hip rotation created more torque, which naturally improved head stability by reducing compensatory movements"). Be specific with numbers and causality.`

      const response = await callAIWithRetry(prompt, 'gpt-4o', true)
      const parsedReport = parseAIJsonResponse<Partial<ComparisonReport>>(response, 'Comparison report object with summary, improvements, regressions, unchanged, recommendations, progressScore, keyTakeaway')

      validateAIResponse(parsedReport, [
        'summary',
        'improvements',
        'regressions',
        'unchanged',
        'recommendations',
        'progressScore',
        'keyTakeaway'
      ])

      const normalizedReport: ComparisonReport = {
        summary: typeof parsedReport.summary === 'string' ? parsedReport.summary : 'No summary provided.',
        improvements: normalizeMetricChanges(parsedReport.improvements),
        regressions: normalizeMetricChanges(parsedReport.regressions),
        unchanged: normalizeUnchangedMetrics(parsedReport.unchanged),
        recommendations: normalizeRecommendations(parsedReport.recommendations),
        progressScore: normalizeProgressScore(parsedReport.progressScore),
        keyTakeaway: typeof parsedReport.keyTakeaway === 'string' ? parsedReport.keyTakeaway : 'Keep refining the fundamentals for more consistent swings.'
      }

      clearInterval(progressInterval)
      setComparisonProgress(100)

      setTimeout(() => {
        setComparisonReport(normalizedReport)
        setIsComparing(false)
      }, 300)

      toast.success('Comparison complete!', {
        description: 'Your detailed swing analysis is ready'
      })
    } catch (error) {
      console.error('Comparison failed:', error)
      const description = error instanceof Error ? error.message : 'Unable to generate comparison report. Please try again.'
      toast.error('Comparison failed', { description })
      setIsComparing(false)
    } finally {
      clearInterval(progressInterval)
    }
  }

  const renderSelectionView = () => (
    <div className="space-y-6">
      <Alert>
        <Info size={18} />
        <AlertDescription>
          Select two completed swing analyses to compare. The AI will identify specific improvements, regressions, and explain the biomechanical reasons behind each change.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">First Swing (Earlier)</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {completedAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedSwing1?.id === analysis.id && "border-primary bg-primary/5",
                    selectedSwing2?.id === analysis.id && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => setSelectedSwing1(analysis)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      {new Date(analysis.uploadedAt).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2">
                      <span>{new Date(analysis.uploadedAt).toLocaleTimeString()}</span>
                      {analysis.club && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Backpack size={12} />
                            {analysis.club}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Score:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.feedback!.overallScore}/100
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Second Swing (Later)</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {completedAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedSwing2?.id === analysis.id && "border-primary bg-primary/5",
                    selectedSwing1?.id === analysis.id && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => setSelectedSwing2(analysis)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      {new Date(analysis.uploadedAt).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2">
                      <span>{new Date(analysis.uploadedAt).toLocaleTimeString()}</span>
                      {analysis.club && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Backpack size={12} />
                            {analysis.club}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Score:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.feedback!.overallScore}/100
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedSwing1 && selectedSwing2 ? (
            <span className="text-foreground font-medium">2 swings selected - ready to compare</span>
          ) : (
            <span>Select two swings to compare</span>
          )}
        </div>
        <Button
          onClick={handleCompare}
          disabled={!selectedSwing1 || !selectedSwing2 || isComparing}
          className="gap-2"
          size="lg"
        >
          <Sparkle size={20} weight="bold" />
          Compare Swings
        </Button>
      </div>
    </div>
  )

  const renderProcessingView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <Sparkle size={48} weight="duotone" className="text-primary" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">Analyzing Your Swings</h3>
      <p className="text-muted-foreground text-center mb-6">
        AI is comparing metrics and identifying key improvements...
      </p>
      <Progress value={comparisonProgress} className="h-3 w-full max-w-md mb-2" />
      <p className="text-sm text-muted-foreground">{comparisonProgress}%</p>
    </motion.div>
  )

  const renderComparisonView = () => {
    if (!comparisonReport) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="glass-card border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendUp size={24} className="text-cyan-400" />
                  PROGRESS SCORE
                </CardTitle>
                <CardDescription className="mt-1 text-slate-400">
                  {comparisonReport.summary}
                </CardDescription>
              </div>
              <div className="text-4xl font-black text-cyan-400 font-mono tabular-nums">
                {comparisonReport.progressScore}/100
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-slate-500">
              <Sparkle size={16} weight="duotone" className="text-purple-400" />
              Key Takeaway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-white leading-relaxed font-mono">{comparisonReport.keyTakeaway}</p>
          </CardContent>
        </Card>

        {comparisonReport.improvements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 text-emerald-400">
              <ArrowUp size={16} weight="bold" />
              Improvements
            </h3>
            {comparisonReport.improvements.map((improvement, idx) => (
              <Card key={idx} className="glass-card border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm font-bold text-white">{improvement.metric}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      >
                        {improvement.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono">
                        {improvement.change}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-slate-300 font-mono opacity-80">{improvement.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {comparisonReport.regressions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 text-red-400">
              <ArrowDown size={16} weight="bold" />
              Regressions
            </h3>
            {comparisonReport.regressions.map((regression, idx) => (
              <Card key={idx} className="glass-card border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm font-bold text-white">{regression.metric}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className="text-[10px] border-red-500/30 text-red-400 bg-red-500/10"
                      >
                        {regression.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 bg-red-500/10 font-mono">
                        {regression.change}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-slate-300 font-mono opacity-80">{regression.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {comparisonReport.unchanged.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Minus size={24} className="text-muted-foreground" weight="bold" />
              Consistent Areas
            </h3>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="grid gap-2">
                  {comparisonReport.unchanged.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" weight="fill" />
                      <div>
                        <span className="font-medium">{item.metric}:</span> {item.note}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {comparisonReport.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target size={24} className="text-primary" weight="bold" />
              Next Steps
            </h3>
            <Card className="glass-card border-primary/30">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {comparisonReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightning size={18} className="text-primary mt-0.5 flex-shrink-0" weight="bold" />
                      <span className="text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setComparisonReport(null)
              setSelectedSwing1(null)
              setSelectedSwing2(null)
            }}
          >
            New Comparison
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </motion.div>
    )
  }

  if (completedAnalyses.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Not Enough Analyses</DialogTitle>
            <DialogDescription>
              You need at least 2 completed swing analyses to use the comparison feature.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <Info size={18} />
            <AlertDescription>
              Upload and analyze more golf swings to unlock swing comparison and track your progress over time.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={24} weight="duotone" className="text-primary" />
            AI Swing Comparison
          </DialogTitle>
          <DialogDescription>
            Compare two swings to see what improved, what regressed, and understand why
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <AnimatePresence mode="wait">
            {isComparing ? (
              <motion.div key="processing">
                {renderProcessingView()}
              </motion.div>
            ) : comparisonReport ? (
              <motion.div key="comparison">
                {renderComparisonView()}
              </motion.div>
            ) : (
              <motion.div key="selection">
                {renderSelectionView()}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
