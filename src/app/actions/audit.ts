'use server'

import { saveAuditPaper, logAuditTrail } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveAIFindingAction(finding: {
    type: string;
    title: string;
    content: string;
    hash: string;
}) {
    try {
        const result = await saveAuditPaper({
            type: finding.type as any,
            title: finding.title,
            content_json: { detail: finding.content },
            integrity_hash: finding.hash,
        });

        await logAuditTrail({
            event_type: 'AI_FINDING_GENERATED',
            metadata: { type: finding.type, hash: finding.hash }
        });

        revalidatePath('/');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveJournalAction(entries: any[], totalDebit: number, totalCredit: number) {
    try {
        const result = await saveAuditPaper({
            type: 'ENTRY',
            title: `Journal Entry: Balance ${totalDebit}`,
            content_json: { entries, totalDebit, totalCredit },
            integrity_hash: 'manual-entry-' + Date.now(), // Simplified for demo
        });

        await logAuditTrail({
            event_type: 'JOURNAL_ENTRY_SAVED',
            metadata: { total: totalDebit }
        });

        revalidatePath('/');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
