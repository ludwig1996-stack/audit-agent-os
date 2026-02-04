'use server'

/**
 * Enterprise Audit Actions Module
 * Handles document processing, journal entries, and vault integration.
 */

import { saveAuditPaper, logAuditTrail, supabase } from "@/lib/supabase-server";
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

        // Auto-save finding to the vault
        if (analysis.parsed_tags.length > 0) {
            const tag = analysis.parsed_tags[0];
            await saveAuditPaper({
                type: tag.type as any,
                title: `AI Finding: ${file.name}`,
                content_json: { detail: tag.content, full_analysis: analysis.text },
                integrity_hash: analysis.integrity_hash,
            });
        } else {
            // Fallback: Save as a general MEMO if no specific tags were extracted
            await saveAuditPaper({
                type: 'MEMO',
                title: `OCR Scan: ${file.name}`,
                content_json: { detail: "General document scan performed. No specific risks or entries flagged.", full_analysis: analysis.text },
                integrity_hash: analysis.integrity_hash,
            });
        }

        await logAuditTrail({
            event_type: 'OCR_DOCUMENT_PROCESSED',
            metadata: { filename: file.name, hash: analysis.integrity_hash, tags_found: analysis.parsed_tags.length }
        });

        revalidatePath('/');
        console.log("Document processed and saved successfully");
        return { success: true, data: analysis, saved: true };
    } catch (error: any) {
        console.error("OCR Process Error Detail:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return { success: false, error: error.message };
    }
}

export async function initializeUserAction() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error("Not authenticated");

        // Check if user already has an organization
        const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!existingOrg) {
            // Create a default organization for the new auditor
            const { data: newOrg, error } = await supabase
                .from('organizations')
                .insert([{
                    name: `Audit Firm of ${user.email?.split('@')[0]}`,
                    owner_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            // Create a first mock client
            await supabase
                .from('clients')
                .insert([{
                    organization_id: newOrg.id,
                    name: 'First Growth Client AB',
                    industry: 'SaaS',
                    materiality_threshold: 50000
                }]);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Initialization Error:", error);
        return { success: false, error: error.message };
    }
}
