import React, { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { AlertTriangle, Zap, Droplets, X } from 'lucide-react';

interface EmergencyAlertProps {
    userId: string;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ userId }) => {
    const { on, off, isConnected } = useSocket();
    const [powerOutage, setPowerOutage] = useState(false);
    const [waterLeak, setWaterLeak] = useState(false);

    useEffect(() => {
        if (!isConnected) return;

        const handleUserMetrics = (data: any) => {
            // Check for power outage
            if (data.electricity?.status === 'OUTAGE') {
                setPowerOutage(true);
            } else {
                setPowerOutage(false);
            }

            // Check for water leak
            if (data.water?.leakage === true) {
                setWaterLeak(true);
            } else {
                setWaterLeak(false);
            }
        };

        const handleEmergencyAlert = (data: any) => {
            console.log('🚨 Emergency alert received:', data);
            if (data.userId === userId) {
                if (data.type === 'POWER_OUTAGE') {
                    setPowerOutage(true);
                } else if (data.type === 'WATER_LEAK') {
                    setWaterLeak(true);
                } else if (data.type === 'POWER_RESTORED') {
                    setPowerOutage(false);
                }
            }
        };

        on(`user-metrics-${userId}`, handleUserMetrics);
        on('emergency-alert', handleEmergencyAlert);

        return () => {
            off(`user-metrics-${userId}`, handleUserMetrics);
            off('emergency-alert', handleEmergencyAlert);
        };
    }, [isConnected, userId, on, off]);

    return (
        <>
            {/* Power Outage Alert (DISABLED) */}
            {powerOutage && false && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/95 backdrop-blur-sm animate-pulse">
                    <button
                        onClick={() => setPowerOutage(false)}
                        className="absolute top-8 right-8 p-3 bg-red-900/50 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all z-50 border border-white/10"
                    >
                        <X size={40} />
                    </button>

                    <div className="text-center space-y-6 p-12 max-w-2xl relative">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Zap size={120} className="text-red-400 animate-bounce" />
                                <div className="absolute inset-0 bg-red-400 blur-3xl opacity-50 animate-pulse"></div>
                            </div>
                        </div>

                        <h1 className="text-6xl font-black text-red-400 tracking-tight">
                            POWER OUTAGE
                        </h1>

                        <div className="space-y-3">
                            <p className="text-2xl text-red-200 font-bold">
                                ⚡ Your area is experiencing a power cut
                            </p>
                            <p className="text-lg text-red-300">
                                Grid maintenance in progress. Power will be restored shortly.
                            </p>
                        </div>

                        <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-6 space-y-2">
                            <div className="flex items-center justify-center gap-2 text-red-100">
                                <AlertTriangle size={20} />
                                <span className="font-semibold">Safety Tips</span>
                            </div>
                            <ul className="text-sm text-red-200 space-y-1 text-left max-w-md mx-auto">
                                <li>• Unplug sensitive electronics</li>
                                <li>• Keep refrigerator/freezer closed</li>
                                <li>• Use battery-powered lights only</li>
                            </ul>
                        </div>

                        <p className="text-sm text-red-400 animate-pulse font-mono">
                            Estimated restoration: 15-30 minutes
                        </p>
                    </div>
                </div>
            )}

            {/* Water Leak Alert (DISABLED) */}
            {waterLeak && false && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-950/95 backdrop-blur-sm">
                    <button
                        onClick={() => setWaterLeak(false)}
                        className="absolute top-8 right-8 p-3 bg-blue-900/50 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all z-50 border border-white/10"
                    >
                        <X size={40} />
                    </button>

                    <div className="text-center space-y-6 p-12 max-w-2xl relative">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Droplets size={120} className="text-blue-400 animate-bounce" />
                                <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-50 animate-pulse"></div>
                            </div>
                        </div>

                        <h1 className="text-6xl font-black text-blue-400 tracking-tight">
                            WATER LEAK DETECTED
                        </h1>

                        <div className="space-y-3">
                            <p className="text-2xl text-blue-200 font-bold">
                                💧 Unusual water flow detected in your area
                            </p>
                            <p className="text-lg text-blue-300">
                                Repair crew has been dispatched automatically.
                            </p>
                        </div>

                        <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-6">
                            <div className="flex items-center justify-center gap-2 text-blue-100 mb-3">
                                <AlertTriangle size={20} />
                                <span className="font-semibold">Action Required</span>
                            </div>
                            <p className="text-blue-200">
                                Please check your taps and water fixtures. Turn off main valve if leak is inside your property.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 text-blue-300 text-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="font-mono">Repair drone en route...</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
