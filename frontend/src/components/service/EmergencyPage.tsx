import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { TouchButton } from '../ui/TouchButton';
import { Shield, Phone, Siren, Flame, AlertTriangle, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const EmergencyPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sosActive, setSosActive] = useState(false);

    const handleSOS = () => {
        setSosActive(true);
        toast.error(t('sosSignalSent'), {
            duration: 10000,
            style: { background: '#f43f5e', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 'bold' }
        });

        // Mock API call
        setTimeout(() => {
            setSosActive(false);
            toast.success(t('teamDispatched'), {
                duration: 5000,
            });
        }, 3000);
    };

    const emergencyContacts = [
        { name: t('police'), number: '100', icon: <Shield size={32} />, color: 'bg-blue-600', border: 'border-blue-400' },
        { name: t('ambulance'), number: '108', icon: <Siren size={32} />, color: 'bg-emerald-600', border: 'border-emerald-400' },
        { name: t('fire'), number: '101', icon: <Flame size={32} />, color: 'bg-orange-600', border: 'border-orange-400' },
        { name: t('contactHelpline'), number: '1091', icon: <Shield size={32} />, color: 'bg-pink-600', border: 'border-pink-400' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6 flex flex-col h-full">
                <header className="mb-8 flex items-center gap-4">
                    <TouchButton onClick={() => navigate('/dashboard')} variant="ghost" size="default" icon={<ArrowLeft />}>
                        {t('back')}
                    </TouchButton>
                    <div>
                        <h1 className="text-4xl font-black text-white flex items-center gap-3">
                            <Shield className="text-rose-500" size={40} />
                            {t('safeCityCenter')}
                        </h1>
                        <p className="text-slate-400">{t('instantAccess')}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">

                    {/* Left: SOS Section */}
                    <div className="bg-gradient-to-br from-rose-900/40 to-red-900/20 border-2 border-rose-500/30 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">{t('emergencySOS')}</h2>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSOS}
                                className={`
                                    w-64 h-64 rounded-full border-8 border-red-500/30 flex items-center justify-center
                                    shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:shadow-[0_0_80px_rgba(244,63,94,0.5)] transition-all
                                    ${sosActive ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-br from-red-600 to-rose-700'}
                                `}
                            >
                                <div className="text-white flex flex-col items-center gap-2">
                                    <AlertTriangle size={64} fill="white" />
                                    <div className="text-4xl font-black tracking-tighter">SOS</div>
                                    <div className="text-sm font-bold opacity-80 uppercase">{t('tapForHelp')}</div>
                                </div>
                            </motion.button>

                            <p className="mt-8 text-slate-400 font-medium max-w-sm mx-auto">
                                {t('pressToShare')}
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Dials & Map */}
                    <div className="flex flex-col gap-6">
                        {/* Quick Contacts */}
                        <div className="grid grid-cols-2 gap-4">
                            {emergencyContacts.map((contact) => (
                                <motion.button
                                    key={contact.name}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        ${contact.color} border-b-4 ${contact.border}
                                        p-6 rounded-3xl flex flex-col items-start justify-between min-h-[160px] shadow-lg
                                        relative overflow-hidden
                                    `}
                                    onClick={() => toast.success(`${t('calling')} ${contact.name}...`)}
                                >
                                    <div className="bg-black/20 p-3 rounded-2xl mb-4 backdrop-blur-sm">
                                        {contact.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight opacity-90">{contact.name}</h3>
                                        <div className="text-white font-black text-3xl">{contact.number}</div>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 text-white/10 rotate-12">
                                        <Phone size={100} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Location Mock */}
                        <div className="bg-slate-800/50 flex-1 rounded-3xl border border-white/10 p-6 flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4 z-10">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="font-bold tracking-wide text-sm">{t('liveLocationActive')}</span>
                                </div>
                                <span className="text-slate-500 text-xs font-mono">LAT: 28.6139 | LNG: 77.2090</span>
                            </div>

                            {/* Map Placeholder */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/img/osm-intl,13,28.6139,77.2090,300x200.png')] bg-cover bg-center grayscale" />

                            <div className="mt-auto z-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                <MapPin className="text-rose-500" size={24} />
                                <div className="text-sm">
                                    <p className="text-white font-bold">Connaught Place, New Delhi</p>
                                    <p className="text-slate-400">{t('locationVisible')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
