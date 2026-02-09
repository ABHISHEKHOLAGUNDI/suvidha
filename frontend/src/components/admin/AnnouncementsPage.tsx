import React, { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Megaphone, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const AnnouncementsPage: React.FC = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements`, {
                credentials: 'include'
            });
            const data = await res.json();
            setAnnouncements(data);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        }
    };

    const handlePost = async () => {
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch(`${API_URL}/api/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: message.trim() })
            });

            if (!res.ok) throw new Error('Failed to post');

            setSuccess(true);
            setMessage('');

            // Refresh announcements list
            await fetchAnnouncements();

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                            <Megaphone className="text-purple-400" size={28} />
                        </div>
                        <h1 className="text-4xl font-bold text-white">City Announcements</h1>
                    </div>
                    <p className="text-slate-400 ml-16">
                        Post important updates that all citizens will see and receive via email
                    </p>
                </div>

                {/* Post New Announcement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 mb-8"
                >
                    <h2 className="text-xl font-bold text-white mb-4">Post New Announcement</h2>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Electricity will be restored at 9 PM tonight..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none min-h-[120px] mb-4"
                        maxLength={500}
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">
                            {message.length}/500 characters
                        </span>

                        <button
                            onClick={handlePost}
                            disabled={loading || !message.trim()}
                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Post & Email All Citizens
                                </>
                            )}
                        </button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
                        >
                            <CheckCircle className="text-green-400" size={20} />
                            <span className="text-green-300 font-medium">
                                Announcement posted successfully! Emails are being sent to all citizens.
                            </span>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="text-red-400" size={20} />
                            <span className="text-red-300 font-medium">{error}</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Announcement History */}
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Announcements</h2>

                    {announcements.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No announcements yet</p>
                    ) : (
                        <div className="space-y-3">
                            {announcements.map((ann) => (
                                <div
                                    key={ann.id}
                                    className={`border rounded-lg p-4 ${ann.active
                                        ? 'bg-purple-500/10 border-purple-500/30'
                                        : 'bg-slate-800/30 border-slate-700/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {ann.active && (
                                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                    ACTIVE
                                                </span>
                                            )}
                                            <span className="text-slate-400 text-sm">
                                                by {ann.creator_name || 'Admin'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock size={14} />
                                            {new Date(ann.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-white">{ann.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
