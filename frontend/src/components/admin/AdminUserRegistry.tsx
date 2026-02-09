import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { FaceEnrollment } from './FaceEnrollment';
import { UserPlus, MapPin, Mail, Lock, Trash2, Fingerprint, Smile, Edit, X, IndianRupee, AlertTriangle, History as HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentOverlay } from '../payments/PaymentOverlay';
import { UserHistoryModal } from './UserHistoryModal';
import { useTranslation } from 'react-i18next';

interface AdminUserRegistryProps {
    onUpdate: () => void;
    users?: any[];
}

export const AdminUserRegistry: React.FC<AdminUserRegistryProps> = ({ onUpdate, users = [] }) => {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [enrollingFaceFor, setEnrollingFaceFor] = useState<string | null>(null);

    // Custom Modal States
    const [addMoneyUser, setAddMoneyUser] = useState<any | null>(null);
    const [depositAmount, setDepositAmount] = useState<number>(1000); // Default: ₹1000
    const [deleteUser, setDeleteUser] = useState<any | null>(null);
    const [historyUser, setHistoryUser] = useState<{ id: string; name: string } | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<any>();

    const onSubmit = async (data: any) => {
        try {
            if (editingUser) {
                await api.updateUser(editingUser.id, {
                    name: data.name,
                    email: data.email,
                    address: data.address,
                    wallet_balance: parseFloat(data.wallet_balance)
                });
                toast.success(t('profileUpdated'));
                setEditingUser(null);
            } else {
                await api.register({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    address: data.address
                });
                toast.success(t('accountCreated'));
                setShowForm(false);
            }
            reset();
            onUpdate();
        } catch (e) {
            toast.error('Operation Failed: ' + e);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('address', user.address);
        setValue('wallet_balance', user.wallet_balance);
        setShowForm(true);
    };

    const handleFaceCapture = async (descriptor: number[]) => {
        if (enrollingFaceFor) {
            try {
                await api.saveBiometrics({
                    userId: enrollingFaceFor,
                    faceDescriptor: descriptor
                });
                onUpdate();
                toast.success(t('bioEnrolled'));
            } catch (e) {
                toast.error('Face Enrollment Failed: ' + e);
            }
            setEnrollingFaceFor(null);
        }
    };

    const handleWebAuthnEnroll = async (_user: any) => {
        toast.info('WebAuthn is simulated in this environment.');
    };

    const handleConfirmAddMoney = async (e: React.FormEvent | null, amountVal?: number) => {
        if (e) e.preventDefault();

        // Use passed amount from PaymentOverlay's customAmount
        let amount = amountVal;
        if (!amount && e) {
            const form = e.target as HTMLFormElement;
            amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
        }

        if (!addMoneyUser || !amount || isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/admin/add-money', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include session cookie
                body: JSON.stringify({ userId: addMoneyUser.id, amount })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(t('moneyAdded'), {
                    description: `New Balance: ₹${data.newBalance}`
                });
                onUpdate();
                // Don't close modal here - let user print receipt first via PaymentOverlay
            } else {
                toast.error(data.error || 'Transaction Failed');
            }
        } catch (e) {
            toast.error('System Error: ' + e);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteUser) return;
        try {
            await api.deleteUser(deleteUser.id);
            onUpdate();
            toast.success(t('accountDeleted'));
            setDeleteUser(null);
        } catch (e) {
            toast.error('Deletion Failed: ' + e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-500">{t('citizenRegistry')}</h3>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        reset();
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg text-white font-bold transition-all shadow-[0_0_15px_rgba(255,165,0,0.2)] border border-orange-400/50"
                >
                    <UserPlus size={20} /> {t('registerCitizen')}
                </button>
            </div>

            {/* Registration/Edit Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="glass-panel border-orange-500/30 p-8 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0b0b2e]/90">
                        <div className="flex justify-between items-center mb-6 border-b border-orange-500/20 pb-4">
                            <h4 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-500">
                                {editingUser ? t('editProfile') : t('newRegistration')}
                            </h4>
                            <button onClick={() => setShowForm(false)} className="text-orange-400/50 hover:text-orange-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase text-orange-400/70 font-bold mb-2 tracking-wider">{t('fullName')}</label>
                                <input {...register("name", { required: true })} className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 text-orange-100 focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600" placeholder={t('placeholderName')} />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-orange-400/70 font-bold mb-2 tracking-wider">{t('emailLoginId')}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3.5 text-orange-500/50 group-hover:text-orange-400" size={16} />
                                    <input {...register("email", { required: true })} className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 pl-10 text-orange-100 focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600" placeholder="user@city.com" />
                                </div>
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-xs uppercase text-orange-400/70 font-bold mb-2 tracking-wider">{t('password')}</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 text-orange-500/50 group-hover:text-orange-400" size={16} />
                                        <input {...register("password", { required: true })} className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 pl-10 text-orange-100 focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600" type="text" placeholder={t('defaultPassword')} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs uppercase text-orange-400/70 font-bold mb-2 tracking-wider">{t('areaAddress')}</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-3.5 text-orange-500/50 group-hover:text-orange-400" size={16} />
                                    <input {...register("address", { required: true })} className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 pl-10 text-orange-100 focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600" placeholder={t('placeholderAddress')} />
                                </div>
                            </div>

                            {editingUser && (
                                <div>
                                    <label className="block text-xs uppercase text-orange-400/70 font-bold mb-2 tracking-wider">{t('walletBalance')}</label>
                                    <input {...register("wallet_balance", { required: true })} type="number" className="w-full bg-black/40 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 font-mono font-bold focus:border-emerald-500 outline-none" />
                                </div>
                            )}

                            <div className="col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-orange-500/20">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-orange-400/60 hover:text-orange-200 font-semibold transition-colors">{t('cancel')}</button>
                                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(255,165,0,0.2)] border border-orange-400/50">
                                    {editingUser ? t('saveChanges') : t('createProfile')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Money Modal (Replaced by PaymentOverlay) */}
            <PaymentOverlay
                isOpen={!!addMoneyUser}
                amount={depositAmount}
                title={t('walletRechargeAdmin')}
                description={`Credit deposit for user: ${addMoneyUser?.name} (${addMoneyUser?.id})`}
                onClose={() => { setAddMoneyUser(null); setDepositAmount(1000); }}
                onSuccess={(_txnId, actualAmount) => handleConfirmAddMoney(null, actualAmount)}
                isAdmin={true}
            />

            {/* Delete Confirmation Modal */}
            {deleteUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="glass-panel border-red-500/50 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-[#1a0505]/90">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse">
                                <AlertTriangle className="text-red-500" size={40} />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-white mb-2">{t('deleteCitizen')}</h4>
                            <p className="text-red-200/60 font-mono text-sm leading-relaxed">
                                {t('deleteConfirmation')} <span className="text-white font-bold decoration-red-500 underline underline-offset-4">{deleteUser.name}</span>?
                                <br />{t('permanentDataLoss')}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setDeleteUser(null)} className="flex-1 py-3 text-red-200 hover:text-white bg-red-900/20 hover:bg-red-900/40 rounded-lg font-semibold border border-transparent hover:border-red-500/30 transition-all">{t('cancel')}</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/50 uppercase tracking-wide">{t('deletePermanently')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* User List Table */}
            <div className="glass-panel border-orange-500/20 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm text-orange-100/80">
                    <thead className="bg-black/60 text-orange-400/60 uppercase font-serif tracking-widest text-[10px]">
                        <tr>
                            <th className="p-4 font-normal">{t('tableHeaderNameId')}</th>
                            <th className="p-4 font-normal">{t('tableHeaderLocation')}</th>
                            <th className="p-4 font-normal">{t('tableHeaderWallet')}</th>
                            <th className="p-4 font-normal">{t('tableHeaderBiometrics')}</th>
                            <th className="p-4 font-normal">{t('tableHeaderHistory')}</th>
                            <th className="p-4 text-right font-normal">{t('tableHeaderActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-500/10">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-orange-500/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-white text-base font-serif group-hover:text-orange-200 transition-colors">{user.name}</div>
                                    <div className="text-[10px] font-mono text-slate-500 group-hover:text-orange-400/50">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-orange-200/70">
                                        <MapPin size={14} /> {user.address}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="font-mono text-emerald-400 font-bold group-hover:text-emerald-300 shadow-emerald-500/10 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all">₹{user.wallet_balance || 0}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEnrollingFaceFor(user.id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all ${user.faceDescriptor ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-orange-400/50 hover:text-orange-300'}`}
                                        >
                                            <Smile size={14} /> {user.faceDescriptor ? t('enrolled') : t('addFace')}
                                        </button>
                                        <button
                                            onClick={() => handleWebAuthnEnroll(user)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all ${user.fingerprintId ? 'bg-sky-900/30 border-sky-500/50 text-sky-400' : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-orange-400/50 hover:text-orange-300'}`}
                                        >
                                            <Fingerprint size={14} /> {user.fingerprintId ? t('enrolled') : t('addFinger')}
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => setHistoryUser({ id: user.id, name: user.name })}
                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-all flex items-center gap-1"
                                        title="View Transaction History"
                                    >
                                        <HistoryIcon size={16} />
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setAddMoneyUser(user)}
                                            className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-600/20 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30"
                                            title="Add Money to Wallet"
                                        >
                                            <IndianRupee size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-orange-400 hover:text-white hover:bg-orange-600/20 rounded-lg transition-colors border border-transparent hover:border-orange-500/30"
                                            title="Edit User"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteUser(user)}
                                            className="p-2 text-red-500 hover:text-red-200 hover:bg-red-600/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {enrollingFaceFor && (
                <FaceEnrollment
                    onCapture={handleFaceCapture}
                    onCancel={() => setEnrollingFaceFor(null)}
                />
            )}

            {/* Transaction History Modal */}
            <UserHistoryModal
                userId={historyUser?.id || null}
                userName={historyUser?.name || null}
                onClose={() => setHistoryUser(null)}
            />
        </div>
    );
};
