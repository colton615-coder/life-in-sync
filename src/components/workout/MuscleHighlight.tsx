import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MuscleHighlightProps {
  muscles: string[]; // e.g., ['chest', 'triceps']
  className?: string;
}

export function MuscleHighlight({ muscles, className }: MuscleHighlightProps) {
  // Normalize input
  const activeMuscles = muscles.map(m => m.toLowerCase());

  const isActive = (target: string) => {
     // Check for exact match or broad category
     return activeMuscles.some(m => m.includes(target) || target.includes(m));
  };

  // Helper for path styling
  const getPathStyle = (group: string) => {
      const active = isActive(group);
      return cn(
          "transition-all duration-500",
          active
            ? "fill-cyan-400/80 stroke-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            : "fill-white/5 stroke-white/10"
      );
  };

  return (
    <div className={cn("relative w-24 h-48", className)}>
      <svg viewBox="0 0 100 200" className="w-full h-full overflow-visible">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Head */}
        <circle cx="50" cy="15" r="8" className="fill-white/5 stroke-white/10" strokeWidth="0.5" />

        {/* Shoulders (Delts) */}
        <path
            d="M 28 30 Q 20 35 18 45 L 22 50 Q 30 40 38 35 Z"
            className={getPathStyle('shoulders')}
            strokeWidth="0.5"
        />
        <path
            d="M 72 30 Q 80 35 82 45 L 78 50 Q 70 40 62 35 Z"
            className={getPathStyle('shoulders')}
            strokeWidth="0.5"
        />

        {/* Chest (Pecs) */}
        <path
            d="M 38 35 Q 50 45 62 35 L 60 55 Q 50 60 40 55 Z"
            className={getPathStyle('chest')}
            strokeWidth="0.5"
        />

        {/* Arms (Biceps/Triceps/Forearms) */}
        <path
            d="M 18 45 L 15 70 L 20 70 L 22 50 Z"
            className={getPathStyle('arms')}
            strokeWidth="0.5"
        />
        <path
            d="M 82 45 L 85 70 L 80 70 L 78 50 Z"
            className={getPathStyle('arms')}
            strokeWidth="0.5"
        />
         {/* Forearms */}
         <path
            d="M 15 70 L 12 90 L 18 90 L 20 70 Z"
            className={getPathStyle('forearms')}
            strokeWidth="0.5"
        />
         <path
            d="M 85 70 L 88 90 L 82 90 L 80 70 Z"
            className={getPathStyle('forearms')}
            strokeWidth="0.5"
        />

        {/* Core (Abs) */}
        <path
            d="M 40 55 Q 50 60 60 55 L 58 85 Q 50 90 42 85 Z"
            className={getPathStyle('core')}
            strokeWidth="0.5"
        />
        {/* Lats/Back visibility from front */}
        <path
            d="M 28 30 L 38 35 L 40 55 L 35 70 L 30 50 Z"
            className={getPathStyle('back')}
            strokeWidth="0.5"
        />
         <path
            d="M 72 30 L 62 35 L 60 55 L 65 70 L 70 50 Z"
            className={getPathStyle('back')}
            strokeWidth="0.5"
        />

        {/* Legs (Quads) */}
        <path
            d="M 35 85 Q 25 100 28 140 L 45 140 Q 48 100 42 85 Z"
            className={getPathStyle('legs')}
            strokeWidth="0.5"
        />
        <path
            d="M 65 85 Q 75 100 72 140 L 55 140 Q 52 100 58 85 Z"
            className={getPathStyle('legs')}
            strokeWidth="0.5"
        />

        {/* Calves */}
        <path
            d="M 28 145 Q 25 160 30 185 L 40 185 Q 45 160 45 145 Z"
            className={getPathStyle('calves')}
            strokeWidth="0.5"
        />
        <path
            d="M 72 145 Q 75 160 70 185 L 60 185 Q 55 160 55 145 Z"
            className={getPathStyle('calves')}
            strokeWidth="0.5"
        />

        {/* Glutes (implied for legs check) */}
         <path
            d="M 35 85 L 65 85"
            className={cn("stroke-none", isActive('glutes') && "fill-cyan-400/20")}
        />

      </svg>

      {/* Holographic Scanline Effect */}
      <motion.div
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-cyan-400/30 blur-[2px]"
      />
    </div>
  );
}
