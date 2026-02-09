import React, { useEffect } from 'react';
import { QrCode, Scan } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QrMockProps {
    onSuccess: () => void;
}

export const QrMock: React.FC<QrMockProps> = ({ onSuccess }) => {
    const { t } = useTranslation();

    // Simulate a scan after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onSuccess();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onSuccess]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
            <div className="w-64 h-64 border-4 border-kiosk-amber rounded-3xl relative flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <QrCode size={120} className="text-white/20" />
                <Scan size={48} className="absolute text-kiosk-amber animate-bounce" />
                <div className="absolute inset-0 border-t-4 border-red-500 animate-[scan_2s_ease-in-out_infinite] opacity-50" />
            </div>
            <p className="mt-6 text-xl font-bold text-white tracking-wider animate-pulse">
                {t('scanQr')}...
            </p>
        </div>
    );
};
