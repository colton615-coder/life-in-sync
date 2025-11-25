import React from 'react';
import { motion } from 'framer-motion';

export const LifeCore = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* The Prism Container */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-24 h-24 flex items-center justify-center"
      >
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />

        {/* The Diamond Shape (CSS Rotated Square) */}
        <div
            className="relative w-16 h-16 transform rotate-45 border border-cyan-400/50 bg-gradient-to-b from-cyan-500/10 to-purple-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        >
            {/* Inner Detail - A smaller diamond to give depth */}
            <div className="absolute inset-2 border border-white/20 bg-white/5" />

            {/* Core - The bright center */}
            <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
        </div>
      </motion.div>

      {/* Optional: Status Label underneath */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xs tracking-[0.2em] text-cyan-200/60 font-sans"
      >
        LiFE-iN-SYNC
      </motion.p>
    </div>
  );
};
