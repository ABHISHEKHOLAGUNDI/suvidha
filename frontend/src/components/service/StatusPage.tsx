import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { TouchButton } from '../ui/TouchButton';
import { ArrowLeft, Search, CheckCircle, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

export const StatusPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchId, setSearchId] = useState('');
    const [grievances, setGrievances] = useState<any[]>([]);
    const [allGrievances, setAllGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const data = await api.getGrievances();
                const safeData = Array.isArray(data) ? data : [];
                setGrievances(safeData);
                setAllGrievances(safeData);
            } catch (e) {
                console.error('Failed to fetch grievances', e);
            } finally {
                setLoading(false);
            }
        };
        fetchGrievances();
    }, []);

    const handleSearch = () => {
        if (searchId) {
            const found = allGrievances.filter(g => g.id.toLowerCase().includes(searchId.toLowerCase()));
            setGrievances(found);
        } else {
            setGrievances(allGrievances);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Resolved': return t('statusResolved');
            case 'Rejected': return t('statusRejected');
            case 'In Progress': return t('statusInReview'); // Mapping In Progress to Under Review for display if needed, or create new key
            case 'Pending': return t('statusSubmitted'); // Mapping Pending to Submitted
            default: return status;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
                <div className="mb-6">
                    <TouchButton onClick={() => navigate('/dashboard')} variant="ghost" size="lg" icon={<ArrowLeft />}>
                        {t('backToServices')}
                    </TouchButton>
                </div>

                <div className="glass-panel p-8 rounded-3xl flex-1 border border-white/20 overflow-y-auto">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <Activity className="text-sky-400" size={32} />
                        {t('yourApplications')}
                    </h2>

                    {/* Search Box */}
                    <div className="flex gap-4 mb-8">
                        <input
                            type="text"
                            placeholder={t('searchById')}
                            className="flex-1 p-6 rounded-xl bg-white/10 border border-white/20 text-white text-xl placeholder-white/30 focus:border-sky-400 outline-none"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <TouchButton onClick={handleSearch} isLoading={loading} variant="primary" size="lg" icon={<Search />}>
                            {t('filter')}
                        </TouchButton>
                    </div>

                    {/* Results List */}
                    <div className="space-y-6">
                        {grievances.map((g) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-2xl p-8 border border-white/10"
                            >
                                <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{g.category}</h3>
                                        <p className="text-slate-400 mt-1">{t('refId')} {g.id}</p>
                                        <p className="text-sm text-slate-500 mt-1">{g.name}</p>
                                    </div>
                                    <div className={`px-6 py-2 rounded-full font-bold border ${g.status === 'Resolved' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" :
                                        g.status === 'Rejected' ? "bg-red-500/20 text-red-400 border-red-500/50" :
                                            "bg-amber-500/20 text-amber-300 border-amber-500/50"
                                        }`}>
                                        {getStatusLabel(g.status)}
                                    </div>
                                </div>

                                {/* Timeline (Simplified for real API) */}
                                <div className="space-y-4 relative pl-4">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[27px] top-2 bottom-4 w-[2px] bg-white/10" />

                                    {[
                                        { label: t('statusSubmitted'), key: 'Pending', step: 1 },
                                        { label: t('statusInReview'), key: 'In Progress', step: 2 },
                                        { label: t('statusResolved'), key: 'Resolved', step: 3 }
                                    ].map((step, index) => {
                                        // const isCompleted = g.status === 'Resolved' || (g.status === 'In Progress' && index === 0) || (g.status === 'Pending' && index === -1);
                                        // Logic improvement:
                                        const statusPriority = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3, 'Rejected': 0 };
                                        const currentPrio = statusPriority[g.status as keyof typeof statusPriority] || 1;
                                        const completed = currentPrio > index + 1 || (g.status === 'Resolved' && index === 2);
                                        const active = currentPrio === index + 1;

                                        return (
                                            <div key={index} className="flex gap-6 relative z-10">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 transition-all ${completed ? "bg-emerald-500 border-white text-white" :
                                                    (active ? "bg-amber-500 border-amber-300 animate-pulse" : "bg-slate-800 border-slate-700")
                                                    }`}>
                                                    {completed ? <CheckCircle size={24} /> : (active ? <Clock size={24} /> : <div className="w-3 h-3 bg-slate-500 rounded-full" />)}
                                                </div>
                                                <div className="pt-2">
                                                    <h4 className={`text-xl font-bold ${completed || active ? "text-white" : "text-slate-500"}`}>
                                                        {step.label}
                                                    </h4>
                                                    {active && <p className="text-amber-400 text-sm font-bold">{t('currentStage')}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}

                        {grievances.length === 0 && (
                            <div className="text-center py-12 text-slate-500 text-xl">
                                {t('noApplicationsFound')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
