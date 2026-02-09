import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchButton } from '../ui/TouchButton';
import { BiometricMock } from './BiometricMock';
import { EmailLogin } from './EmailLogin';
import { FaceIdLogin } from './FaceIdLogin';
import { Mail, Smile } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: (user?: any) => void;
    onBack: () => void;
}

type AuthMethod = 'email' | 'bio' | 'face';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
    const { t } = useTranslation();
    const [method, setMethod] = useState<AuthMethod>('email');

    const renderMethod = () => {
        switch (method) {
            case 'email':
                return <EmailLogin onSuccess={onLoginSuccess} />;
            case 'bio':
                return <BiometricMock onSuccess={onLoginSuccess} />;
            case 'face':
                return <FaceIdLogin onSuccess={onLoginSuccess} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <TouchButton onClick={onBack} variant="ghost" className="text-orange-200 hover:text-white">
                    ← {t('back')}
                </TouchButton>
                <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-500 drop-shadow-sm tracking-widest">{t('login')}</h2>
                <div className="w-[100px]" /> {/* Spacer */}
            </div>

            <div className="flex-1 flex gap-8">
                {/* Sidebar Selection */}
                <div className="w-1/3 flex flex-col gap-4">
                    <TouchButton
                        variant={method === 'email' ? 'primary' : 'outline'}
                        onClick={() => setMethod('email')}
                        icon={<Mail className={method === 'email' ? 'text-white' : 'text-orange-500'} />}
                        className={`justify-start text-left h-24 text-xl border transition-all ${method === 'email'
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400 text-white shadow-[0_0_15px_rgba(255,165,0,0.3)]'
                            : 'bg-black/40 border-orange-500/30 text-orange-200 hover:bg-orange-500/10'
                            }`}
                    >
                        {t('emailAndPassword')}
                    </TouchButton>
                    <TouchButton
                        variant={method === 'face' ? 'primary' : 'outline'}
                        onClick={() => setMethod('face')}
                        icon={<Smile className={method === 'face' ? 'text-white' : 'text-orange-500'} />}
                        className={`justify-start text-left h-24 text-xl border transition-all ${method === 'face'
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400 text-white shadow-[0_0_15px_rgba(255,165,0,0.3)]'
                            : 'bg-black/40 border-orange-500/30 text-orange-200 hover:bg-orange-500/10'
                            }`}
                    >
                        {t('faceVerification')}
                    </TouchButton>
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-panel rounded-3xl p-8 flex items-center justify-center relative overflow-hidden backdrop-blur-xl bg-[#0b0b2e]/60">
                    <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-300">
                        {renderMethod()}
                    </div>
                </div>
            </div>
        </div>
    );
};
