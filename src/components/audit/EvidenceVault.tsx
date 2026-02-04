"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import AccountingVerification from './AccountingVerification';
import WorkpaperExport from './WorkpaperExport';

export default function EvidenceVault() {
    const evidence = [
        { id: 1, type: 'RISK', title: 'Unusual Ledger Balance', client: 'Alpha AB' },
        { id: 2, type: 'AML', title: 'Foreign Entity Payment', client: 'Beta Group' },
        { id: 3, type: 'ENTRY', title: 'Year-end Adjustment', client: 'Gamma SA' },
        { id: 4, type: 'MEMO', title: 'Fixed Asset Review', client: 'Omega Corp' },
    ];

    return (
        <aside className="w-[32%] glass-panel flex flex-col">
            <header className="h-12 flex items-center px-4 border-b border-[#333] justify-between">
                <div className="flex items-center gap-2 text-terminal-green font-bold text-sm tracking-tight">
                    <FileText size={16} />
                    <span>EVIDENCE VAULT</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">COUNT: {evidence.length.toString().padStart(2, '0')}</span>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                <AccountingVerification />
                <WorkpaperExport />

                <div className="space-y-3 pt-2">
                    <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold px-1">Detected Findings</label>
                    {evidence.map(item => (
                        <div key={item.id} className="p-3 bg-white/[0.02] border border-white/5 rounded hover:border-terminal-amber/30 transition-all cursor-pointer space-y-2 group">
                            <div className="flex justify-between items-center">
                                <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${item.type === 'RISK' ? 'bg-red-500/20 text-red-500' :
                                    item.type === 'AML' ? 'bg-terminal-amber/20 text-terminal-amber' :
                                        'bg-terminal-green/20 text-terminal-green'
                                    }`}>
                                    {item.type}
                                </span>
                                <span className="text-zinc-600 text-[9px] font-mono group-hover:text-zinc-400 transition-colors">ID: {item.id}29-X</span>
                            </div>
                            <div className="text-sm text-zinc-300 font-semibold group-hover:text-white transition-colors">{item.title}</div>
                            <div className="text-[10px] text-zinc-500">{item.client}</div>
                        </div>
                    ))}
                </div>
        </aside>
    );
}
