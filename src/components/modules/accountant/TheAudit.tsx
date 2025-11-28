import { useState, useEffect } from 'react';
import { FinancialAudit, AuditResolution } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { GeminiCore } from '@/services/gemini_core';
import { useKV } from '@/hooks/use-kv';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logger } from '@/services/logger';

interface TheAuditProps {
  audit: FinancialAudit;
  setAudit: (audit: FinancialAudit) => void;
  onComplete: (audit: FinancialAudit) => void;
}

export function TheAudit({ audit, setAudit, onComplete }: TheAuditProps) {
  const [, setReport] = useKV<FinancialReport | null>('finance-report-v2', null);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<'scanning' | 'generating_report'>('scanning');
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);

  // 1. Initial Scan: If no flags exist, run the audit.
  useEffect(() => {
    const initAudit = async () => {
      if (audit.flags.length === 0 && !isLoading) {
        setIsLoading(true);
        setAnalyzingStep('scanning');
        try {
          const gemini = new GeminiCore();
          const result = await gemini.performFinancialAudit(audit);

          if (result.success) {
            setAudit({
              ...audit,
              flags: result.data,
              lastUpdated: new Date().toISOString()
            });
          } else {
            toast.error("Audit Protocol Failed: " + result.message);
          }
        } catch {
            toast.error("Connection Interrupted.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    initAudit();
    // We only want this to run when the audit flags length changes to 0 (reset/init)
    // or on mount if it's 0. We specifically want to avoid adding 'audit' as a full dep
    // because it changes on every resolution, which would re-trigger this logic if not careful.
    // However, eslint demands it. We can disable the rule or be more specific.
    // For safety, disabling the rule for this effect as it is a specific initialization logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit.flags.length]);

  // 2. Resolve a Flag
  const handleResolve = (resolution: AuditResolution) => {
    const updatedResolutions = [...audit.resolutions, resolution];

    // If acceptance involves changing a value (e.g. reduction), apply it to categories
    let updatedCategories = audit.categories;
    if (resolution.action === 'accept' && resolution.adjustedAmount !== undefined) {
        updatedCategories = audit.categories.map(cat => ({
            ...cat,
            subcategories: cat.subcategories.map(sub => {
                 // Try to match subcategory ID first
                 const flag = audit.flags.find(f => f.id === resolution.flagId);
                 if (flag?.subcategoryId === sub.id) {
                     return { ...sub, amount: resolution.adjustedAmount || sub.amount };
                 }
                 return sub;
            })
        }));
    }

    setAudit({
      ...audit,
      categories: updatedCategories,
      resolutions: updatedResolutions
    });

    // Move to next flag
    if (currentFlagIndex < audit.flags.length - 1) {
      setCurrentFlagIndex(prev => prev + 1);
    }
  };

  // 3. Finalize: Generate the Blueprint
  const handleFinalize = async () => {
    const auditId = audit.lastUpdated || 'unknown-audit-id';
    const userId = 'GuestUser'; // Placeholder until auth is implemented

    logger.info('TheAudit', 'Finalize button clicked', { userId, auditId });

    // Data Validation
    if (audit.monthlyIncome === null || audit.monthlyIncome === undefined) {
        logger.error('TheAudit', 'Validation Failed: monthlyIncome is missing', { audit });
        toast.error("Audit data is incomplete (missing income).");
        return;
    }

    logger.info('TheAudit', 'Payload Validation Passed', {
        monthlyIncome: audit.monthlyIncome,
        categoriesCount: audit.categories.length,
        flagsCount: audit.flags.length
    });

    setIsLoading(true);
    setAnalyzingStep('generating_report');
    try {
        logger.info('TheAudit', 'Sending request to Report Generator (GeminiCore)...');
        const gemini = new GeminiCore();
        const result = await gemini.generateFinalReport(audit);

        if (result.success) {
            logger.info('TheAudit', 'Report Generation Success');
            setReport(result.data);
            onComplete(audit); // This moves status to 'completed'
        } else {
            logger.error('TheAudit', 'Report Generation Failed (API Error)', { message: result.message, code: result.code });
            toast.error("Failed to generate final report: " + result.message);
        }
    } catch (error: any) {
        logger.error('TheAudit', 'CRITICAL FAILURE: Report Generation threw an exception', {
            error: error.message,
            stack: error.stack
        });
        toast.error("Failed to generate report. Check logs.");
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Render States ---

  if (isLoading) {
    return <SarcasticLoader text={analyzingStep === 'scanning' ? "Auditing your life choices..." : "Drafting the Blueprint..."} />;
  }

  if (audit.flags.length === 0) {
      // Edge case: AI returned no flags (User is perfect?)
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400">Zero Deficiencies Detected.</h2>
              <p className="text-muted-foreground">The Accountant has no notes. Impressive.</p>
              <Button onClick={handleFinalize} className="w-full max-w-xs">Generate Blueprint</Button>
          </div>
      );
  }

  // All flags resolved?
  const allResolved = audit.flags.length === audit.resolutions.length;
  if (allResolved) {
      return (
        <Card className="glass-card p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gradient-cyan">Audit Review Complete</h2>
            <p className="text-lg text-muted-foreground">
                Resolutions recorded. Ready to generate the final financial blueprint (v2.0).
            </p>
            <Button onClick={handleFinalize} className="w-full h-14 text-lg font-bold bg-cyan-600 hover:bg-cyan-500">
                Finalize & Generate Report <ArrowRight className="ml-2" />
            </Button>
        </Card>
      );
  }

  const currentFlag = audit.flags[currentFlagIndex];
  // If the user navigates back/forth manually (optional future feature), we need to check status.
  // For now, we just show the current un-resolved one effectively due to the index increment logic,
  // but if we wanted to show reviewed ones, we'd need logic here.
  // Simplified: We just show the current index.

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-10">
      <div className="flex items-center justify-between text-sm text-muted-foreground font-mono uppercase">
        <span>Deficiency {currentFlagIndex + 1} of {audit.flags.length}</span>
        <span>Severity: <span className={cn(
            currentFlag.severity === 'critical' ? "text-red-500 font-bold" :
            currentFlag.severity === 'warning' ? "text-amber-400" : "text-cyan-400"
        )}>{currentFlag.severity}</span></span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={currentFlag.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "glass-card p-8 border-l-4",
                currentFlag.severity === 'critical' ? "border-l-red-500" :
                currentFlag.severity === 'warning' ? "border-l-amber-500" : "border-l-cyan-500"
            )}>
                <div className="flex items-start gap-4 mb-6">
                    <AlertTriangle className={cn("h-8 w-8 mt-1",
                         currentFlag.severity === 'critical' ? "text-red-500" :
                         currentFlag.severity === 'warning' ? "text-amber-500" : "text-cyan-500"
                    )} />
                    <div>
                        <h3 className="text-2xl font-bold">{currentFlag.title}</h3>
                        <p className="text-lg mt-2 text-white/90 leading-relaxed">"{currentFlag.message}"</p>
                    </div>
                </div>

                {currentFlag.suggestedAction && (
                    <div className="bg-white/5 p-4 rounded-lg mb-8 border border-white/10">
                        <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Recommendation</p>
                        <p className="font-mono text-cyan-300">{currentFlag.suggestedAction}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={() => handleResolve({
                            flagId: currentFlag.id,
                            action: 'accept'
                            // Note: Parsing the reduced amount from text is hard.
                            // For V1 of this feature, 'accept' just acknowledges the flag without auto-changing the value
                            // unless we parsed a specific number. The prompt didn't strictly enforce a number return.
                            // We will mark it as accepted and let the Final Report generation handle the "Proposed Budget".
                        })}
                        className="h-12 border-green-500/30 hover:bg-green-500/10 text-green-400"
                        variant="outline"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> Acknowledge & Accept
                    </Button>
                    <Button
                         onClick={() => handleResolve({ flagId: currentFlag.id, action: 'justify', justification: 'User justified this expense.' })}
                         className="h-12 border-white/10 hover:bg-white/5"
                         variant="outline"
                    >
                        Justify (Keep As Is)
                    </Button>
                </div>
            </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
