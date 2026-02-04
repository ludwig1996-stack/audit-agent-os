const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testSupabase() {
    let supabaseUrl = '';
    let supabaseKey = '';

    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');

        const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

        if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1].trim();
        if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1].trim();
    } catch (e) {
        console.error('Could not read .env.local manually');
    }

    console.log('Testing Supabase connection to:', supabaseUrl);

    if (!supabaseUrl || !supabaseKey) {
        console.error('Error: Supabase credentials not found in .env.local');
        return;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try to fetch something simple, e.g., the profiles table (which we know might exist)
        // or just a system query if possible. 
        // Since we don't know the exact schema yet, let's try to list tables if possible, 
        // but typically anon key can only read specific tables.

        console.log('Attempting to fetch data from "profiles" table...');
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.log('Connection attempt returned an error (this might be normal if table doesn\'t exist):', error.message);
            console.log('However, the client was able to talk to Supabase.');
        } else {
            console.log('SUCCESS: Successfully connected and fetched from Supabase!');
            console.log('Sample data:', data);
        }
    } catch (error) {
        console.error('FAILED: Critical error connecting to Supabase:');
        console.error(error.message);
    }
}

testSupabase();
