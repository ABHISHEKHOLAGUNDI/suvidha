import React from 'react';
import { TouchButton } from './TouchButton';
import { Delete, Check } from 'lucide-react';

interface KeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onSubmit?: () => void;
    maxLength?: number;
    currentLength?: number;
}

export const Keypad: React.FC<KeypadProps> = ({
    onKeyPress,
    onDelete,
    onSubmit,
    maxLength,
    currentLength = 0
}) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const handlePress = (key: string) => {
        if (maxLength && currentLength >= maxLength) return;
        onKeyPress(key);
    };

    return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-[400px] mx-auto p-4 bg-slate-100 rounded-2xl shadow-inner">
            {keys.map((key) => (
                <TouchButton
                    key={key}
                    onClick={() => handlePress(key)}
                    variant="ghost"
                    className="bg-white shadow-md text-3xl font-bold text-slate-800 active:bg-blue-100"
                    size="lg"
                >
                    {key}
                </TouchButton>
            ))}
            <TouchButton
                onClick={onDelete}
                variant="warning"
                className="flex items-center justify-center"
                size="lg"
            >
                <Delete size={32} />
            </TouchButton>
            <TouchButton
                onClick={() => handlePress('0')}
                variant="ghost"
                className="bg-white shadow-md text-3xl font-bold text-slate-800 active:bg-blue-100"
                size="lg"
            >
                0
            </TouchButton>
            <TouchButton
                onClick={onSubmit}
                variant="primary"
                className="flex items-center justify-center"
                size="lg"
                disabled={!onSubmit}
            >
                <Check size={32} />
            </TouchButton>
        </div>
    );
};
