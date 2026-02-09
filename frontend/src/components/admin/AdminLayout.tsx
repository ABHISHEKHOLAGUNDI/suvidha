import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TouchButton } from '../ui/TouchButton';
import { LogOut, ShieldCheck } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

import { api } from '../../services/api';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.logout();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/auth');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-mono">
            {/* Admin Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-wider">SUVIDHA Admin</h1>
                        <p className="text-xs text-slate-500">Authorized Personnel Only</p>
                    </div>
                </div>
                <TouchButton variant="ghost" size="default" onClick={handleLogout} icon={<LogOut size={16} />}>
                    Exit
                </TouchButton>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};
