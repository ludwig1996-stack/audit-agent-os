"use client";

import SecurityMonitor from "@/components/audit/SecurityMonitor";
import NeuralChat from "@/components/audit/NeuralChat";
import EvidenceVault from "@/components/audit/EvidenceVault";
import { createClient } from "@/lib/supabase-client";
import { LogOut } from 'lucide-react';

export default function AuditDashboard() {
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="flex h-screen w-full bg-black text-xs font-medium overflow-hidden relative">
            <SecurityMonitor />
            <NeuralChat />
            <EvidenceVault />

            {/* Logout button repositioned to bottom left for terminal feel */}
            <button
                onClick={handleSignOut}
                className="absolute bottom-4 left-4 z-50 p-2 text-zinc-700 hover:text-red-500 transition-colors bg-black/40 border border-white/5 rounded-full"
                title="DECOMMISSION SESSION"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
