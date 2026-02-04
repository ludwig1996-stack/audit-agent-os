"use client";

import React, { useState } from 'react';
import { Shield, ChevronRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { initializeUserAction } from '@/app/actions/audit';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error, data } = isSignUp
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            if (isSignUp && data.user) {
                await initializeUserAction();
            }
            // Redirect or refresh state - will be handled by Parent
            window.location.reload();
        }
    };

    return (
        <div className="w-full max-w-md p-8 glass-panel rounded-lg border-white/10 space-y-8 relative overflow-hidden backdrop-blur-3xl">
            {/* Decorative scan line */}
            <motion.div
                className="absolute top-0 left-0 w-full h-[1px] bg-terminal-amber/30 z-0"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-12 h-12 rounded bg-terminal-amber/10 border border-terminal-amber/30 flex items-center justify-center text-terminal-amber">
                    <Shield size={32} />
                </div>
                <h1 className="text-xl font-bold tracking-tighter text-white uppercase italic">AUDIT AGENT <span className="text-terminal-amber">OS</span></h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Secured Terminal Access</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Email Identifier</label>
                    <input
                        type="email"
                        required
                        placeholder="NAME@AUDIT.FIRM"
                        className="w-full bg-black/50 border border-zinc-800 rounded px-4 py-3 text-sm text-terminal-amber outline-none focus:border-terminal-amber/50 placeholder:text-zinc-800 font-mono"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Encrypted Payload</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••••••"
                            className="w-full bg-black/50 border border-zinc-800 rounded px-4 py-3 text-sm text-terminal-amber outline-none focus:border-terminal-amber/50 placeholder:text-zinc-800 font-mono"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-zinc-700 hover:text-zinc-500"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-terminal-amber hover:bg-amber-400 text-black font-bold py-4 rounded transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,184,0,0.1)]"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : (
                        <>
                            {isSignUp ? "INITIALIZE AGENT" : "ACCESS TERMINAL"}
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 p-3 rounded flex items-center gap-3"
                        >
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <div className="text-[10px] text-red-200 font-mono uppercase leading-tight">{error}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="pt-4 border-t border-zinc-900 text-center relative z-10">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[10px] text-zinc-600 hover:text-terminal-amber uppercase font-mono tracking-widest transition-colors"
                >
                    {isSignUp ? "ALREADY COMMISSIONED? SIGN IN" : "NO AGENT PROFILE? INITIALIZE"}
                </button>
            </div>

            <div className="absolute bottom-4 left-0 w-full text-center">
                <span className="text-[8px] text-zinc-800 font-mono uppercase tracking-[0.3em]">ISA-230 Integrity Protocol v2.5.0</span>
            </div>
        </div>
    );
}
