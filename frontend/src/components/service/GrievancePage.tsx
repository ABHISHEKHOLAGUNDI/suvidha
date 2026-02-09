import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { TouchButton } from '../ui/TouchButton';
import { ThermalReceipt } from './ThermalReceipt';
import { DigiLockerModal } from './DigiLockerModal';
import { cn } from '../../lib/utils';
import { ArrowLeft, UploadCloud, FileText, CheckCircle, Database, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface FormData {
    name: string;
    category: string;
    description: string;
}

export const GrievancePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
    const [file, setFile] = useState<File | null>(null);
    const [receiptData, setReceiptData] = useState<{ ticketId: string, name: string, category: string } | null>(null);
    const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: { 'image/*': [], 'application/pdf': [] }
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await api.addGrievance({
                name: data.name,
                category: data.category,
                description: data.description
            });

            if (res.id) {
                setReceiptData({
                    ticketId: res.id,
                    name: data.name,
                    category: data.category
                });
            } else {
                alert('Submission failed: ' + (res.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    const handleDigiLockerSuccess = (fileName: string) => {
        const fakeFile = new File(["fake content"], fileName, { type: "application/pdf" });
        setFile(fakeFile);
        setValue("name", "Abhishek Holagundi");
    };

    const categories = [
        { val: 'Road', label: t('road'), icon: '🛣️' },
        { val: 'Water', label: t('waterSupply'), icon: '💧' },
        { val: 'Electricity', label: t('electricityLights'), icon: '⚡' },
        { val: 'Sanitation', label: t('garbageSewer'), icon: '🗑️' },
        { val: 'Police', label: t('policeSafety'), icon: '🚓' },
        { val: 'Other', label: t('otherIssue'), icon: '📝' }
    ];

    return (
        <DashboardLayout>
            <AnimatePresence>
                {receiptData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
                        <ThermalReceipt
                            ticketId={receiptData.ticketId}
                            name={receiptData.name}
                            category={receiptData.category}
                            onClose={() => {
                                setReceiptData(null);
                                navigate('/status');
                            }}
                        />
                    </motion.div>
                )}

                {isDigiLockerOpen && (
                    <DigiLockerModal
                        onSuccess={handleDigiLockerSuccess}
                        onClose={() => setIsDigiLockerOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col h-full max-w-7xl mx-auto w-full p-6">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TouchButton onClick={() => navigate('/dashboard')} variant="ghost" size="default" icon={<ArrowLeft />}>
                                {t('back')}
                            </TouchButton>
                            <h1 className="text-4xl font-black text-white flex items-center gap-3">
                                <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                                    <FileText size={32} className="text-rose-400" />
                                </div>
                                {t('reportResolve')}
                            </h1>
                        </div>
                        <p className="text-slate-400 text-lg ml-24">{t('fileComplaints')}</p>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    {/* Left Column: Form */}
                    <div className="lg:w-1/2 bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col h-full">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-6">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('reporterName')}</label>
                                    <input
                                        {...register("name", { required: true })}
                                        className="w-full p-4 text-lg border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/20 focus:border-rose-500 focus:bg-black/40 outline-none transition-all"
                                        placeholder={t('reporterName')}
                                        autoComplete="off"
                                    />
                                    {errors.name && <span className="text-red-400 text-xs font-bold">Name required</span>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('issueLocation')}</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            defaultValue={t('detecting')}
                                            readOnly
                                            className="w-full p-4 text-lg border border-white/10 rounded-xl bg-black/20 text-emerald-400 font-mono outline-none"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-pulse bg-emerald-500 h-2 w-2 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('issueCategory')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((cat) => (
                                        <label key={cat.val} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value={cat.val}
                                                {...register("category", { required: true })}
                                                className="peer sr-only"
                                            />
                                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 peer-checked:bg-rose-500/20 peer-checked:border-rose-500 peer-checked:text-rose-300 transition-all flex items-center gap-3">
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="font-bold text-white/80 peer-checked:text-white">{cat.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.category && <span className="text-red-400 text-xs font-bold">Category required</span>}
                            </div>

                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('description')}</label>
                                <textarea
                                    {...register("description", { required: true })}
                                    className="w-full h-full p-4 text-lg border border-white/10 rounded-xl bg-black/20 text-white placeholder-white/20 focus:border-rose-500 focus:bg-black/40 resize-none outline-none transition-all"
                                    placeholder={t('description')}
                                />
                                {errors.description && <span className="text-red-400 text-xs font-bold">Description required</span>}
                            </div>

                            <TouchButton type="submit" variant="primary" size="xl" className="w-full mt-4 bg-gradient-to-r from-rose-600 to-orange-600 border-none" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="animate-spin mr-2" /> {t('submitting')}</>
                                ) : (
                                    <>{t('submitReport')} <ArrowLeft className="rotate-180 ml-2" /></>
                                )}
                            </TouchButton>
                        </form>
                    </div>

                    {/* Right Column: Evidence Upload */}
                    <div className="lg:w-1/2 flex flex-col gap-6">

                        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl flex items-center justify-between">
                            <div>
                                <h3 className="text-blue-200 font-bold text-lg">{t('autoVerification')}</h3>
                                <p className="text-blue-300/60 text-sm">{t('autoVerificationSub')}</p>
                            </div>
                            <Database className="text-blue-400 opacity-50" size={32} />
                        </div>

                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex-1 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer text-center p-8 relative overflow-hidden group",
                                isDragActive ? "border-rose-400 bg-rose-500/10 scale-[0.99]" : "border-white/10 bg-black/20 hover:bg-black/30 hover:border-white/20",
                                file ? "border-emerald-500 bg-emerald-900/10" : ""
                            )}
                        >
                            <input {...getInputProps()} />

                            {file ? (
                                <div className="animate-in zoom-in duration-300 relative z-10">
                                    <div className="bg-emerald-500/20 p-6 rounded-full inline-block mb-6 backdrop-blur-sm">
                                        <CheckCircle size={60} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2">{t('evidenceAttached')}</h3>
                                    <div className="bg-black/40 px-4 py-2 rounded-lg inline-block border border-white/10 text-emerald-300 font-mono text-sm max-w-[300px] truncate">
                                        {file.name}
                                    </div>
                                    <p className="text-slate-400 mt-6 text-sm font-bold uppercase tracking-widest">{t('tapToReplace')}</p>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <div className="w-32 h-32 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 border border-rose-500/20">
                                        <UploadCloud size={60} className={cn("transition-colors", isDragActive ? "text-rose-400" : "text-rose-300/70")} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4">
                                        {isDragActive ? t('dropProof') : t('uploadProof')}
                                    </h3>
                                    <p className="text-xl text-slate-400 max-w-sm mx-auto leading-relaxed">
                                        {t('tapToPhoto')}
                                    </p>
                                    <div className="mt-8 flex gap-3 justify-center">
                                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs text-slate-500 uppercase font-bold">JPG</span>
                                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs text-slate-500 uppercase font-bold">PNG</span>
                                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs text-slate-500 uppercase font-bold">MP4</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
