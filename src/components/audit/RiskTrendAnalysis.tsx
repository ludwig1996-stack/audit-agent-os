"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function RiskTrendAnalysis() {
    // Simulated data for the trend chart
    const dataPoints = [20, 35, 15, 60, 45, 80, 55];

    return (
        <div className="glass-panel p-4 rounded-lg border-white/5 bg-white/[0.01] space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Activity size={12} className="text-terminal-amber" />
                    Predictive Risk Trends
                </label>
                <div className="flex gap-2 text-[10px] items-center">
                    <span className="text-zinc-600 font-mono">CUMULATIVE ERROR:</span>
                    <span className="text-red-400 font-bold">142,500 SEK</span>
                </div>
            </div>

            <div className="h-24 flex items-end gap-1 px-1">
                {dataPoints.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className={`flex-1 rounded-t-sm transition-colors ${val > 70 ? 'bg-red-500/60' : val > 40 ? 'bg-terminal-amber/40' : 'bg-zinc-800'
                            }`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-white/5 rounded bg-white/[0.02] space-y-1">
                    <div className="text-[8px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                        <TrendingUp size={8} /> Momentum
                    </div>
                    <div className="text-xs font-bold text-terminal-green">+12%</div>
                </div>
                <div className="p-2 border border-white/5 rounded bg-white/[0.02] space-y-1">
                    <div className="text-[8px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                        <AlertTriangle size={8} /> Anomalies
                    </div>
                    <div className="text-xs font-bold text-red-500">03</div>
                </div>
                <div className="p-2 border border-white/5 rounded bg-white/[0.02] space-y-1">
                    <div className="text-[8px] text-zinc-600 font-bold uppercase">Confidence</div>
                    <div className="text-xs font-bold text-zinc-400">94.2%</div>
                </div>
            </div>

            <div className="text-[9px] text-zinc-700 italic font-mono text-center">
                AI detects anomaly cluster in accounts payable (2440).
            </div>
        </div>
    );
}
