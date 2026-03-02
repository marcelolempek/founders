require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_feed_posts', {
        p_limit: 1,
        p_cdn_url: process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    });
    console.log(JSON.stringify(data, null, 2));

    const { data: q } = await supabase.rpc('query_db', { query: "SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'get_feed_posts';" })
    console.log(q);
}

check();
