'use client';

import React, { useState, useEffect } from 'react';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
    postId: string;
    initialIsBookmarked?: boolean;
    className?: string;
    onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({
    postId,
    initialIsBookmarked = false,
    className = "",
    onBookmarkChange
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const { toggleBookmark, loading } = useBookmarks();
    const [isAnimating, setIsAnimating] = useState(false);
    const { user } = useUser();
    const router = useRouter();

    // Sync state if props change
    useEffect(() => {
        setIsBookmarked(initialIsBookmarked);
    }, [initialIsBookmarked]);

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        if (loading) return;

        const previousBookmarked = isBookmarked;

        // Optimistic update
        setIsBookmarked(!previousBookmarked);
        setIsAnimating(true);
        onBookmarkChange?.(!previousBookmarked);

        setTimeout(() => setIsAnimating(false), 300);

        try {
            const newBookmarkedState = await toggleBookmark(postId, previousBookmarked);

            // If the returned state is different from our optimistic update (rare), sync up
            if (newBookmarkedState !== !previousBookmarked) {
                setIsBookmarked(newBookmarkedState);
                onBookmarkChange?.(newBookmarkedState);
            }
        } catch (error) {
            // Revert on error
            setIsBookmarked(previousBookmarked);
            onBookmarkChange?.(previousBookmarked);
        }
    };

    return (
        <button
            onClick={handleBookmark}
            className={`group transition-transform active:scale-110 ${isBookmarked ? 'text-primary' : 'text-slate-900 hover:text-slate-600'} ${className}`}
            title={isBookmarked ? "Item Salvo" : "Salvar Item"}
            disabled={loading}
        >
            <span className={`material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform ${isAnimating ? 'animate-bounce' : ''}`}>
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
        </button>
    );
}
