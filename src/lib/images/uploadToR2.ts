import { supabase } from '../supabase';

/**
 * Upload a blob to R2 via presigned URL
 * @param path R2 path (e.g., "posts/{postId}/thumb/{imageId}.webp")
 * @param blob Image blob to upload
 */
export async function uploadBlobToR2(
    path: string,
    blob: Blob,
    contentType: string = 'image/webp'
): Promise<void> {
    // Get presigned URL from edge function
    const { data, error } = await supabase.functions.invoke('r2-signed-upload', {
        body: { path },
    });

    if (error) {
        throw new Error(`Failed to get upload URL: ${error.message}`);
    }

    if (data?.error) {
        throw new Error(`R2 Function Error: ${data.error}`);
    }

    const { uploadUrl } = data;

    // Upload blob to R2 using presigned URL
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
            'Content-Type': contentType,
        },
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }
}

/**
 * Upload all 3 variants of an image to R2
 * @param postId Post UUID
 * @param imageId Image UUID
 * @param variants Object with thumb, feed, detail blobs
 */
export async function uploadImageVariantsToR2(
    postId: string,
    imageId: string,
    variants: { thumb: Blob; feed: Blob; detail: Blob }
): Promise<void> {
    // Upload all variants in parallel
    await Promise.all([
        uploadBlobToR2(`posts/${postId}/thumb/${imageId}.webp`, variants.thumb),
        uploadBlobToR2(`posts/${postId}/feed/${imageId}.webp`, variants.feed),
        uploadBlobToR2(`posts/${postId}/feed/${imageId}.webp`, variants.detail),
    ]);
}
