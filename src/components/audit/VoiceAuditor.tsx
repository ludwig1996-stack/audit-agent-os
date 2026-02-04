"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Radio, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiLiveService } from '@/lib/gemini-live';

export default function VoiceAuditor() {
    const [isActive, setIsActive] = useState(false);
    const [lastFinding, setLastFinding] = useState<string | null>(null);

    const toggleSession = async () => {
        if (isActive) {
            setIsActive(false);
            setLastFinding(null);
        } else {
            setIsActive(true);
            // In a real app, we'd pass the actual API key from env
            const service = new GeminiLiveService("DEMO_KEY", (event) => {
                if (event.type === 'finding') {
                    setLastFinding(event.data.detail);
                }
            });
            await service.start();
        }
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Mic size={12} className={isActive ? 'text-red-500' : ''} />
                    Gemini Live Audit
                </label>
                {isActive && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                    />
                )}
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSession}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${isActive
                            ? 'bg-red-500/10 border-red-500 text-red-500 shadow-red-500/20'
                            : 'bg-terminal-amber/10 border-terminal-amber text-terminal-amber shadow-terminal-amber/20'
                        }`}
                >
                    {isActive ? <MicOff size={28} /> : <Mic size={28} />}
                </motion.button>

                <div className="text-center space-y-1">
                    <div className={`text-[11px] font-bold ${isActive ? 'text-red-500' : 'text-zinc-500'}`}>
                        {isActive ? 'LIVE MONITORING ACTIVE' : 'VOICE ENGINE READY'}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono">
                        GEMINI-2.5-FLASH-NATIVE-AUDIO
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {lastFinding && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/20 p-2 rounded flex items-start gap-2"
                    >
                        <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                        <div className="text-[9px] text-red-200 leading-tight italic">
                            Auto-flagged: {lastFinding}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
