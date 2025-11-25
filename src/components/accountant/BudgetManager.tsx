// src/components/accountant/BudgetManager.tsx
import { useKV } from '@/hooks/use-kv';
import { FinancialReport } from '@/types/financial_report';
import { SarcasticLoader } from '@/components/SarcasticLoader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

export function BudgetManager() {
  const [report, setReport] = useKV<FinancialReport | null>('financial-report', null);
  // TODO: Add state for chat history, user input, and loading status

  if (!report) {
    return <SarcasticLoader text="Loading your budget..." />;
  }

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AI consultation logic
    console.log("Submitting consultation request...");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* Column 1: Budget Editor */}
      <div className="md:col-span-2 space-y-4">
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

      {/* Column 2: AI Consultation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Consult The Accountant</h2>
        <div className="p-4 glass-card rounded-lg flex flex-col h-[500px]">
          {/* Chat History */}
          <div className="flex-grow space-y-4 overflow-y-auto pr-2">
            {/* AI Welcome Message */}
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="font-bold text-cyan-400">The Accountant</p>
              <p className="text-sm">How can I assist you with your budget today? For example, you could ask: "How can I free up an extra $100 for my hobbies?"</p>
            </div>
            {/* TODO: Render chat history */}
          </div>

          {/* User Input */}
          <form onSubmit={handleConsultationSubmit} className="mt-4 flex items-center space-x-2">
            <Textarea
              placeholder="Ask a question about your budget..."
              className="flex-grow glass-morphic"
              rows={2}
            />
            <Button type="submit" size="icon" className="h-full">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
