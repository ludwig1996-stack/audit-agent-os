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
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>("");

    const fetchEvidence = async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching evidence from Supabase...");

        try {
            const { data, error: supabaseError } = await supabase
                .from('audit_workpapers')
                .select('*')
                .order('created_at', { ascending: false });

            if (supabaseError) {
                console.error("Supabase fetch error:", supabaseError);
                setError(supabaseError.message);
                setDebugInfo(`Error: ${supabaseError.message}`);
            } else if (data) {
                console.log(`Successfully fetched ${data.length} items`);
                setEvidence(data);
                if (data.length > 0 && !selectedItem) {
                    setSelectedItem(data[0]);
                }
                setDebugInfo(`Fetched ${data.length} items`);
            }
        } catch (err: any) {
            console.error("Vault fetch exception:", err);
            setError(err.message);
            setDebugInfo(`Exception: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
                    setSelectedItem(payload.new); // Auto-select new findings
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
                <AccountingVerification
                    selectedStartData={selectedItem?.content_json?.journal_suggestions}
                />

                {/* Formal Workpaper View */}
                <WorkpaperExport
                    title={selectedItem?.title}
                    type={selectedItem?.type}
                    content={selectedItem?.content_json?.detail}
                    hash={selectedItem?.integrity_hash}
                    fullAnalysis={selectedItem?.content_json?.full_analysis}
                />

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
                        evidence.map(item => {
                            // Calculate balance status on the fly for the list view
                            const entries = item.content_json?.journal_suggestions || [];
                            const dr = entries.reduce((s: number, e: any) => s + (Number(e.debit) || 0), 0);
                            const cr = entries.reduce((s: number, e: any) => s + (Number(e.credit) || 0), 0);
                            const isBalanced = entries.length > 0 && Math.abs(dr - cr) < 0.01;
                            const hasEntries = entries.length > 0;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`p-3 bg-white/[0.02] border rounded transition-all cursor-pointer space-y-2 group ${selectedItem?.id === item.id ? 'border-terminal-amber bg-terminal-amber/5' : 'border-white/5 hover:border-terminal-amber/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${item.type === 'RISK' ? 'bg-red-500/20 text-red-500' :
                                                item.type === 'AML' ? 'bg-terminal-amber/20 text-terminal-amber' :
                                                    'bg-terminal-green/20 text-terminal-green'
                                                }`}>
                                                {item.type}
                                            </span>
                                            {/* The "Red Dot" / Balance Indicator the user requested */}
                                            {hasEntries && !isBalanced && (
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Unbalanced Journal" />
                                            )}
                                        </div>
                                        <span className="text-zinc-600 text-[9px] font-mono group-hover:text-zinc-400 transition-colors uppercase">
                                            {item.integrity_hash ? `HASH: ${item.integrity_hash.substring(0, 8)}` : `ID: ${item.id.substring(0, 4)}`}
                                        </span>
                                    </div>
                                    <div className="text-sm text-zinc-300 font-semibold group-hover:text-white transition-colors line-clamp-1">{item.title}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono italic flex justify-between">
                                        <span>
                                            {new Intl.DateTimeFormat('sv-SE', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            }).format(new Date(item.created_at))}
                                        </span>
                                        {hasEntries && (
                                            <span className={isBalanced ? "text-zinc-600" : "text-red-400 font-bold"}>
                                                {isBalanced ? "BALANCED" : "⚠️ UNBALANCED"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </aside>
    );
}
