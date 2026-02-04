"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryRow {
    id: string;
    account: string;
    description: string;
    debit: number;
    credit: number;
}

export default function AccountingVerification() {
    const [entries, setEntries] = useState<EntryRow[]>([
        { id: '1', account: '1930', description: 'Bank', debit: 1000, credit: 0 },
        { id: '2', account: '3001', description: 'Sales', debit: 0, credit: 1000 },
    ]);

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

    const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    return (
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
                        {entries.map((entry) => (
                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="py-1 px-1">
                                    <input
                                        className="w-16 bg-transparent border-none outline-none text-terminal-amber focus:text-white"
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
                                        className="w-20 bg-transparent border-none outline-none text-right text-terminal-green"
                                        value={entry.debit || ''}
                                        onChange={(e) => updateRow(entry.id, 'debit', parseFloat(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="py-1 px-1 text-right">
                                    <input
                                        type="number"
                                        className="w-20 bg-transparent border-none outline-none text-right text-terminal-amber"
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

            <div className="flex justify-between pt-2 border-t border-zinc-800 text-[11px] font-bold font-mono">
                <span className="text-zinc-500">TOTALS:</span>
                <div className="flex gap-4">
                    <span className="text-terminal-green">DR: {totalDebit.toLocaleString()}</span>
                    <span className="text-terminal-amber">CR: {totalCredit.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
