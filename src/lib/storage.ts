/**
 * Storage Service Abstraction Layer
 * 
 * This module provides a unified interface for image storage operations.
 * Currently uses Supabase Storage, but designed to easily migrate to:
 * - Cloudflare R2
 * - Cloudflare Images
 * 
 * To migrate, simply implement the StorageProvider interface and swap the provider.
 */

import { supabase } from './supabase';

// Storage provider interface for easy migration
export interface StorageProvider {
    uploadImage(bucket: string, path: string, file: File): Promise<{ url: string; error?: string }>;
    deleteImage(bucket: string, path: string): Promise<{ error?: string }>;
    getPublicUrl(bucket: string, path: string): string;
}

// Supabase Storage Provider (current implementation)
class SupabaseStorageProvider implements StorageProvider {
    async uploadImage(bucket: string, path: string, file: File): Promise<{ url: string; error?: string }> {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                return { url: '', error: error.message };
            }

            const url = this.getPublicUrl(bucket, data.path);
            return { url };
        } catch (err) {
            return { url: '', error: err instanceof Error ? err.message : 'Upload failed' };
        }
    }

    async deleteImage(bucket: string, path: string): Promise<{ error?: string }> {
        try {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) {
                return { error: error.message };
            }
            return {};
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Delete failed' };
        }
    }

    getPublicUrl(bucket: string, path: string): string {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
}

// Cloudflare R2 Provider
import { generateImageVariants, uploadImageVariantsToR2 } from './images';

class CloudflareR2Provider implements StorageProvider {
    async uploadImage(bucket: string, path: string, file: File): Promise<{ url: string; error?: string }> {
        // This method is deprecated for R2 - use uploadPostImageR2 instead
        // Kept for interface compatibility
        console.warn('uploadImage() is deprecated for R2, use uploadPostImageR2()');
        return { url: '', error: 'Use uploadPostImageR2 for R2 uploads' };
    }

    async deleteImage(bucket: string, path: string): Promise<{ error?: string }> {
        // TODO: Implement R2 delete (low priority - images are immutable)
        return {};
    }

    getPublicUrl(bucket: string, path: string): string {
        // Not used for R2 - use getImageUrl() helper from images/imageUrl.ts
        console.warn('getPublicUrl() not implemented for R2, use getImageUrl()');
        return '';
    }

    /**
     * Upload post image to R2 (new API)
     * Generates 3 variants (thumb, feed, detail) and uploads all
     * @param postId Post UUID
     * @param file Original image file
     * @returns Image UUID (to be stored in post_images.image_id)
     */
    async uploadPostImageR2(postId: string, file: File): Promise<{ imageId: string; error?: string }> {
        try {
            const imageId = crypto.randomUUID();

            // Generate all 3 variants
            const variants = await generateImageVariants(file);

            // Upload to R2
            await uploadImageVariantsToR2(postId, imageId, variants);

            return { imageId };
        } catch (err) {
            return {
                imageId: '',
                error: err instanceof Error ? err.message : 'R2 upload failed'
            };
        }
    }
}


// Cloudflare Images Provider (future implementation)
// class CloudflareImagesProvider implements StorageProvider {
//   async uploadImage(bucket: string, path: string, file: File): Promise<{ url: string; error?: string }> {
//     // TODO: Implement Cloudflare Images upload
//     throw new Error('Not implemented');
//   }
//
//   async deleteImage(bucket: string, path: string): Promise<{ error?: string }> {
//     // TODO: Implement Cloudflare Images delete
//     throw new Error('Not implemented');
//   }
//
//   getPublicUrl(bucket: string, path: string): string {
//     // TODO: Implement Cloudflare Images public URL
//     throw new Error('Not implemented');
//   }
// }

// Current provider - CHANGE THIS to switch storage backends
// const currentProvider: StorageProvider = new SupabaseStorageProvider(); // Legacy
const currentProvider: StorageProvider = new CloudflareR2Provider(); // R2 (New)

// Public API - use these functions throughout the app
export const storage = {
    /**
     * Upload an image to storage
     * @param bucket - Bucket name ('post-images' or 'avatars')
     * @param path - File path within bucket (e.g., 'user-id/filename.jpg')
     * @param file - File to upload
     */
    uploadImage: (bucket: string, path: string, file: File) =>
        currentProvider.uploadImage(bucket, path, file),

    /**
     * Delete an image from storage
     * @param bucket - Bucket name
     * @param path - File path within bucket
     */
    deleteImage: (bucket: string, path: string) =>
        currentProvider.deleteImage(bucket, path),

    /**
     * Get public URL for an image
     * @param bucket - Bucket name
     * @param path - File path within bucket
     */
    getPublicUrl: (bucket: string, path: string) =>
        currentProvider.getPublicUrl(bucket, path),

    /**
     * Upload post image (helper)
     */
    uploadPostImage: async (userId: string, file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        return currentProvider.uploadImage('post-images', fileName, file);
    },

    /**
     * Upload avatar image (helper)
     */
    uploadAvatar: async (userId: string, file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        return currentProvider.uploadImage('avatars', fileName, file);
    },

    /**
     * Upload post image to R2 (new API for R2 provider)
     * Returns image UUID instead of URL
     */
    uploadPostImageR2: async (postId: string, file: File) => {
        if (currentProvider instanceof CloudflareR2Provider) {
            return currentProvider.uploadPostImageR2(postId, file);
        }
        throw new Error('R2 upload only available with CloudflareR2Provider');
    },
};

// Export bucket names as constants
export const STORAGE_BUCKETS = {
    POST_IMAGES: 'post-images',
    AVATARS: 'avatars',
} as const;
