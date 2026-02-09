import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AccessibilityContextType {
    highContrast: boolean;
    fontSize: 'normal' | 'large' | 'xlarge';
    toggleHighContrast: () => void;
    setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
    isPanelOpen: boolean;
    togglePanel: () => void;
    setPanelOpen: (isOpen: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>('normal');

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const savedContrast = localStorage.getItem('accessibility_contrast');
        const savedFontSize = localStorage.getItem('accessibility_fontSize');

        if (savedContrast === 'true') setHighContrast(true);
        if (savedFontSize) setFontSizeState(savedFontSize as any);
    }, []);

    useEffect(() => {
        // Apply to document
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        localStorage.setItem('accessibility_contrast', String(highContrast));
    }, [highContrast]);

    useEffect(() => {
        // Apply font size
        document.documentElement.classList.remove('font-normal', 'font-large', 'font-xlarge');
        document.documentElement.classList.add(`font-${fontSize}`);
        localStorage.setItem('accessibility_fontSize', fontSize);
    }, [fontSize]);

    const toggleHighContrast = () => setHighContrast(!highContrast);
    const setFontSize = (size: 'normal' | 'large' | 'xlarge') => setFontSizeState(size);
    const togglePanel = () => setIsPanelOpen(!isPanelOpen);

    return (
        <AccessibilityContext.Provider value={{ highContrast, fontSize, toggleHighContrast, setFontSize, isPanelOpen, togglePanel, setPanelOpen: setIsPanelOpen }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
};
