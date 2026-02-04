"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Database } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import AccountingVerification from './AccountingVerification';
import WorkpaperExport from './WorkpaperExport';

// Use env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EvidenceVault() {
    const [evidence, setEvidence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvidence = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_workpapers')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setEvidence(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvidence();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_workpapers' },
                (payload) => {
                    setEvidence((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <aside className="w-[32%] glass-panel flex flex-col">
            <header className="h-12 flex items-center px-4 border-b border-[#333] justify-between">
                <div className="flex items-center gap-2 text-terminal-green font-bold text-sm tracking-tight">
                    <FileText size={16} />
                    <span>EVIDENCE VAULT</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest flex items-center gap-2">
                    {loading && <Loader2 size={10} className="animate-spin" />}
                    COUNT: {evidence.length.toString().padStart(2, '0')}
                </span>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                <AccountingVerification />
                <WorkpaperExport />

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Real-time Findings</label>
                        <button onClick={fetchEvidence} className="text-[8px] text-zinc-700 hover:text-zinc-500 font-mono uppercase">Refresh</button>
                    </div>

                    {loading && evidence.length === 0 ? (
                        <div className="text-center py-8 text-zinc-800 font-mono text-[9px] uppercase animate-pulse">CONNECTING TO SUPABASE CLUSTER...</div>
                    ) : evidence.length === 0 ? (
                        <div className="text-center py-8 text-zinc-800 font-mono text-[9px] uppercase">No vault entries detected.</div>
                    ) : (
                        evidence.map(item => (
                            <div key={item.id} className="p-3 bg-white/[0.02] border border-white/5 rounded hover:border-terminal-amber/30 transition-all cursor-pointer space-y-2 group">
                                <div className="flex justify-between items-center">
                                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${item.type === 'RISK' ? 'bg-red-500/20 text-red-500' :
                                        item.type === 'AML' ? 'bg-terminal-amber/20 text-terminal-amber' :
                                            'bg-terminal-green/20 text-terminal-green'
                                        }`}>
                                        {item.type}
                                    </span>
                                    <span className="text-zinc-600 text-[9px] font-mono group-hover:text-zinc-400 transition-colors uppercase">
                                        {item.integrity_hash ? `HASH: ${item.integrity_hash.substring(0, 8)}` : `ID: ${item.id.substring(0, 4)}`}
                                    </span>
                                </div>
                                <div className="text-sm text-zinc-300 font-semibold group-hover:text-white transition-colors line-clamp-1">{item.title}</div>
                                <div className="text-[10px] text-zinc-500 font-mono italic">
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}
