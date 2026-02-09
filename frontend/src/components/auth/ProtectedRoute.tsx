import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await api.getCurrentUser();
                setUser(currentUser);
            } catch (e) {
                console.error('Auth check failed', e);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900 border-slate-700">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold animate-pulse">Establishing Secure Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Not logged in (Redirect to AuthenticationFlow at /auth)
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        // Not an admin - Force Logout or show unauthorized
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                <h1 className="text-4xl font-black text-red-500 mb-4">ACCESS DENIED</h1>
                <p className="text-xl text-slate-300 mb-8">You do not have clearance for the Admin Terminal.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-6 py-3 bg-slate-700 rounded-lg font-bold hover:bg-slate-600 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={async () => {
                            await api.logout();
                            window.location.href = '/';
                        }}
                        className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-500 transition-colors"
                    >
                        Login as Admin
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
