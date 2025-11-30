import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntakeFormProps {
  onComplete: (income: number) => void;
  initialIncome: number | null;
}

type Frequency = 'monthly' | 'yearly';

export function IntakeForm({ onComplete, initialIncome }: IntakeFormProps) {
  const [amount, setAmount] = useState<string>(initialIncome ? initialIncome.toString() : '');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // Normalize to Monthly for the system
    const monthlyIncome = frequency === 'yearly' ? value / 12 : value;
    onComplete(monthlyIncome);
  };

  return (
    <div className="flex flex-col min-h-[80vh] pt-12 px-4 pb-safe">
      {/* Top Header - YNAB Style Cleanliness */}
      <div className="mb-12 text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Income Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Establish your financial baseline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">

        {/* Frequency Tabs (Pill Selector) */}
        <div className="flex justify-center">
            <div className="bg-white/5 p-1 rounded-full flex relative border border-white/10">
                <button
                    type="button"
                    onClick={() => setFrequency('monthly')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        frequency === 'monthly' ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]" : "text-muted-foreground hover:text-white"
                    )}
                >
                    Monthly
                </button>
                <button
                    type="button"
                    onClick={() => setFrequency('yearly')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        frequency === 'yearly' ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]" : "text-muted-foreground hover:text-white"
                    )}
                >
                    Yearly
                </button>
            </div>
        </div>

        {/* Main Input Area */}
        <div className="space-y-4">
            <div className="relative group">
                 {/* Input Label incorporated visually above or via placeholder */}
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 text-white/30 text-3xl font-light select-none pointer-events-none">
                    $
                 </div>
                 <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        if (error) setError(null);
                    }}
                    className="h-24 pl-12 text-5xl font-bold text-center bg-transparent border-0 border-b-2 border-white/10 focus:border-cyan-500/50 rounded-none focus:ring-0 transition-colors placeholder:text-white/10"
                    autoFocus
                 />
            </div>
            {error && (
              <p className="text-center text-sm text-red-400 font-medium animate-pulse">
                {error}
              </p>
            )}
        </div>

        {/* Action Button - Stuck to bottom/keyboard compatible */}
        <div className="mt-auto pt-8 pb-4">
            <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg rounded-xl transition-transform active:scale-95"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-[10px] text-center text-muted-foreground/30 mt-4 uppercase tracking-widest">
                Encrypted & Local Only
            </p>
        </div>
      </form>
    </div>
  );
}
