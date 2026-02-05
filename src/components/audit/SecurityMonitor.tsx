"use client";

import React from 'react';
import { Shield, Activity, Lock } from 'lucide-react';
import DocumentScanner from './DocumentScanner';
import VoiceAuditor from './VoiceAuditor';
import AMLWatchlistScanner from './AMLWatchlistScanner';
import RealtimeAgentStatus from './RealtimeAgentStatus';
import RiskTrendAnalysis from './RiskTrendAnalysis';

export default function SecurityMonitor() {
    return (
        <aside className="w-[18%] glass-panel flex flex-col p-4 border-r border-[#333] gap-4 overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-terminal-amber font-bold text-sm tracking-tighter shrink-0">
                <Shield size={18} />
                <span>SECURITY MONITOR</span>
            </div>

            <RealtimeAgentStatus />

            <RiskTrendAnalysis />

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-zinc-500 uppercase tracking-widest text-[10px]">
                        <span>Entropy Score</span>
                        <span className="text-terminal-green italic">OPTIMAL</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-terminal-green w-[85%]" />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Activity size={14} className="text-terminal-amber" />
                        <span>ISA-230 Compliance</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Activity size={14} className="text-terminal-amber" />
                        <span>ISA-240 Fraud Detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Activity size={14} className="text-terminal-amber" />
                        <span>ISA-315 Risk Assesment</span>
                    </div>
                </div>
            </div>

            <div className="py-6 border-t border-zinc-800">
                <AMLWatchlistScanner />
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-800 space-y-4">
                <VoiceAuditor />
                <DocumentScanner />
                <div className="flex items-center gap-2 text-zinc-500 px-2">
                    <Lock size={12} />
                    <span className="text-[10px]">SHA-256 INTEGRITY ACTIVE</span>
                </div>
            </div>
        </aside>
    );
}
