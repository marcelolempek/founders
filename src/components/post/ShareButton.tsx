'use client';

import React, { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { getAbsolutePostUrl } from '@/lib/utils/postUrl';

interface ShareButtonProps {
    postId: string;
    postTitle?: string;
    initialSharesCount?: number;
    className?: string;
}

export function ShareButton({
    postId,
    postTitle,
    initialSharesCount = 0,
    className = ""
}: ShareButtonProps) {
    const [sharesCount, setSharesCount] = useState(initialSharesCount);

    // We could potentially track shares in the backend here if needed, 
    // but for now we just use the browser API.

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = getAbsolutePostUrl(postId);
        const shareData = {
            title: postTitle,
            text: `Confira: ${postTitle ?? ''}`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                // Optimistic update if we were tracking shares
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copiado!');
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`group text-slate-900 hover:text-slate-600 transition-colors -mt-1 active:scale-110 flex items-center gap-1.5 ${className}`}
            title="Compartilhar"
        >
            <span className="material-symbols-outlined text-[24px] -rotate-12 group-hover:scale-110 transition-transform">send</span>
            {sharesCount > 0 && (
                <span className="text-slate-900 text-sm font-medium">{sharesCount}</span>
            )}
        </button>
    );
}
