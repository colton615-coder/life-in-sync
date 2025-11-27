import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign } from 'lucide-react';

interface IntakeFormProps {
  onComplete: (income: number) => void;
  initialIncome: number | null;
}

export function IntakeForm({ onComplete, initialIncome }: IntakeFormProps) {
  const [income, setIncome] = useState<string>(initialIncome ? initialIncome.toString() : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(income);

    if (isNaN(value) || value <= 0) {
      setError("We need a real number to work with.");
      return;
    }

    onComplete(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-gradient-cyan">
          The Accountant
        </h1>
        <p className="text-lg text-muted-foreground uppercase tracking-widest text-xs">
          Financial Optimization Service
        </p>
      </div>

      <Card className="w-full max-w-lg glass-card p-8 border-t-4 border-t-cyan-500/50">
        <div className="mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold font-mono uppercase text-cyan-400">Client Intake Form</h2>
            <p className="text-sm text-muted-foreground mt-1">
                Please verify your monthly liquidity to initiate the audit protocol.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm uppercase font-semibold text-muted-foreground">
              Total Monthly Income (Net)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="income"
                type="number"
                placeholder="0.00"
                value={income}
                onChange={(e) => {
                    setIncome(e.target.value);
                    if (error) setError(null);
                }}
                className="pl-9 h-14 text-xl font-mono glass-morphic bg-black/20 focus:bg-black/40 transition-all border-white/10 focus:border-cyan-500/50"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 font-mono mt-2 animate-pulse">
                &gt; Error: {error}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] transition-all"
            >
              Begin Audit <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-center text-muted-foreground/50 mt-4 font-mono">
                confidentiality protocols active
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
