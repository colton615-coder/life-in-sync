// src/components/accountant/BudgetManager.tsx
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { AccountantChat, ChatMessage, Expense } from './AccountantChat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Warning } from '@phosphor-icons/react';

// Mock Data based on user specification
const MOCK_BUDGET = 5000;
// Need to define createMockExpenses since it was missing in the previous file but used
const createMockExpenses = (): Expense[] => [
  { id: '1', category: 'Housing', amount: 1500, date: '2025-11-01', description: 'Rent' },
  { id: '2', category: 'Transportation', amount: 300, date: '2025-11-05', description: 'Gas & Car Payment' },
  { id: '3', category: 'Food', amount: 600, date: '2025-11-10', description: 'Groceries' },
  { id: '4', category: 'Entertainment', amount: 150, date: '2025-11-12', description: 'Movie night' },
  { id: '5', category: 'Hobbies', amount: 250, date: '2025-11-20', description: 'Golf supplies' },
];

export function BudgetManager() {
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  const mockExpenses = useMemo(() => createMockExpenses(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      text: "How can I assist you with your budget today? For example, you could ask: \"How can I free up an extra $100 for my hobbies?\"",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'advisor'>('overview');

  const handleSendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Mock AI response with a delay
    setTimeout(() => {
      const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remainingBudget = MOCK_BUDGET - totalExpenses;

      const aiResponse: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: `I see you have $${remainingBudget.toFixed(2)} remaining in your budget. Based on your expenses, here is my advice...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const startAudit = () => {
    setActiveTab('advisor');
    setMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        sender: 'ai',
        text: "Let's get this audit started. I'm ready to judge your spending.",
        timestamp: new Date(),
      }
    ]);
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-8">
        <div className="space-y-4 max-w-md">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6">
            <Warning size={48} className="text-amber-400 animate-pulse" weight="duotone" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            System Offline
          </h2>
          <p className="text-muted-foreground text-lg">
            Financial data not initialized.
          </p>
        </div>

        <Button
          onClick={startAudit}
          className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-black shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-105 rounded-xl border border-white/20"
        >
          Start Audit
        </Button>
      </div>
    );
  }

  const budgetOverview = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Live Budget</h2>
        {/* Removed SarcasticLoader here unless needed for specific async action */}
      </div>

      <p className="text-muted-foreground">
        This is your active budget. You can make adjustments here. Consult "The Accountant" for advice on any changes.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-6 glass-card border-l-4 border-l-emerald-500">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Income</h3>
             <p className="text-3xl font-bold font-mono mt-2 text-emerald-400">
                ${report.proposedBudget.totalIncome.toLocaleString()}
             </p>
         </Card>
         <Card className="p-6 glass-card border-l-4 border-l-rose-500">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</h3>
             <p className="text-3xl font-bold font-mono mt-2 text-rose-400">
                ${report.proposedBudget.totalExpenses.toLocaleString()}
             </p>
         </Card>
         <Card className="p-6 glass-card border-l-4 border-l-cyan-500">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining</h3>
             <p className="text-3xl font-bold font-mono mt-2 text-cyan-400">
                ${report.proposedBudget.remainingBudget.toLocaleString()}
             </p>
         </Card>
      </div>

      <div className="p-6 glass-card rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Allocation Breakdown</h3>
        <div className="space-y-4">
            {Object.entries(report.proposedBudget.allocations).map(([category, data]) => (
                <div key={category} className="group">
                    <div className="flex justify-between items-end mb-1">
                        <span className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{category}</span>
                        <span className="font-mono text-slate-400">${data.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                         <div
                            className="h-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, (data.total / report.proposedBudget.totalIncome) * 100)}%` }}
                         />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );

  const advisorChat = (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold shrink-0">Consult The Accountant</h2>
      <div className="flex-1 min-h-0">
        <AccountantChat
            messages={messages}
            budget={MOCK_BUDGET}
            expenses={mockExpenses}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <div className="p-1 md:p-4 h-full flex flex-col">
      {/* Mobile Tab View */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex border-b border-white/10 mb-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className={cn('flex-1 rounded-none', activeTab === 'overview' && 'border-b-2 border-cyan-400 text-cyan-400')}
          >
            Overview
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('advisor')}
            className={cn('flex-1 rounded-none', activeTab === 'advisor' && 'border-b-2 border-cyan-400 text-cyan-400')}
          >
            Advisor
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
             {activeTab === 'overview' ? budgetOverview : advisorChat}
        </div>
      </div>

      {/* Desktop Split View */}
      <div className="hidden md:grid md:grid-cols-5 gap-6 h-full">
        <div className="md:col-span-3 overflow-auto pr-2 custom-scrollbar">
          {budgetOverview}
        </div>
        <div className="md:col-span-2 h-[calc(100vh-120px)] sticky top-4">
          {advisorChat}
        </div>
      </div>
    </div>
  );
}
