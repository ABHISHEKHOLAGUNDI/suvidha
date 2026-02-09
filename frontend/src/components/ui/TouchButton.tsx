import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useSound } from '../../hooks/useSound';

interface TouchButtonProps extends Omit<HTMLMotionProps<"button">, "onClick"> {
    variant?: 'primary' | 'warning' | 'outline' | 'ghost';
    size?: 'default' | 'lg' | 'xl';
    isLoading?: boolean;
    icon?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
    className,
    variant = 'primary',
    size = 'lg',
    isLoading = false,
    icon,
    children,
    onClick,
    ...props
}) => {
    const { playBeep } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!props.disabled && !isLoading) {
            playBeep(); // 800Hz beep
            onClick?.(e);
        }
    };

    const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-bold focus:outline-none disabled:opacity-50 disabled:pointer-events-none appearance-none select-none";

    const variants = {
        primary: "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/50 border border-blue-400/30",
        warning: "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-900/50 border border-amber-400/30",
        outline: "border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
        ghost: "hover:bg-white/5 text-slate-200",
    };

    const sizes = {
        default: "h-12 px-6 text-lg",
        lg: "h-[64px] px-8 text-xl min-w-[200px]",
        xl: "h-[88px] px-10 text-2xl min-w-[300px]",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            onClick={handleClick}
            {...props}
        >
            {isLoading && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
            {!isLoading && icon && <span className="mr-3">{icon}</span>}
            {children as React.ReactNode}
        </motion.button>
    );
};
