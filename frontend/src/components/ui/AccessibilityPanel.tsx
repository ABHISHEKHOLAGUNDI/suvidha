import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Type, Contrast } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const AccessibilityPanel: React.FC = () => {
    // const [isOpen, setIsOpen] = useState(false); // Removed local state
    const { highContrast, fontSize, toggleHighContrast, setFontSize, isPanelOpen, setPanelOpen } = useAccessibility();

    return (
        <AnimatePresence>
            {isPanelOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4" // Increased Z-index
                    onClick={() => setPanelOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Settings size={24} className="text-purple-400" />
                                Accessibility
                            </h3>
                            <button
                                onClick={() => setPanelOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* High Contrast Toggle */}
                        <div className="mb-6">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors">
                                    <Contrast size={20} className="text-cyan-400" />
                                    <span className="font-semibold">High Contrast Mode</span>
                                </span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={highContrast}
                                        onChange={toggleHighContrast}
                                        className="sr-only"
                                    />
                                    <div className={`w-14 h-7 rounded-full transition-colors ${highContrast ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${highContrast ? 'translate-x-8' : 'translate-x-1'} mt-1`} />
                                    </div>
                                </div>
                            </label>
                            <p className="text-xs text-slate-500 mt-2 ml-8">Increases color contrast for better visibility</p>
                        </div>

                        {/* Font Size Selector */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Type size={20} className="text-amber-400" />
                                <span className="font-semibold text-slate-300">Text Size</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        className={`py-3 px-4 rounded-lg font-bold transition-all ${fontSize === size
                                            ? 'bg-amber-500 text-white shadow-lg'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Current: <span className="font-bold">{fontSize === 'normal' ? 'Standard' : fontSize === 'large' ? 'Large' : 'Extra Large'}</span>
                            </p>
                        </div>

                        {/* Screen Reader Info */}
                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <p className="text-xs text-blue-300">
                                <strong>Screen Reader:</strong> This interface is optimized for screen readers with ARIA labels.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
