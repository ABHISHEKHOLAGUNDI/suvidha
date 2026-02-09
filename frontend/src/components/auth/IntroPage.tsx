import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import rhinoHologram from '../../assets/future_rhino.png';

interface IntroPageProps {
    onComplete: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Small buffer at 100%
                    return 100;
                }
                return prev + 1;
            });
        }, 40); // 4 Seconds Intro approx

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="relative w-full h-screen overflow-hidden text-white flex flex-col items-center justify-center font-serif">

            {/* Note: Global Particle Background handles the stars/snow now */}

            {/* 1. Rotating Tech Rings (The "3D Element") */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-40">
                {/* Outer Gold Ring */}
                <motion.div
                    className="w-[600px] h-[600px] border border-orange-400/30 rounded-full absolute"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Middle Cyan Dashed Ring */}
                <motion.div
                    className="w-[500px] h-[500px] border-2 border-dashed border-cyan-500/30 rounded-full absolute"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Complex Ring */}
                <motion.div
                    className="w-[400px] h-[400px] border border-orange-500/20 rounded-full absolute flex items-center justify-center"
                    animate={{ rotate: 180 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-full h-1 bg-transparent border-t border-orange-500/50 absolute top-[50%]" />
                    <div className="h-full w-1 bg-transparent border-l border-orange-500/50 absolute left-[50%]" />
                </motion.div>
            </div>

            {/* 2. Central Hologram Content */}
            <div className="relative z-20 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative mb-12"
                >
                    {/* The Holographic Rhino - Circular Logo Style */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-orange-500/30 bg-black/50 shadow-[0_0_50px_rgba(255,165,0,0.2)] flex items-center justify-center">
                        <motion.img
                            src={rhinoHologram}
                            alt="Holographic Rhino"
                            className="w-[110%] h-[110%] object-cover opacity-90"
                            // Slight scaling for "breathing" effect
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Fake Scanline Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent w-full h-[20%] animate-scan pointer-events-none" />

                        {/* Inner Border Glint */}
                        <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                    </div>
                </motion.div>

                {/* 3. Typography - Cinematic Gold */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-orange-300 tracking-[0.5em] text-sm md:text-base font-light mb-2 uppercase">
                        Government of Assam
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#f3e5ab] to-[#a08035] drop-shadow-2xl mb-4">
                        SUVIDHA
                    </h1>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mb-8" />
                </motion.div>

                {/* 4. Minimal Loader */}
                <div className="w-64 flex flex-col items-center">
                    <div className="w-full h-[2px] bg-slate-800 relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-200 to-orange-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between w-full mt-2 text-[10px] text-orange-400/70 tracking-widest font-mono">
                        <span>INITIALIZING NEURAL LINK</span>
                        <span>{progress}%</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
