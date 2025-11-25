import { useCallback } from 'react';

export function useGymSound() {
  const playBuzzer = useCallback(() => {
    // Check if AudioContext is supported
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Buzzer characteristics: Sawtooth wave, low pitch, loud
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime); // Start at 150Hz
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5); // Drop pitch slightly

    // Envelope
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, []);

  const playSuccess = useCallback(() => {
     const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  return { playBuzzer, playSuccess };
}
