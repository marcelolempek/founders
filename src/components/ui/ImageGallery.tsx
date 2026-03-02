'use client';

import React, { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
    alts?: string[];
}

export function ImageGallery({ images, alts = [] }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setIsFullscreen(false);
    };

    return (
        <div className="flex flex-col" onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Main Image */}
            <div className="w-full aspect-[4/3] bg-black relative group cursor-pointer" onClick={() => setIsFullscreen(true)}>
                <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-opacity duration-300"
                    style={{ backgroundImage: `url("${images[currentIndex]}")` }}
                    data-alt={alts[currentIndex] || `Image ${currentIndex + 1}`}
                />

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-primary hover:text-white transition-colors border border-white/10">
                    <span className="material-symbols-outlined">favorite</span>
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 border border-white/10 z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Multiple Images Indicator */}
                {images.length > 1 && (
                    <div className="absolute top-4 left-4">
                        <span className="material-symbols-outlined text-slate-900 drop-shadow-md text-[20px]">filter_none</span>
                    </div>
                )}

                {/* Dots Indicator */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); handleThumbnailClick(index); }}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-primary w-4'
                                        : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar items-center bg-white">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                    ? 'border-2 border-primary'
                                    : 'border border-slate-200 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${image}")` }}
                                data-alt={alts[index] || `Thumbnail ${index + 1}`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                    onClick={() => setIsFullscreen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsFullscreen(false);
                        if (e.key === 'ArrowLeft') goToPrevious();
                        if (e.key === 'ArrowRight') goToNext();
                    }}
                    tabIndex={0}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px]">close</span>
                    </button>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[28px]">chevron_left</span>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[28px]">chevron_right</span>
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <img
                        src={images[currentIndex]}
                        alt={alts[currentIndex] || `Image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-slate-900">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
