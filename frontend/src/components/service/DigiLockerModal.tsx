import React, { useState } from 'react';
import { TouchButton } from '../ui/TouchButton';
import { Loader2, CheckCircle, FileText, X, CreditCard, IdCard, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../hooks/useSound';

interface DigiLockerModalProps {
    onSuccess: (fileName: string) => void;
    onClose: () => void;
}

type DocumentType = 'aadhaar' | 'pan' | 'driving_license' | null;

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({ onSuccess, onClose }) => {
    const { playBeep } = useSound();
    const [step, setStep] = useState<'select' | 'otp' | 'fetching' | 'preview' | 'success'>('select');
    const [selectedDoc, setSelectedDoc] = useState<DocumentType>(null);
    const [otp, setOtp] = useState('');

    const docDetails = {
        aadhaar: { name: 'Aadhaar Card', file: 'Aadhaar_Card_Verified.pdf', icon: IdCard },
        pan: { name: 'PAN Card', file: 'PAN_Card_Verified.pdf', icon: CreditCard },
        driving_license: { name: 'Driving License', file: 'DL_Verified.pdf', icon: FileCheck },
    };

    const handleDocSelect = (doc: DocumentType) => {
        setSelectedDoc(doc);
        setStep('otp');
        playBeep();
    };

    const handleOtpSubmit = () => {
        if (otp.length === 6) {
            playBeep();
            setStep('fetching');
            setTimeout(() => {
                setStep('preview');
                playBeep(1200);
                setTimeout(() => {
                    setStep('success');
                    setTimeout(() => {
                        if (selectedDoc) onSuccess(docDetails[selectedDoc].file);
                        onClose();
                    }, 1500);
                }, 2000);
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <X size={24} />
                </button>

                {/* DigiLocker Branding Header */}
                <div className="bg-[#2e5dc6] p-6 text-center">
                    <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <FileText /> DigiLocker
                    </h2>
                    <p className="text-blue-100 text-sm">Government of India</p>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {/* SELECT DOCUMENT */}
                        {step === 'select' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-slate-600 text-lg font-semibold mb-4">Select Document Type:</p>
                                {(['aadhaar', 'pan', 'driving_license'] as DocumentType[]).map((doc) => {
                                    if (!doc) return null;
                                    const { name, icon: Icon } = docDetails[doc];
                                    return (
                                        <button
                                            key={doc}
                                            onClick={() => handleDocSelect(doc)}
                                            className="w-full p-4 bg-slate-100 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-lg transition-all flex items-center gap-4"
                                        >
                                            <Icon size={32} className="text-blue-600" />
                                            <span className="text-lg font-semibold text-slate-700">{name}</span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {/* OTP VERIFICATION */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <p className="text-xl font-bold text-slate-700 mb-2">OTP Verification</p>
                                    <p className="text-slate-500 text-sm">
                                        Enter OTP sent to your registered mobile number
                                    </p>
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-48 text-center text-2xl font-mono tracking-widest border-2 border-slate-300 focus:border-blue-500 rounded-lg p-3 outline-none"
                                        placeholder="000000"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 text-center">
                                    Demo: Use any 6-digit code
                                </p>
                                <TouchButton
                                    onClick={handleOtpSubmit}
                                    disabled={otp.length !== 6}
                                    className="w-full bg-[#2e5dc6] hover:bg-[#254ea8] disabled:bg-slate-300"
                                >
                                    Verify OTP
                                </TouchButton>
                            </motion.div>
                        )}

                        {/* FETCHING */}
                        {step === 'fetching' && (
                            <motion.div
                                key="fetching"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-6"
                            >
                                <Loader2 size={48} className="text-[#2e5dc6] animate-spin mb-4" />
                                <p className="text-lg font-bold text-slate-700">Fetching Document...</p>
                                <p className="text-slate-500">{selectedDoc && docDetails[selectedDoc].name}</p>
                            </motion.div>
                        )}

                        {/* PREVIEW */}
                        {step === 'preview' && selectedDoc && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-6 text-center">
                                    <FileText size={64} className="text-blue-600 mx-auto mb-4" />
                                    <p className="font-bold text-lg text-slate-700">{docDetails[selectedDoc].name}</p>
                                    <p className="text-slate-500 text-sm">{docDetails[selectedDoc].file}</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                                    <p className="text-green-700 text-sm font-semibold">✓ Document Verified</p>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-6"
                            >
                                <CheckCircle size={64} className="text-emerald-500 mb-4" />
                                <p className="text-xl font-bold text-emerald-600">Document Attached!</p>
                                <p className="text-slate-500">Returning to form...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
