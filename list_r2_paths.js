require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listPaths() {
    console.log('| POST TITLE | R2 BUCKET PATH (Upload a .webp here) |');
    console.log('|---|---|');

    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, post_images(image_id, is_cover)')
        .eq('status', 'active');

    if (posts) {
        posts.forEach(p => {
            if (p.post_images && p.post_images.length > 0) {
                p.post_images.forEach(img => {
                    if (img.image_id) {
                        console.log(`| ${p.title} | **posts/${p.id}/feed/${img.image_id}.webp** |`);
                    }
                });
            }
        });
    }

    console.log('\n| USERNAME | R2 BUCKET PATH (Upload a .webp here) |');
    console.log('|---|---|');
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('username', ['lucas_designer', 'maria_advogada', 'joao_dev', 'roberto_eletricista', 'ana_contabilidade', 'pedro_financas', 'bia_mkt', 'marcos_arquiteto', 'carol_doces', 'tiago_mecanico']);

    if (profiles) {
        profiles.forEach(pr => {
            console.log(`| @${pr.username} | **avatars/${pr.id}.webp** |`);
        });
    }
}

listPaths();
