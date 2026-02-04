"use client";

import React, { useState } from 'react';
import { CheckSquare, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterVerification({ onVerified }: { onVerified?: () => void }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [complete, setComplete] = useState(false);

    const startVerification = () => {
        setIsVerifying(true);
        setComplete(false);

        // Simulate extensive ISA compliance checks
        setTimeout(() => {
            setIsVerifying(false);
            setComplete(true);
            onVerified?.();
        }, 4000);
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-terminal-amber/20 bg-terminal-amber/[0.02] space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-terminal-amber uppercase tracking-widest font-bold flex items-center gap-2">
                    <ShieldCheck size={12} />
                    Master Verification Check
                </label>
                {complete && (
                    <span className="text-[10px] text-terminal-green font-bold flex items-center gap-1">
                        <CheckSquare size={10} /> READY TO COMMIT
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500">SHA-256 INTEGRITY NODES</span>
                    <span className={complete ? "text-terminal-green" : "text-zinc-700"}>{complete ? "VERIFIED" : "PENDING"}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500">ISA COMPLIANCE AGGREGATION</span>
                    <span className={complete ? "text-terminal-green" : "text-zinc-700"}>{complete ? "100% COMPLETE" : "0%"}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500">DATA SYNC LATENCY</span>
                    <span className={complete ? "text-terminal-green" : "text-zinc-700"}>{complete ? "0.0ms" : "---"}</span>
                </div>
            </div>

            <button
                onClick={startVerification}
                disabled={isVerifying || complete}
                className={`w-full py-4 rounded font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${complete
                        ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30 cursor-default'
                        : 'bg-terminal-amber text-black hover:bg-terminal-amber/80 disabled:opacity-50'
                    }`}
            >
                {isVerifying ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        RUNNING ISA-315 PROTOCOL...
                    </>
                ) : complete ? (
                    <>
                        <CheckSquare size={16} />
                        AUDIT REPORT READY
                    </>
                ) : (
                    <>
                        <Lock size={16} />
                        MASTER VERIFICATION
                    </>
                )}
            </button>

            <AnimatePresence>
                {isVerifying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[9px] text-zinc-500 font-mono italic text-center animate-pulse"
                    >
                        "Cross-referencing all entities against the EVIDENCE VAULT..."
                    </motion.div>
                )}
            </AnimatePresence>

            {!complete && !isVerifying && (
                <div className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded text-zinc-500 italic text-[9px]">
                    <AlertCircle size={10} />
                    <span>Must pass Master Verification before committing to Audit Report.</span>
                </div>
            )}
        </div>
    );
}
