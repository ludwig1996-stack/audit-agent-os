const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function verifySchema() {
    let supabaseUrl = '';
    let supabaseKey = '';

    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
    } catch (e) {
        console.error('Env error');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Verifying tables...');

    const tables = ['organizations', 'clients', 'audit_workpapers', 'audit_trails'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`Table "${table}": ERROR - ${error.message}`);
        } else {
            console.log(`Table "${table}": OK`);
        }
    }
}

verifySchema();
