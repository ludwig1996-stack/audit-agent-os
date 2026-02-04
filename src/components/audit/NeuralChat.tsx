"use client";

import React from 'react';
import { ChevronDown, BadgeCheck, Upload, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterVerification from './MasterVerification';

export default function NeuralChat() {
    return (
        <main className="flex-1 flex flex-col bg-[#050505] relative border-r border-[#333]">
            <header className="h-12 flex items-center px-6 border-b border-[#333] justify-between z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold tracking-tight text-white uppercase">NEURAL REASONING PATH</h1>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-500">GEMINI-3-PRO ACTIVE</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Mock AI Message */}
                <div className="max-w-3xl space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded bg-terminal-amber flex items-center justify-center text-black font-bold shrink-0">A</div>
                        <div className="space-y-3">
                            <div className="text-zinc-300 text-sm leading-relaxed">
                                Analyzing current accounting entries for Swedish BAS-kontoplan compatibility. I detected an unusual debit entry on account 1510 without matching vat-code.
                            </div>

                            <details className="group border border-white/5 bg-white/[0.02] rounded overflow-hidden">
                                <summary className="px-4 py-2 text-[10px] text-zinc-500 cursor-pointer hover:text-white flex items-center justify-between select-none">
                                    <span className="flex items-center gap-2"><ChevronDown size={10} className="group-open:rotate-180 transition-transform" /> VIEW REASONING PATH (8000ms budget)</span>
                                    <span className="text-terminal-amber/50 font-mono italic">THINKING_COMPLETED</span>
                                </summary>
                                <div className="p-4 pt-0 text-[11px] text-zinc-500 font-mono space-y-2 border-t border-white/5 text-xs">
                                    <p> &gt; Extracting ledger context...</p>
                                    <p> &gt; Cross-referencing ISA-315 risk matrix...</p>
                                    <p className="text-terminal-green"> &gt; MATCH: Potential unrecognized revenue risk found.</p>
                                </div>
                            </details>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-terminal-green flex items-center gap-1 font-bold">
                                    <BadgeCheck size={12} /> VERIFIED INTEGRITY
                                </span>
                                <span className="text-[9px] text-zinc-700 font-mono uppercase">hash: d5a8...c8f2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="p-6 pt-0 space-y-4">
                <MasterVerification />
                <div className="glass-panel p-4 rounded-lg flex items-end gap-4 border-white/10">
                    <div className="flex-1 space-y-2">
                        <textarea
                            placeholder="PROMPT AUDIT AGENT..."
                            className="w-full bg-transparent border-none outline-none resize-none text-terminal-amber placeholder:text-zinc-800 text-sm data-mono"
                            rows={2}
                        />
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 border border-white/10 hover:border-terminal-amber hover:text-terminal-amber transition-colors"
                        >
                            <Upload size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-terminal-amber flex items-center justify-center text-black"
                        >
                            <Mic size={16} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </main>
    );
}
