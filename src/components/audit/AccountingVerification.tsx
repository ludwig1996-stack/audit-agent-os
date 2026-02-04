"use client";

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Calculator, Database, ShieldCheck, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveJournalAction, signOffWorkpaperAction } from '@/app/actions/audit';
import { createClient } from '@/lib/supabase-client';

interface EntryRow {
    id: string;
    account: string;
    description: string;
    debit: number;
    credit: number;
}

interface AccountingVerificationProps {
    selectedItem?: any; // Full paper object
}

export default function AccountingVerification(props: AccountingVerificationProps) {
    const [entries, setEntries] = useState<EntryRow[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSigningOff, setIsSigningOff] = useState(false);
    const supabase = createClient();

    const addRow = () => {
        const newRow: EntryRow = {
            id: Math.random().toString(36).substr(2, 9),
            account: '',
            description: '',
            debit: 0,
            credit: 0,
        };
        setEntries([...entries, newRow]);
    };

    const removeRow = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const updateRow = (id: string, field: keyof EntryRow, value: string | number) => {
        setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    React.useEffect(() => {
        const handleAISuggestion = async (event: any) => {
            console.log("AccountingVerification received ai-journal-suggested event:", event.detail);
            const suggestedEntries = event.detail.entries;

            if (suggestedEntries && Array.isArray(suggestedEntries) && suggestedEntries.length > 0) {
                const formattedEntries = suggestedEntries.map((e: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    account: e.account || '',
                    description: e.description || '',
                    debit: Number(e.debit) || 0,
                    credit: Number(e.credit) || 0,
                }));

                setEntries(formattedEntries);

                const tDebit = formattedEntries.reduce((sum: number, e: any) => sum + e.debit, 0);
                const tCredit = formattedEntries.reduce((sum: number, e: any) => sum + e.credit, 0);

                if (tDebit === tCredit && tDebit > 0) {
                    setTimeout(async () => {
                        const result = await saveJournalAction(formattedEntries, tDebit, tCredit);
                        if (result.success) {
                            console.log("Auto-committed balanced journal entry");
                        }
                    }, 500);
                }
            }
        };

        window.addEventListener('ai-journal-suggested', handleAISuggestion);
        return () => window.removeEventListener('ai-journal-suggested', handleAISuggestion);
    }, []);

    const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    // Hydrate from selected vault item
    React.useEffect(() => {
        if (props.selectedItem?.content_json?.journal_suggestions) {
            const formattedEntries = props.selectedItem.content_json.journal_suggestions.map((e: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                account: e.account || '',
                description: e.description || '',
                debit: Number(e.debit) || 0,
                credit: Number(e.credit) || 0,
            }));
            setEntries(formattedEntries);
        } else if (props.selectedItem?.content_json?.entries) {
            const formattedEntries = props.selectedItem.content_json.entries.map((e: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                account: e.account || '',
                description: e.description || '',
                debit: Number(e.debit) || 0,
                credit: Number(e.credit) || 0,
            }));
            setEntries(formattedEntries);
        } else {
            setEntries([]);
        }
    }, [props.selectedItem]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await saveJournalAction(entries, totalDebit, totalCredit);
        setIsSaving(false);
        if (result.success) {
            alert("Journal entries committed to Evidence Vault!");
        } else {
            alert("Error saving: " + result.error);
        }
    };

    const handleSignOff = async (status: 'APPROVED' | 'DISMISSED') => {
        if (!props.selectedItem?.id) return;
        setIsSigningOff(true);
        const { data: { user } } = await supabase.auth.getUser();
        const result = await signOffWorkpaperAction(props.selectedItem.id, status, user?.email || 'unknown@audit.com');
        setIsSigningOff(false);
        if (result.success) {
            alert(`Audit Observation ${status === 'APPROVED' ? 'Approved' : 'Dismissed'} & Logged.`);
        } else {
            alert("Sign-off error: " + result.error);
        }
    };

    const reviewStatus = props.selectedItem?.content_json?.review_status || 'PENDING';

    return (
        <div className="space-y-6">
            {/* Observation Review Section (Phase 3) */}
            {props.selectedItem && (props.selectedItem.type === 'RISK' || props.selectedItem.type === 'AML') && (
                <div className={`p-4 rounded-lg border flex flex-col gap-3 ${reviewStatus === 'APPROVED' ? 'bg-terminal-green/5 border-terminal-green/20' :
                    reviewStatus === 'DISMISSED' ? 'bg-zinc-900 border-zinc-800 opacity-50' :
                        'bg-terminal-amber/5 border-terminal-amber/20 shadow-[0_0_15px_rgba(255,184,0,0.1)] animate-pulse-slow'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className={reviewStatus === 'APPROVED' ? 'text-terminal-green' : 'text-terminal-amber'} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                Revisions-Observation: {props.selectedItem.type}
                            </span>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${reviewStatus === 'APPROVED' ? 'bg-terminal-green/20 text-terminal-green' :
                            reviewStatus === 'DISMISSED' ? 'bg-zinc-800 text-zinc-500' :
                                'bg-terminal-amber/20 text-terminal-amber'
                            }`}>
                            {reviewStatus}
                        </span>
                    </div>

                    <div className="text-[11px] text-zinc-300 font-mono italic">
                        "{props.selectedItem.content_json?.detail || props.selectedItem.title}"
                    </div>

                    {reviewStatus === 'PENDING' ? (
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => handleSignOff('APPROVED')}
                                disabled={isSigningOff}
                                className="flex-1 py-1.5 bg-terminal-green text-black rounded text-[9px] font-bold hover:bg-green-400 transition-colors uppercase flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={12} /> Approve Finding (ISA 240)
                            </button>
                            <button
                                onClick={() => handleSignOff('DISMISSED')}
                                disabled={isSigningOff}
                                className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 rounded text-[9px] font-bold hover:bg-zinc-700 transition-colors uppercase flex items-center justify-center gap-2"
                            >
                                <XCircle size={12} /> Dismiss Finding
                            </button>
                        </div>
                    ) : (
                        <div className="text-[9px] text-zinc-500 font-mono border-t border-white/5 pt-2 flex justify-between">
                            <span>Signed off by: {props.selectedItem.content_json?.reviewed_by_email}</span>
                            <span>{new Date(props.selectedItem.content_json?.reviewed_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 glass-panel rounded-lg border-white/5 bg-white/[0.01] space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Calculator size={12} />
                        Accounting Verification (ISA 230)
                    </label>
                    <AnimatePresence mode="wait">
                        {isBalanced ? (
                            <motion.span
                                key="balanced"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] text-terminal-green font-bold flex items-center gap-1"
                            >
                                <CheckCircle2 size={10} /> BALANCED
                            </motion.span>
                        ) : (
                            <motion.span
                                key="unbalanced"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] text-red-500 font-bold flex items-center gap-1"
                            >
                                <AlertTriangle size={10} /> UNBALANCED (DIFF: {Math.abs(totalDebit - totalCredit)})
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono">
                                <th className="py-2 px-1">Account</th>
                                <th className="py-2 px-1">Description</th>
                                <th className="py-2 px-1 text-right">Debit</th>
                                <th className="py-2 px-1 text-right">Credit</th>
                                <th className="py-2 px-1 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300 font-mono text-[11px]">
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-600 italic">
                                        Waiting for AI Scan...
                                    </td>
                                </tr>
                            )}
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-1 px-1">
                                        <input
                                            className="w-16 bg-transparent border-none outline-none text-terminal-amber focus:text-white font-mono"
                                            value={entry.account}
                                            onChange={(e) => updateRow(entry.id, 'account', e.target.value)}
                                            placeholder="BAS"
                                        />
                                    </td>
                                    <td className="py-1 px-1">
                                        <input
                                            className="w-full bg-transparent border-none outline-none text-zinc-400 focus:text-white"
                                            value={entry.description}
                                            onChange={(e) => updateRow(entry.id, 'description', e.target.value)}
                                            placeholder="Entry detail..."
                                        />
                                    </td>
                                    <td className="py-1 px-1 text-right">
                                        <input
                                            type="number"
                                            className="w-20 bg-transparent border-none outline-none text-right text-terminal-green font-mono"
                                            value={entry.debit || ''}
                                            onChange={(e) => updateRow(entry.id, 'debit', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="py-1 px-1 text-right">
                                        <input
                                            type="number"
                                            className="w-20 bg-transparent border-none outline-none text-right text-terminal-amber font-mono"
                                            value={entry.credit || ''}
                                            onChange={(e) => updateRow(entry.id, 'credit', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                        <button onClick={() => removeRow(entry.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={addRow}
                    className="w-full py-2 border border-dashed border-zinc-800 text-zinc-600 hover:text-terminal-amber hover:border-terminal-amber/50 transition-all rounded text-[10px] uppercase font-bold flex items-center justify-center gap-2"
                >
                    <Plus size={12} /> Add Entry Row
                </button>

                <div className="flex justify-between pt-2 border-t border-zinc-800 text-[11px] font-bold font-mono items-center">
                    <span className="text-zinc-500">TOTALS:</span>
                    <div className="flex gap-4 items-center">
                        <span className="text-terminal-green">DR: {totalDebit.toLocaleString()}</span>
                        <span className="text-terminal-amber">CR: {totalCredit.toLocaleString()}</span>
                        {isBalanced && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-terminal-green text-black px-2 py-1 rounded text-[9px] hover:bg-green-400 transition-colors flex items-center gap-1 font-bold"
                            >
                                <Database size={10} /> {isSaving ? "SAVING..." : "COMMIT TO VAULT"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
