import { useCallback } from 'react';

export const useSound = () => {
    const playBeep = useCallback((frequency = 800, duration = 0.05, type: OscillatorType = 'sine') => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            // Perceptual loudness adjustments
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, []);

    return { playBeep };
};
