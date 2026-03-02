'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserList } from '@/components/ui/UserList';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';
import { useFollowers } from '@/lib/hooks/useProfile';
import { useSocial } from '@/lib/hooks/useSocial';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { getR2Url } from '@/lib/images';

export default function FollowersScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user: currentUser } = useUser();
    const userId = searchParams.get('id') || undefined;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'mutual'>('all');

    const { followers, loading, error, refetch } = useFollowers(userId);
    const { followUser, unfollowUser, loading: socialLoading } = useSocial();

    // Filter followers based on search and tab
    const filteredUsers = followers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || (activeTab === 'mutual' && user.isFollowing);
        return matchesSearch && matchesTab;
    });

    // Map to UserList format
    const userListData = filteredUsers.map(user => ({
        id: user.id,
        name: user.username,
        username: user.username,
        avatar: getR2Url(user.avatar_url) || '',
        isVerified: user.is_verified,
        isFollowing: user.isFollowing || false,
        mutualFollowers: 0,
    }));

    const handleFollowToggle = async (userId: string, currentlyFollowing: boolean) => {
        if (!currentUser) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        if (socialLoading) return;

        if (currentlyFollowing) {
            await unfollowUser(userId);
        } else {
            await followUser(userId);
        }
        refetch();
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
                            placeholder="Buscar seguidores..."
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-slate-900 placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-text-secondary hover:text-slate-900'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('mutual')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'mutual'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-text-secondary hover:text-slate-900'
                            }`}
                    >
                        Mútuos
                    </button>
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
                        emptyMessage={searchQuery ? 'Nenhum seguidor encontrado' : 'Nenhum seguidor ainda'}
                        onFollowToggle={handleFollowToggle}
                    />
                )}
            </main>

            <MobileNav />
        </div>
    );
}
