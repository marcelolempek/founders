import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import PostDetail from '@/components/screens/post/PostDetail';
import { getImageUrl, getPostImageUrl } from '@/lib/images/imageUrl';
import { getAbsolutePostUrl, getShortId } from '@/lib/utils/postUrl';

interface PageProps {
    params: Promise<{
        id: string;
    }>
}

async function getPost(shortId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Since PostgREST doesn't support pattern matching on UUIDs easily,
    // we'll fetch posts and filter client-side
    // This is acceptable since we're only matching the first 8 characters
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            description,
            user:profiles!posts_user_id_fkey(username),
            images:post_images(url, image_id, is_cover)
        `)
        .limit(100); // Fetch a reasonable number to search through

    if (error) {
        console.error('Error fetching posts:', error);
        return null;
    }

    // Filter client-side for posts starting with the short ID
    const matchingPost = data?.find((post: any) =>
        post.id.toLowerCase().startsWith(shortId.toLowerCase())
    );

    return matchingPost || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id: shortId } = await params;
    const post = await getPost(shortId);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Empreendedores de Cristo.com';

    if (!post) {
        return {
            title: 'Post não encontrado | Empreendedores de Cristo',
            description: 'Este post não está disponível.',
            openGraph: {
                title: 'Post não encontrado | Empreendedores de Cristo',
                description: 'Este post não está disponível.',
                url: `${siteUrl}/p/${shortId}`,
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
    const postUrl = getAbsolutePostUrl(post.id);

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
    const { id: shortId } = await params;

    // Get the full post to extract complete ID
    const post = await getPost(shortId);

    if (!post) {
        return <div>Post não encontrado</div>;
    }

    return <PostDetail initialPostId={post.id} />;
}
