import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from '@phosphor-icons/react';
import { Card } from '@/components/Card';

interface IntakeFormProps {
  onStart: () => void;
}

export function IntakeForm({ onStart }: IntakeFormProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-2xl"
      >
        <div className="space-y-2">
            <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-500 uppercase">Financial Audit Initiative</h2>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            THE ACCOUNTANT
            </h1>
        </div>

        <Card className="glass-card p-8 border-white/10 bg-black/40 backdrop-blur-md">
            <div className="space-y-6 text-left">
                <div className="border-b border-white/10 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-200 uppercase tracking-widest font-mono">To Whom It May Concern:</h3>
                </div>

                <p className="text-slate-300 leading-relaxed font-light">
                    This document serves as the preliminary intake for a comprehensive financial audit.
                    The objective is to achieve absolute clarity on current capital allocation, liabilities, and liquidity.
                </p>

                <p className="text-slate-300 leading-relaxed font-light">
                    Honesty in data entry is mandatory for accurate strategic planning.
                    The resulting analysis will form the basis of a restructured financial operating model tailored for maximum mobility and freedom.
                </p>

                <div className="pt-4 flex items-center justify-end">
                    <div className="text-right mr-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Authorized By</p>
                        <p className="text-sm font-mono text-cyan-400">LI-SYS-CORE</p>
                    </div>
                </div>
            </div>
        </Card>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 1.0 }}
        >
             <Button
                size="lg"
                onClick={onStart}
                className="group relative overflow-hidden bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-400/50 text-cyan-100 px-12 py-8 text-xl tracking-widest uppercase transition-all duration-300"
            >
                <span className="relative z-10 flex items-center gap-3">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
