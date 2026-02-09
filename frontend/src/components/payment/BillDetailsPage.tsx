import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { TouchButton } from '../ui/TouchButton';
import { calculateTotalDue, CURRENCY_FORMAT } from '../../lib/billing';
import { ArrowLeft, AlertTriangle, CreditCard, Receipt, Loader2, Printer, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { OTPInput } from '../payments/OTPInput';

export const BillDetailsPage: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // type is actually ID now
    const navigate = useNavigate();

    // Payment States
    const [viewState, setViewState] = useState<'details' | 'otp' | 'processing' | 'printing' | 'receipt'>('details');
    const [progress, setProgress] = useState(0);
    const [billData, setBillData] = useState<any>();
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const user = await api.getCurrentUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                setUserEmail(user.email); // Store email for OTP display

                const bills = await api.getBills(user.id);
                // Find bill by ID (params.type holds ID now)
                const found = bills.find((b: any) => b.id === type);
                // Fallback: search by type if ID match fails (backwards compat)
                const fallback = bills.find((b: any) => b.type === type);

                setBillData(found || fallback);
            } catch (e) {
                console.error("Failed to fetch bill", e);
                navigate('/login');
            }
        };
        fetchBill();
    }, [type, navigate]);

    if (!billData) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-white" size={48} />
            </div>
        </DashboardLayout>
    );

    // Recalculate based on real data
    const daysOverdue = 3;
    const { penalty, total } = calculateTotalDue(
        billData.amount,
        0.001,
        daysOverdue
    );

    const displayTotal = billData.status === 'paid' ? 0 : total;

    const handlePay = async () => {
        const user = await api.getCurrentUser();
        if (!user || !billData) return;

        const loadingToast = toast.loading('Sending OTP to your email...');

        try {
            // Request OTP
            const otpResult = await api.requestPaymentOTP(user.id, displayTotal, billData.type);

            toast.dismiss(loadingToast); // Dismiss loading toast

            if (otpResult.success) {
                // Check if in demo mode
                if (otpResult.demoMode) {
                    toast.success(otpResult.message, {
                        duration: 10000,
                        description: 'Email not configured. Check browser console for OTP.'
                    });
                } else {
                    toast.success('OTP sent! Check your email.', {
                        description: `Code sent to ${userEmail}`
                    });
                }
                setViewState('otp'); // Show OTP input screen
            } else {
                // Handle specific errors
                if (otpResult.retryAfter) {
                    toast.error(`Rate limit exceeded. Please wait ${otpResult.retryAfter} minutes.`, {
                        duration: 8000
                    });
                } else {
                    toast.error(otpResult.error || 'Failed to send OTP', {
                        description: 'Please try again or contact support'
                    });
                }
            }
        } catch (e: any) {
            toast.dismiss(loadingToast); // Dismiss on error too
            console.error('OTP request error:', e);
            toast.error('Failed to request OTP', {
                description: e.message || 'Network error. Please check your connection.'
            });
        }
    };

    const handleOTPComplete = async (otp: string) => {
        const user = await api.getCurrentUser();
        if (!user || !billData) return;

        setIsVerifyingOTP(true);

        try {
            // Verify OTP
            const verifyResult = await api.verifyPaymentOTP(user.id, otp);

            if (verifyResult.success && verifyResult.verified) {
                // OTP verified, proceed with payment
                toast.success('OTP Verified! Processing payment...');
                setViewState('processing');

                try {
                    const paymentResult = await api.payBill(user.id, billData.id, displayTotal, billData.type);

                    if (paymentResult.success) {
                        setViewState('printing');
                        let p = 0;
                        const interval = setInterval(() => {
                            p += 5;
                            if (p >= 100) {
                                clearInterval(interval);
                                setViewState('receipt');
                                toast.success('Payment Successful!', {
                                    description: `₹${displayTotal.toFixed(2)} paid successfully`
                                });
                            }
                            setProgress(p);
                        }, 100);
                    } else {
                        setViewState('details');
                        setIsVerifyingOTP(false);
                        toast.error(paymentResult.error || 'Payment Failed', {
                            description: 'Please try again'
                        });
                    }
                } catch (paymentError: any) {
                    setViewState('details');
                    setIsVerifyingOTP(false);
                    toast.error('Payment processing failed', {
                        description: paymentError.message || 'Please contact support'
                    });
                }
            } else {
                toast.error(verifyResult.error || 'Invalid OTP', {
                    description: 'Please check the code and try again'
                });
                setIsVerifyingOTP(false);
            }
        } catch (e: any) {
            console.error('OTP verification error:', e);
            toast.error('Verification failed', {
                description: e.message || 'Please try again'
            });
            setIsVerifyingOTP(false);
            // Don't go back to details, let user retry OTP
        }
    };

    const handleResendOTP = async () => {
        const user = await api.getCurrentUser();
        if (!user || !billData) return;

        const loadingToast = toast.loading('Resending OTP...');

        try {
            const otpResult = await api.requestPaymentOTP(user.id, displayTotal, billData.type);

            toast.dismiss(loadingToast);

            if (otpResult.success) {
                toast.success('OTP resent! Check your email.');
            } else {
                toast.error(otpResult.error || 'Failed to resend OTP');
            }
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error('Error resending OTP: ' + e);
        }
    };

    return (
        <DashboardLayout>
            <AnimatePresence mode="wait">

                {/* STATE: DETAILS */}
                {viewState === 'details' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col h-full max-w-4xl mx-auto w-full"
                    >
                        <div className="mb-8">
                            <TouchButton onClick={() => navigate('/dashboard')} variant="ghost" size="lg" icon={<ArrowLeft />}>
                                Back to Dashboard
                            </TouchButton>
                        </div>

                        <div className="glass-panel rounded-3xl overflow-hidden flex-1 flex flex-col border border-white/20">
                            {/* Header */}
                            <div className="bg-white/5 p-8 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                        <Receipt size={32} className="text-sky-400" />
                                        {type?.toUpperCase()} Bill
                                    </h2>
                                    <p className="text-slate-400 mt-2 text-lg">Bill ID: {billData.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400">Due Date</p>
                                    <p className={`text-xl font-bold ${billData.status === 'paid' ? "text-emerald-400" : "text-red-400"}`}>
                                        {billData.dueDate} ({billData.status === 'paid' ? "PAID" : "Overdue"})
                                    </p>
                                </div>
                            </div>

                            {billData.status === 'paid' ? (
                                <div className="p-12 flex flex-col items-center justify-center flex-1">
                                    <CheckCircle size={80} className="text-emerald-500 mb-6" />
                                    <h3 className="text-4xl font-bold text-white mb-2">No Dues Pending</h3>
                                    <p className="text-xl text-slate-400">Thank you for your timely payment.</p>
                                </div>
                            ) : (
                                <div className="p-8 flex-1 flex flex-col gap-8">
                                    {/* Breakdown Card */}
                                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-6">

                                        {/* Principal */}
                                        <div className="flex justify-between items-center pb-6 border-b border-white/10">
                                            <span className="text-2xl text-slate-300">Principal Amount</span>
                                            <span className="text-2xl font-bold text-white">{CURRENCY_FORMAT.format(billData.amount)}</span>
                                        </div>

                                        {/* Penalty */}
                                        <div className="flex justify-between items-center pb-6 border-b border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-2xl text-red-400 font-bold flex items-center gap-2">
                                                    Late Penalty
                                                    <AlertTriangle size={24} />
                                                </span>
                                                <span className="text-sm text-red-300/70">
                                                    Compound Interest Applied
                                                </span>
                                            </div>
                                            <span className="text-2xl font-bold text-red-400">+{CURRENCY_FORMAT.format(penalty)}</span>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-3xl font-black text-slate-200">Total Payable</span>
                                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{CURRENCY_FORMAT.format(displayTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            {billData.status !== 'paid' && (
                                <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end">
                                    <TouchButton onClick={handlePay} variant="primary" size="xl" icon={<CreditCard size={32} />} className="w-full md:w-auto px-12">
                                        Proceed to Pay {CURRENCY_FORMAT.format(displayTotal)}
                                    </TouchButton>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STATE: OTP INPUT */}
                {viewState === 'otp' && (
                    <motion.div
                        key="otp"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col h-full max-w-2xl mx-auto w-full"
                    >
                        <div className="mb-8">
                            <TouchButton onClick={() => setViewState('details')} variant="ghost" size="lg" icon={<ArrowLeft />}>
                                Back to Bill Details
                            </TouchButton>
                        </div>

                        <div className="glass-panel rounded-3xl p-12 border border-emerald-500/30">
                            <OTPInput
                                onComplete={handleOTPComplete}
                                onResend={handleResendOTP}
                                email={userEmail}
                                isVerifying={isVerifyingOTP}
                            />
                        </div>
                    </motion.div>
                )}

                {/* STATE: PROCESSING / PRINTING */}
                {(viewState === 'processing' || viewState === 'printing') && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="text-center">
                            {viewState === 'processing' ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 size={80} className="text-sky-500 animate-spin mb-6" />
                                    <h2 className="text-3xl font-bold text-white">Processing Payment...</h2>
                                    <p className="text-slate-400 mt-2">Connecting to Bank Server</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-[400px]">
                                    <Printer size={80} className="text-emerald-500 animate-bounce mb-6" />
                                    <h2 className="text-3xl font-bold text-white mb-6">Printing Receipt</h2>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-700 h-6 rounded-full overflow-hidden mb-2 relative">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150 ease-linear"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-emerald-400 font-mono">{progress}% Complete</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STATE: RECEIPT SUCCESS */}
                {viewState === 'receipt' && (
                    <motion.div
                        key="receipt"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white w-[360px] shadow-2xl rounded-lg overflow-hidden relative">
                            {/* Close Button - Critical for UX since Return button was removed */}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 z-10 transition-colors"
                                title="Close Receipt"
                            >
                                <X size={20} />
                            </button>

                            {/* Receipt Content */}
                            <div className="p-8 pb-8 font-mono text-center text-slate-900 bg-white">
                                <CheckCircle size={48} className="text-emerald-600 mx-auto mb-4" />
                                <h1 className="text-2xl font-black uppercase mb-1">Payment Success</h1>
                                <p className="text-sm text-slate-500 mb-6">Transaction ID: TXN-{billData.id.split('-').pop()}</p>

                                <div className="border-t-2 border-slate-200 my-4" />

                                <div className="flex justify-between mb-2">
                                    <span className="font-bold">TOTAL PAID</span>
                                    <span className="font-bold text-xl">{CURRENCY_FORMAT.format(displayTotal)}</span>
                                </div>

                                <div className="border-b-2 border-slate-200 my-4" />

                                <p className="text-xs text-slate-400 uppercase mb-6">Thank you for being a responsible citizen.</p>

                                {/* Buttons inside receipt */}
                                <div className="flex justify-center">
                                    <TouchButton onClick={() => window.print()} variant="outline" className="px-8 text-sm h-12 gap-2 border-slate-300 text-slate-600 hover:bg-slate-50">
                                        <Printer size={16} /> Print
                                    </TouchButton>
                                </div>
                            </div>

                            {/* Jagged Edge bottom effect */}
                            <div className="h-5 bg-white relative">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_33.333%,#ffffff_33.333%,#ffffff_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#ffffff_33.333%,#ffffff_66.667%,transparent_66.667%)] bg-[length:20px_20px] translate-y-3"></div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </DashboardLayout>
    );
};
