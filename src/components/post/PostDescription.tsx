'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PostDescriptionProps {
    authorId: string;
    username: string;
    description: string;
    maxLength?: number;
}

export const PostDescription = ({
    authorId,
    username,
    description,
    maxLength = 120
}: PostDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = description.length > maxLength;
    const displayText = isExpanded || !shouldTruncate
        ? description
        : description.slice(0, maxLength).trim() + '...';

    const parsehashtags = (text: string) => {
        return text.split(/(\s+)/).map((part, i) => {
            if (part.startsWith('#')) {
                const tag = part.slice(1);
                return (
                    <Link
                        key={i}
                        href={`/explore?q=${encodeURIComponent(part)}`}
                        className="text-primary font-bold hover:underline cursor-pointer"
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-1">
            <p className="text-sm text-white leading-relaxed">
                <Link href={`/profile/${authorId}`} className="font-bold mr-2 hover:text-primary transition-colors">
                    {username}
                </Link>
                <span className="text-slate-300">{parsehashtags(displayText)}</span>
                {shouldTruncate && !isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-slate-400 hover:text-white text-xs ml-1 font-medium transition-colors underline underline-offset-2"
                    >
                        mais
                    </button>
                )}
            </p>
        </div>
    );
};
