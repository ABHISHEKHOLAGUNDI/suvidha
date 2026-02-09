import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { api, API_URL } from '../../services/api';
import type { Grievance } from '../../services/db';
import { CheckCircle, XCircle, RefreshCw, Map, BarChart3, Users, Zap, Sliders, Database, UploadCloud, Megaphone } from 'lucide-react';
import { AdminUserRegistry } from './AdminUserRegistry';
import { MapAnalytics } from './MapAnalytics';
import { LiveMetrics } from './LiveMetrics';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type TabType = 'users' | 'map' | 'metrics' | 'grievances' | 'settings' | 'waste';

export const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('map');
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [wasteRequests, setWasteRequests] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});

    // Resolution Modal State
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState<string | null>(null);
    const [resolutionPhoto, setResolutionPhoto] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file (JPG, PNG, etc.)');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image too large. Please upload a file smaller than 5MB');
                e.target.value = ''; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setResolutionPhoto(ev.target.result as string);
                    toast.success('Photo uploaded successfully');
                }
            };
            reader.onerror = () => {
                toast.error('Failed to read file. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResolveConfirm = async () => {
        if (!selectedGrievance || !resolutionPhoto) {
            toast.error('Please upload a photo of the resolution');
            return;
        }

        // Validate file size (limit to 5MB for email attachment)
        if (resolutionPhoto.length > 5 * 1024 * 1024) {
            toast.error('Photo too large. Please upload a smaller file (max 5MB)');
            return;
        }

        const loadingToast = toast.loading('Resolving grievance and sending notification...');

        try {
            await api.resolveGrievance(selectedGrievance, 'Resolved', resolutionPhoto);

            toast.dismiss(loadingToast);
            toast.success('Grievance Resolved Successfully!', {
                duration: 5000,
                description: 'Citizen has been notified via email with proof of resolution',
                closeButton: true,
                position: 'top-center'
            });

            setShowResolveModal(false);
            setResolutionPhoto('');
            setSelectedGrievance(null);
            refreshData();
        } catch (e: any) {
            toast.dismiss(loadingToast);
            console.error('Failed to resolve grievance:', e);
            toast.error('Failed to resolve grievance', {
                description: e.message || 'Please try again or contact support',
                duration: 6000
            });
        }
    };

    const refreshData = async () => {
        try {
            const [realUsers, allGrievances, allWaste] = await Promise.all([
                api.getUsers(),
                api.getAllGrievances(),
                api.getWasteRequests()
            ]);
            setUsers(Array.isArray(realUsers) ? realUsers : []);
            setGrievances(Array.isArray(allGrievances) ? allGrievances : []);
            setWasteRequests(Array.isArray(allWaste) ? allWaste : []);
        } catch (e) {
            console.error("Failed to fetch admin data", e);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings`);
            const data = await res.json();
            setSettings(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        refreshData();
        fetchSettings();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.updateGrievanceStatus(id, status);
            refreshData();
        } catch (e) {
            alert('Failed to update status: ' + e);
        }
    };

    const updateWasteStatus = async (id: string, status: string) => {
        try {
            await api.updateWasteStatus(id, status);
            toast.success(t('pickupStatusUpdated'));
            refreshData();
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const saveSettings = async (newSettings: any) => {
        try {
            await fetch(`${API_URL}/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: newSettings })
            });
            setSettings(newSettings);
            toast.success(t('systemConfigSaved'));
        } catch (e) {
            toast.error('Failed to save settings');
        }
    };

    const handleToggle = (key: string) => {
        const newValue = settings[key] === 'true' ? 'false' : 'true';
        saveSettings({ ...settings, [key]: newValue });
    };

    const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
        { id: 'map', label: t('tabCityOverview'), icon: <Map size={20} /> },
        { id: 'metrics', label: t('tabLiveMetrics'), icon: <BarChart3 size={20} /> },
        { id: 'users', label: t('tabUserRegistry'), icon: <Users size={20} /> },
        { id: 'grievances', label: t('tabGrievances'), icon: <Zap size={20} /> },
        { id: 'waste', label: t('tabWasteManagement'), icon: <UploadCloud size={20} /> },
        { id: 'settings', label: t('tabSystemConfig'), icon: <Sliders size={20} /> },
    ];

    return (
        <AdminLayout>
            <div className="flex flex-col h-full bg-transparent">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 px-6 pt-6 underline-offset-4">
                    <div>
                        <h2 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-200 drop-shadow-md tracking-widest uppercase">
                            {t('adminAppTitle')}
                        </h2>
                        <p className="text-blue-200/60 text-sm font-mono tracking-widest mt-1">
                            {t('godMode')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.href = '/admin/announcements'}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 border border-purple-500/50 rounded-lg transition-all group flex items-center gap-2"
                        >
                            <Megaphone size={18} className="text-white" />
                            <span className="text-white font-bold text-sm">Announcements</span>
                        </button>
                        <button onClick={refreshData} className="p-3 bg-black/40 border border-orange-500/20 rounded-lg hover:border-orange-500 hover:bg-orange-500/10 transition-all group">
                            <RefreshCw size={20} className="text-orange-500 group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-6 mb-6 border-b border-orange-500/20 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-serif font-semibold transition-all relative whitespace-nowrap tracking-wide ${activeTab === tab.id
                                ? 'text-[#f3e5ab]'
                                : 'text-slate-500 hover:text-orange-200'
                                }`}
                        >
                            {/* Icon Color Update */}
                            <span className={activeTab === tab.id ? 'text-orange-400' : 'opacity-50'}>{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-500 shadow-[0_0_10px_orange]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'map' && (
                        <div className="h-full">
                            <MapAnalytics />
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="h-full">
                            <LiveMetrics />
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="p-6 overflow-y-auto h-full">
                            <AdminUserRegistry onUpdate={refreshData} users={users} />
                        </div>
                    )}

                    {activeTab === 'grievances' && (
                        <div className="p-6 overflow-y-auto h-full">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-950 p-4 border-b border-slate-800">
                                    <h3 className="text-xl font-bold text-sky-400">{t('citizenComplaints')}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{grievances.length} {t('totalSubmissions')}</p>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {grievances.map((g) => (
                                        <div key={g.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white">{g.category}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {t('reportedBy')} {g.name} | ID: {g.id}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-4 py-1 rounded-full text-sm font-bold ${g.status === 'Resolved'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                                        : g.status === 'Rejected'
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                                        }`}
                                                >
                                                    {g.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-300 mb-4">{g.description}</p>
                                            {(g.status === 'Pending' || g.status === 'Received' || g.status === 'In Progress') && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGrievance(g.id);
                                                            setShowResolveModal(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle size={18} /> {t('markResolved')}
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(g.id, 'Rejected')}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                                                    >
                                                        <XCircle size={18} /> {t('reject')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {grievances.length === 0 && (
                                        <div className="p-12 text-center text-slate-500">
                                            <p className="text-xl">{t('noGrievances')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resolution Modal */}
                    {showResolveModal && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                            {/* ... existing modal code ... */}
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                                <h3 className="text-xl font-bold text-white mb-4">{t('resolveGrievance')}</h3>
                                {/* ... contents ... */}
                                <p className="text-slate-400 mb-6">{t('uploadProofRes')}</p>

                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {resolutionPhoto ? (
                                            <div className="flex flex-col items-center">
                                                <img src={resolutionPhoto} alt="Preview" className="h-32 rounded-lg mb-2 object-cover" />
                                                <p className="text-emerald-400 text-sm">{t('photoSelected')}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <UploadCloud className="text-slate-500 mb-2" size={32} />
                                                <p className="text-slate-300">{t('tapToUpload')}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 justify-end mt-6">
                                        <button
                                            onClick={() => {
                                                setShowResolveModal(false);
                                                setResolutionPhoto('');
                                            }}
                                            className="px-4 py-2 text-slate-400 hover:text-white"
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            onClick={handleResolveConfirm}
                                            disabled={!resolutionPhoto}
                                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold"
                                        >
                                            {t('confirmEmail')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'waste' && (
                        <div className="p-6 overflow-y-auto h-full">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-amber-400">{t('wastePickupRequests')}</h3>
                                        <p className="text-slate-400 text-sm mt-1">{wasteRequests.length} {t('pendingCollections')}</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {wasteRequests.map((req) => (
                                        <div key={req.id} className="p-6 hover:bg-slate-800/30 transition-colors flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.type === 'E-Waste' ? 'bg-red-500/20 text-red-400' :
                                                        req.type === 'Wet Waste' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {req.type}
                                                    </span>
                                                    <span className="text-slate-500 text-sm">{req.id}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-white mb-1">{req.name}</h4>
                                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                                    <Map size={14} /> {req.address}
                                                </p>
                                                <p className="text-amber-500/80 text-sm mt-2 font-mono">
                                                    SCHEDULED: {req.slot}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`px-4 py-1 rounded-full text-sm font-bold ${req.status === 'Collected' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                                {req.status !== 'Collected' && (
                                                    <button
                                                        onClick={() => updateWasteStatus(req.id, 'Collected')}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} /> {t('markCollected')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {wasteRequests.length === 0 && (
                                        <div className="p-12 text-center text-slate-500">
                                            <p className="text-xl">{t('noSchedulingRequests')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="p-6 overflow-y-auto h-full">
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Database className="text-purple-400" />
                                        <h3 className="text-xl font-bold text-white">{t('frontendFeatureFlags')}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'feature_citizen_score', label: t('featureCitizenScore') },
                                            { key: 'feature_gas_booking', label: t('featureGasBooking') },
                                            { key: 'feature_waste_pickup', label: t('featureWastePickup') },
                                            { key: 'feature_track_status', label: t('featureTrackStatus') }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                                <span className="font-medium text-slate-200">{item.label}</span>
                                                <button
                                                    onClick={() => handleToggle(item.key)}
                                                    className={`w-14 h-7 rounded-full transition-colors relative ${settings[item.key] === 'true' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings[item.key] === 'true' ? 'left-8' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                                        <p>{t('featureNote')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};
