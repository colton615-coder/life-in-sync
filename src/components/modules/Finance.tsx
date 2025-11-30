import { useState } from 'react';
import { FinancialAudit } from '@/types/accountant';
import { AnimatePresence, motion } from 'framer-motion';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { IntakeForm } from './accountant/IntakeForm';
import { DataEntry } from './accountant/DataEntry';
import { TheAudit } from './accountant/TheAudit';
import { BudgetManager } from './accountant/BudgetManager';
import { useFinanceMigration } from '@/hooks/use-finance-migration';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { PowerOff } from 'lucide-react';

export function Finance() {
  const { audit, setAudit, isResetting } = useFinanceMigration();
  // Local state to manage the transition from "System Offline" to "Intake Form"
  const [isIntakeStarted, setIsIntakeStarted] = useState(false);

  const handleIntakeComplete = (income: number) => {
    setAudit(prev => ({
      ...prev,
      monthlyIncome: income,
      status: 'data_entry',
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleDataEntryComplete = () => {
    setAudit(prev => ({
      ...prev,
      status: 'audit_review',
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleAuditComplete = (finalAudit: FinancialAudit) => {
    setAudit({
      ...finalAudit,
      status: 'completed',
      lastUpdated: new Date().toISOString()
    });
  };

  // If we are actively resetting, show the loader.
  // If audit is missing (loading), we also show loader, unless it hangs.
  if (!audit || isResetting) {
    return <SarcasticLoader text="Initializing Finance 2.0 Protocols..." context="finance" />;
  }

  const SystemOfflineView = () => (
    <div className="pt-20 px-4 flex justify-center items-center h-full">
      <Card className="glass-card max-w-lg w-full p-10 flex flex-col items-center justify-center text-center border-red-500/30 bg-red-950/10 backdrop-blur-xl relative overflow-hidden">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <PowerOff className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="relative z-10 text-3xl font-bold text-white mb-3 tracking-tight">System Offline</h2>
        <p className="relative z-10 text-muted-foreground mb-10 text-lg leading-relaxed">
          Financial database not found. <br/> Initialize "The Accountant" protocols to begin audit.
        </p>

        <Button
          size="lg"
          className="relative z-10 h-16 px-10 text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] border-none transition-all hover:scale-105 active:scale-95"
          onClick={() => setIsIntakeStarted(true)}
        >
          Initialize Financial Interview
        </Button>
      </Card>
    </div>
  );

  // Render the appropriate phase based on status
  const renderPhase = () => {
    switch (audit.status) {
      case 'intake':
        if (!isIntakeStarted) {
          return <SystemOfflineView />;
        }
        return (
          <IntakeForm
            onComplete={handleIntakeComplete}
            initialIncome={audit.monthlyIncome}
          />
        );
      case 'data_entry':
        return (
          <DataEntry
            audit={audit}
            setAudit={setAudit}
            onComplete={handleDataEntryComplete}
          />
        );
      case 'audit_review':
        return (
          <TheAudit
            audit={audit}
            setAudit={setAudit}
            onComplete={handleAuditComplete}
          />
        );
      case 'completed':
        return (
          <BudgetManager
            audit={audit}
            setAudit={setAudit}
          />
        );
      default:
        return <div>Error: Unknown State</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-0 py-4 min-h-[80vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={audit.status + (isIntakeStarted ? '-active' : '-offline')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderPhase()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
