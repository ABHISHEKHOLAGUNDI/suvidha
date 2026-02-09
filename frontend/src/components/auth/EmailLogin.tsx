import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchButton } from '../ui/TouchButton';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface EmailLoginProps {
    onSuccess: (user?: any) => void;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({ onSuccess }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // New API: api.login(email, password) - throws on error
            const res = await api.login(data.email, data.password);

            // Success! User is in session
            onSuccess(res.user);
        } catch (error: any) {
            // Error thrown by API
            setError('root', {
                message: error.message || t('loginFailed')
            });
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <h3 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-500 mb-8 flex items-center gap-3">
                <Mail className="text-orange-500" />
                {t('signIn')}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-orange-400/80 uppercase tracking-wider">{t('emailAddress')}</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50 group-hover:text-orange-400 transition-colors" size={20} />
                        <input
                            {...register("email", { required: t('emailRequired') })}
                            className="w-full pl-12 pr-4 py-4 text-lg bg-black/40 border border-orange-500/30 rounded-xl focus:border-orange-400 focus:shadow-[0_0_15px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600 text-orange-100"
                            placeholder={t('placeholderEmail')}
                            type="email"
                        />
                    </div>
                    {errors.email && <span className="text-red-400 text-sm">{errors.email.message as string}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-orange-400/80 uppercase tracking-wider">{t('password')}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50 group-hover:text-orange-400 transition-colors" size={20} />
                        <input
                            {...register("password", { required: t('passwordRequired') })}
                            className="w-full pl-12 pr-4 py-4 text-lg bg-black/40 border border-orange-500/30 rounded-xl focus:border-orange-400 focus:shadow-[0_0_15px_rgba(255,165,0,0.1)] outline-none transition-all placeholder:text-slate-600 text-orange-100"
                            placeholder={t('placeholderPassword')}
                            type="password"
                        />
                    </div>
                    {errors.password && <span className="text-red-400 text-sm">{errors.password.message as string}</span>}
                </div>

                {errors.root && (
                    <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm font-bold text-center">
                        {errors.root.message}
                    </div>
                )}

                <TouchButton
                    type="submit"
                    variant="primary"
                    size="xl"
                    className="w-full mt-2 bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400 text-white shadow-[0_0_15px_rgba(255,165,0,0.3)] hover:from-orange-500 hover:to-amber-500"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>{t('loginButton')} <ArrowRight /></>}
                </TouchButton>

                <p className="text-center text-slate-500 text-sm mt-4">
                    {t('demoCredentials')}: <br />
                    <span className="font-mono text-orange-300/70">abhishek@city.com</span> / <span className="font-mono text-orange-300/70">password123</span>
                </p>
            </form>
        </div>
    );
};
