import { resizeImage } from './resizeImage';
import { IMAGE_SIZES, ImageVariant } from './imageSizes';

/**
 * Generate all 3 image variants (thumb, feed, detail)
 * @param file Original image file
 * @returns Object with 3 WebP blobs
 */
export async function generateImageVariants(file: File): Promise<{
    thumb: Blob;
    feed: Blob;
    detail: Blob;
}> {
    // Generate all variants in parallel
    const [thumb, feed, detail] = await Promise.all([
        resizeImage(file, IMAGE_SIZES.thumb),
        resizeImage(file, IMAGE_SIZES.feed),
        resizeImage(file, IMAGE_SIZES.detail),
    ]);

    return { thumb, feed, detail };
}
