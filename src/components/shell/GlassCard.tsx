import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/5", // Very low opacity base
        "backdrop-blur-xl", // Heavy frost
        "border border-white/10", // Subtle etching
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]", // Deep glass shadow
        className
      )}
      {...props}
    >
      {/* Specular highlight gradient for that "premium glass" feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
