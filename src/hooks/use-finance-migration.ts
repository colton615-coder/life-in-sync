import { useState, useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialAudit, INITIAL_TEMPLATE_CATEGORIES } from '@/types/accountant';
import { APP_CONFIG } from '@/lib/constants';

// Initial state for Finance 2.0
const INITIAL_AUDIT: FinancialAudit = {
  version: '2.0',
  lastUpdated: new Date().toISOString(),
  status: 'intake',
  monthlyIncome: null,
  categories: INITIAL_TEMPLATE_CATEGORIES.map(c => ({
    id: crypto.randomUUID(), // Using native crypto in modern browsers/node
    name: c.name,
    subcategories: c.subcategories.map(s => ({
      id: crypto.randomUUID(),
      name: s,
      amount: null
    }))
  })),
  flags: [],
  resolutions: []
};

export function useFinanceMigration() {
  const [audit, setAudit] = useKV<FinancialAudit>(APP_CONFIG.STORAGE_KEYS.FINANCE.AUDIT, INITIAL_AUDIT);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (audit) {
      let hasChanges = false;
      let nextAudit = { ...audit };

      // Check Version
      if (audit.version !== APP_CONFIG.VERSION) {
        console.log(`Migrating to Finance ${APP_CONFIG.VERSION}...`);
        nextAudit = INITIAL_AUDIT;
        hasChanges = true;
      }
      // Check for Transportation Crash
      else if (audit.categories.some(c => c.name === 'Transportation')) {
        console.log('Sanitizing audit data: Removing Transportation category...');
        nextAudit = {
          ...audit,
          categories: audit.categories.filter(c => c.name !== 'Transportation')
        };
        hasChanges = true;
      }

      if (hasChanges) {
        setAudit(nextAudit);
      }
    }
  }, [audit, setAudit]);

  return {
    audit,
    setAudit,
    isResetting,
    setIsResetting
  };
}
