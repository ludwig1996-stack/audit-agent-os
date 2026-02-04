import { z } from 'zod';

/**
 * Zod Schema for Journal Entries.
 * Enforces strictly typed accounting entries.
 */
export const JournalEntrySchema = z.object({
    account: z.string().min(4, "Account must be at least 4 digits"),
    description: z.string().min(1, "Description is required"),
    debit: z.number().nonnegative().default(0),
    credit: z.number().nonnegative().default(0),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

/**
 * Zod Schema for Audit Findings.
 * Used to validate the raw output from the AI Agent.
 */
export const FindingTypeSchema = z.enum(["RISK", "AML", "ENTRY", "MEMO"]);

export const ParsedFindingSchema = z.object({
    type: FindingTypeSchema,
    content: z.string().min(1),
    full_analysis: z.string().optional(),
    journal_suggestions: z.array(JournalEntrySchema).nullable().optional(),
});

export type ParsedFinding = z.infer<typeof ParsedFindingSchema>;

/**
 * Schema for preserving audit data in Supabase.
 */
export const AuditPaperSchema = z.object({
    type: FindingTypeSchema,
    title: z.string(),
    content_json: z.record(z.string(), z.any()), // JSONB in DB, validates structure before save
    integrity_hash: z.string().length(64),
});
