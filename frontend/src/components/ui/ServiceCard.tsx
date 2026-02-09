import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useSound } from '../../hooks/useSound';

interface ServiceCardProps {
    title: string;
    icon: React.ReactNode;
    status?: string;
    variant?: 'neutral' | 'alert' | 'success';
    actionLabel?: string;
    onClick?: () => void;
    className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    icon,
    status,
    variant = 'neutral',
    actionLabel,
    onClick,
    className
}) => {
    const { playBeep } = useSound();

    const variants = {
        neutral: "bg-[#0b0b2e]/60 border border-orange-500/30 hover:bg-[#0b0b2e]/80 hover:border-orange-500/60 shadow-[0_0_15px_rgba(255,165,0,0.05)]",
        alert: "bg-red-950/40 border border-red-500/50 hover:bg-red-900/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        success: "bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    };

    const statusColors = {
        neutral: "text-orange-200/80 font-mono text-sm tracking-wider",
        alert: "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
        success: "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    };

    const handleTap = () => {
        playBeep(600);
        onClick?.();
    };

    return (
        <motion.div
            onClick={handleTap}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative rounded-xl p-8 backdrop-blur-md cursor-pointer flex flex-col items-center justify-between text-center gap-6 h-full min-h-[300px] transition-all duration-300 group",
                variants[variant],
                className
            )}
        >
            {/* Top decorative line for neutral cards */}
            {variant === 'neutral' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent shadow-[0_0_10px_orange]" />
            )}

            <div className={cn("p-6 rounded-full backdrop-blur-xl shadow-lg border relative transition-colors duration-500",
                variant === 'alert' ? "bg-red-500/10 border-red-500/30" :
                    (variant === 'success' ? "bg-emerald-500/10 border-emerald-500/30" : "bg-orange-500/5 border-orange-500/20 group-hover:border-orange-400/50"))}>

                {/* Inner Glow Pulse */}
                {(variant === 'neutral') && <div className="absolute inset-0 bg-orange-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}

                {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, {
                    size: 54,
                    className: variant === 'alert' ? "text-red-400 drop-shadow-[0_0_5px_red]" : (variant === 'success' ? "text-emerald-400 drop-shadow-[0_0_5px_emerald]" : "text-amber-200 drop-shadow-[0_0_5px_orange]")
                })}
            </div>

            <div className="flex flex-col gap-2">
                <h3 className={cn("text-2xl font-serif text-white tracking-wide uppercase", variant === 'neutral' ? 'text-gradient-gold' : '')}>{title}</h3>
                {status && (
                    <p className={cn("text-lg", statusColors[variant])}>
                        {status}
                    </p>
                )}
            </div>

            {actionLabel && (
                <div className={cn(
                    "px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-[0.15em] border transition-all duration-300",
                    variant === 'alert' ? "bg-red-600/20 border-red-500 text-red-200 hover:bg-red-600 hover:text-white" :
                        variant === 'success' ? "bg-emerald-600/20 border-emerald-500 text-emerald-200 hover:bg-emerald-600 hover:text-white" :
                            "bg-gradient-to-r from-transparent via-orange-500/10 to-transparent border-orange-500/50 text-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-400 shadow-[0_0_10px_rgba(255,165,0,0.1)]"
                )}>
                    {actionLabel}
                </div>
            )}
        </motion.div>
    );
};
