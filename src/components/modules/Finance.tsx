import { useState, useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialAudit, INITIAL_TEMPLATE_CATEGORIES } from '@/types/accountant';
import { AnimatePresence, motion } from 'framer-motion';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { IntakeForm } from './accountant/IntakeForm';
import { DataEntry } from './accountant/DataEntry';
import { TheAudit } from './accountant/TheAudit';
import { BudgetManager } from './accountant/BudgetManager';
import { v4 as uuidv4 } from 'uuid';

// Initial state for Finance 2.0
const INITIAL_AUDIT: FinancialAudit = {
  version: '2.0',
  lastUpdated: new Date().toISOString(),
  status: 'intake',
  monthlyIncome: null,
  categories: INITIAL_TEMPLATE_CATEGORIES.map(c => ({
    id: uuidv4(),
    name: c.name,
    subcategories: c.subcategories.map(s => ({
      id: uuidv4(),
      name: s,
      amount: null
    }))
  })),
  flags: [],
  resolutions: []
};

export function Finance() {
  const [audit, setAudit] = useKV<FinancialAudit>('finance-audit-v2', INITIAL_AUDIT);
  const [isResetting, setIsResetting] = useState(false);

  // Migration/Reset Logic: If we detect version mismatch or explicit reset
  useEffect(() => {
    if (audit) {
      if (audit.version !== '2.0') {
        console.log('Migrating to Finance 2.0...');
        setAudit(INITIAL_AUDIT);
      } else if (audit.categories.some(c => c.name === 'Transportation')) {
        // Fix for backend crash: Remove Transportation category if present
        console.log('Sanitizing audit data: Removing Transportation category...');
        setAudit(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.name !== 'Transportation')
        }));
      }
    }
  }, [audit, setAudit]);

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

  if (!audit || isResetting) {
    return <SarcasticLoader text="Initializing Finance 2.0 Protocols..." />;
  }

  // Render the appropriate phase based on status
  const renderPhase = () => {
    switch (audit.status) {
      case 'intake':
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
          key={audit.status}
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
