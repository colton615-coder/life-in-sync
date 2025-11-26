import React from 'react';
import { motion } from 'framer-motion';

export const LifeCore = () => {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div
        className="w-20 h-20 mb-2"
        style={{
          backgroundImage: 'url(/assets/logo-brain.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <p className="text-xs tracking-[0.2em] text-cyan-200/60 font-sans">
        LiFE-iN-SYNC
      </p>
    </div>
  );
};
