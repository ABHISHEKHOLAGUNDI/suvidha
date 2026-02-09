import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building, CheckCircle2, Loader } from 'lucide-react';

interface PaymentGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: (transactionId: string, method: string) => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | null;

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
    isOpen,
    onClose,
    amount,
    onSuccess,
}) => {
    const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [transactionId, setTransactionId] = useState('');

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
    };

    const handleProceed = () => {
        if (!selectedMethod) return;

        setStep('processing');

        // Simulate payment processing
        setTimeout(() => {
            const txnId = `TXN${Date.now().toString().slice(-10)}`;
            setTransactionId(txnId);
            setStep('success');

            // Call success callback after 2 seconds
            setTimeout(() => {
                onSuccess(txnId, selectedMethod!);
                handleClose();
            }, 2000);
        }, 2500);
    };

    const handleClose = () => {
        setStep('select');
        setSelectedMethod(null);
        setTransactionId('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={step === 'select' ? handleClose : undefined}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* SELECT METHOD */}
                    {step === 'select' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white">Payment Gateway</h3>
                                <button onClick={handleClose} className="text-slate-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg mb-6">
                                <p className="text-xs text-orange-300 uppercase tracking-wider mb-1">Amount to Pay</p>
                                <p className="text-3xl font-bold text-white">₹{amount.toFixed(2)}</p>
                            </div>

                            <p className="text-slate-300 mb-4 font-semibold">Select Payment Method:</p>

                            <div className="space-y-3 mb-6">
                                {/* UPI */}
                                <button
                                    onClick={() => handleMethodSelect('upi')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${selectedMethod === 'upi'
                                            ? 'bg-blue-600 border-blue-400 shadow-lg'
                                            : 'bg-slate-800 border-slate-700 hover:border-blue-500'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedMethod === 'upi' ? 'bg-white/20' : 'bg-blue-500/20'}`}>
                                        <Smartphone className="text-blue-400" size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-white">UPI</p>
                                        <p className="text-xs text-slate-400">Pay via Google Pay, PhonePe, Paytm</p>
                                    </div>
                                </button>

                                {/* Card */}
                                <button
                                    onClick={() => handleMethodSelect('card')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${selectedMethod === 'card'
                                            ? 'bg-purple-600 border-purple-400 shadow-lg'
                                            : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedMethod === 'card' ? 'bg-white/20' : 'bg-purple-500/20'}`}>
                                        <CreditCard className="text-purple-400" size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-white">Card Payment</p>
                                        <p className="text-xs text-slate-400">Credit / Debit Cards</p>
                                    </div>
                                </button>

                                {/* Net Banking */}
                                <button
                                    onClick={() => handleMethodSelect('netbanking')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${selectedMethod === 'netbanking'
                                            ? 'bg-green-600 border-green-400 shadow-lg'
                                            : 'bg-slate-800 border-slate-700 hover:border-green-500'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedMethod === 'netbanking' ? 'bg-white/20' : 'bg-green-500/20'}`}>
                                        <Building className="text-green-400" size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-white">Net Banking</p>
                                        <p className="text-xs text-slate-400">Pay via Internet Banking</p>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={!selectedMethod}
                                className={`w-full py-3 rounded-lg font-bold transition-all ${selectedMethod
                                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Proceed to Pay
                            </button>
                        </>
                    )}

                    {/* PROCESSING */}
                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <Loader className="text-sky-400 animate-spin mx-auto mb-4" size={48} />
                            <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                            <p className="text-slate-400 text-sm">Please wait. Do not refresh this page.</p>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                            <p className="text-slate-400 mb-6">Your bill has been paid successfully.</p>

                            <div className="bg-slate-800 p-4 rounded-lg mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Transaction ID:</span>
                                    <span className="text-white font-mono font-bold">{transactionId}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Amount Paid:</span>
                                    <span className="text-white font-bold">₹{amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Method:</span>
                                    <span className="text-white capitalize">{selectedMethod}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500">Redirecting to dashboard...</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
