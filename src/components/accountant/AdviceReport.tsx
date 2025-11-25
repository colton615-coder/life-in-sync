// src/components/accountant/AdviceReport.tsx
import { FinancialReport } from '@/types/financial_report';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { ACCOUNTANT_CATEGORIES } from '@/types/accountant';

interface AdviceReportProps {
  advice: FinancialReport['moneyManagementAdvice'];
}

export function AdviceReport({ advice }: AdviceReportProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Actionable Advice</h2>
        <p className="text-muted-foreground">Key strategies for improving your financial health.</p>
      </div>

      <div className="space-y-4">
        {advice.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="p-4 border border-white/10 rounded-lg glass-card-secondary"
          >
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{tip.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                <p className="text-xs font-mono mt-2 text-cyan-400/80">
                  Category: {ACCOUNTANT_CATEGORIES[tip.relatedCategory].label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
