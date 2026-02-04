
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load Env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log("✅ Loaded .env.local");
    }
} catch (e) {
    console.warn("⚠️ Could not load .env.local:", e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVaultTest() {
    console.log("🚀 Connecting to Evidence Vault (Supabase)...");

    // 1. Create a Mock Unbalanced Entry
    const mockEntry = {
        type: 'ENTRY',
        title: 'TEST_ENTRY_' + Date.now(),
        content_json: {
            detail: "Test content from CLI verification",
            journal_suggestions: [
                // Intentionally Unbalanced
                { account: '1930', description: 'Test Debit', debit: 100, credit: 0 },
                { account: '3000', description: 'Test Credit', debit: 0, credit: 90 }
            ]
        },
        integrity_hash: 'hash_' + Date.now()
    };

    console.log("📤 Inserting test workpaper...");
    const { data, error } = await supabase
        .from('audit_workpapers')
        .insert([mockEntry])
        .select()
        .single();

    if (error) {
        console.error("❌ Insert Failed:", error.message);
        return;
    }

    console.log(`✅ Inserted ID: ${data.id}`);

    // 2. Fetch Back
    console.log("📥 Fetching recent entries...");
    const { data: list, error: fetchError } = await supabase
        .from('audit_workpapers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (fetchError) {
        console.error("❌ Fetch Failed:", fetchError.message);
        return;
    }

    console.log(`✅ Retrieved ${list.length} items from Vault.`);

    // Check our item
    const found = list.find(i => i.id === data.id);
    if (found) {
        const entries = found.content_json.journal_suggestions || [];
        const dr = entries.reduce((s, e) => s + e.debit, 0);
        const cr = entries.reduce((s, e) => s + e.credit, 0);
        console.log(`🔍 Verified Item Content: Debit=${dr}, Credit=${cr} -> ${dr === cr ? 'BALANCED' : 'UNBALANCED'}`);
        if (dr !== cr) {
            console.log("✨ verification confirmed: System correctly stores UNBALANCED state.");
        }
    }
}

runVaultTest();
