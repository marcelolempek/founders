'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSocial } from '@/lib/hooks/useSocial';
import { useNotify } from '@/components/ui/Toast';

interface PostHeaderProps {
    authorId?: string;
    currentUserId?: string;
    username: string;
    userAvatar: string;
    location: string;
    timestamp: string;
    isVerified?: boolean;
    onMenuClick?: () => void;
    initialIsFollowing?: boolean;
}

export function PostHeader({
    authorId,
    currentUserId,
    username,
    userAvatar,
    location,
    timestamp,
    isVerified = false,
    onMenuClick,
    initialIsFollowing,
}: PostHeaderProps) {
    const profileLink = authorId === currentUserId ? "/profile/profile" : `/profile/${authorId}`;

    // Follow Logic
    const { checkIsFollowing, followUser, unfollowUser } = useSocial();
    const { success: notifySuccess, error: notifyError } = useNotify();
    const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);
    const [loadingFollow, setLoadingFollow] = useState(false);

    useEffect(() => {
        // If we have an initial value (it's not undefined), we trust it and don't fetch
        if (initialIsFollowing !== undefined) {
            setIsFollowing(initialIsFollowing);
            return;
        }

        let mounted = true;
        if (authorId && currentUserId && authorId !== currentUserId) {
            checkIsFollowing(authorId).then(following => {
                if (mounted) setIsFollowing(following);
            });
        }
        return () => { mounted = false; };
    }, [authorId, currentUserId, initialIsFollowing]);

    const handleFollowToggle = async () => {
        if (!authorId || loadingFollow) return;

        setLoadingFollow(true);
        try {
            if (isFollowing) {
                const success = await unfollowUser(authorId);
                if (success) {
                    setIsFollowing(false);
                    notifySuccess(`Você deixou de seguir ${username}`);
                }
            } else {
                const success = await followUser(authorId);
                if (success) {
                    setIsFollowing(true);
                    notifySuccess(`Você começou a seguir ${username}`);
                }
            }
        } catch (error) {
            notifyError('Erro ao atualizar seguidor');
        } finally {
            setLoadingFollow(false);
        }
    };

    return (
        <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2.5">
                <Link href={profileLink} className="size-8 rounded-full bg-cover bg-center cursor-pointer border border-white/10" style={{ backgroundImage: `url("${userAvatar || '/images/default-avatar.png'}")` }}></Link>
                <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-1">
                        <Link href={profileLink} className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer">{username}</Link>
                        {isVerified && (
                            <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} title="Verified Seller">verified</span>
                        )}
                        <span className="text-text-secondary text-[10px]">•</span>
                        <span className="text-xs font-medium text-text-secondary">{timestamp}</span>

                    </div>
                    <span className="text-[11px] text-text-secondary truncate max-w-[200px]">{location}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {authorId && currentUserId && authorId !== currentUserId && (
                    <button
                        onClick={handleFollowToggle}
                        disabled={loadingFollow}
                        className={`text-xs font-bold transition-colors ${isFollowing
                            ? 'text-text-secondary hover:text-red-400'
                            : 'text-primary hover:text-green-400'
                            }`}
                    >
                        {loadingFollow ? '...' : (isFollowing ? 'Seguindo' : 'Seguir')}
                    </button>
                )}
                {onMenuClick && (
                    <button onClick={onMenuClick} className="text-slate-400 hover:text-white transition-colors p-1">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                )}
            </div>
        </div>
    );
};
