// src/components/accountant/FirstMeeting.tsx
import { useState } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { SpendingAnalysisReport } from './SpendingAnalysisReport';
import { ProposedBudgetReport } from './ProposedBudgetReport';
import { AdviceReport } from './AdviceReport';

const MEETING_STEPS = ['introduction', 'spendingAnalysis', 'proposedBudget', 'moneyManagementAdvice', 'conclusion'] as const;

interface FirstMeetingProps {
  onComplete: () => void;
}

export function FirstMeeting({ onComplete }: FirstMeetingProps) {
  const [report] = useKV<FinancialReport | null>('financial-report', null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < MEETING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle meeting conclusion
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderMeetingStep = () => {
    const stepKey = MEETING_STEPS[currentStep];

    switch (stepKey) {
      case 'introduction':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Your First Meeting</h2>
            <p className="text-muted-foreground">"The Accountant" has completed a thorough analysis of your financial audit. This meeting will walk you through the findings, present a tailored budget, and provide actionable advice to help you achieve your financial goals. Let's begin.</p>
          </div>
        );
      case 'spendingAnalysis':
        return <SpendingAnalysisReport analysis={report!.spendingAnalysis} />;
      case 'proposedBudget':
        return <ProposedBudgetReport budget={report!.proposedBudget} />;
      case 'moneyManagementAdvice':
        return <AdviceReport advice={report!.moneyManagementAdvice} />;
      case 'conclusion':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Meeting Concluded</h2>
            <p className="text-muted-foreground">You have reviewed your financial analysis and the proposed plan. The next step is to implement this budget and begin tracking your daily transactions. "The Accountant" will be here to guide you and help you stay on track.</p>
          </div>
        );
      default:
        return <div>Invalid step.</div>;
    }
  };

  if (!report) {
    return <SarcasticLoader text="Locating your financial report..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-center">First Meeting with The Accountant</h1>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 glass-card rounded-lg"
        >
          {renderMeetingStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {MEETING_STEPS.length}
        </p>
        <Button onClick={handleNext}>
          {currentStep === MEETING_STEPS.length - 1 ? 'Finish Meeting' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
