require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function diagnose() {
    console.log('--- DIAGNOSTIC: POST IMAGES ---');

    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, post_images(url, image_id, is_cover)')
        .limit(10);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    posts.forEach(p => {
        console.log(`\nPost: "${p.title}" (ID: ${p.id})`);
        if (p.post_images && p.post_images.length > 0) {
            p.post_images.forEach(img => {
                console.log(`  - Image: ${img.url}`);
                console.log(`    image_id: ${img.image_id}`);
                console.log(`    is_cover: ${img.is_cover}`);
            });
        } else {
            console.log('  - No images found in post_images table for this post');
        }
    });

    console.log('\n--- DIAGNOSTIC: PROFILES ---');
    const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .in('username', ['lucas_designer', 'maria_advogada', 'joao_dev', 'tiago_mecanico'])

    if (profErr) {
        console.error('Error fetching profiles:', profErr);
    } else {
        profiles.forEach(pr => {
            console.log(`User: ${pr.username} | Avatar: ${pr.avatar_url}`);
        });
    }
}

diagnose();
