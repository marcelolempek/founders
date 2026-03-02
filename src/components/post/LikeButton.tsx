'use client';

import React, { useState, useEffect } from 'react';
import { useLike } from '@/lib/hooks/usePosts';
import { getCurrentUser } from '@/lib/supabase';

interface LikeButtonProps {
    postId: string;
    initialIsLiked: boolean;
    initialLikesCount: number;
    className?: string; // For custom styling positioning if needed
    onLikeChange?: (newIsLiked: boolean) => void; // Optional callback for parent
}

export function LikeButton({
    postId,
    initialIsLiked,
    initialLikesCount,
    className = "",
    onLikeChange
}: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const { toggleLike, loading } = useLike();
    const [isAnimating, setIsAnimating] = useState(false);

    // Sync state if props change (e.g. re-fetch or prop update from parent)
    useEffect(() => {
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
    }, [initialIsLiked, initialLikesCount]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigating to post detail if button is clicked
        e.preventDefault();

        // Check auth quickly (optimistic check, real check in hook)
        const user = await getCurrentUser();
        if (!user) {
            // Let the hook handle the error/toast for auth
            const result = await toggleLike(postId, isLiked);
            // Logic below assumes success, but toggleLike handles auth check
            return;
        }

        // Optimistic Update
        const previousIsLiked = isLiked;
        const newIsLiked = !previousIsLiked;

        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        setIsAnimating(true);

        if (onLikeChange) onLikeChange(newIsLiked);

        // Perform API call
        const finalState = await toggleLike(postId, previousIsLiked);

        // Revert if API call failed (toggleLike returns the ACTUAL new state if possible, or reverts)
        // Adjusting my hook logic knowledge: useLike returns boolean (success state or new state?)
        // Let's check useLike signature -> It returns Promise<boolean> (the NEW state)

        if (finalState !== newIsLiked) {
            // Revert UI
            setIsLiked(finalState);
            setLikesCount(prev => finalState ? prev + 1 : Math.max(0, prev - 1));
            if (onLikeChange) onLikeChange(finalState);
        }

        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <button
            onClick={handleLike}
            className={`group flex items-center gap-1.5 min-w-[50px] transition-colors ${className}`}
            disabled={loading}
        >
            <div className={`relative flex items-center justify-center ${isAnimating ? 'animate-bounce' : ''}`}>
                <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${isLiked
                        ? 'text-primary fill-current'
                        : 'text-text-secondary group-hover:text-primary'
                        }`}
                    style={{
                        fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0"
                    }}
                >
                    thumb_up
                </span>
            </div>
            <span className={`text-sm font-medium transition-colors ${isLiked ? 'text-primary' : 'text-text-secondary group-hover:text-slate-900'
                }`}>
                {likesCount}
            </span>
        </button>
    );
}
