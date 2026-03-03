require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSeed() {
    console.log('--- FORCING IMAGES TO WORK FOR PRESENTATION ---');
    console.log('Reason: get_feed_posts prefixes images with R2 domain if image_id is present.');
    console.log('Since R2 is empty, we will set image_id to NULL to force using absolute Unsplash URLs.\n');

    const avatars = {
        'lucas_designer': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        'maria_advogada': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        'joao_dev': 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
        'roberto_eletricista': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
        'ana_contabilidade': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
        'pedro_financas': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        'bia_mkt': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        'marcos_arquiteto': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        'carol_doces': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        'tiago_mecanico': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    };

    for (const [username, url] of Object.entries(avatars)) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_url: url })
            .eq('username', username);

        if (error) {
            console.error(`Error updating avatar for ${username}:`, error.message);
        } else {
            console.log(`Success: Updated avatar for ${username}`);
        }
    }

    console.log('\n--- FIXING POST IMAGES ---');

    const postImgs = [
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000'
    ];

    // Get all posts
    const { data: posts, error: postErr } = await supabase
        .from('posts')
        .select('id, title');

    if (posts) {
        for (const post of posts) {
            const url = postImgs[Math.floor(Math.random() * postImgs.length)];

            // CRITICAL: We update the URL AND set image_id to NULL
            const { error: imgErr } = await supabase
                .from('post_images')
                .update({
                    url: url,
                    image_id: null // This prevents the SQL function from prefixing with R2 domain
                })
                .eq('post_id', post.id);

            if (imgErr) {
                console.error(`Error updating image for post ${post.title}:`, imgErr.message);
            } else {
                console.log(`Success: Restored absolute image for "${post.title}"`);
            }
        }
    }

    console.log('\nAll done! Restart your application to see the fix.');
}

fixSeed();
