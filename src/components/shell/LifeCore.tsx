import React from 'react';
import { motion } from 'framer-motion';

export const LifeCore = () => {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div
        className="w-20 h-20 mb-2"
        style={{
          backgroundImage: 'url(/assets/logo-brain.jpg)',
          backgroundSize: '135%',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};
