// src/components/shell/Toaster.tsx
import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast font-sans backdrop-blur-2xl border bg-slate-950/90 text-white shadow-lg border-white/10',
          description: 'group-[.toast]:text-slate-300',
          actionButton:
            'group-[.toast]:bg-cyan-500 group-[.toast]:text-black group-[.toast]:font-bold group-[.toast]:shadow-[0_0_10px_rgba(6,182,212,0.5)]',
          cancelButton:
            'group-[.toast]:bg-white/10 group-[.toast]:text-white hover:group-[.toast]:bg-white/20',

          // Refined States (Less Aggressive Glow)
          // Success
          success:
            '!bg-emerald-950/95 !border-emerald-500/50 !text-emerald-50 !shadow-lg',

          // Error
          error:
            '!bg-rose-950/95 !border-rose-500/50 !text-rose-50 !shadow-lg',

          // Warning
          warning:
            '!bg-amber-950/95 !border-amber-500/50 !text-amber-50 !shadow-lg',

          // Info
          info:
            '!bg-cyan-950/95 !border-cyan-500/50 !text-cyan-50 !shadow-lg',
        },
      }}
    />
  );
};
