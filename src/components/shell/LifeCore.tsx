import React from 'react';
import { motion } from 'framer-motion';

export const LifeCore = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div
        className="w-24 h-24 mb-2 mix-blend-screen"
        style={{
          backgroundImage: 'url(/assets/logo-brain-transparent.jpg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <h1 className="text-xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        LiFE-iN-SYNC
      </h1>
    </div>
  );
};
