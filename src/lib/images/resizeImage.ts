import { ImageSizeConfig } from './imageSizes';

/**
 * Resize an image using native Canvas API (no external dependencies)
 * This avoids production minification issues with pica library
 * @param file Original image file
 * @param config Target size configuration
 * @returns WebP blob
 */
export async function resizeImage(
    file: File,
    config: ImageSizeConfig
): Promise<Blob> {
    // Load image
    const img = await loadImage(file);

    // Calculate target dimensions
    const { targetWidth, targetHeight } = calculateDimensions(
        img.width,
        img.height,
        config
    );

    // Create canvas and resize using native browser API
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image with high quality settings
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Convert to WebP blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            },
            'image/webp',
            0.90 // 90% quality
        );
    });
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate target dimensions based on mode
 */
function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    config: ImageSizeConfig
): { targetWidth: number; targetHeight: number } {
    const { width: configWidth, height: configHeight, mode } = config;

    if (mode === 'cover') {
        // Crop to fill exact dimensions (for thumb)
        return {
            targetWidth: configWidth,
            targetHeight: configHeight || configWidth,
        };
    }

    // Contain mode - maintain aspect ratio
    if (configHeight === null) {
        // Scale width, maintain aspect ratio
        const aspectRatio = originalHeight / originalWidth;
        return {
            targetWidth: configWidth,
            targetHeight: Math.round(configWidth * aspectRatio),
        };
    }

    // Both dimensions specified - fit within bounds
    const aspectRatio = originalWidth / originalHeight;
    if (originalWidth > originalHeight) {
        return {
            targetWidth: configWidth,
            targetHeight: Math.round(configWidth / aspectRatio),
        };
    } else {
        return {
            targetWidth: Math.round(configHeight * aspectRatio),
            targetHeight: configHeight,
        };
    }
}
