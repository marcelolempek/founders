'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { ConfirmModal } from '@/components/ui/Modal';
import { getR2Url } from '@/lib/images';


interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    isFollowing?: boolean;
    bio?: string;
    location?: string;
    mutualFollowers?: number;
}

interface UserListProps {
    users: User[];
    emptyMessage?: string;
    showFollowButton?: boolean;
    onFollowToggle?: (userId: string, currentlyFollowing: boolean) => void;
}

export function UserList({ users, emptyMessage = 'Nenhum usuário encontrado', showFollowButton = true, onFollowToggle }: UserListProps) {
    const [followingState, setFollowingState] = useState<Record<string, boolean>>(
        users.reduce((acc, user) => ({ ...acc, [user.id]: user.isFollowing || false }), {})
    );
    const [userToUnfollow, setUserToUnfollow] = useState<string | null>(null);

    const { user: currentUser } = useCurrentUser();

    const handleFollowToggle = (userId: string) => {
        const currentlyFollowing = followingState[userId];
        if (currentlyFollowing) {
            setUserToUnfollow(userId);
        } else {
            toggleFollow(userId, false);
        }
    };

    const toggleFollow = (userId: string, currentlyFollowing: boolean) => {
        setFollowingState(prev => ({ ...prev, [userId]: !currentlyFollowing }));
        onFollowToggle?.(userId, currentlyFollowing);
    };

    const confirmUnfollow = () => {
        if (!userToUnfollow) return;
        toggleFollow(userToUnfollow, true);
        setUserToUnfollow(null);
    };

    const getProfileLink = (targetId: string) => {
        return targetId === currentUser?.id ? '/profile/profile' : `/profile/${targetId}`;
    };

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-text-secondary/50 mb-4">group_off</span>
                <p className="text-text-secondary">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-slate-200">
            {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-3 px-4 hover:bg-white/50 transition-colors">
                    <Link href={getProfileLink(user.id)} className="flex-shrink-0">
                        <div
                            className="size-12 rounded-full border-2 border-slate-200 overflow-hidden flex-shrink-0"
                        >
                            <img
                                src={getR2Url(user.avatar) || '/images/default-avatar.png'}
                                alt={user.username}
                                className="size-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                }}
                            />
                        </div>

                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link href={getProfileLink(user.id)} className="flex items-center gap-1.5 hover:underline">
                            <span className="font-bold text-slate-900 truncate">{user.name}</span>
                            {user.isVerified && (
                                <span className="material-symbols-outlined text-primary text-[16px] icon-filled">verified</span>
                            )}
                        </Link>
                        <p className="text-sm text-text-secondary truncate">@{user.username}</p>
                        {user.mutualFollowers && user.mutualFollowers > 0 && (
                            <p className="text-xs text-text-secondary mt-0.5">
                                {user.mutualFollowers} seguidor{user.mutualFollowers > 1 ? 'es' : ''} em comum
                            </p>
                        )}
                    </div>
                    {showFollowButton && (
                        <button
                            onClick={() => handleFollowToggle(user.id)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${followingState[user.id]
                                ? 'bg-white border border-slate-200 text-slate-900 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {followingState[user.id] ? 'Seguindo' : 'Seguir'}
                        </button>
                    )}
                </div>
            ))}

            <ConfirmModal
                isOpen={!!userToUnfollow}
                onClose={() => setUserToUnfollow(null)}
                onConfirm={confirmUnfollow}
                title="Deixar de seguir"
                message={`Deseja parar de seguir @${users.find(u => u.id === userToUnfollow)?.username}?`}
                confirmText="Deixar de seguir"
                variant="danger"
            />
        </div>
    );
}
