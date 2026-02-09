import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSocket } from '../../hooks/useSocket';
import { API_URL } from '../../services/api';
import { Zap, Droplets, AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CityMetrics {
    totalLoad: number;
    activeMeters: number;
    outageCount: number;
    leakCount: number;
    timestamp: string;
}

export const LiveMetrics: React.FC = () => {
    const { t } = useTranslation();
    const { on, off, isConnected } = useSocket();
    const [currentMetrics, setCurrentMetrics] = useState<CityMetrics | null>(null);
    const [loadHistory, setLoadHistory] = useState<Array<{ time: string; load: number }>>([]);
    const [autoChaos, setAutoChaos] = useState(false); // Default OFF for peace of mind


    useEffect(() => {
        if (!isConnected) return;

        const handleCityMetrics = (data: CityMetrics) => {
            setCurrentMetrics(data);

            // Add to history (keep last 20 data points)
            setLoadHistory((prev) => {
                const time = new Date(data.timestamp).toLocaleTimeString();
                const newHistory = [...prev, { time, load: typeof data.totalLoad === 'string' ? parseFloat(data.totalLoad) : data.totalLoad }];
                return newHistory.slice(-20);
            });
        };

        on('city-metrics', handleCityMetrics);

        return () => {
            off('city-metrics', handleCityMetrics);
        };
    }, [isConnected, on, off]);

    if (!currentMetrics) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>{t('waitingForData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 space-y-6 overflow-y-auto">
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-yellow-400" size={24} />
                        <span className="text-xs uppercase text-yellow-200 font-bold">{t('gridLoad')}</span>
                    </div>
                    <div className="text-3xl font-black text-white">{currentMetrics.totalLoad} kW</div>
                    <div className="text-xs text-yellow-200 mt-1">{currentMetrics.activeMeters} {t('activeMeters')}</div>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-400" size={24} />
                        <span className="text-xs uppercase text-red-200 font-bold">{t('outages')}</span>
                    </div>
                    <div className="text-3xl font-black text-white">{currentMetrics.outageCount}</div>
                    <div className="text-xs text-red-200 mt-1">{t('powerFailures')}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Droplets className="text-blue-400" size={24} />
                        <span className="text-xs uppercase text-blue-200 font-bold">{t('waterLeaks')}</span>
                    </div>
                    <div className="text-3xl font-black text-white">{currentMetrics.leakCount}</div>
                    <div className="text-xs text-blue-200 mt-1">{t('activeIncidents')}</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-emerald-400" size={24} />
                        <span className="text-xs uppercase text-emerald-200 font-bold">{t('status')}</span>
                    </div>
                    <div className="text-3xl font-black text-white">
                        {((currentMetrics.activeMeters / (currentMetrics.activeMeters + currentMetrics.outageCount)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-emerald-200 mt-1">{t('systemUptime')}</div>
                </div>
            </div>

            {/* Live Load Chart */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-400" />
                    {t('cityPowerGridLoad')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={loadHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="load"
                            stroke="#eab308"
                            strokeWidth={3}
                            dot={{ fill: '#fbbf24', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                    {isConnected ? (
                        <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>{t('realTimeActive')}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{t('disconnectedSim')}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Disaster Control Panel */}
            <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        {t('disasterSim')}
                    </h3>

                    <button
                        onClick={() => {
                            const newState = !autoChaos;
                            setAutoChaos(newState);
                            fetch(`${API_URL}/admin/simulation/toggle`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ enabled: newState })
                            });
                        }}
                        className={`px-4 py-2 rounded-full font-bold text-xs transition-colors flex items-center gap-2 ${autoChaos ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        <Activity size={14} />
                        {t('autoChaos')}: {autoChaos ? 'ON' : 'OFF'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => fetch(`${API_URL}/admin/trigger-event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'POWER_OUTAGE' })
                        })}
                        className="bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-200 p-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Zap size={20} /> {t('triggerGridFailure')}
                    </button>

                    <button
                        onClick={() => fetch(`${API_URL}/admin/trigger-event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'WATER_LEAK' })
                        })}
                        className="bg-blue-950/50 hover:bg-blue-900 border border-blue-800 text-blue-200 p-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Droplets size={20} /> {t('triggerWaterBurst')}
                    </button>

                    <button
                        onClick={() => fetch(`${API_URL}/admin/trigger-event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'RESOLVE_ALL' })
                        })}
                        className="bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 p-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Shield size={20} /> {t('healNetwork')}
                    </button>
                </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-slate-500 pb-8">
                {t('lastUpdated')}: {new Date(currentMetrics.timestamp).toLocaleString()}
            </div>
        </div>
    );
};
