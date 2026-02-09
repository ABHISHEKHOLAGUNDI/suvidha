import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { ServiceCard } from '../ui/ServiceCard';
import { Trash2, Megaphone, Siren, TrendingUp, Award, Zap, Activity, Shield, CheckCircle, Map as MapIcon, Building2, Receipt } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { CURRENCY_FORMAT } from '../../lib/billing';
import { EmergencyAlert } from './EmergencyAlert';
import { motion, AnimatePresence } from 'framer-motion';
import { CityMap } from '../admin/CityMap';

import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

// City Update Banner Component
const CityUpdateBanner: React.FC = () => {
    const [announcement, setAnnouncement] = useState<{ message: string } | null>(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await fetch(`${API_URL}/api/announcements/current`, {
                    credentials: 'include'
                });
                const data = await res.json();
                setAnnouncement(data);
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
            }
        };
        fetchAnnouncement();

        // Poll every 30 seconds for new announcements
        const interval = setInterval(fetchAnnouncement, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!announcement) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-full p-4 flex items-center gap-4 animate-in slide-in-from-bottom duration-1000">
            <div className="bg-sky-500 rounded-full p-2">
                <TrendingUp className="text-white" size={20} />
            </div>
            <p className="text-slate-300">
                <span className="font-bold text-white">City Update:</span> {announcement.message}
            </p>
        </div>
    );
};


const socket = io(API_URL); // Initialize socket outside component

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Session State
    const [user, setUser] = useState<any>(null);
    const [elecBill, setElecBill] = useState<any>();
    const [liveStats, setLiveStats] = useState<{
        power: { load: number; units: number; status: string };
        water: { flow: number; pressure: number; leak: boolean };
    } | null>(null);
    const [settings, setSettings] = useState<any>({});
    const [citizenScore, setCitizenScore] = useState<{ score: number, rank: string }>({ score: 500, rank: 'Bronze' });
    const [showGasModal, setShowGasModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Get current session user
                const sessionUser = await api.getCurrentUser();
                if (!sessionUser) {
                    navigate('/login');
                    return;
                }
                setUser(sessionUser);

                // Fetch latest utility bills
                const billsData = await api.getBills(sessionUser.id);
                const safeBills = Array.isArray(billsData) ? billsData : [];
                const elec = safeBills.find((b: any) => b.type === 'electricity');
                setElecBill(elec);

                // Fetch Settings
                const res = await fetch(`${API_URL}/settings`);
                const settingsData = await res.json();
                setSettings(settingsData);

                // Fetch Score
                try {
                    const scoreData = await api.getScore(sessionUser.id);
                    setCitizenScore(scoreData);
                } catch (e) {
                    console.error("Failed to fetch score", e);
                }

            } catch (e) {
                console.error("Dashboard initialization error", e);
            }
        };
        loadDashboard();

        // Poll for wallet updates
        const pollInterval = setInterval(async () => {
            try {
                const sessionUser = await api.getCurrentUser();
                if (sessionUser) {
                    setUser(sessionUser);
                }
                const res = await fetch(`${API_URL}/settings`);
                const settingsData = await res.json();
                setSettings(settingsData);
            } catch (e) {
                console.error("Dashboard polling error", e);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
        // Listen for real-time updates
        const handleCityPulse = (data: any) => {
            if (data.type === 'GRID_UPDATE') {
                setLiveStats({
                    power: {
                        load: parseFloat(data.payload.electricity.currentLoad),
                        units: parseFloat(data.payload.electricity.totalUnits),
                        status: data.payload.electricity.status
                    },
                    water: {
                        flow: parseFloat(data.payload.water.flowRate),
                        pressure: parseFloat(data.payload.water.pressure),
                        leak: data.payload.water.leakage
                    }
                });
            }
        };

        socket.on('city-pulse', handleCityPulse);

        return () => {
            socket.off('city-pulse', handleCityPulse);
        };
    }, [user, navigate]);


    if (!user) return null;

    return (
        <>
            <EmergencyAlert userId={user.id} />

            <DashboardLayout>
                <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full py-6">

                    {/* Welcome Message & Toggle */}
                    <div className="text-left mb-8 animate-in slide-in-from-left duration-700 flex flex-wrap justify-between items-end gap-4">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-200 mb-2 drop-shadow-md tracking-wide">
                                {t('welcome')}, <span className="text-white">{user.name}</span>
                            </h2>
                            <p className="text-xl text-blue-300/60 font-mono tracking-widest uppercase mb-4">
                                CITIZEN_ID: <span className="text-emerald-400">{user.id}</span> | {t('currentRank').toUpperCase()}: <span className="text-amber-400">{citizenScore.rank}</span>
                            </p>

                            {/* View Toggle */}
                            <div className="inline-flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Building2 size={16} /> {t('services')}
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <MapIcon size={16} /> {t('cityView')}
                                </button>
                            </div>
                        </div>

                        {/* Integrated Wallet Card */}
                        <div className="glass-panel border-emerald-500/30 p-4 flex items-center gap-4 min-w-[250px] shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <Shield className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-500/70 uppercase font-black tracking-[0.2em] mb-1">{t('civicWallet')}</p>
                                <p className="text-3xl font-serif font-black text-emerald-100 drop-shadow-sm">
                                    {CURRENCY_FORMAT.format(user.wallet_balance || user.walletBalance || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CITY MAP VIEW */}
                    {viewMode === 'map' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl relative"
                        >
                            <CityMap />
                        </motion.div>
                    )}

                    {/* Dashboard Grid - Mixed Layout */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 h-full">
                            {/* Row 1: Core Modules */}

                            {/* 1. BILLS & UTILITIES (Consolidated) */}
                            <ServiceCard
                                title={t('myBills')}
                                icon={<Receipt className={liveStats?.water.leak || liveStats?.power.status === 'OUTAGE' ? "text-red-500" : "text-amber-400"} />}
                                status={
                                    liveStats?.water.leak ? "CRITICAL: Water Leak" :
                                        liveStats?.power.status === 'OUTAGE' ? "Power Outage Detected" :
                                            (elecBill && elecBill.amount > 0 ? `Alert: ${CURRENCY_FORMAT.format(elecBill.amount)} Due` : "All Services Normal")
                                }
                                variant={
                                    liveStats?.water.leak || liveStats?.power.status === 'OUTAGE' || (elecBill && elecBill.amount > 0)
                                        ? "alert" : "success"
                                }
                                actionLabel={t('viewPay')}
                                onClick={() => navigate('/bills')}
                                className="h-full min-h-[280px] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                            />

                            {/* 2. REPORT & RESOLVE (Grievance) */}
                            <ServiceCard
                                title={t('reportResolve')}
                                icon={<Megaphone className="text-cyan-400" />}
                                status="File Complaint / Issue"
                                variant="neutral"
                                actionLabel={t('openPortal')}
                                onClick={() => navigate('/grievance')}
                                className="h-full min-h-[280px] border-cyan-500/20"
                            />

                            {/* 3. SAFE CITY (Emergency) */}
                            <ServiceCard
                                title={t('safeCity')}
                                icon={<Siren className="text-rose-500 animate-pulse" />}
                                status="Emergency Response"
                                variant="alert"
                                actionLabel={t('sosHelp')}
                                onClick={() => navigate('/emergency')}
                                className="h-full min-h-[280px] border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                            />

                            {/* Row 2: Lifestyle & Gamification */}

                            {/* 4. CITIZEN SCORE (Real Data) */}
                            <div className="md:col-span-2 glass-panel p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp size={120} />
                                </div>
                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                                <Award className="text-purple-400" size={24} />
                                            </div>
                                            <h3 className="font-serif font-bold text-slate-200 tracking-wider">{t('citizenScore').toUpperCase()}</h3>
                                        </div>
                                        <h2 className="text-6xl font-serif font-black text-white mb-2 drop-shadow-lg">
                                            {citizenScore.score}
                                        </h2>
                                        <p className="text-slate-400 mb-6">Top 5% of City • {citizenScore.rank} Citizen</p>

                                        <div className="w-full max-w-md bg-slate-800/50 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min((citizenScore.score / 1000) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono text-purple-300/60 w-full max-w-md">
                                            <span>{t('currentRank').toUpperCase()}</span>
                                            <span>{citizenScore.rank.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-mono border-t border-slate-700/50 pt-4">
                                    <Zap size={12} className="text-yellow-400" />
                                    Earn +50pts for timely bill payments | +10pts for reporting issues
                                </div>
                            </div>

                            {/* 5. WASTE PICKUP (New) */}
                            <ServiceCard
                                title={t('wastePickup')}
                                icon={<Trash2 className="text-amber-400" />}
                                status="Schedule Doorstep Collection"
                                variant="neutral"
                                actionLabel={t('scheduleNow')}
                                onClick={() => navigate('/waste')}
                                className="h-full border-amber-500/20"
                            />
                        </div>
                    )}

                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Removed Gas Booking Card and duplicate Waste Pickup */}

                            {settings['feature_track_status'] !== 'false' && (
                                <ServiceCard
                                    title={t('trackStatus')}
                                    icon={<Activity />}
                                    status="View Applications"
                                    variant="neutral"
                                    actionLabel={t('checkTimeline')}
                                    onClick={() => navigate('/status')}
                                    className="h-full min-h-[200px] bg-indigo-900/10 border-indigo-500/20"
                                />
                            )}
                        </div>
                    )}


                    {/* Footer / Quick Info */}
                    <div className="mt-8 flex items-center justify-between">
                        <CityUpdateBanner />

                        {/* Secret Admin Link */}
                        <button onClick={() => navigate('/admin')} className="p-2 text-slate-700 hover:text-red-500 transition-colors" title="Admin Portal">
                            <Shield size={20} />
                        </button>
                    </div>

                </div>

                {/* Gas Booking Modal (Visual Only) */}
                <AnimatePresence>
                    {showGasModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowGasModal(false)}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                                <p className="text-slate-400 mb-6">
                                    Your cylinder has been booked successfully.
                                </p>
                                <div className="bg-slate-800 p-4 rounded-lg mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Ref No:</span>
                                        <span className="text-white font-mono">REF-776263</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Delivery By:</span>
                                        <span className="text-white">Tomorrow, 4 PM</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGasModal(false)}
                                    className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-bold"
                                >
                                    Done
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DashboardLayout >
        </>
    );
};
