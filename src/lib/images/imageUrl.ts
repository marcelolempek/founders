import { ImageVariant } from './imageSizes';

export function getR2Url(path: string | null | undefined): string {
    if (!path || typeof path !== 'string') return '';

    // Trim to avoid issues with accidental spaces in DB
    const cleanPathInput = path.trim();

    // If it's already a full URL or data URI, return as is
    if (cleanPathInput.startsWith('http') || cleanPathInput.startsWith('data:')) return cleanPathInput;

    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (!baseUrl || cleanPathInput.startsWith('/images/')) {
        // Local asset or no baseUrl, stay relative
        return cleanPathInput.startsWith('/') ? cleanPathInput : `/${cleanPathInput}`;
    }

    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const finalNormalizedPath = cleanPathInput.startsWith('/') ? cleanPathInput : `/${cleanPathInput}`;

    return `${cleanBase}${finalNormalizedPath}`;
}

/**
 * Get public URL for an avatar image
 * @param userId User UUID
 * @param avatarUrl Optional: full URL or ID stored in profile
 */
export function getAvatarUrl(userId: string, avatarUrl?: string | null): string {
    if (!avatarUrl) return '';

    // Se for URL legada do Google ou Supabase, retorna direto
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }

    // Se já for um path completo de R2 (avatars/...)
    if (avatarUrl.startsWith('avatars/')) {
        return getR2Url(avatarUrl);
    }

    // Caso contrário, assume que avatarUrl é apenas o ID e constrói o path
    return getR2Url(`avatars/${userId}.webp`);
}

/**
 * Get public URL for an image stored in R2
 */
/**
 * Get the best available URL for a post image, prioritizing R2 but falling back
 * to legacy URLs correctly.
 */
export function getPostImageUrl(
    postId: string,
    image_id: string | null | undefined,
    url: string | null | undefined,
    variant: ImageVariant = 'feed'
): string {
    // 1. If we have image_id and either NO url or URL is an Unsplash placeholder
    if (image_id && (!url || url.includes('unsplash.com'))) {
        return getImageUrl(postId, image_id, variant);
    }

    // 2. If we have a URL (real legacy or external), use it
    if (url) {
        return getR2Url(url);
    }

    // 3. Fallback to image_id if we have nothing else
    if (image_id) {
        return getImageUrl(postId, image_id, variant);
    }

    return '';
}

export function getImageUrl(
    postId: string,
    imageIdOrUrl: string,
    variant: ImageVariant
): string {
    if (imageIdOrUrl.startsWith('http')) {
        return imageIdOrUrl;
    }

    // Se já parecer um path completo de R2
    if (imageIdOrUrl.includes('/posts/')) {
        return getR2Url(imageIdOrUrl);
    }

    // Removal of cache busting query string as it causes 404s on some R2 setups
    return getR2Url(`posts/${postId}/${variant}/${imageIdOrUrl}.webp`);
}

export function getImageUrls(
    postId: string,
    imageIdOrUrl: string
): { thumb: string; feed: string; detail: string; } {
    return {
        thumb: getImageUrl(postId, imageIdOrUrl, 'thumb'),
        feed: getImageUrl(postId, imageIdOrUrl, 'feed'),
        detail: getImageUrl(postId, imageIdOrUrl, 'detail'),
    };
}
export function getBestAvatar(profile?: any, user?: any): string {
    // 1. Try profile from database first (highest priority)
    if (profile?.avatar_url) {
        return getR2Url(profile.avatar_url);
    }

    // 2. Try various user metadata locations (Supabase standard)
    const meta = user?.user_metadata || {};
    const metaAvatar = meta.avatar_url || meta.picture || meta.photoURL;
    if (metaAvatar) {
        return getR2Url(metaAvatar);
    }

    // 3. Try direct user properties (some variants/SDKs)
    const directAvatar = user?.avatar_url || user?.picture || user?.photoURL;
    if (directAvatar) {
        return getR2Url(directAvatar);
    }

    // 4. Absolute fallback
    return '/images/default-avatar.png';
}
