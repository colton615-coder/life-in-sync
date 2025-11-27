// src/components/accountant/BudgetManager.tsx
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { AccountantChat, ChatMessage } from './AccountantChat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/Card';
import { Progress } from '@/components/ui/progress';

export function BudgetManager() {
  const [report] = useKV<FinancialReport | null>('financial-report', null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      text: "I am monitoring your ledger. What adjustment requires authorization?",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'advisor'>('overview');

  if (!report) {
    return <SarcasticLoader text="Loading authorized budget..." />;
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

    // Placeholder for real AI integration in Budget Manager
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: `I have noted your request regarding "${text}". However, strictly adhering to the proposed budget is recommended for optimal liquidity.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const budgetOverview = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Active Ledger</h2>
            <p className="text-muted-foreground text-sm">Approved operational budget.</p>
        </div>
        <div className="text-right">
             <div className="text-xs font-mono uppercase text-cyan-500">Total Monthly Allocation</div>
             {/* Calculate total from the dynamic proposed budget */}
             <div className="text-2xl font-mono font-bold text-white">
                 ${Object.values(report.proposedBudget).reduce((acc, cat) => acc + cat.allocatedAmount, 0).toLocaleString()}
             </div>
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(report.proposedBudget).map(([catId, catData]) => (
            <Card key={catId} className="glass-card p-4 border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold uppercase text-slate-200 text-sm tracking-wider">
                        {report.categories.find(c => c.id === catId)?.label || catId.replace(/-/g, ' ')}
                    </h3>
                    <span className="font-mono text-cyan-400">${catData.allocatedAmount.toLocaleString()}</span>
                </div>

                {/* Visual bar just for effect, assuming 100% allocation for now since we don't have 'actuals' here yet */}
                <Progress value={100} className="h-1 bg-white/10" indicatorClassName="bg-cyan-500/50" />

                <div className="mt-3 space-y-1">
                    {Object.entries(catData.subcategories).map(([subId, amount]) => (
                        <div key={subId} className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>{subId.replace(/-/g, ' ')}</span>
                            <span>${amount}</span>
                        </div>
                    ))}
                </div>
            </Card>
        ))}
      </div>
    </div>
  );

  const advisorChat = (
    <div className="space-y-4 h-[600px] flex flex-col">
      <div className="flex-none">
        <h2 className="text-xl font-bold text-white">Consultation</h2>
        <p className="text-xs text-muted-foreground">Direct line to The Accountant.</p>
      </div>
      <div className="flex-grow overflow-hidden">
        <AccountantChat
            messages={messages}
            budget={0} // Deprecated prop
            expenses={[]} // Deprecated prop
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <div className="p-1 md:p-4 animate-in fade-in">
      {/* Mobile Tab View */}
      <div className="md:hidden">
        <div className="flex border-b border-white/10 mb-4">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className={cn('flex-1 rounded-none text-slate-400', activeTab === 'overview' && 'border-b-2 border-cyan-400 text-cyan-400 bg-cyan-950/10')}
          >
            Overview
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('advisor')}
            className={cn('flex-1 rounded-none text-slate-400', activeTab === 'advisor' && 'border-b-2 border-cyan-400 text-cyan-400 bg-cyan-950/10')}
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
