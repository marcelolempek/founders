require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('post_images').select('*').eq('post_id', 'e9d31451-c670-450e-8135-b6dbfe101d53');
    console.log('Images for post:', JSON.stringify(data, null, 2));
}

check();
