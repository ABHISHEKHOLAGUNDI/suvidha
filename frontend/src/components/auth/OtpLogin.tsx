import React, { useState } from 'react';
import { Keypad } from '../ui/Keypad';
import { useTranslation } from 'react-i18next';

interface OtpLoginProps {
    onSuccess: () => void;
}

export const OtpLogin: React.FC<OtpLoginProps> = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [pin, setPin] = useState('');

    const handleKeyPress = (key: string) => {
        if (pin.length < 6) setPin(prev => prev + key);
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (pin.length === 6) onSuccess();
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-600 mb-4 text-center">{t('enterPin')}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-slate-200 mb-6 flex justify-center gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-kiosk-blue' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
            <Keypad
                onKeyPress={handleKeyPress}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                currentLength={pin.length}
                maxLength={6}
            />
        </div>
    );
};
