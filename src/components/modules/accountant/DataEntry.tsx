import { useState } from 'react';
import { FinancialAudit, Category, Subcategory } from '@/types/accountant';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface DataEntryProps {
  audit: FinancialAudit;
  setAudit: (audit: FinancialAudit) => void;
  onComplete: () => void;
}

export function DataEntry({ audit, setAudit, onComplete }: DataEntryProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(audit.categories[0]?.id || null);
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
    setExpandedCategory(newId);
  };

  const deleteCategory = (catId: string) => {
    setAudit({
      ...audit,
      categories: audit.categories.filter(cat => cat.id !== catId)
    });
  };

  // --- Render Helpers ---

  const calculateTotal = () => {
    return audit.categories.reduce((total, cat) => {
      return total + cat.subcategories.reduce((subTotal, sub) => subTotal + (sub.amount || 0), 0);
    }, 0);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">Expense Ledger</h2>
          <p className="text-sm text-muted-foreground">Itemize your monthly outflows.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Total Declared</p>
          <p className="text-xl font-mono text-cyan-400">${calculateTotal().toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {audit.categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
            onUpdateAmount={updateSubcategoryAmount}
            onAddSubcategory={addSubcategory}
            onDeleteSubcategory={deleteSubcategory}
            onDeleteCategory={deleteCategory}
          />
        ))}

        {/* Add Category UI */}
        {isAddingCategory ? (
          <Card className="glass-card p-4 border-dashed border-cyan-500/30">
            <Label>New Category Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Crypto, Golf, Projects"
                className="glass-morphic"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button onClick={addCategory} size="sm" variant="default">Add</Button>
              <Button onClick={() => setIsAddingCategory(false)} size="sm" variant="ghost">Cancel</Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="ghost"
            className="w-full border border-dashed border-white/10 text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/50 h-12"
            onClick={() => setIsAddingCategory(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Custom Category
          </Button>
        )}
      </div>

      <div className="pt-8 pb-32 flex justify-end">
        <Button
          onClick={onComplete}
          className="w-full md:w-auto shadow-2xl shadow-cyan-500/20 bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-14 px-8 rounded-full text-lg"
        >
          <BrainCircuit className="mr-2 h-5 w-5" /> Submit for Audit
        </Button>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function CategoryCard({
  category,
  isExpanded,
  onToggle,
  onUpdateAmount,
  onAddSubcategory,
  onDeleteSubcategory,
  onDeleteCategory
}: {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateAmount: (cid: string, sid: string, val: string) => void;
  onAddSubcategory: (cid: string, name: string) => void;
  onDeleteSubcategory: (cid: string, sid: string) => void;
  onDeleteCategory: (cid: string) => void;
}) {
  const [newSubName, setNewSubName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const catTotal = category.subcategories.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleAddSub = () => {
    if (newSubName.trim()) {
      onAddSubcategory(category.id, newSubName);
      setNewSubName('');
      setIsAdding(false);
    }
  };

  return (
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300",
      isExpanded ? "border-cyan-500/30 bg-black/40" : "border-white/5 opacity-80 hover:opacity-100"
    )}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg transition-colors", isExpanded ? "bg-cyan-500/10 text-cyan-400" : "bg-white/5 text-muted-foreground")}>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            {!isExpanded && (
               <p className="text-xs text-muted-foreground">{category.subcategories.length} items • ${catTotal.toFixed(2)}</p>
            )}
          </div>
        </div>

        {isExpanded && (
           <Button
             variant="ghost"
             size="icon"
             className="text-red-400/50 hover:text-red-400 hover:bg-red-950/30"
             onClick={(e) => {
               e.stopPropagation();
               if(confirm('Delete this entire category?')) onDeleteCategory(category.id);
             }}
           >
             <Trash2 className="h-4 w-4" />
           </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 space-y-3">
              {category.subcategories.map(sub => (
                <div key={sub.id} className="grid grid-cols-[1fr,100px,32px] gap-3 items-center">
                  <Label className="text-sm truncate" title={sub.name}>{sub.name}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={sub.amount === null ? '' : sub.amount}
                    onChange={(e) => onUpdateAmount(category.id, sub.id, e.target.value)}
                    className="h-9 font-mono text-right glass-morphic"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    onClick={() => onDeleteSubcategory(category.id, sub.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {isAdding ? (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <Input
                    placeholder="Subcategory Name"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="h-8 text-sm glass-morphic"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                  />
                  <Button size="sm" onClick={handleAddSub}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-muted-foreground border border-dashed border-white/10"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
