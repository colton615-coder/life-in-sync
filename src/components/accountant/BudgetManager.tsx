// src/components/accountant/BudgetManager.tsx
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { AccountantChat, ChatMessage, Expense } from './AccountantChat';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Mock Data based on user specification
const MOCK_BUDGET = 5000;
const MOCK_EXPENSES: Expense[] = [
  { id: '1', category: 'Housing', amount: 1500, date: '2025-11-01', description: 'Rent' },
  { id: '2', category: 'Transportation', amount: 300, date: '2025-11-05', description: 'Gas & Car Payment' },
  { id: '3', category: 'Food', amount: 600, date: '2025-11-10', description: 'Groceries' },
  { id: '4', category: 'Entertainment', amount: 150, date: '2025-11-12', description: 'Movie night' },
  { id: '5', category: 'Hobbies', amount: 250, date: '2025-11-20', description: 'Golf supplies' },
];

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BudgetManager() {
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-welcome-message',
      sender: 'ai',
      text: "How can I assist you with your budget today? For example, you could ask: \"How can I free up an extra $100 for my hobbies?\"",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'advisor'>('overview');

  if (!report) {
    return <SarcasticLoader text="Loading your budget..." />;
  }

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
      const totalExpenses = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.amount, 0);
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

  const budgetOverview = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Live Budget</h2>
      <p className="text-muted-foreground">
        This is your active budget. You can make adjustments here. Consult "The Accountant" for advice on any changes.
      </p>
      <div className="p-6 glass-card rounded-lg">
        {/* TODO: Implement the budget editing UI here */}
        <p className="text-center text-muted-foreground">[Budget Editor UI Placeholder]</p>
        <pre className="mt-4 text-xs font-mono bg-black/20 p-2 rounded overflow-auto">
          {JSON.stringify(report.proposedBudget, null, 2)}
        </pre>
      </div>
    </div>
  );

  const advisorChat = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Consult The Accountant</h2>
      <AccountantChat
        messages={messages}
        budget={MOCK_BUDGET}
        expenses={MOCK_EXPENSES}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <div className="p-1 md:p-4">
      {/* Mobile Tab View */}
      <div className="md:hidden">
        <div className="flex border-b border-white/10 mb-4">
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
        {activeTab === 'overview' ? budgetOverview : advisorChat}
      </div>

      {/* Desktop Split View */}
      <div className="hidden md:grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          {budgetOverview}
        </div>
        <div className="md:col-span-2">
          {advisorChat}
        </div>
      </div>
    </div>
  );
}
