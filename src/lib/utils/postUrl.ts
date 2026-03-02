// ============================================
// Empreendedores de Cristo - Post URL Utilities
// ============================================
// Helper functions for generating short post URLs
// ============================================

/**
 * Extract the first 8 characters from a UUID (short ID)
 * Example: "13952eef-cda5-47c9-9d78-54ae47b5133c" -> "13952eef"
 */
export function getShortId(uuid: string): string {
    if (!uuid) return '';

    // Extract characters before first hyphen (or first 8 chars if no hyphen)
    const firstHyphenIndex = uuid.indexOf('-');
    if (firstHyphenIndex > 0) {
        return uuid.substring(0, firstHyphenIndex);
    }

    // Fallback: just take first 8 characters
    return uuid.substring(0, 8);
}

/**
 * Generate a short post URL
 * @param postId - Full UUID of the post
 * @param absolute - Whether to include the origin (default: false)
 * @returns Short post URL in format /p/{shortId} or https://domain.com/p/{shortId}
 */
export function getPostUrl(postId: string, absolute: boolean = false): string {
    if (!postId) return '';

    const shortId = getShortId(postId);
    const relativePath = `/p/${shortId}`;

    if (absolute) {
        return getAbsolutePostUrl(postId);
    }

    return relativePath;
}

/**
 * Generate an absolute post URL (with origin)
 * @param postId - Full UUID of the post
 * @returns Absolute URL in format https://domain.com/p/{shortId}
 */
export function getAbsolutePostUrl(postId: string): string {
    if (!postId) return '';

    const shortId = getShortId(postId);

    // Use environment variable or fallback to default domain
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Empreendedores de Cristo.com';

    // Remove trailing slash if present
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    return `${baseUrl}/p/${shortId}`;
}
