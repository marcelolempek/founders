require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listPaths() {
    let output = '# Estrutura R2 Bucket - Manual Upload\n\n';
    output += '## 1. POST IMAGES\n';
    output += '| Post Title | R2 Path (Upload a .webp here) |\n';
    output += '|:---|:---|\n';

    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, post_images(image_id, is_cover)')
        .eq('status', 'active');

    if (posts) {
        posts.forEach(p => {
            if (p.post_images && p.post_images.length > 0) {
                p.post_images.forEach(img => {
                    if (img.image_id) {
                        output += `| ${p.title} | \`posts/${p.id}/feed/${img.image_id}.webp\` |\n`;
                    }
                });
            }
        });
    }

    output += '\n## 2. PROFILE AVATARS\n';
    output += '| User Name | R2 Path (Upload a .webp here) |\n';
    output += '|:---|:---|\n';

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('username', ['lucas_designer', 'maria_advogada', 'joao_dev', 'roberto_eletricista', 'ana_contabilidade', 'pedro_financas', 'bia_mkt', 'marcos_arquiteto', 'carol_doces', 'tiago_mecanico']);

    if (profiles) {
        profiles.forEach(pr => {
            output += `| @${pr.username} | \`avatars/${pr.id}.webp\` |\n`;
        });
    }

    fs.writeFileSync('r2_manual_map.md', output);
    console.log('File r2_manual_map.md generated successfully');
}

listPaths();
