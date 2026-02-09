import React, { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';
import { Zap, Users, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface CityStats {
    totalLoad: number;
    activeUsers: number;
    totalUsers: number;
    outages: number;
    leaks: number;
}

export const SimpleCityOverview: React.FC = () => {
    const { on, off, isConnected } = useSocket();
    const [stats, setStats] = useState<CityStats>({
        totalLoad: 0,
        activeUsers: 0,
        totalUsers: 0,
        outages: 0,
        leaks: 0
    });
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (!isConnected) return;

        const handleMetrics = (data: any) => {
            setStats({
                totalLoad: parseFloat(data.totalLoad || 0),
                activeUsers: data.activeMeters || 0,
                totalUsers: users.length,
                outages: data.outageCount || 0,
                leaks: data.leakCount || 0
            });
        };

        on('city-metrics', handleMetrics);
        return () => off('city-metrics', handleMetrics);
    }, [isConnected, on, off, users.length]);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
            setStats(prev => ({ ...prev, totalUsers: data.length }));
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const uptime = stats.activeUsers > 0
        ? ((stats.activeUsers / (stats.activeUsers + stats.outages)) * 100).toFixed(1)
        : 100;

    return (
        <div className="p-8 h-full overflow-y-auto">
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="glass-card rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <Users className="text-blue-400 group-hover:text-blue-300 transition-colors" size={32} />
                        {isConnected && (
                            <div className="flex items-center gap-2 text-xs text-blue-300 font-mono border border-blue-500/30 px-2 py-1 rounded-full bg-blue-500/10">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                                LIVE
                            </div>
                        )}
                    </div>
                    <div className="relative z-10 text-5xl font-serif text-white mb-2">{stats.totalUsers}</div>
                    <div className="relative z-10 text-sm text-blue-200/60 uppercase tracking-wider font-bold">Registered Citizens</div>
                </div>

                {/* Grid Load */}
                <div className="glass-card rounded-2xl p-6 relative group overflow-hidden border-orange-500/30">
                    <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-orange-600/10 transition-colors" />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <Zap className="text-orange-400 group-hover:text-orange-300 transition-colors" size={32} />
                        <Activity className="text-orange-300 animate-pulse" size={20} />
                    </div>
                    <div className="relative z-10 text-5xl font-serif text-white mb-2">{stats.totalLoad.toFixed(2)}</div>
                    <div className="relative z-10 text-sm text-orange-200/60 uppercase tracking-wider font-bold">kW City Load</div>
                </div>

                {/* Outages */}
                <div className={`glass-card rounded-2xl p-6 relative group overflow-hidden transition-all ${stats.outages > 0 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-emerald-500/30'}`}>
                    <div className={`absolute inset-0 transition-colors ${stats.outages > 0 ? 'bg-red-900/20' : 'bg-emerald-600/5'}`} />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <AlertTriangle className={stats.outages > 0 ? "text-red-400 animate-bounce" : "text-emerald-400"} size={32} />
                        {stats.outages > 0 && (
                            <div className="text-[10px] text-red-200 font-bold px-2 py-1 bg-red-500/30 rounded border border-red-500/50 animate-pulse">
                                CRITICAL
                            </div>
                        )}
                    </div>
                    <div className={`relative z-10 text-5xl font-serif font-bold mb-2 ${stats.outages > 0 ? 'text-red-100' : 'text-emerald-100'}`}>
                        {stats.outages}
                    </div>
                    <div className={`relative z-10 text-sm uppercase tracking-wider font-bold ${stats.outages > 0 ? 'text-red-300' : 'text-emerald-300/60'}`}>
                        Power Outages
                    </div>
                </div>

                {/* Uptime */}
                <div className="glass-card rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-600/5 group-hover:bg-emerald-600/10 transition-colors" />
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <TrendingUp className="text-emerald-400 group-hover:text-emerald-300 transition-colors" size={32} />
                    </div>
                    <div className="relative z-10 text-5xl font-serif text-white mb-2">{uptime}%</div>
                    <div className="relative z-10 text-sm text-emerald-200/60 uppercase tracking-wider font-bold">System Uptime</div>
                </div>
            </div>

            {/* User List */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-orange-500/20">
                <div className="bg-black/40 p-6 border-b border-orange-500/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-500">Registered Citizens</h3>
                        <p className="text-orange-400/40 text-sm mt-1 uppercase tracking-widest">{users.length} RESIDENTS | VERIFIED</p>
                    </div>
                    <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-300 font-mono">
                        DATABASE_ACTIVE
                    </div>
                </div>
                <div className="divide-y divide-orange-500/10">
                    {users.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-orange-500/5 transition-colors flex justify-between items-center group">
                            <div>
                                <h4 className="text-lg font-serif font-bold text-orange-100 group-hover:text-white transition-colors">{user.name}</h4>
                                <p className="text-sm text-slate-500 font-mono group-hover:text-orange-400/60 transition-colors">{user.email} • {user.id.substring(0, 8)}...</p>
                                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide group-hover:text-slate-400">{user.address}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-serif font-bold text-emerald-400 drop-shadow-sm">
                                    ₹{user.wallet_balance?.toFixed(2) || user.walletBalance?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold">Wallet Balance</div>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No residents found in database sector.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
