"use client";

import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const handleUpload = () => {
        setIsScanning(true);
        setScanComplete(false);

        // Simulate OCR Scan
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
        }, 3000);
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={12} />
                    Document Scanner
                </label>
                {scanComplete && (
                    <span className="text-[10px] text-terminal-green font-bold flex items-center gap-1 animate-pulse">
                        <CheckCircle2 size={10} /> ANALYSIS READY
                    </span>
                )}
            </div>

            <div
                className={`h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-all cursor-pointer ${isScanning ? 'border-terminal-amber/50 bg-terminal-amber/5' : 'border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02]'
                    }`}
                onClick={!isScanning ? handleUpload : undefined}
            >
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <Loader2 className="animate-spin text-terminal-amber" size={24} />
                            <div className="text-[10px] text-terminal-amber font-mono animate-pulse">PERFORMING OCR SCAN...</div>

                            {/* Scan Line effect */}
                            <motion.div
                                className="absolute inset-x-0 h-[2px] bg-terminal-amber/30 z-20 shadow-[0_0_15px_rgba(255,184,0,0.5)]"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <FileText className="text-zinc-700" size={32} />
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Drop Audit Evidence or Click to Upload</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="text-[9px] text-zinc-600 font-mono">Format: PDF/PNG/JPG</div>
                <div className="text-[9px] text-zinc-600 font-mono text-right italic">Max: 20MB</div>
            </div>
        </div>
    );
}
