import React, { useState, useEffect } from 'react';
import { X, Receipt, TrendingUp, TrendingDown, History } from 'lucide-react';
import { api } from '../../services/api';
import { CURRENCY_FORMAT } from '../../lib/billing';
import { motion, AnimatePresence } from 'framer-motion';

interface UserHistoryModalProps {
    userId: string | null;
    userName: string | null;
    onClose: () => void;
}

interface Transaction {
    id: string;
    user_id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ userId, userName, onClose }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.getTransactions(userId!);
            setTransactions(data);
        } catch (e) {
            console.error('Failed to fetch history:', e);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel border-orange-500/20 max-w-3xl w-full max-h-[80vh] overflow-hidden rounded-3xl bg-[#0b0b2e]/95 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                >
                    {/* Header */}
                    <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500/20 p-3 rounded-full border border-orange-500/30">
                                <History size={24} className="text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-white">Transaction History</h3>
                                <p className="text-slate-400 font-mono text-sm">USER: <span className="text-orange-300">{userName}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Transaction List */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <Receipt size={64} className="text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">No transaction history found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((txn) => (
                                    <div
                                        key={txn.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${txn.type === 'DEPOSIT'
                                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                        : 'bg-red-500/20 border border-red-500/30'
                                                    }`}>
                                                    {txn.type === 'DEPOSIT' ? (
                                                        <TrendingUp size={20} className="text-emerald-400" />
                                                    ) : (
                                                        <TrendingDown size={20} className="text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-sm mb-1">{txn.description}</p>
                                                    <p className="text-slate-400 text-xs font-mono">ID: {txn.id}</p>
                                                    <p className="text-slate-500 text-xs mt-1">{txn.date}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold text-lg ${txn.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {txn.type === 'DEPOSIT' ? '+' : '-'}{CURRENCY_FORMAT.format(Math.abs(txn.amount))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-white/5 p-4 border-t border-white/10 flex justify-between items-center">
                        <p className="text-slate-400 text-sm">Total Transactions: <span className="text-white font-bold">{transactions.length}</span></p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
