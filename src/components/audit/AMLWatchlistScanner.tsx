"use client";

import React, { useState } from 'react';
import { Search, UserCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SANCTIONS = [
    "Global Trading Corp",
    "North Star Mining",
    "Vanguard Shipping",
    "Onyx Energy",
];

export default function AMLWatchlistScanner() {
    const [query, setQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<'CLEAR' | 'MATCH' | null>(null);

    const performScan = () => {
        if (!query) return;
        setIsScanning(true);
        setResult(null);

        // Bloomberg-style scanning animation
        setTimeout(() => {
            setIsScanning(false);
            const matched = MOCK_SANCTIONS.some(s => s.toLowerCase().includes(query.toLowerCase()));
            setResult(matched ? 'MATCH' : 'CLEAR');
        }, 2000);
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Search size={12} />
                    AML Watchlist Scanner
                </label>
                <span className="text-[9px] text-zinc-700 font-mono">SOURCE: OFAC/EU/UN</span>
            </div>

            <div className="flex gap-2">
                <input
                    placeholder="ENTER ENTITY NAME..."
                    className="flex-1 bg-black/40 border border-zinc-800 rounded px-3 py-2 text-xs text-terminal-amber outline-none focus:border-terminal-amber/50 data-mono"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performScan()}
                />
                <button
                    onClick={performScan}
                    disabled={isScanning || !query}
                    className="bg-terminal-amber text-black px-3 py-1 rounded text-[10px] font-bold uppercase transition-all hover:bg-terminal-amber/80 disabled:opacity-50"
                >
                    {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                </button>
            </div>

            <div className="h-24 bg-black/60 rounded border border-zinc-900 overflow-hidden relative flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full text-center space-y-2"
                        >
                            <div className="text-[10px] text-terminal-amber font-mono animate-pulse">CROSS-REFERENCING GLOBAL DATABASES...</div>
                            <div className="w-full h-1 bg-zinc-900 overflow-hidden rounded">
                                <motion.div
                                    className="h-full bg-terminal-amber"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                            </div>
                        </motion.div>
                    ) : result === 'CLEAR' ? (
                        <motion.div
                            key="clear"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <UserCheck size={24} className="text-terminal-green" />
                            <div className="text-xs text-terminal-green font-bold tracking-widest uppercase">ENTITY VERIFIED: NO MATCHES</div>
                        </motion.div>
                    ) : result === 'MATCH' ? (
                        <motion.div
                            key="match"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <ShieldAlert size={24} className="text-red-500" />
                            <div className="text-xs text-red-500 font-bold tracking-widest uppercase animate-bounce">CRITICAL MATCH DETECTED</div>
                        </motion.div>
                    ) : (
                        <div className="text-[10px] text-zinc-700 font-mono uppercase">System Idle. Pending Entity Input.</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
