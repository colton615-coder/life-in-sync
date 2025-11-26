import React from 'react';
import { motion } from 'framer-motion';
import { CircuitBrainLogo } from '@/components/ui/CircuitBrainLogo';

export const LifeCore = () => {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="w-16 h-16">
        <CircuitBrainLogo />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-xs tracking-[0.2em] text-cyan-200/60 font-sans"
      >
        LiFE-iN-SYNC
      </motion.p>
    </div>
  );
};
