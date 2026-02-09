import React, { useState } from 'react';
import { Fingerprint, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../hooks/useSound';

interface BiometricMockProps {
    onSuccess: () => void;
}

export const BiometricMock: React.FC<BiometricMockProps> = ({ onSuccess }) => {
    const { t } = useTranslation();
    const { playBeep } = useSound();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

    const triggerWebAuthn = async () => {
        if (status === 'scanning' || status === 'success') return;

        setStatus('scanning');
        playBeep(400);

        try {
            // Fake challenge to trigger browser chrome (Windows Hello / TouchID)
            // Note: This relies on the browser's built-in UI for credentials.
            // Since we don't have a real backend to verify, we just want the UI to appear.
            // navigator.credentials.get() with empty allowCredentials can sometimes trigger it depending on browser config.
            // A more reliable "fake" trigger without backend is hard, but we'll try a generic get.

            const publicKey: PublicKeyCredentialRequestOptions = {
                challenge: new Uint8Array([1, 2, 3, 4]), // Random challenge
                timeout: 60000,
                userVerification: "required", // This triggers the modal
            };

            await navigator.credentials.get({ publicKey });

            // If promise resolves, user passed biometrics
            setStatus('success');
            playBeep(1200, 0.1);
            setTimeout(onSuccess, 1000);

        } catch (error) {
            console.log("WebAuthn cancelled or failed", error);
            // Fallback for demo if hardware missing or user cancels
            // We simulate success anyway for the "Demo Mode" after a short delay if it wasn't a hard error
            setStatus('success'); // AUTO-SUCCESS FOR DEMO if real hardware fails/cancels
            playBeep(1200, 0.1);
            setTimeout(onSuccess, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div
                className={cn(
                    "relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all",
                    status === 'idle' ? "bg-white/10 hover:bg-white/20 ring-4 ring-white/5" : "",
                    status === 'scanning' ? "bg-sky-500/20 ring-4 ring-sky-500/50 scale-105" : "",
                    status === 'success' ? "bg-emerald-500/20 ring-4 ring-emerald-500" : "",
                    status === 'failed' ? "bg-red-500/20 ring-4 ring-red-500" : ""
                )}
                onClick={triggerWebAuthn}
            >
                {status === 'success' ? (
                    <CheckCircle size={64} className="text-emerald-400" />
                ) : status === 'failed' ? (
                    <XCircle size={64} className="text-red-400" />
                ) : (
                    <>
                        <Fingerprint
                            size={64}
                            className={cn(
                                "transition-colors",
                                status === 'scanning' ? "text-sky-400 animate-pulse" : "text-slate-400"
                            )}
                        />
                        {status === 'scanning' && (
                            <div className="absolute inset-0 border-4 border-sky-400 rounded-full animate-[spin_1s_linear_infinite] border-t-transparent" />
                        )}
                    </>
                )}

            </div>
            <p className="mt-6 text-xl font-bold text-slate-200">
                {status === 'idle' && t('scanFinger')}
                {status === 'scanning' && "Verifying Identity..."}
                {status === 'success' && "Verified!"}
            </p>
            {status === 'idle' && <p className="text-sm text-slate-500 mt-2">(Tap icon to activate Sensor)</p>}
        </div>
    );
};
