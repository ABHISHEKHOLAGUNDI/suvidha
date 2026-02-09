import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { api } from '../../services/api';
import { CURRENCY_FORMAT } from '../../lib/billing';
import {
    Receipt, Droplets, Zap, Flame, Trash2,
    ArrowRight, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import { TouchButton } from '../ui/TouchButton';
import { useTranslation } from 'react-i18next';

interface Bill {
    id: string;
    type: 'electricity' | 'water' | 'gas' | 'waste';
    amount: number;
    amountDue?: number; // Handle both cases just in case
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
}

export const BillsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDue, setTotalDue] = useState(0);

    const getIcon = (type: string) => {
        switch (type) {
            case 'electricity': return <Zap className="text-amber-400" size={32} />;
            case 'water': return <Droplets className="text-cyan-400" size={32} />;
            case 'gas': return <Flame className="text-orange-400" size={32} />;
            case 'waste': return <Trash2 className="text-emerald-400" size={32} />;
            default: return <Receipt className="text-slate-400" size={32} />;
        }
    };

    const getGradient = (type: string) => {
        switch (type) {
            case 'electricity': return 'from-amber-900/40 to-orange-900/20 border-amber-500/30 hover:border-amber-400/50';
            case 'water': return 'from-cyan-900/40 to-blue-900/20 border-cyan-500/30 hover:border-cyan-400/50';
            case 'gas': return 'from-orange-900/40 to-red-900/20 border-orange-500/30 hover:border-orange-400/50';
            case 'waste': return 'from-emerald-900/40 to-green-900/20 border-emerald-500/30 hover:border-emerald-400/50';
            default: return 'from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-slate-500';
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'electricity': return t('electricity');
            case 'water': return t('water');
            case 'gas': return t('gas');
            case 'waste': return t('wastePickup');
            default: return t('services');
        }
    };

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const user = await api.getCurrentUser();
                if (!user) {
                    navigate('/');
                    return;
                }
                const data = await api.getBills(user.id);
                const safeData = Array.isArray(data) ? data : [];
                setBills(safeData);

                // Calculate total due
                const due = safeData
                    .filter((b: Bill) => b.status !== 'paid')
                    .reduce((sum: number, b: Bill) => sum + (b.amount || b.amountDue || 0), 0);
                setTotalDue(due);
            } catch (err) {
                console.error('Failed to fetch bills:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <Loader2 className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 mb-2"
                        >
                            <div className="bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20">
                                <Receipt className="text-sky-400" size={40} />
                            </div>
                            {t('pageTitle')}
                        </motion.h1>
                        <p className="text-slate-400 text-lg ml-20">{t('pageSubtitle')}</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[280px]"
                    >
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">{t('totalOutstanding')}</p>
                        <p className={`text-4xl font-black ${totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {CURRENCY_FORMAT.format(totalDue)}
                        </p>
                        {totalDue === 0 && (
                            <p className="text-emerald-500 text-sm mt-2 flex items-center gap-1 font-bold">
                                <CheckCircle size={14} /> {t('allBillsPaid')}
                            </p>
                        )}
                    </motion.div>
                </header>

                {/* Bills Grid */}
                {bills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bills.map((bill, index) => (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    relative overflow-hidden rounded-[2rem] p-8 border transition-all duration-300 group
                                    bg-gradient-to-br ${getGradient(bill.type)}
                                    shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer
                                `}
                                onClick={() => navigate(`/bills/${bill.id}`)}
                            >
                                {/* Status Badge */}
                                <div className="absolute top-6 right-6 z-10">
                                    {bill.status === 'paid' ? (
                                        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-4 py-2 rounded-full border border-emerald-500/30 flex items-center gap-2 uppercase tracking-wide backdrop-blur-sm">
                                            <CheckCircle size={14} /> {t('statusPaid')}
                                        </span>
                                    ) : (
                                        <span className="bg-red-500/20 text-red-300 text-xs font-black px-4 py-2 rounded-full border border-red-500/30 flex items-center gap-2 uppercase tracking-wide backdrop-blur-sm animate-pulse">
                                            <AlertTriangle size={14} /> {t('statusDue')}
                                        </span>
                                    )}
                                </div>

                                {/* Icon & Type */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                                        {getIcon(bill.type)}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                                        {getLabel(bill.type)}
                                    </h3>
                                    <p className="text-slate-400 font-mono text-sm tracking-wide opacity-70">ID: {bill.id}</p>
                                </div>

                                {/* Amount Details */}
                                <div className="space-y-3 bg-black/20 rounded-xl p-4 mb-6 border border-white/5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-400 text-sm font-medium">{t('labelAmount')}</span>
                                        <span className="text-2xl font-black text-white">
                                            {CURRENCY_FORMAT.format(bill.amount || bill.amountDue || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">{t('labelDueDate')}</span>
                                        <span className={`font-mono font-bold ${new Date(bill.dueDate) < new Date() && bill.status !== 'paid' ? 'text-red-400' : 'text-slate-300'}`}>
                                            {new Date(bill.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <TouchButton
                                    variant={bill.status === 'paid' ? 'ghost' : 'primary'}
                                    className="w-full justify-between px-6 group-hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {bill.status === 'paid' ? t('viewReceipt') : t('proceedToPay')}
                                    <ArrowRight size={18} className="opacity-80" />
                                </TouchButton>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 text-center">
                        <div className="bg-slate-800 p-6 rounded-full mb-6">
                            <Receipt size={64} className="text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">{t('noBillsFound')}</h3>
                        <p className="text-slate-500 max-w-md">
                            {t('noBillsMessage')}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
