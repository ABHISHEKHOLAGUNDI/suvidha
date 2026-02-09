import React, { useState } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { TouchButton } from '../ui/TouchButton';
import { ArrowLeft, Trash2, Calendar, MapPin, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const WastePickupPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [scheduled, setScheduled] = useState(false);

    const handleSchedule = () => {
        if (!selectedType) return;
        setScheduled(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
                <div className="mb-6">
                    <TouchButton onClick={() => navigate('/dashboard')} variant="ghost" size="lg" icon={<ArrowLeft />}>
                        Back to Services
                    </TouchButton>
                </div>

                {!scheduled ? (
                    <div className="glass-panel p-8 rounded-3xl flex-1 border border-white/20 flex flex-col">
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Trash2 className="text-emerald-400" size={32} />
                            Schedule Waste Pickup
                        </h2>
                        <p className="text-slate-400 mb-8">Select waste type for doorstep collection (Swachh Bharat Mission)</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {['Dry Waste', 'Wet Waste', 'E-Waste'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedType === type
                                            ? "bg-emerald-500/20 border-emerald-500 text-white"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="text-2xl font-bold mb-2">{type}</div>
                                    <div className="text-sm opacity-70">
                                        {type === 'E-Waste' ? "Specific disposal for batteries/gadgets" : "Standard household collection"}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8 flex items-center gap-4">
                            <MapPin className="text-amber-400" />
                            <div>
                                <div className="text-sm text-slate-400 uppercase font-bold">Pickup Location</div>
                                <div className="text-xl text-white font-bold">#42, Indiranagar, 2nd Main</div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <TouchButton
                                onClick={handleSchedule}
                                disabled={!selectedType}
                                variant="primary"
                                size="xl"
                                className="w-full"
                                icon={<Calendar />}
                            >
                                Confirm Pickup for Tomorrow
                            </TouchButton>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-12 rounded-3xl flex-1 flex flex-col items-center justify-center text-center border border-emerald-500/30"
                    >
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
                            <Check size={48} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2">Request Confirmed!</h2>
                        <p className="text-xl text-slate-300 max-w-md">
                            A sanitation vehicle has been scheduled for <strong>{selectedType}</strong> pickup.
                        </p>
                        <div className="mt-12 bg-emerald-900/30 px-8 py-4 rounded-xl border border-emerald-500/30">
                            Reference: <span className="font-mono font-bold text-emerald-400">PICK-9922</span>
                        </div>
                        <TouchButton onClick={() => navigate('/dashboard')} variant="outline" className="mt-12">
                            Return Home
                        </TouchButton>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};
