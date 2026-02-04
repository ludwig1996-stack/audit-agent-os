"use client";

import React from 'react';
import { FileDown, Printer, ShieldCheck, BadgeCheck } from 'lucide-react';

interface WorkpaperProps {
    title?: string;
    client?: string;
    type?: string;
    content?: string;
    hash?: string;
    fullAnalysis?: string;
}

export default function WorkpaperExport({
    title = "Risk Assessment Memo",
    client = "Alpha Global AB",
    type = "RISK",
    content = "Analysis of internal controls reveals potential weaknesses in revenue recognition processes. Recommended action: detailed ledger review.",
    hash = "sha256:d5a8c8f2b7e1f4d9a3b0c2e...",
    fullAnalysis
}: WorkpaperProps) {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                    <FileDown size={12} />
                    Formal Workpaper Export
                </label>
                <button
                    onClick={handlePrint}
                    className="text-terminal-amber hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                    <Printer size={12} /> PRINT / SAVE
                </button>
            </div>

            <div className="bg-white text-black p-6 rounded shadow-inner max-h-[400px] overflow-y-auto text-[11px] font-serif border-[12px] border-zinc-200">
                {/* Printable Area Header */}
                <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold uppercase tracking-tighter">OFFICIAL AUDIT WORKPAPER</h2>
                        <div className="flex gap-4 font-mono text-[9px] uppercase font-bold bg-zinc-100 px-2 py-1">
                            <span>Client: {client}</span>
                            <span>Project ID: AA-2026-X</span>
                        </div>
                    </div>
                    <ShieldCheck size={32} className="text-zinc-300" />
                </div>

                {/* Info Box */}
                <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-[10px]">
                    <div className="bg-zinc-50 p-2 border border-zinc-100">
                        <div className="text-zinc-400 uppercase tracking-widest text-[8px] mb-1">Document Type</div>
                        <div className="font-bold">{type} Compliance Document</div>
                    </div>
                    <div className="bg-zinc-50 p-2 border border-zinc-100">
                        <div className="text-zinc-400 uppercase tracking-widest text-[8px] mb-1">Status</div>
                        <div className="font-bold text-terminal-green">VERIFIED</div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold underline decoration-1 underline-offset-4 uppercase">{title}</h3>
                    <div className="leading-relaxed whitespace-pre-wrap">
                        {content || "No detailed finding description provided by AI."}
                    </div>

                    {/* Collapsible Full Analysis for deep dive */}
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <details className="text-zinc-400">
                            <summary className="cursor-pointer hover:text-black transition-colors text-[9px] uppercase font-bold">Show Raw AI Reasoning</summary>
                            <p className="mt-2 text-[10px] bg-zinc-50 p-2 rounded border border-zinc-100 font-mono text-zinc-600">
                                {fullAnalysis || (hash.includes('DEMO') ? 'No raw data for demo paper.' : 'Raw OCR & ISA-315 reasoning data validated.')}
                            </p>
                        </details>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-100 italic">
                        "ISA 230 requires that the auditor prepare audit documentation that is sufficient to enable an experienced auditor, having no previous connection with the audit, to understand the nature, timing, and extent of the audit procedures performed, the evidence obtained, and the conclusions reached."
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-zinc-200 space-y-4 font-mono text-[9px]">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-terminal-green font-bold">
                                <BadgeCheck size={10} /> ISA COMPLIANCE CERTIFIED
                            </div>
                            <div className="text-zinc-400 uppercase">Integrity Hash: {hash}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] text-zinc-400 uppercase">Timestamp</div>
                            <div>{new Date().toISOString()}</div>
                        </div>
                    </div>
                    <div className="flex gap-12 pt-4">
                        <div className="border-t border-black w-24 pt-1">Auditor Signature</div>
                        <div className="border-t border-black w-24 pt-1">Supervisor Sign-off</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
