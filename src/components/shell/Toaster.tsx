// src/components/shell/Toaster.tsx
import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast holographic-deep-glass border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] bg-white/5 backdrop-blur-xl text-slate-200',
          description: 'group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-cyan-400/20 group-[.toast]:text-cyan-300',
          cancelButton:
            'group-[.toast]:bg-white/5 group-[.toast]:text-slate-400',
          error: '!bg-red-500/10 !border-red-500/30',
          success: '!bg-green-500/10 !border-green-500/30',
          warning: '!bg-yellow-500/10 !border-yellow-500/30',
          info: '!bg-blue-500/10 !border-blue-500/30',
        },
      }}
    />
  );
};
