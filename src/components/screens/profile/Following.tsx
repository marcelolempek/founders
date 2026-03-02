'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserList } from '@/components/ui/UserList';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';
import { useFollowing } from '@/lib/hooks/useProfile';
import { useSocial } from '@/lib/hooks/useSocial';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { getR2Url } from '@/lib/images';

export default function FollowingScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user: currentUser } = useUser();
    const userId = searchParams.get('id') || undefined;

    const [searchQuery, setSearchQuery] = useState('');

    const { following, loading, error, refetch } = useFollowing(userId);
    const { unfollowUser, loading: socialLoading } = useSocial();

    // Filter following based on search
    const filteredUsers = following.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Map to UserList format
    const userListData = filteredUsers.map(user => ({
        id: user.id,
        name: user.username,
        username: user.username,
        avatar: getR2Url(user.avatar_url) || '',
        isVerified: user.is_verified,
        isFollowing: true, // All users in following list are being followed
    }));

    const handleFollowToggle = async (targetUserId: string, currentlyFollowing: boolean) => {
        if (!currentUser) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        if (socialLoading) return;

        if (currentlyFollowing) {
            const confirmed = confirm('Deixar de seguir este usuário?');
            if (!confirmed) return;
            await unfollowUser(targetUserId);
            refetch();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 w-full max-w-2xl mx-auto pb-20">
                {/* Search */}
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar seguindo..."
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-slate-900 placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <span className="text-sm text-text-secondary">{filteredUsers.length} contas</span>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-4 text-center">
                        <p className="text-red-400 mb-2">{error}</p>
                        <button onClick={refetch} className="text-primary hover:underline">Tentar novamente</button>
                    </div>
                )}

                {/* User List */}
                {!loading && !error && (
                    <UserList
                        users={userListData}
                        emptyMessage={searchQuery ? 'Nenhuma conta encontrada' : 'Você ainda não segue ninguém'}
                        onFollowToggle={handleFollowToggle}
                    />
                )}
            </main>

            <MobileNav />
        </div>
    );
}
