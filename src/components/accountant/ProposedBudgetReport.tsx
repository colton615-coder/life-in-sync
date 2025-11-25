// src/components/accountant/ProposedBudgetReport.tsx
import { FinancialReport } from '@/types/financial_report';
import { ACCOUNTANT_CATEGORIES } from '@/types/accountant';
import { motion } from 'framer-motion';

interface ProposedBudgetReportProps {
  budget: FinancialReport['proposedBudget'];
}

export function ProposedBudgetReport({ budget }: ProposedBudgetReportProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Proposed Monthly Budget</h2>
        <p className="text-muted-foreground">A disciplined plan for your financial future.</p>
      </div>

      <div className="space-y-4">
        {Object.entries(budget).map(([categoryKey, categoryData], index) => (
          <motion.div
            key={categoryKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 border border-white/10 rounded-lg glass-card-secondary"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg capitalize">
                {ACCOUNTANT_CATEGORIES[categoryKey as keyof typeof ACCOUNTANT_CATEGORIES].label}
              </h3>
              <p className="text-xl font-mono font-bold text-cyan-400">
                ${categoryData.allocatedAmount.toFixed(2)}
              </p>
            </div>
            <ul className="space-y-1 pl-4">
              {Object.entries(categoryData.subcategories).map(([subcatKey, subcatValue]) => (
                <li key={subcatKey} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {ACCOUNTANT_CATEGORIES[categoryKey as keyof typeof ACCOUNTANT_CATEGORIES].subcategories[subcatKey as keyof typeof ACCOUNTANT_CATEGORIES[keyof typeof ACCOUNTANT_CATEGORIES]['subcategories']]}
                  </span>
                  <span className="font-mono">${(subcatValue as number).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
