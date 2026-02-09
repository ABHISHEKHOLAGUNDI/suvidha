import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TouchButton } from '../ui/TouchButton';
import { LogOut, Home, Settings } from 'lucide-react';
import rhinoHologram from '../../assets/future_rhino.png';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

import { useWorldTime } from '../../hooks/useWorldTime';
import { api } from '../../services/api';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { date: currentDate, time: currentTime, isSynced } = useWorldTime();
    const { togglePanel } = useAccessibility();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        try {
            await api.logout();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/auth'); // Force navigation anyway
        }
    };

    return (
        <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-transparent">
            {/* Header */}
            <header className="glass-panel border-orange-500/20 m-4 rounded-2xl p-6 flex items-center justify-between z-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0b0b2e]/40 backdrop-blur-md">
                {/* Ashoka Chakra Graphic Placeholder Effect - Converted to Gold Arc */}
                <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border-[2px] border-orange-500/10 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 to-transparent pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    {/* Emblem Logo - Rhino Hologram */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center p-1 shadow-[0_0_20px_rgba(255,165,0,0.3)] bg-black/40 border border-orange-500/30 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-orange-500/10 animate-pulse rounded-full"></div>
                        <img
                            src={rhinoHologram}
                            alt="City Logo"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity scale-110"
                        />
                    </div>

                    <div>
                        <h1 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-200 tracking-wide drop-shadow-md">
                            SUVIDHA <span className="text-lg font-mono font-normal text-emerald-400/80 pl-2 tracking-widest">| CITY_OS_v2.0</span>
                        </h1>
                        <p className="text-blue-200/80 text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_current] ${isSynced ? 'bg-emerald-500 text-emerald-500' : 'bg-amber-500 text-amber-500'}`} />
                            {t('cityTitle')} • {currentDate} • <span className="font-mono text-white/60">{currentTime}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Language Switcher */}
                    <div className="relative group">
                        <select
                            onChange={(e) => i18n.changeLanguage(e.target.value)}
                            value={i18n.language}
                            className="bg-slate-900/80 text-cyan-400 border border-cyan-500/30 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8 font-mono tracking-wider uppercase text-sm cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <option value="en">ENG</option>
                            <option value="hi">HIN</option>
                            <option value="kn">KAN</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500/50">
                            ▼
                        </div>
                    </div>

                    <TouchButton variant="outline" size="default" onClick={togglePanel} icon={<Settings size={20} className="text-purple-400" />}>
                        <span className="text-purple-100">{t('settings')}</span>
                    </TouchButton>

                    <TouchButton variant="outline" size="default" onClick={() => navigate('/dashboard')} icon={<Home size={20} className="text-sky-400" />}>
                        <span className="text-sky-100">{t('dashboard')}</span>
                    </TouchButton>
                    <TouchButton variant="warning" size="default" onClick={handleLogout} icon={<LogOut size={20} className="text-orange-400" />}>
                        <span className="text-orange-100">{t('logout')}</span>
                    </TouchButton>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pt-0 md:p-8 md:pt-0 flex flex-col relative z-0">
                {children}
            </main>
        </div>
    );
};
