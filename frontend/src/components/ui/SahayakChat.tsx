import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

// Message Interface
interface Message {
    id: string;
    role: 'bot' | 'user';
    text: string;
    citations?: any[];
}

export const SahayakChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            text: '🙏 Namaste! I am Sahayak AI, your intelligent civic assistant.\n\nI can help you with:\n✅ Checking your bills\n✅ Filing complaints\n✅ Checking complaint status\n✅ Wallet balance\n✅ Payment guidance\n\nJust ask me anything! Try: "Show my pending bills" or "How do I file a complaint?"'
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Call our new AI Chat endpoint
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Send session cookie
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages // Send conversation history
                })
            });

            if (!res.ok) {
                throw new Error('AI service unavailable');
            }

            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: data.answer || "I apologize, but I couldn't process that request right now.",
                citations: data.functionCalled ? [{ function: data.functionCalled }] : undefined
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (e) {
            console.error('AI Chat error:', e);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'bot',
                    text: "I'm having trouble connecting right now. Please make sure:\n\n✅ You're logged in\n✅ Backend server is running\n✅ GEMINI_API_KEY is set in .env\n\nTry asking about your bills or complaints!"
                }]);
            }, 500);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 w-[90vw] max-w-sm h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-amber-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <Bot size={24} className="text-white" />
                                <div>
                                    <h3 className="font-bold leading-none">Sahayak AI</h3>
                                    <span className="text-xs text-orange-100 opacity-80">Smart Civic Assistant</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'bot' ? "bg-orange-500/20 text-orange-400" : "bg-slate-700 text-slate-300")}>
                                        {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={cn("p-3 rounded-2xl text-sm max-w-[80%]", msg.role === 'bot' ? "bg-slate-800/50 text-slate-200 border border-slate-700" : "bg-orange-600 text-white")}>
                                        <p>{msg.text}</p>
                                        {msg.citations && msg.citations.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-white/10">
                                                <p className="text-[10px] uppercase font-bold text-orange-400 mb-1">Citations:</p>
                                                <ul className="space-y-1">
                                                    {msg.citations.map((cite: any, idx: number) => (
                                                        <li key={idx} className="text-xs text-slate-400 italic">
                                                            Section {cite.section} - Electricity Act
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isThinking && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <Bot size={16} className="text-orange-400 animate-pulse" />
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/20 border-t border-white/10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about bills, complaints, services..."
                                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                                />
                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 border border-violet-400/30 hover:shadow-violet-500/20 transition-all font-bold"
            >
                {isOpen ? <ChevronUp className="rotate-180" size={18} /> : <Bot size={20} />}
                <span>{isOpen ? 'Close Sahayak' : 'Ask Sahayak AI'}</span>
            </motion.button>
        </div>
    );
};
