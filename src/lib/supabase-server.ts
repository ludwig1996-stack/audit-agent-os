import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client for use in Server Actions and Route Handlers.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Specialized helper to save audit findings.
 */
export async function saveAuditPaper(paper: {
    client_id?: string;
    type: 'RISK' | 'AML' | 'ENTRY' | 'MEMO';
    title: string;
    content_json: any;
    integrity_hash: string;
    created_by?: string;
}) {
    const { data, error } = await supabase
        .from('audit_workpapers')
        .insert([paper])
        .select();

    if (error) {
        console.error('Failed to save audit paper:', error);
        throw new Error(error.message);
    }
    return data;
}

/**
 * Specialized helper to log system events.
 */
export async function logAuditTrail(event: {
    event_type: string;
    metadata: any;
}) {
    const { error } = await supabase
        .from('audit_trails')
        .insert([event]);

    if (error) {
        console.error('Failed to log audit trail:', error);
    }
}
