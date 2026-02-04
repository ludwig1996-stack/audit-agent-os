"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Eye, Wifi } from 'lucide-react';

type AgentState = 'IDLE' | 'ANALYZING' | 'MONITORING' | 'ALERT';

export default function RealtimeAgentStatus() {
    const [state, setState] = useState<AgentState>('IDLE');
    const [lastAction, setLastAction] = useState<string>("System initialized.");

    useEffect(() => {
        // Simulate real-time monitoring transitions
        const states: AgentState[] = ['IDLE', 'MONITORING', 'ANALYZING', 'MONITORING'];
        let idx = 0;

        const interval = setInterval(() => {
            const nextState = states[idx % states.length];
            setState(nextState);
            if (nextState === 'MONITORING') setLastAction("Scanning transaction streams...");
            if (nextState === 'ANALYZING') setLastAction("Testing Benford's Law distribution...");
            if (nextState === 'IDLE') setLastAction("Awaiting new evidence...");
            idx++;
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-3 rounded-lg border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${state === 'ANALYZING' ? 'border-terminal-amber bg-terminal-amber/10' :
                            state === 'MONITORING' ? 'border-terminal-green bg-terminal-green/10' :
                                'border-zinc-800 bg-zinc-900'
                        }`}>
                        <ShieldCheck size={20} className={
                            state === 'ANALYZING' ? 'text-terminal-amber animate-pulse' :
                                state === 'MONITORING' ? 'text-terminal-green scale-110' :
                                    'text-zinc-600'
                        } />
                    </div>
                    {state === 'MONITORING' && (
                        <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-terminal-green rounded-full border-2 border-black"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Senior Auditor</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${state === 'ANALYZING' ? 'bg-terminal-amber/20 text-terminal-amber' :
                                state === 'MONITORING' ? 'bg-terminal-green/20 text-terminal-green' :
                                    'bg-zinc-800 text-zinc-500'
                            }`}>
                            {state === 'MONITORING' ? 'LIVE' : state}
                        </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 font-mono truncate max-w-[200px]">
                        {lastAction}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 pr-2">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-600 uppercase font-bold">ISA-240 Mode</span>
                    <span className="text-[10px] text-terminal-amber font-mono">SKEPTICAL</span>
                </div>
                <Wifi size={14} className="text-zinc-700 animate-pulse" />
            </div>
        </div>
    );
}
