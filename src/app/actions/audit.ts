'use server'

import { saveAuditPaper, logAuditTrail } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { auditAgent } from "@/lib/ai";

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

export async function processDocumentAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No file uploaded");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!auditAgent) throw new Error("AI Agent not initialized");

        const analysis = await auditAgent.analyzeDocument(buffer, file.type);

        // Auto-save the first finding to the vault for demo purposes
        if (analysis.parsed_tags.length > 0) {
            const tag = analysis.parsed_tags[0];
            await saveAuditPaper({
                type: tag.type as any,
                title: `OCR Scan: ${file.name}`,
                content_json: { detail: tag.content, full_analysis: analysis.text },
                integrity_hash: analysis.integrity_hash,
            });

            await logAuditTrail({
                event_type: 'OCR_DOCUMENT_PROCESSED',
                metadata: { filename: file.name, hash: analysis.integrity_hash }
            });
        }

        revalidatePath('/');
        return { success: true, data: analysis };
    } catch (error: any) {
        console.error("OCR Process Error:", error);
        return { success: false, error: error.message };
    }
}
