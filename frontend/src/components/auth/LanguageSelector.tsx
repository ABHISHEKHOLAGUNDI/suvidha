import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
// import { TouchButton } from '../ui/TouchButton';

interface LanguageSelectorProps {
    onSelect?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
    const { i18n, t } = useTranslation();

    const languages = [
        { code: 'en', label: 'English', script: 'A', native: 'English' },
        { code: 'hi', label: 'Hindi', script: 'अ', native: 'हिंदी' },
        { code: 'kn', label: 'Kannada', script: 'ಕ', native: 'ಕನ್ನಡ' },
    ];

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        if (onSelect) onSelect();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">{t('selectLanguage')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                            "group relative overflow-hidden bg-white border-4 rounded-3xl p-8 hover:border-kiosk-blue transition-all active:scale-95 shadow-xl min-h-[250px] flex flex-col items-center justify-center gap-4",
                            i18n.language === lang.code ? "border-kiosk-blue ring-4 ring-blue-100" : "border-transparent"
                        )}
                    >
                        <div className="text-8xl font-black text-slate-200 group-hover:text-blue-100 transition-colors">
                            {lang.script}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <span className="text-6xl font-black text-kiosk-blue mb-2 drop-shadow-sm">{lang.script}</span>
                            <span className="text-2xl font-bold text-slate-700">{lang.native}</span>
                            <span className="text-lg text-slate-400">{lang.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
