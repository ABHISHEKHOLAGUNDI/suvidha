import React from 'react';
import { useTranslation } from 'react-i18next';

export const GovHeader: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLang = () => {
        const next = i18n.language === 'en' ? 'hi' : (i18n.language === 'hi' ? 'kn' : 'en');
        i18n.changeLanguage(next);
    };

    return (
        <div className="w-full">
            {/* Top Black Strip */}
            <div className="bg-[#1b1b1b] text-white px-4 py-1 text-[10px] md:text-xs flex justify-between items-center">
                <div className="flex gap-4">
                    <span>Government of India</span>
                    <span className="opacity-50">|</span>
                    <span>Ministry of Electronics & IT</span>
                </div>
                <div className="flex gap-4">
                    <span>Skip to Main Content</span>
                    <span className="opacity-50">|</span>
                    <span className="cursor-pointer hover:underline" onClick={toggleLang}>
                        {i18n.language === 'en' ? 'A / अ / ಕ' : (i18n.language === 'hi' ? 'अ / A / ಕ' : 'ಕ / A / अ')}
                    </span>
                </div>
            </div>

            {/* Main Header Strip */}
            <div className="bg-white px-6 py-3 flex items-center justify-between shadow-md relative z-20">
                <div className="flex items-center gap-4">
                    {/* Emblem Placeholders - Accessible Text for now */}
                    <div className="text-center">
                        <div className="font-black text-slate-800 text-xs">GOVERNMENT OF INDIA</div>
                        <div className="text-[10px] text-slate-500 font-bold tracking-wider">C-DAC</div>
                    </div>
                </div>

                {/* Digital India / Swachh Bharat Placeholders */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <div className="font-bold text-slate-900 leading-tight">SUVIDHA</div>
                        <div className="text-[10px] text-slate-500 uppercase">Smart Urban Service</div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-[8px] text-slate-400">
                            DI
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-[8px] text-slate-400">
                            SB
                        </div>
                    </div>
                </div>
            </div>

            {/* Tricolor Line */}
            <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        </div>
    );
};
