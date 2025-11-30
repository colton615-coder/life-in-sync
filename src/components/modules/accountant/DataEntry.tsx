import { useState, useRef, useEffect } from 'react';
import { FinancialAudit, Category } from '@/types/accountant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface DataEntryProps {
  audit: FinancialAudit;
  setAudit: (audit: FinancialAudit) => void;
  onComplete: () => void;
}

export function DataEntry({ audit, setAudit, onComplete }: DataEntryProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // --- Actions ---
  const updateSubcategoryAmount = (catId: string, subId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setAudit({
      ...audit,
      categories: audit.categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub =>
            sub.id === subId ? { ...sub, amount: isNaN(numValue!) ? null : numValue } : sub
          )
        };
      })
    });
  };

  const addSubcategory = (catId: string, name: string) => {
    if (!name.trim()) return;
    setAudit({
      ...audit,
      categories: audit.categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          subcategories: [...cat.subcategories, { id: uuidv4(), name, amount: null }]
        };
      })
    });
  };

  const deleteSubcategory = (catId: string, subId: string) => {
    setAudit({
      ...audit,
      categories: audit.categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub.id !== subId)
        };
      })
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = uuidv4();
    setAudit({
      ...audit,
      categories: [...audit.categories, { id: newId, name: newCategoryName, subcategories: [] }]
    });
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const deleteCategory = (catId: string) => {
    setAudit({
      ...audit,
      categories: audit.categories.filter(cat => cat.id !== catId)
    });
  };

  const calculateTotal = () => {
    return audit.categories.reduce((total, cat) => {
      return total + cat.subcategories.reduce((subTotal, sub) => subTotal + (sub.amount || 0), 0);
    }, 0);
  };

  return (
    <div className="relative pb-32">
        {/* Sticky Header: Ledger Overview */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex justify-between items-center shadow-lg">
            <div>
                <h2 className="text-lg font-bold text-gradient-cyan tracking-tight">Expense Ledger</h2>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Monthly Outflows</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</p>
                <p className="text-lg font-mono text-cyan-400 font-bold tracking-tight">${calculateTotal().toFixed(2)}</p>
            </div>
        </div>

        {/* High Density List Content */}
        <div className="space-y-8 pt-4">
            {audit.categories.map(category => (
                <CategoryGroup
                    key={category.id}
                    category={category}
                    onUpdateAmount={updateSubcategoryAmount}
                    onAddSubcategory={addSubcategory}
                    onDeleteSubcategory={deleteSubcategory}
                    onDeleteCategory={deleteCategory}
                />
            ))}

            {/* Add Category Trigger */}
            <div className="px-4">
                 {isAddingCategory ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-3 rounded-lg flex gap-2"
                    >
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New Category Name..."
                            className="h-10 bg-transparent border-white/10"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                        />
                        <Button size="sm" onClick={addCategory}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                    </motion.div>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full border border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:text-cyan-400 h-12 text-muted-foreground"
                        onClick={() => setIsAddingCategory(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Custom Group
                    </Button>
                )}
            </div>
        </div>

        {/* Floating Action Button for Submission */}
        <div className="fixed bottom-24 inset-x-4 z-30 pointer-events-none flex justify-center">
            <Button
                onClick={onComplete}
                className="pointer-events-auto shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 px-8 rounded-full text-base backdrop-blur-md border border-white/20"
            >
                <BrainCircuit className="mr-2 h-4 w-4" /> Finalize Audit
            </Button>
        </div>
    </div>
  );
}

// --- Sub-Components ---

function CategoryGroup({
  category,
  onUpdateAmount,
  onAddSubcategory,
  onDeleteSubcategory,
  onDeleteCategory
}: {
  category: Category;
  onUpdateAmount: (cid: string, sid: string, val: string) => void;
  onAddSubcategory: (cid: string, name: string) => void;
  onDeleteSubcategory: (cid: string, sid: string) => void;
  onDeleteCategory: (cid: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const catTotal = category.subcategories.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleAddSub = () => {
    if (newSubName.trim()) {
      onAddSubcategory(category.id, newSubName);
      setNewSubName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-0">
        {/* Category Header - Sticky within parent flow context if needed, but here just distinct */}
        <div className="px-4 py-2 flex justify-between items-end border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <h3 className="font-bold text-sm text-white/90 uppercase tracking-wide">{category.name}</h3>
            <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">${catTotal.toFixed(2)}</span>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground/30 hover:text-red-400"
                    onClick={() => {
                        if(confirm('Delete Group?')) onDeleteCategory(category.id);
                    }}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>

        {/* High Density List Items */}
        <div className="divide-y divide-white/5">
            {category.subcategories.map(sub => (
                <div key={sub.id} className="group flex items-center justify-between px-4 py-3 active:bg-white/5 transition-colors">
                     {/* Label Area */}
                    <div className="flex-1 min-w-0 mr-4">
                        <Label className="text-sm font-medium text-gray-300 truncate block cursor-pointer" onClick={() => document.getElementById(`input-${sub.id}`)?.focus()}>
                            {sub.name}
                        </Label>
                    </div>

                    {/* Input Area - Integrated, Tabular feel */}
                    <div className="flex items-center gap-0 w-32 relative">
                        <span className="absolute left-2 text-muted-foreground/50 text-xs pointer-events-none">$</span>
                        <Input
                            id={`input-${sub.id}`}
                            type="number"
                            placeholder="0"
                            value={sub.amount === null ? '' : sub.amount}
                            onChange={(e) => onUpdateAmount(category.id, sub.id, e.target.value)}
                            className="h-9 w-full pl-5 pr-2 text-right font-mono text-base bg-transparent border-transparent hover:bg-white/5 focus:bg-white/10 focus:border-cyan-500/30 transition-all rounded-md p-0"
                        />
                    </div>

                     {/* Delete Action - Only visible on hover/focus within group to reduce noise */}
                     {/* On mobile this might be tricky, so we keep it subtle always visible or use swipe. For now, subtle visibility. */}
                    <div className="w-8 flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground/20 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            onClick={() => onDeleteSubcategory(category.id, sub.id)}
                            tabIndex={-1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}

            {/* Inline Add Item Row */}
            {isAdding ? (
                 <div className="flex items-center px-4 py-2 gap-2 bg-white/5 animate-in fade-in slide-in-from-top-1">
                    <Input
                        placeholder="Item Name"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="h-9 text-sm bg-transparent border-white/10 focus:border-cyan-500/50"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                    />
                    <Button size="sm" onClick={handleAddSub} className="h-9">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-9">X</Button>
                </div>
            ) : (
                <div
                    className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors group"
                    onClick={() => setIsAdding(true)}
                >
                    <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center group-hover:border-cyan-400 group-hover:text-cyan-400 text-muted-foreground">
                        <Plus className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium group-hover:text-cyan-400">Add Item</span>
                </div>
            )}
        </div>
    </div>
  );
}
