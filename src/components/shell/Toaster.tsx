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

          // Neon / Glowing States
          // Success: Emerald Glow
          success:
            '!bg-emerald-950/90 !border-emerald-500 !text-emerald-50 !shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)]',

          // Error: Rose/Red Glow
          error:
            '!bg-rose-950/90 !border-rose-500 !text-rose-50 !shadow-[0_0_25px_-5px_rgba(244,63,94,0.6)]',

          // Warning: Amber Glow
          warning:
            '!bg-amber-950/90 !border-amber-500 !text-amber-50 !shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]',

          // Info: Cyan Glow
          info:
            '!bg-cyan-950/90 !border-cyan-500 !text-cyan-50 !shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)]',
        },
      }}
    />
  );
};
