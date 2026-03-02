/**
 * Fixed image sizes for R2 storage
 * NEVER change these - they define the R2 path structure
 */

export const IMAGE_SIZES = {
    thumb: {
        width: 300,
        height: 300,
        mode: 'cover' as const, // Crop central
    },
    feed: {
        width: 900,
        height: null, // Maintain aspect ratio
        mode: 'contain' as const,
    },
    detail: {
        width: 1400,
        height: null, // Maintain aspect ratio
        mode: 'contain' as const,
    },
    avatar: {
        width: 300,
        height: 300,
        mode: 'cover' as const,
    },
} as const;

export type ImageVariant = keyof typeof IMAGE_SIZES;

export interface ImageSizeConfig {
    width: number;
    height: number | null;
    mode: 'cover' | 'contain';
}
