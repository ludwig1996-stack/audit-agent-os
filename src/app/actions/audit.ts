'use server'

/**
 * Enterprise Audit Actions Module
 * Handles document processing, journal entries, and vault integration.
 */

import { saveAuditPaper, logAuditTrail, supabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { auditAgent } from "@/lib/ai";
import { z } from "zod";
import JSON5 from "json5";
import { AuditPaperSchema, JournalEntrySchema } from "@/lib/types";

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
    console.log("SERVER ACTION: processDocumentAction started");
    try {
        const file = formData.get('file') as File;
        const ledgerContext = formData.get('ledgerContext') as string | null;

        if (!file) throw new Error("No file uploaded");

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, PDF.`);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!auditAgent) throw new Error("AI Agent not initialized");

        // 1. AI Analysis with Ledger Context (if any)
        const analysis = await auditAgent.analyzeDocument(buffer, file.type, ledgerContext || undefined);

        // 2. Extract and Validate Findings
        // We use the first found valid tag as the main finding to save
        const mainTag = analysis.parsed_tags.find(t => ['RISK', 'AML', 'ENTRY', 'MEMO'].includes(t.type));

        // 3. Extract and Validate Journal Entries
        const journalTag = analysis.parsed_tags.find(t => t.type === 'JOURNAL');
        let journalSuggestions = null;

        if (journalTag) {
            let jsonString = "{}";
            try {
                // Attempt clean parse
                const jsonStart = journalTag.content.indexOf('{');
                const jsonEnd = journalTag.content.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1) {
                    jsonString = journalTag.content.substring(jsonStart, jsonEnd + 1);
                } else {
                    jsonString = journalTag.content;
                }

                // Use JSON5 for robust parsing (handles comments, trailing commas, missing quotes)
                const rawObj = JSON5.parse(jsonString);

                // Validate with Zod
                const zResult = z.object({ entries: z.array(JournalEntrySchema) }).safeParse(rawObj);

                if (zResult.success) {
                    journalSuggestions = zResult.data.entries;
                } else {
                    console.warn("Journal Validation Failed:", zResult.error);
                }

            } catch (e) {
                console.warn("Journal JSON Parse Failed:", e);
                console.warn("Failed JSON String:", jsonString);
            }
        }

        // 4. Construct Final Paper
        const findingType = (mainTag?.type as any) || 'MEMO';
        const findingTitle = mainTag ? `AI Finding: ${file.name}` : `OCR Scan: ${file.name}`;
        const findingContent = mainTag?.content || "General document scan performed.";

        // Validate complete paper before save
        const workpaper = AuditPaperSchema.parse({
            type: findingType,
            title: findingTitle,
            content_json: {
                detail: findingContent,
                full_analysis: analysis.text,
                journal_suggestions: journalSuggestions
            },
            integrity_hash: analysis.integrity_hash
        });

        // 5. Persist to DB
        await saveAuditPaper(workpaper);

        await logAuditTrail({
            event_type: 'OCR_DOCUMENT_PROCESSED',
            metadata: {
                filename: file.name,
                hash: analysis.integrity_hash,
                has_finding: !!mainTag,
                has_journal: !!journalSuggestions
            }
        });

        revalidatePath('/');
        console.log("Document processed securely.");
        return { success: true, data: analysis, journalSuggestions, saved: true };

    } catch (error: any) {
        console.error("Secure Process Error:", error);
        // Return a safe error object to client
        if (error instanceof z.ZodError) {
            return { success: false, error: "Validation Error: Data integrity check failed." };
        }
        return { success: false, error: error.message || "Internal System Error" };
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
