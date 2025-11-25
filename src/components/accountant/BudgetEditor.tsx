// src/components/accountant/BudgetEditor.tsx
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { FinancialAudit, ACCOUNTANT_CATEGORIES } from '@/types/accountant';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { EditableField } from '../ui/EditableField';

export function BudgetEditor() {
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  const [audit] = useKV<FinancialAudit | null>('financial-audit', null);

  if (!report || !audit) {
    return <SarcasticLoader text="Loading budget data..." />;
  }

  const handleBudgetUpdate = (updatedBudget: FinancialReport['proposedBudget']) => {
    setReport(prevReport => {
      if (!prevReport) return null;
      return {
        ...prevReport,
        proposedBudget: updatedBudget,
      };
    });
  };

  const handleSubcategorySave = (categoryKey: keyof FinancialReport['proposedBudget'], subcategoryKey: string, newValue: number) => {
    const updatedBudget = { ...report.proposedBudget };
    const category = updatedBudget[categoryKey];
    if (category && typeof category === 'object' && 'subcategories' in category) {
      // @ts-ignore
      category.subcategories[subcategoryKey] = newValue;
      handleBudgetUpdate(updatedBudget);
    }
  };

  const totalBudgeted = Object.values(report.proposedBudget).reduce((total, category) => {
    const categoryTotal = Object.values(category.subcategories).reduce((sum, value) => sum + value, 0);
    return total + categoryTotal;
  }, 0);

  const isOverBudget = totalBudgeted > (audit.monthlyIncome || 0);

  return (
    <div className="space-y-4">
      {isOverBudget && (
        <div className="flex items-center p-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg">
          <AlertTriangle className="h-6 w-6 mr-4" />
          <div>
            <h3 className="font-bold">Budget Exceeded</h3>
            <p className="text-sm">Your total budgeted amount of ${totalBudgeted.toFixed(2)} is greater than your monthly income of ${audit.monthlyIncome?.toFixed(2)}.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold">Your Live Budget</h2>
            <p className="text-muted-foreground">Click any amount to edit. Changes are saved automatically.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="p-4 glass-card rounded-lg space-y-4">
        {Object.entries(report.proposedBudget).map(([categoryKey, categoryData]) => {
          const totalAllocated = Object.values(categoryData.subcategories).reduce((sum, value) => sum + value, 0);

          return (
            <div key={categoryKey} className="p-4 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg capitalize">
                  {ACCOUNTANT_CATEGORIES[categoryKey as keyof typeof ACCOUNTANT_CATEGORIES]?.label || categoryKey}
                </h3>
                <p className="text-xl font-mono font-bold text-cyan-400">
                  ${totalAllocated.toFixed(2)}
                </p>
              </div>
              <ul className="space-y-2 pl-4">
                {Object.entries(categoryData.subcategories).map(([subcatKey, subcatValue]) => (
                  <li key={subcatKey} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {ACCOUNTANT_CATEGORIES[categoryKey as keyof typeof ACCOUNTANT_CATEGORIES]?.subcategories[subcatKey as keyof typeof ACCOUNTANT_CATEGORIES[keyof typeof ACCOUNTANT_CATEGORIES]['subcategories']] || subcatKey}
                    </span>
                    <EditableField
                      initialValue={subcatValue as number}
                      onSave={(newValue) => handleSubcategorySave(categoryKey, subcatKey, newValue)}
                      className="font-mono text-base"
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
