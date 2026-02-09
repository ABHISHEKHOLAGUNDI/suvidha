import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle, Truck, Recycle, Battery } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

const WastePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSchedule = async () => {
        if (!selectedType) {
            toast.error(t('selectWasteType'));
            return;
        }

        setLoading(true);
        try {
            // Visualize "Tomorrow Morning" as the slot
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const slot = `${tomorrow.toLocaleDateString()} (08:00 AM - 10:00 AM)`;

            await api.scheduleWastePickup(selectedType, slot);

            toast.success(t('pickupScheduled'), {
                description: `${t('vehicleArriving')}: ${slot}`,
                duration: 5000,
            });
            navigate('/dashboard');
        } catch (e) {
            toast.error(t('schedulingFailed'));
        } finally {
            setLoading(false);
        }
    };

    const types = [
        { id: 'Dry Waste', label: t('dryWaste'), icon: <Trash2 size={40} className="text-blue-400" />, desc: t('plasticPaperMetal'), color: 'border-blue-500/30 hover:bg-blue-500/10' },
        { id: 'Wet Waste', label: t('wetWaste'), icon: <Recycle size={40} className="text-green-400" />, desc: t('kitchenWasteOrganic'), color: 'border-green-500/30 hover:bg-green-500/10' },
        { id: 'E-Waste', label: t('eWaste'), icon: <Battery size={40} className="text-red-400" />, desc: t('batteriesWiresElectronics'), color: 'border-red-500/30 hover:bg-red-500/10' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">
                <button onClick={() => navigate('/dashboard')} className="mb-8 text-slate-400 hover:text-white transition-colors">
                    ← {t('backToDashboard')}
                </button>

                <div className="text-center mb-12">
                    <div className="inline-flex p-4 rounded-full bg-amber-500/10 mb-4 border border-amber-500/20">
                        <Truck size={48} className="text-amber-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-4">
                        {t('wastePickup')}
                    </h1>
                    <p className="text-xl text-slate-400">{t('scheduleWastePickupDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {types.map((t) => (
                        <motion.button
                            key={t.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedType(t.id)}
                            className={`p-8 rounded-2xl border-2 transition-all text-left flex flex-col items-center text-center gap-4 ${selectedType === t.id
                                ? 'bg-slate-800 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                                : `bg-slate-900/50 ${t.color} border-slate-800`
                                }`}
                        >
                            {t.icon}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{t.label}</h3>
                                <p className="text-sm text-slate-400">{t.desc}</p>
                            </div>
                            {selectedType === t.id && (
                                <div className="absolute top-4 right-4 text-emerald-400">
                                    <CheckCircle size={24} />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={handleSchedule}
                        disabled={loading || !selectedType}
                        className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${loading || !selectedType
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]'
                            }`}
                    >
                        {loading ? t('scheduling') : t('confirmPickup')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WastePage;
