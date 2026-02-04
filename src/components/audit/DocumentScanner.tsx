"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processDocumentAction } from '@/app/actions/audit';

export default function DocumentScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("CLIENT: handleFileChange triggered");
        const file = e.target.files?.[0];
        if (!file) {
            console.log("CLIENT: No file selected");
            return;
        }

        console.log("CLIENT: File selected:", file.name);
        setIsScanning(true);
        setScanComplete(false);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await processDocumentAction(formData);
            if (result.success) {
                setScanComplete(true);
                if (result.journalSuggestions) {
                    console.log("DocumentScanner: Dispatching ai-journal-suggested:", result.journalSuggestions);
                    window.dispatchEvent(new CustomEvent('ai-journal-suggested', {
                        detail: { entries: result.journalSuggestions }
                    }));
                } else {
                    console.warn("DocumentScanner: No journal suggestions found in result");
                    // Dispatch empty event to at least notify user "scan done" or handle in UI
                    window.dispatchEvent(new CustomEvent('ai-journal-suggested', {
                        detail: { entries: [] }
                    }));
                    alert("Analysis complete, but no specific journal entries were generated.");
                }
            } else {
                setError(result.error || "Failed to process document");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4 relative overflow-hidden">
            {/* Hidden Input for Clean UI */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
            />

            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={12} />
                    Real-time Audit Scanner
                </label>
                {scanComplete && (
                    <span className="text-[10px] text-terminal-green font-bold flex items-center gap-1 animate-pulse">
                        <CheckCircle2 size={10} /> ANALYSIS SYNCED
                    </span>
                )}
            </div>

            <div
                className={`h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-all cursor-pointer relative ${isScanning ? 'border-terminal-amber/50 bg-terminal-amber/5' : 'border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02]'
                    }`}
                onClick={!isScanning ? triggerUpload : undefined}
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
                            <div className="text-[10px] text-terminal-amber font-mono animate-pulse">AI MULTIMODAL ANALYSIS...</div>

                            {/* Scan Line effect */}
                            <motion.div
                                className="absolute inset-x-0 h-[2px] bg-terminal-amber/30 z-20 shadow-[0_0_15px_rgba(255,184,0,0.5)]"
                                animate={{ top: ['100%', '0%', '100%'] }}
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
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter text-center px-4">
                                Select Audit Evidence<br />to Scan & Vault
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] text-white font-bold bg-red-500/90 p-3 rounded shadow-lg border border-red-400/50 flex flex-col gap-1 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-white" />
                            <span>SYSTEM ERROR</span>
                        </div>
                        <span className="font-mono text-[9px] opacity-90">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
                <div className="text-[10px] text-zinc-600 font-mono">PDF/PNG/JPG Support</div>
                <div className="text-[10px] text-terminal-amber font-bold text-right italic">Powered by Gemini 2.5</div>
            </div>
        </div>
    );
}
