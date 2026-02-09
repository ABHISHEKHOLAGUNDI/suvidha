import React, { useEffect, useState } from 'react';
import { Mic, Activity } from 'lucide-react'; // Changed imports
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useSound } from '../../hooks/useSound';

export const VoiceFloatingButton: React.FC = () => {
    const { isListening, transcript, startListening, stopListening } = useVoiceInput(); // Ensure stopListening is exposed or handled
    const { playBeep } = useSound();
    const [welcomeSpoken, setWelcomeSpoken] = useState(false);

    // Auto-Welcome Message
    useEffect(() => {
        if (!welcomeSpoken) {
            // Small delay to allow interaction first if needed, or wait for user to click 
            // Actually browsers block auto-audio. We'll wait for first click or just skip auto for now to avoid annoying errors.
            // Let's make it speak only when activated first time.
        }
    }, [welcomeSpoken]);

    const handleStart = () => {
        playBeep(1000, 0.1);
        startListening();

        // Mock Response for "Wow Factor"
        if (!welcomeSpoken) {
            const utterance = new SpeechSynthesisUtterance("Suvidha Voice Assistant Online. How can I help you today?");
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
            setWelcomeSpoken(true);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-6 pointer-events-none">
            {/* Holographic Transcript Projection */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                        className="bg-black/40 backdrop-blur-2xl border border-cyan-500/30 p-6 rounded-2xl mb-4 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-sm relative overflow-hidden"
                    >
                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_2s_linear_infinite]"></div>

                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="text-cyan-400 animate-pulse" size={20} />
                            <span className="text-cyan-400 font-mono text-xs tracking-[0.2em] font-bold">AI LISTENING MODULE ACTIVE</span>
                        </div>

                        <p className="text-white text-xl font-light leading-relaxed">
                            "{transcript || "Listening..."}"
                        </p>

                        {/* Decorative Tech Bits */}
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                            <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Orb Button */}
            <div className="relative group pointer-events-auto">
                {/* Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isListening ? 'bg-cyan-500 opacity-60 animate-pulse' : 'bg-blue-600 opacity-20 group-hover:opacity-40'}`}></div>

                <motion.button
                    onClick={isListening ? stopListening : handleStart}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-2xl ${isListening
                        ? 'bg-slate-900 border-cyan-400 shadow-cyan-500/50'
                        : 'bg-slate-900 border-slate-700 hover:border-blue-400'
                        }`}
                >
                    {isListening ? (
                        <div className="relative flex items-center justify-center">
                            {/* Inner reacting core */}
                            <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 animate-ping"></div>
                            <Mic className="text-cyan-400 relative z-10" size={32} />

                            {/* Orbital Rings */}
                            <div className="absolute w-16 h-16 border border-cyan-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute w-12 h-12 border border-cyan-500/50 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                        </div>
                    ) : (
                        <Mic className="text-slate-300 group-hover:text-blue-400 transition-colors" size={32} />
                    )}
                </motion.button>

                {/* Status Indicator Dot */}
                <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 transition-colors ${isListening ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-600'}`}></div>
            </div>
        </div>
    );
};
