'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PostGalleryProps {
    images: string[];
    price?: string;
    conditionLabel?: string;
    isTrade?: boolean;
    href?: string;
    onClick?: () => void;
    aspectRatio?: 'auto' | 'square' | 'portrait' | 'video';
}

export const PostGallery = ({
    images,
    price,
    conditionLabel,
    isTrade = false,
    href,
    onClick,
    aspectRatio = 'portrait'
}: PostGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleGalleryClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    const ratioClass = {
        auto: 'aspect-auto',
        square: 'aspect-square',
        portrait: 'aspect-[4/5]',
        video: 'aspect-[9/16]'
    }[aspectRatio];

    const isMultiple = images.length > 1;

    return (
        <div className="relative w-full bg-slate-50 group overflow-hidden flex justify-center items-center min-h-[300px]">
            {/* Main Image - Natural Height */}
            <img
                src={images[currentIndex]}
                alt="Post content"
                className="w-full h-auto max-h-[75vh] object-contain"
                onClick={handleGalleryClick}
            // If it's a gallery, we might want to prevent default click navigation if used for zooming, but here it opens details
            />

            {/* Click Overlay just for pointer events if needed, but img onClick works */}
            {href && !onClick && (
                <Link href={href} className="absolute inset-0 z-10"></Link>
            )}

            {/* Price/Trade Tag - Overlaid regardless of image size */}
            <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
                {isTrade && (
                    <div className="bg-blue-600/90 backdrop-blur-sm px-2.5 py-1 rounded shadow-lg border border-blue-500/50 w-fit">
                        <span className="text-slate-900 font-bold text-xs tracking-wide uppercase">TROCA</span>
                    </div>
                )}
                {price && (
                    <div className="bg-primary/90 backdrop-blur-sm px-2.5 py-1.5 rounded shadow-lg border border-primary/50 w-fit">
                        <span className="text-[#0f172a] font-bold text-sm tracking-tight">{price}</span>
                    </div>
                )}
                {conditionLabel && (
                    <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded shadow-lg border border-white/10 w-fit">
                        <span className="text-slate-900 font-bold text-[10px] tracking-wide uppercase">{conditionLabel}</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            {isMultiple && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(prev => Math.max(0, prev - 1)); }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-slate-900 rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-30 ${currentIndex === 0 ? 'hidden' : ''}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(prev => Math.min(images.length - 1, prev + 1)); }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-slate-900 rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-30 ${currentIndex === images.length - 1 ? 'hidden' : ''}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>

                    {/* Dots / Counter */}
                    <div className="absolute top-3 right-3 z-20">
                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-slate-900 text-[10px] font-bold">
                            {currentIndex + 1}/{images.length}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-1.5 z-30 bg-gradient-to-t from-black/50 to-transparent">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentIndex ? 'bg-primary scale-110' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
