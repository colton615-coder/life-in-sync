import { useState } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialAudit, ACCOUNTANT_CATEGORIES } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { GeminiCore } from '@/services/gemini_core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/Card';
import { ArrowLeft, ArrowRight, BrainCircuit } from 'lucide-react';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { FirstMeeting } from '../accountant/FirstMeeting';
import { BudgetManager } from '../accountant/BudgetManager';

// Define the initial state for a new audit
const createNewAudit = (): FinancialAudit => {
  const expenses = {} as FinancialAudit['expenses'];
  for (const catKey in ACCOUNTANT_CATEGORIES) {
    const category = catKey as keyof typeof ACCOUNTANT_CATEGORIES;
    // @ts-ignore
    expenses[category] = {};
    for (const subcatKey in ACCOUNTANT_CATEGORIES[category].subcategories) {
      // @ts-ignore
      expenses[category][subcatKey] = null;
    }
  }

  return {
    monthlyIncome: null,
    expenses,
    auditCompletedAt: null,
    version: '1.0',
  };
};

export function Finance() {
  const [audit, setAudit] = useKV<FinancialAudit>('financial-audit', createNewAudit());
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  const [meetingCompleted, setMeetingCompleted] = useKV<boolean>('meeting-completed', false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditSteps = [
    'monthlyIncome',
    ...Object.keys(ACCOUNTANT_CATEGORIES),
  ] as const;

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gemini = new GeminiCore();
      const completedAudit = { ...audit, auditCompletedAt: new Date().toISOString() };
      setAudit(completedAudit);
      const generatedReport = await gemini.generateFinancialReport(completedAudit);
      setReport(generatedReport);
    } catch (err) {
      console.error("Failed to generate financial report:", err);
      setError("The Accountant is currently unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < auditSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: complete the audit and generate the report
      generateReport();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    const stepKey = auditSteps[currentStep];

    if (isLoading) {
      return <SarcasticLoader text="Analyzing your questionable life choices..." />;
    }

    if (error) {
      return (
        <Card className="glass-card text-center p-8 border-red-500/50">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={generateReport}>Try Again</Button>
        </Card>
      );
    }

    if (meetingCompleted && report) {
      return <BudgetManager />;
    }

    if (report) {
       return <FirstMeeting onComplete={() => setMeetingCompleted(true)} />;
    }

    if (audit?.auditCompletedAt && !report) {
       return (
        <Card className="glass-card text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-gradient-cyan">Audit Submitted</h2>
           <p className="text-muted-foreground mb-6">Your financial data has been sent to "The Accountant". Generate your report to continue.</p>
          <Button onClick={generateReport}>Generate Report</Button>
        </Card>
      );
    }

    if (stepKey === 'monthlyIncome') {
      return (
        <Card className="glass-card p-6">
          <Label htmlFor="monthly-income" className="text-lg font-semibold">What is your total monthly income?</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">This helps establish your baseline budget.</p>
          <Input
            id="monthly-income"
            type="number"
            placeholder="e.g., 5000"
            value={audit.monthlyIncome || ''}
            onChange={(e) => setAudit(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || null }))}
            className="h-12 text-lg glass-morphic"
          />
        </Card>
      );
    }

    const categoryKey = stepKey as keyof typeof ACCOUNTANT_CATEGORIES;
    const category = ACCOUNTANT_CATEGORIES[categoryKey];

    return (
      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">{category.label}</h3>
        <div className="space-y-4">
          {Object.entries(category.subcategories).map(([subcatKey, subcatLabel]) => (
            <div key={subcatKey}>
              <Label htmlFor={`${categoryKey}-${subcatKey}`} className="font-semibold">{subcatLabel}</Label>
              <Input
                id={`${categoryKey}-${subcatKey}`}
                type="number"
                placeholder="0.00"
                value={audit.expenses[categoryKey][subcatKey as keyof typeof audit.expenses[typeof categoryKey]] || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setAudit(prev => {
                    const newExpenses = { ...prev.expenses };
                    // @ts-ignore
                    newExpenses[categoryKey][subcatKey] = isNaN(value) ? null : value;
                    return { ...prev, expenses: newExpenses };
                  });
                }}
                className="h-12 glass-morphic mt-1"
              />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (!audit) {
    return <SarcasticLoader />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-1 md:px-0 pt-4">
       <div className="text-center">
         <h1 className="text-4xl font-bold tracking-tight text-gradient-cyan">The Accountant</h1>
         <p className="text-lg text-muted-foreground/80 mt-2">Your personal AI financial advisor.</p>
       </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2.5">
        <motion.div
          className="bg-cyan-400 h-2.5 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / auditSteps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {!audit.auditCompletedAt && !report && (
        <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {auditSteps.length}
            </p>
            <Button onClick={handleNext} disabled={isLoading}>
            {currentStep === auditSteps.length - 1 ? 'Finish & Analyze' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )}
    </div>
  );
}
