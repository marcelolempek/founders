'use client';

import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
    image: string;
    title: string;
    price: string;
    location: string;
    href?: string;
    onClick?: () => void;
    sold?: boolean;
    variant?: 'default' | 'feed' | 'profile';
}

/**
 * ProductCard component for displaying listing summaries.
 * Supports both standard Link navigation and custom onClick (for modals).
 */
export const ProductCard = ({
    image,
    title,
    price,
    location,
    href,
    onClick,
    sold = false,
    variant = 'default'
}: ProductCardProps) => {

    const cardContent = (
        <div className={`group relative block overflow-hidden rounded-xl bg-card-dark ${sold ? 'opacity-70' : ''} w-full text-left transition-all hover:ring-2 hover:ring-primary/30`}>
            <div className="aspect-square w-full overflow-hidden">
                <img
                    alt={title}
                    className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${sold ? 'grayscale' : ''}`}
                    src={image || '/images/default-post.png'}
                />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>

            {/* Content (Feed variant by default) */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
                {/* Top Right Icon if multiple images or similar */}
                {variant === 'feed' && (
                    <div className="absolute top-2 right-2 pointer-events-none">
                        <span className="material-symbols-outlined text-slate-900 drop-shadow-md text-[20px]">filter_none</span>
                    </div>
                )}

                <p className={`font-extrabold text-sm md:text-lg drop-shadow-lg shadow-black leading-none mb-1 ${sold ? 'text-slate-900' : 'text-primary'}`}>
                    {sold ? 'VENDIDO' : price}
                </p>

                <h3 className="text-slate-900 font-bold text-xs truncate mb-1">{title}</h3>

                {location && (
                    <div className="flex items-center gap-0.5 text-gray-200 text-[10px] font-medium">
                        <span className="material-symbols-outlined text-[12px] text-slate-600">location_on</span>
                        <span className="truncate">{location}</span>
                    </div>
                )}
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full">
                {cardContent}
            </button>
        );
    }

    if (href) {
        return (
            <Link href={href} className="block w-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};
