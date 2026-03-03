import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import PostDetail from '@/components/screens/post/PostDetail';
import { getImageUrl, getPostImageUrl } from '@/lib/images/imageUrl';
import { getPostUrl } from '@/lib/utils/postUrl';

interface PageProps {
    params: Promise<{
        id: string;
        slug: string;
    }>
}

async function getPost(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            description,
            user:profiles(username),
            images:post_images(url, image_id, is_cover)
        `)
        .eq('id', id)
        .single();
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, slug } = await params;
    const post = await getPost(id);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Empreendedores de Cristo.com';
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

    if (!post) {
        return {
            title: 'Post não encontrado | Empreendedores de Cristo',
            description: 'Este post não está disponível.',
            openGraph: {
                title: 'Post não encontrado | Empreendedores de Cristo',
                description: 'Este post não está disponível.',
                url: `${siteUrl}/post/${id}/${slug}`,
                siteName: 'Empreendedores de Cristo',
                locale: 'pt_BR',
                type: 'website',
            },
        };
    }

    // Get the cover image (or first image)
    const images = (post.images as any[]) || [];
    const coverImage = images.find((img: any) => img.is_cover) || images[0];

    // Build image URL using the helper function
    const imageUrl = coverImage
        ? getPostImageUrl(post.id, coverImage.image_id, coverImage.url, 'feed')
        : '';

    const title = post.title || 'Post no Empreendedores de Cristo';
    const description = post.description?.substring(0, 160) || 'Confira este post no Empreendedores de Cristo';
    const username = (post.user as any)?.username || 'Empreendedores de Cristo';
    const postUrl = `${siteUrl}/post/${id}/${slug}`;

    return {
        title: `${title} | Empreendedores de Cristo`,
        description,
        openGraph: {
            title,
            description,
            url: postUrl,
            siteName: 'Empreendedores de Cristo',
            locale: 'pt_BR',
            type: 'article',
            images: imageUrl ? [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ] : [],
            authors: [username],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
            creator: `@${username}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function PostPage({ params }: PageProps) {
    // Redirect to short URL format (without slug)
    const { id } = await params;
    redirect(getPostUrl(id));
}
