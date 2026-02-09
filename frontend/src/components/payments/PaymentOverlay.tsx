import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Smartphone, CreditCard, Printer, Download, Banknote } from 'lucide-react';
import jsPDF from 'jspdf';
import { CURRENCY_FORMAT } from '../../lib/billing';

interface PaymentOverlayProps {
    isOpen: boolean;
    amount: number;
    title: string;
    description: string;
    onClose: () => void;
    onSuccess: (txnId: string, actualAmount?: number) => void; // Add actualAmount param
    isAdmin?: boolean; // New Prop
}

export const PaymentOverlay: React.FC<PaymentOverlayProps> = ({
    isOpen,
    amount,
    title,
    description,
    onClose,
    onSuccess,
    isAdmin = false
}) => {
    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'upi' | 'card' | 'cash'>('upi');
    const [txnId, setTxnId] = useState('');
    const [hasReceiptAction, setHasReceiptAction] = useState(false);
    const [customAmount, setCustomAmount] = useState(amount);

    useEffect(() => {
        if (isOpen) {
            setStep('method'); // Reset
            setTxnId('');
            setHasReceiptAction(false);
            setCustomAmount(amount); // Reset to passed amount
        }
    }, [isOpen, amount]);

    const handlePayment = (selectedMethod: 'upi' | 'card' | 'cash') => {
        setMethod(selectedMethod);
        setStep('processing');

        const delay = selectedMethod === 'cash' ? 1500 : 3000; // Faster for cash

        setTimeout(() => {
            const mockTxn = `TXN-${isAdmin ? 'ADM-' : ''}${Math.floor(Math.random() * 10000000)}`;
            setTxnId(mockTxn);
            setStep('success');
            onSuccess(mockTxn, isAdmin ? customAmount : amount); // Pass actual amount for admin
        }, delay);
    };

    const generateReceipt = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(11, 11, 46); // Dark Blue
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("SUVIDHA CITY OS", 105, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.text("OFFICIAL PAYMENT RECEIPT", 105, 28, { align: 'center' });

        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Transaction ID: ${txnId}`, 20, 60);

        doc.text(`Service: ${title}`, 20, 75);
        doc.text(`Details: ${description}`, 20, 85);

        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(`Amount Paid: ${CURRENCY_FORMAT.format(isAdmin ? customAmount : amount)}`, 20, 100);

        if (method === 'cash') {
            doc.setTextColor(255, 153, 0);
            doc.text("(PAID VIA CASH)", 150, 100);
        }

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 120);
        doc.text("Thank you for contributing to Smart City Maintenance.", 20, 140);

        // Footer Border
        doc.setDrawColor(255, 153, 0); // Orange
        doc.setLineWidth(1);
        doc.line(20, 150, 190, 150);

        doc.save(`Receipt_${txnId}.pdf`);
        setHasReceiptAction(true);
    };

    const handlePrint = () => {
        window.print();
        setHasReceiptAction(true);
    };

    const handleClose = () => {
        if (step === 'success' && !hasReceiptAction) return; // Prevent close
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            >
                <div className="glass-panel border-orange-500/20 max-w-lg w-full p-8 rounded-3xl relative overflow-hidden bg-[#0b0b2e]/90 shadow-[0_0_100px_rgba(0,0,0,0.8)]">

                    {/* Hide Close Button on Success if Receipt not taken */}
                    {!(step === 'success' && !hasReceiptAction) && (
                        <button onClick={handleClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    )}

                    {step === 'method' && (
                        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="text-center">
                            <h3 className="text-2xl font-serif font-bold text-white mb-2">
                                {isAdmin ? 'Cash Collection' : 'Secure Payment Gateway'}
                            </h3>
                            <p className="text-slate-400 mb-8 font-mono text-sm tracking-wide">
                                {isAdmin ? 'ADMINISTRATIVE OVERRIDE' : 'ENCRYPTED :: 256-BIT SSL'}
                            </p>

                            <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-xl mb-8">
                                <p className="text-xs uppercase text-emerald-400 font-bold mb-1">
                                    {isAdmin ? 'Enter Amount to Collect' : 'Total Amount Due'}
                                </p>
                                {isAdmin ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl font-black text-white">₹</span>
                                        <input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Number(e.target.value))}
                                            className="text-4xl font-black text-white bg-transparent border-b-2 border-emerald-500/50 focus:border-emerald-400 outline-none w-40 text-center"
                                            min={1}
                                            step={100}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-4xl font-black text-white">{CURRENCY_FORMAT.format(amount)}</p>
                                )}
                            </div>

                            {!isAdmin ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handlePayment('upi')}
                                        className="p-6 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all hover:border-orange-500/50 group"
                                    >
                                        <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-3 rounded-full text-black group-hover:scale-110 transition-transform">
                                            <Smartphone size={24} />
                                        </div>
                                        <span className="font-bold text-slate-300 group-hover:text-white">UPI / QR Code</span>
                                    </button>

                                    <button
                                        onClick={() => handlePayment('card')}
                                        className="p-6 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all hover:border-blue-500/50 group"
                                    >
                                        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-full text-white group-hover:scale-110 transition-transform">
                                            <CreditCard size={24} />
                                        </div>
                                        <span className="font-bold text-slate-300 group-hover:text-white">Card Payment</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handlePayment('cash')}
                                    className="w-full p-6 border border-emerald-500/30 bg-emerald-900/10 hover:bg-emerald-900/20 rounded-xl flex flex-col items-center gap-3 transition-all hover:border-emerald-500/60 group shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                >
                                    <div className="bg-emerald-500 p-4 rounded-full text-black group-hover:scale-110 transition-transform shadow-[0_0_20px_#10b981]">
                                        <Banknote size={32} />
                                    </div>
                                    <span className="font-bold text-emerald-200 text-lg group-hover:text-white">Confirm Cash Collected</span>
                                    <span className="text-xs text-emerald-500/60 uppercase tracking-widest font-bold">Authorized Personnel Only</span>
                                </button>
                            )}
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-8 relative">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
                                {isAdmin ? 'Verifying Transaction...' : 'Processing Payment...'}
                            </h3>
                            <p className="text-slate-400 font-mono">
                                {isAdmin ? 'Updating Ledger w/ Cash Entry...' : 'Connecting to Banking Server...'}
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="text-center relative"
                        >
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 -z-10">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '3s' }} />
                            </div>

                            {/* Animated Success Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                className="w-28 h-28 mx-auto mb-8 relative"
                            >
                                {/* Outer Ring - Animated */}
                                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-pulse" />
                                <div className="absolute inset-0 border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-emerald-400/50 rounded-full animate-spin" style={{ animationDuration: '4s' }} />

                                {/* Inner Circle */}
                                <div className="absolute inset-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.4)] backdrop-blur-sm">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                    >
                                        <CheckCircle size={48} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Title with Gradient */}
                            <motion.h3
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-400 to-emerald-200 mb-2 drop-shadow-lg"
                            >
                                {isAdmin ? 'Cash Deposited Successfully!' : 'Payment Successful!'}
                            </motion.h3>

                            {/* Amount Display */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/5 border border-emerald-500/30 rounded-xl p-4 mb-6 inline-block backdrop-blur-sm"
                            >
                                <p className="text-xs uppercase text-emerald-400/70 font-bold mb-1">Amount Collected</p>
                                <p className="text-3xl font-black text-white">{CURRENCY_FORMAT.format(isAdmin ? customAmount : amount)}</p>
                            </motion.div>

                            {/* Transaction ID */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-slate-400 mb-8"
                            >
                                Transaction ID: <span className="font-mono text-orange-300 bg-orange-500/10 px-2 py-1 rounded">{txnId}</span>
                            </motion.p>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col gap-3"
                            >
                                <button
                                    onClick={generateReceipt}
                                    className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 border border-orange-500/30 transition-all hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(255,165,0,0.15)] group"
                                >
                                    <Download size={20} className="group-hover:animate-bounce" />
                                    <span>Download Receipt</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 border border-blue-500/30 transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group"
                                >
                                    <Printer size={20} className="group-hover:animate-pulse" />
                                    <span>Print Receipt</span>
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={!hasReceiptAction}
                                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all mt-2 ${hasReceiptAction
                                        ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white hover:scale-105 cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-orange-400/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                        }`}
                                >
                                    {hasReceiptAction ? '✓ Done - Close Receipt' : 'Download/Print Receipt to Continue'}
                                </button>
                            </motion.div>

                            {/* Decorative Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-6 pt-4 border-t border-white/5"
                            >
                                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
                                    {isAdmin ? 'ADMINISTRATIVE CASH DEPOSIT • SUVIDHA CITY OS' : 'SECURE TRANSACTION • SUVIDHA CITY OS'}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
};
