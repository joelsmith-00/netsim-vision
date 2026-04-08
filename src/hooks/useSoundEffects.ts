import { useCallback, useRef } from 'react';

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported
    }
  }, [getCtx]);

  const playPacketSend = useCallback(() => {
    playTone(880, 0.15, 'sine', 0.06);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.04), 80);
  }, [playTone]);

  const playPacketDeliver = useCallback(() => {
    playTone(523, 0.1, 'sine', 0.06);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.06), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.06), 200);
  }, [playTone]);

  const playPacketDrop = useCallback(() => {
    playTone(300, 0.2, 'sawtooth', 0.05);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.04), 150);
  }, [playTone]);

  const playNodeFail = useCallback(() => {
    playTone(150, 0.3, 'square', 0.04);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(600, 0.05, 'sine', 0.03);
  }, [playTone]);

  const playHop = useCallback(() => {
    playTone(1200 + Math.random() * 400, 0.06, 'sine', 0.03);
  }, [playTone]);

  return { playPacketSend, playPacketDeliver, playPacketDrop, playNodeFail, playClick, playHop };
}
