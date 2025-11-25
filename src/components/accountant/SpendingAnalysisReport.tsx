// src/components/accountant/SpendingAnalysisReport.tsx
import { FinancialReport } from '@/types/financial_report';
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, TrendingDown } from 'lucide-react';

interface SpendingAnalysisReportProps {
  analysis: FinancialReport['spendingAnalysis'];
}

export function SpendingAnalysisReport({ analysis }: SpendingAnalysisReportProps) {
  const totalSpending = analysis.reduce((sum, item) => sum + item.totalSpent, 0);

  // Sort by health score, worst to best
  const sortedAnalysis = [...analysis].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Spending Analysis</h2>
        <p className="text-muted-foreground">Here's how "The Accountant" views your spending habits.</p>
      </div>

      <div className="space-y-4">
        {sortedAnalysis.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 border border-white/10 rounded-lg glass-card-secondary"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg capitalize">{item.category.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="text-2xl font-mono font-bold text-cyan-400">${item.totalSpent.toFixed(2)}</p>
              </div>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold
                  ${item.healthScore <= 4 ? 'bg-red-500/20 text-red-400' : ''}
                  ${item.healthScore > 4 && item.healthScore <= 7 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  ${item.healthScore > 7 ? 'bg-green-500/20 text-green-400' : ''}
                `}
              >
                {item.healthScore <= 4 && <TrendingDown className="h-4 w-4" />}
                {item.healthScore > 7 && <TrendingUp className="h-4 w-4" />}
                <span>Health: {item.healthScore}/10</span>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 my-3">
              <div
                className="bg-cyan-400 h-2.5 rounded-full"
                style={{ width: `${(item.totalSpent / totalSpending) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground italic">"{item.aiSummary}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
