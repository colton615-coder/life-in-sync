import { useState, useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialAudit, DEFAULT_ACCOUNTANT_CATEGORIES, UserCategory } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { GeminiCore } from '@/services/gemini_core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/Card';
import { ArrowLeft, ArrowRight, Plus, Trash } from '@phosphor-icons/react';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { TheAudit } from '../accountant/TheAudit';
import { BudgetManager } from '../accountant/BudgetManager';
import { IntakeForm } from './finance/IntakeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// Helper to convert the default const to the new flexible array format
const createInitialCategories = (): UserCategory[] => {
  return Object.values(DEFAULT_ACCOUNTANT_CATEGORIES).map(cat => ({
    id: cat.id,
    label: cat.label,
    subcategories: Object.entries(cat.subcategories).map(([id, label]) => ({ id, label }))
  }));
};

const createNewAudit = (): FinancialAudit => {
  const categories = createInitialCategories();
  const expenses: FinancialAudit['expenses'] = {};

  // Initialize empty expenses for default categories
  categories.forEach(cat => {
    expenses[cat.id] = {};
    cat.subcategories.forEach(sub => {
      expenses[cat.id][sub.id] = null;
    });
  });

  return {
    monthlyIncome: null,
    categories,
    expenses,
    auditCompletedAt: null,
    version: '2.0',
  };
};

export function Finance() {
  const [audit, setAudit] = useKV<FinancialAudit>('financial-audit', createNewAudit());
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  const [auditCompleted, setAuditCompleted] = useKV<boolean>('audit-completed', false);
  const [hasStarted, setHasStarted] = useKV<boolean>('finance-has-started', false);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(-1); // -1 for income step
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states for editing categories
  const [isEditMode, setIsEditMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // DEV: Log error state changes
  useEffect(() => {
    if (error) {
      console.error('Finance component error state updated:', error);
    }
  }, [error]);

  // Migration logic for old data (simplified: just reset if version mismatch)
  useEffect(() => {
    if (audit && audit.version !== '2.0') {
      console.warn('Migrating old audit data...');
      setAudit(createNewAudit());
    }
  }, [audit, setAudit]);

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
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';

      if (errorMessage.includes("api key is missing")) {
        setError("A Gemini API Key is required. Please add it in the Settings module to use The Accountant.");
      } else if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied')) {
        setError('Your API Key is invalid. Please check it in the Settings module.');
      } else {
        setError("The Accountant's analysis could not be processed. This can be a temporary issue. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentCategoryIndex < audit.categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    } else {
      generateReport();
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > -1) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  // --- Dynamic Category Management ---

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    // Generate base ID
    const baseId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    let categoryId = baseId;
    let counter = 1;
    // Check for duplicates
    const existingIds = audit.categories.map(cat => cat.id);
    while (existingIds.includes(categoryId)) {
      categoryId = `${baseId}-${counter}`;
      counter++;
    }

    setAudit(prev => {
      const newCat: UserCategory = {
        id: categoryId,
        label: newCategoryName,
        subcategories: []
      };
      const updatedCategories = [...prev.categories, newCat];
      // Jump to the new category using the new array length
      setCurrentCategoryIndex(updatedCategories.length - 1);
      return {
        ...prev,
        categories: updatedCategories,
        expenses: { ...prev.expenses, [categoryId]: {} }
      };
    });
    setNewCategoryName('');
    setIsEditMode(false);

  const addSubcategory = (categoryId: string) => {
      if (!newSubcategoryName.trim()) return;
      const newId = newSubcategoryName.toLowerCase().replace(/\s+/g, '-');

      setAudit(prev => {
          const updatedCategories = prev.categories.map(cat => {
              if (cat.id === categoryId) {
                  return {
                      ...cat,
                      subcategories: [...cat.subcategories, { id: newId, label: newSubcategoryName }]
                  };
              }
              return cat;
          });

          const updatedExpenses = { ...prev.expenses };
          if (!updatedExpenses[categoryId]) updatedExpenses[categoryId] = {};
          updatedExpenses[categoryId][newId] = null;

          return { ...prev, categories: updatedCategories, expenses: updatedExpenses };
      });
      setNewSubcategoryName('');
  };

  const deleteCategory = (categoryId: string) => {
      setAudit(prev => {
          const updatedCategories = prev.categories.filter(c => c.id !== categoryId);
          const updatedExpenses = { ...prev.expenses };
          delete updatedExpenses[categoryId];
          // Adjust index after deletion using the new length
          if (currentCategoryIndex >= updatedCategories.length) {
              setCurrentCategoryIndex(Math.max(-1, updatedCategories.length - 1));
          }
          return { ...prev, categories: updatedCategories, expenses: updatedExpenses };
      });
  };

  // --- Rendering ---

  if (!hasStarted) {
      return <IntakeForm onStart={() => setHasStarted(true)} />;
  }

  const renderCurrentStep = () => {
    if (isLoading) {
      return <SarcasticLoader text="Conducting forensic analysis of your spending..." />;
    }

    if (error) {
      return (
        <Card className="glass-card text-center p-8 border-red-500/50">
          <h2 className="text-2xl font-bold mb-4 text-red-400">System Failure</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={generateReport}>Retry Analysis</Button>
        </Card>
      );
    }

    if (auditCompleted && report) {
      return <BudgetManager />;
    }

    if (report) {
       // This replaces the old FirstMeeting
       return <TheAudit onComplete={() => setAuditCompleted(true)} />;
    }

    // -- Step: Monthly Income --
    if (currentCategoryIndex === -1) {
      return (
        <Card className="glass-card p-6 border-cyan-500/20">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Monthly Inflow</h2>
                <p className="text-slate-400">Establish the baseline Capital available for allocation.</p>
            </div>
          <Label htmlFor="monthly-income" className="text-xs font-mono uppercase tracking-widest text-cyan-400">Total Net Income</Label>
          <Input
            id="monthly-income"
            type="number"
            placeholder="0.00"
            value={audit.monthlyIncome || ''}
            onChange={(e) => setAudit(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || null }))}
            className="h-16 text-3xl font-mono glass-morphic mt-2 bg-black/20"
          />
        </Card>
      );
    }

    // -- Step: Categories --
    const category = audit.categories[currentCategoryIndex];
    if (!category) return null; // Should not happen

    return (
      <Card className="glass-card p-6 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-cyan-500 select-none pointer-events-none">
            {currentCategoryIndex + 1}
        </div>

        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-2xl font-bold text-white">{category.label}</h3>
                <p className="text-slate-400 text-sm">Input all monthly liabilities for this sector.</p>
            </div>
            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-950/20" onClick={() => deleteCategory(category.id)}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {category.subcategories.map((subcat) => (
            <div key={subcat.id}>
              <Label htmlFor={`${category.id}-${subcat.id}`} className="text-xs font-mono uppercase text-slate-500">{subcat.label}</Label>
              <Input
                id={`${category.id}-${subcat.id}`}
                type="number"
                placeholder="0.00"
                value={audit.expenses[category.id]?.[subcat.id] ?? ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setAudit(prev => {
                    const newExpenses = { ...prev.expenses };
                    if (!newExpenses[category.id]) newExpenses[category.id] = {};
                    newExpenses[category.id][subcat.id] = isNaN(value) ? null : value;
                    return { ...prev, expenses: newExpenses };
                  });
                }}
                className="h-12 font-mono glass-morphic mt-1 bg-white/5"
              />
            </div>
          ))}

          {/* Add Subcategory Inline */}
          {(() => {
            // Handler for adding subcategory, hoisted before JSX
            const handleAddSubcategory = () => {
              if (newSubcategoryName.trim()) {
                addSubcategory(category.id);
              }
            };
            return (
              <div className="pt-4 flex gap-2">
                <Input
                  placeholder="Add new item..."
                  className="h-10 text-sm glass-morphic"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubcategory();
                  }}
                />
                <Button size="icon" variant="outline" onClick={handleAddSubcategory} disabled={!newSubcategoryName}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            );
          })()}
        </div>
      </Card>
    );
  };

  if (!audit) {
    return <SarcasticLoader />;
  }

  // Calculate Progress
  const totalSteps = audit.categories.length + 1; // +1 for Income
  const progress = ((currentCategoryIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-1 md:px-0 pt-4 max-w-xl mx-auto">

       {/* Header is hidden during The Audit or Budget Manager phases usually, but let's keep it minimal */}
       {!report && (
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Data Entry Protocol</h1>
                <p className="text-xs font-mono text-cyan-500">SESSION ID: {new Date().toLocaleDateString()}</p>
            </div>
            {/* Add Category Trigger */}
             <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30">
                        <Plus className="w-4 h-4 mr-2" /> New Category
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10">
                    <DialogHeader>
                        <DialogTitle>Add Custom Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                placeholder="e.g. Crypto, Project X"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={addCategory}>Create Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
       )}

      {/* Progress Bar */}
      {!report && (
        <div className="w-full bg-white/5 h-1">
            <motion.div
            className="bg-cyan-500 h-1 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.max(5, progress)}%` }}
            transition={{ duration: 0.5, ease: 'circOut' }}
            />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategoryIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {!audit.auditCompletedAt && !report && (
        <div className="flex justify-between items-center mt-8">
            <Button variant="ghost" onClick={handleBack} disabled={currentCategoryIndex === -1} className="text-slate-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> PREV
            </Button>

            <div className="text-xs font-mono text-slate-600">
                STEP {currentCategoryIndex + 2} / {totalSteps}
            </div>

            <Button onClick={handleNext} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[120px]">
            {currentCategoryIndex === audit.categories.length - 1 ? 'INITIATE AUDIT' : 'NEXT'}
            {currentCategoryIndex !== audit.categories.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
        </div>
      )}
    </div>
  );
}
