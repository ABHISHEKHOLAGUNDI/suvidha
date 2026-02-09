import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Clock } from 'lucide-react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onResend: () => void;
    expirySeconds?: number;
    email: string;
    isVerifying?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    length = 6,
    onComplete,
    onResend,
    expirySeconds = 300, // 5 minutes default
    email,
    isVerifying = false
}) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const [timeLeft, setTimeLeft] = useState(expirySeconds);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Allow resend after 60 seconds
        const resendTimer = setTimeout(() => {
            setCanResend(true);
        }, 60000);

        return () => {
            clearInterval(timer);
            clearTimeout(resendTimer);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if OTP is complete
        if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === length) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace: move to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(length - newOtp.length).fill('')]);

        // Focus last filled input
        const lastIndex = Math.min(newOtp.length, length - 1);
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === length) {
            onComplete(pastedData);
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        setOtp(Array(length).fill(''));
        setTimeLeft(expirySeconds);
        setCanResend(false);
        onResend();

        // Re-enable resend after 60s
        setTimeout(() => setCanResend(true), 60000);
    };

    return (
        <div className="text-center py-8">
            {/* Header */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
            >
                <Shield size={40} className="text-emerald-400" />
            </motion.div>

            <h3 className="text-2xl font-serif font-bold text-white mb-2">Enter OTP</h3>
            <p className="text-slate-400 text-sm mb-2">
                We've sent a 6-digit code to
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
                <Mail size={16} className="text-emerald-400" />
                <span className="text-emerald-300 font-mono text-sm">{email}</span>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isVerifying}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all outline-none ${digit
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'border-slate-700 bg-slate-800/50 text-white hover:border-emerald-500/50'
                            } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <Clock size={16} className={timeLeft < 60 ? 'text-red-400' : 'text-slate-400'} />
                <span className={`font-mono text-sm ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
                </span>
            </div>

            {/* Resend Button */}
            <button
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-semibold transition-all ${canResend
                    ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                    }`}
            >
                {canResend ? 'Resend OTP' : 'Resend available in 60s'}
            </button>

            {isVerifying && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-emerald-400">Verifying OTP...</span>
                </div>
            )}
        </div>
    );
};
