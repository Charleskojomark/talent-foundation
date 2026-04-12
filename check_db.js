
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found');
        process.exit(1);
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            vars[key.trim()] = valueParts.join('=').trim();
        }
    });
    return vars;
}

const vars = getEnvVars();
const supabaseUrl = vars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking registrations table...');
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching registrations:', error.message);
        const { error: colError } = await supabase
            .from('registrations')
            .select('current_stage')
            .limit(1);
        if (colError) {
            console.log('Detected missing current_stage column:', colError.message);
        } else {
            console.log('current_stage column exists!');
        }
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        if ('current_stage' in data[0]) {
            console.log('current_stage exists!');
        } else {
            console.log('current_stage DOES NOT exist in data object.');
        }
    } else {
        console.log('No data found in registrations table.');
        const { error: colError } = await supabase
            .from('registrations')
            .select('current_stage')
            .limit(1);
        if (colError) {
            console.log('Detected missing current_stage column:', colError.message);
        } else {
            console.log('current_stage column exists!');
        }
    }
}

checkSchema().catch(err => console.error('Unexpected error:', err));
