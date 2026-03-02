'use client';

import React from 'react';

interface RatingSummaryProps {
    score: number;
    totalReviews: number;
    distribution?: { [key: number]: number }; // percentage or count for 1-5 stars
    variant?: 'full' | 'compact' | 'minimal';
}

export const RatingSummary = ({
    score,
    totalReviews,
    distribution = { 5: 90, 4: 10, 3: 0, 2: 0, 1: 0 },
    variant = 'full'
}: RatingSummaryProps) => {
    const renderStars = (count: number, size = 16) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`material-symbols-outlined text-yellow-500`}
                        style={{
                            fontSize: `${size}px`,
                            fontVariationSettings: star <= count ? "'FILL' 1" : "'FILL' 0"
                        }}
                    >
                        star
                    </span>
                ))}
            </div>
        );
    };

    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-sm text-slate-600 font-bold">{score.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({totalReviews})</span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200/30">
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900 leading-none">{score.toFixed(1)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                    {renderStars(Math.round(score), 14)}
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{totalReviews} reviews</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6 p-4 bg-card-dark rounded-xl border border-slate-200/50 shadow-md">
            <div className="flex flex-col items-center px-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">{score.toFixed(1)}</span>
                <div className="mt-1">
                    {renderStars(Math.round(score), 18)}
                </div>
                <span className="text-xs text-text-secondary mt-2 font-medium uppercase tracking-wide">{totalReviews} reviews</span>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-text-secondary w-2">{rating}</span>
                        <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                style={{ width: `${distribution[rating] || 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
