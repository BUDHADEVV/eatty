'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Lock } from 'lucide-react';

export default function ResetDatabasePage() {
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleReset = async () => {
        if (password !== '1232') {
            setStatus('error');
            setErrorMessage('Incorrect password');
            return;
        }

        // Double confirmation to prevent accidental clicks
        const confirmed = window.confirm(
            'WARNING: This will permanently delete ALL orders and ALL menu items from the database.\n\nAre you absolutely sure you want to proceed?'
        );

        if (!confirmed) return;

        // A secondary confirmation just to be extremely safe, since this is a destructive action
        const confirmedTwice = window.confirm(
            'FINAL WARNING: Once deleted, this data cannot be recovered. Type OK to continue or Cancel to abort.'
        );

        if (!confirmedTwice) return;

        setIsDeleting(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/admin/reset', {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reset database');
            }

            setStatus('success');
            setPassword('');
        } catch (error: any) {
            console.error('Reset error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-neutral-800 rounded-2xl p-8 border border-red-500/20 shadow-2xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Database Reset</h1>
                    <p className="text-neutral-400">
                        This utility will clear all demo data from your application so you can start fresh.
                    </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-400 font-medium">
                        <span className="font-bold block mb-1">DANGER ZONE</span>
                        Clicking the button below will permanently delete:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>All Menu Items</li>
                            <li>All Order History</li>
                        </ul>
                    </p>
                </div>

                {status === 'success' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Database has been successfully cleared! You can now use the app normally.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col gap-2 text-red-400">
                        <p className="text-sm font-medium border-b border-red-500/20 pb-2">Error deleting data:</p>
                        <p className="text-xs">{errorMessage}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Reset Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                            disabled={isDeleting || status === 'success'}
                        />
                    </div>

                    <button
                        onClick={handleReset}
                        disabled={isDeleting || status === 'success' || !password}
                        className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all ${isDeleting || status === 'success' || !password
                            ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50 hover:-translate-y-0.5'
                            }`}
                    >
                        {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                        {isDeleting ? 'Deleting EVERYTHING...' : 'Nuke Database'}
                    </button>
                </div>

                <p className="text-xs text-center text-neutral-500 mt-6 font-mono">
                    Route: /bb
                </p>
            </div>
        </div>
    );
}
