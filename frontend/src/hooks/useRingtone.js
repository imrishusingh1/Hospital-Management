import { useRef, useCallback } from 'react';

/**
 * useRingtone — Synthesizes a modern messenger-style ringtone
 * using the Web Audio API. No external files needed.
 *
 * The pattern mimics Facebook Messenger:
 *   3 ascending notes → pause → repeat
 */
const useRingtone = () => {
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  // Plays a single "ding" burst at a given frequency and time offset
  const scheduleTone = (ctx, frequency, startOffset, duration = 0.18, volume = 0.35) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset);

    // Smooth fade in/out to avoid clicking artifacts
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startOffset);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startOffset + 0.02);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + startOffset + duration - 0.03);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + duration);

    oscillator.start(ctx.currentTime + startOffset);
    oscillator.stop(ctx.currentTime + startOffset + duration);
  };

  // Plays one full ring cycle (3 ascending notes)
  const playOneCycle = useCallback(() => {
    try {
      // Create a fresh AudioContext each cycle to avoid state issues
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Facebook Messenger-style ascending ring:
      // Note 1 → Note 2 → Note 3 (each slightly higher)
      scheduleTone(ctx, 830,  0.00, 0.18); // ~G#5
      scheduleTone(ctx, 1047, 0.22, 0.18); // ~C6
      scheduleTone(ctx, 1319, 0.44, 0.25); // ~E6 (held a bit longer)
    } catch (err) {
      console.warn('[Ringtone] AudioContext error:', err);
    }
  }, []);

  const playRing = useCallback(() => {
    // Play immediately, then repeat every 2.8 seconds
    playOneCycle();
    intervalRef.current = setInterval(playOneCycle, 2800);
  }, [playOneCycle]);

  const stopRing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) { /* already closed */ }
      audioCtxRef.current = null;
    }
  }, []);

  return { playRing, stopRing };
};

export default useRingtone;
