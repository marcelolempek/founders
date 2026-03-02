require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: '0e063e04-b8e4-4807-b1df-3d20e4ac0c52',
        p_limit: 3,
        p_cdn_url: process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    });
    console.log("Error:", error);
    console.log("Posts count:", data?.length);
    if (data && data[0]) {
        console.log("First post cover_image_url:", data[0].cover_image_url);
        console.log("First post author_avatar:", data[0].author_avatar);
    }
}

check();
