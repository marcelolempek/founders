'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useNavigation } from '@/context/NavigationContext';
import { usePersistedPageState } from '@/lib/hooks/usePersistedPageState';
import { getR2Url } from '@/lib/images';


interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    bio: string;
    is_verified?: boolean;
}

interface DiscoverPageData {
    searchQuery: string;
    followBackUsers: Profile[];
    suggestedUsers: Profile[];
    followingUsers: Profile[];
    currentUserId: string | null;
}

export default function DiscoverPeople() {
    const [searchQuery, setSearchQuery] = useState('');
    const [followBackUsers, setFollowBackUsers] = useState<Profile[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
    const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { restoreState, saveState, isRestored } = usePersistedPageState<DiscoverPageData>('/discover');
    const hasLoadedRef = useRef(false);

    // Restore state on mount
    useEffect(() => {
        const restored = restoreState();
        if (restored) {
            setSearchQuery(restored.searchQuery || '');
            setFollowBackUsers(restored.followBackUsers || []);
            setSuggestedUsers(restored.suggestedUsers || []);
            setFollowingUsers(restored.followingUsers || []);
            setCurrentUserId(restored.currentUserId || null);
            setLoading(false);
            hasLoadedRef.current = true;
        }
    }, []);

    // Save state when data changes (after initial load)
    useEffect(() => {
        if (!loading && hasLoadedRef.current) {
            saveState({
                searchQuery,
                followBackUsers,
                suggestedUsers,
                followingUsers,
                currentUserId
            });
        }
    }, [searchQuery, followBackUsers, suggestedUsers, followingUsers, currentUserId, loading, saveState]);

    useEffect(() => {
        // Skip loading if we already restored state
        if (isRestored) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                let myFollowingIds = new Set();
                let toFollowBack: Profile[] = [];

                if (user) {
                    setCurrentUserId(user.id);
                    // 1. Fetch Follow Back Candidates (Only if logged in)

                    // Get my followers
                    const { data: followers } = await supabase
                        .from('follows')
                        .select('follower_id, follower:profiles!follows_follower_id_fkey(*)')
                        .eq('following_id', user.id) as { data: any[] | null };

                    // Get who I follow
                    const { data: following } = await supabase
                        .from('follows')
                        .select('following_id, following:profiles!follows_following_id_fkey(*)')
                        .eq('follower_id', user.id) as { data: any[] | null };

                    myFollowingIds = new Set(following?.map((f: any) => f.following_id) || []);

                    // People I follow
                    const followedProfiles = following?.map((f: any) => f.following).filter(Boolean) || [];
                    setFollowingUsers(followedProfiles as Profile[]);

                    // Filter: Followers NOT in Getting Following
                    toFollowBack = followers
                        ?.filter((f: any) => !myFollowingIds.has(f.follower_id))
                        .map((f: any) => f.follower) || [];

                    setFollowBackUsers(toFollowBack as Profile[]);
                } else {
                    // If not logged in, clear sections
                    setFollowBackUsers([]);
                    setFollowingUsers([]);
                }

                // 2. Fetch Suggestions (Public)
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .limit(50); // Increased limit for client-side search approximation

                if (user) {
                    query = query.neq('id', user.id);
                }

                const { data: suggestions } = await query as { data: any[] | null };

                // If logged in, exclude already followed and follow-back candidates from suggestions
                let cleanSuggestions = suggestions || [];
                if (user) {
                    const excludeIds = new Set([
                        ...Array.from(myFollowingIds),
                        ...toFollowBack.map((u: Profile) => u.id),
                        user.id // Ensure current user is excluded
                    ]);
                    cleanSuggestions = suggestions?.filter(p => !excludeIds.has(p.id)) || [];
                }

                setSuggestedUsers(cleanSuggestions as Profile[]);
                hasLoadedRef.current = true;

            } catch (error) {
                console.error("Error loading discover data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleFollow = async (targetId: string) => {
        if (!currentUserId) return;

        // Find user in any of the lists
        const targetUser = [...followBackUsers, ...suggestedUsers].find(u => u.id === targetId);
        if (!targetUser) return;

        // Optimistic UI update
        setFollowBackUsers(prev => prev.filter(u => u.id !== targetId));
        setSuggestedUsers(prev => prev.filter(u => u.id !== targetId));
        setFollowingUsers(prev => [targetUser, ...prev]);

        try {
            await supabase.from('follows').insert({
                follower_id: currentUserId,
                following_id: targetId
            } as any);
        } catch (error) {
            console.error("Error following:", error);
            // Revert state if needed, but let's keep it simple for now
        }
    };

    const handleUnfollow = async (targetId: string) => {
        if (!currentUserId) return;

        // Optimistic UI update
        setFollowingUsers(prev => prev.filter(u => u.id !== targetId));

        try {
            await supabase.from('follows').delete().match({
                follower_id: currentUserId,
                following_id: targetId
            });
        } catch (error) {
            console.error("Error unfollowing:", error);
        }
    };

    // Filter suggestions based on Search Query
    const filteredSuggestions = suggestedUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#0E2741] text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0E2741]/95 backdrop-blur-md pt-4 pb-2 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/" className="text-white hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                        </Link>
                        <div className="flex-1 relative max-w-2xl">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Pesquise por aliados"
                                className="w-full bg-[#1D4165] text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400 transition-all border border-white/5 shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto w-full px-4 mt-6 flex flex-col gap-8">

                {/* 1. Follow Back Section */}
                {followBackUsers.length > 0 && (
                    <section>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">Contas para seguir de volta</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {followBackUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-[#1D4165] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-white/10 flex-shrink-0"
                                            style={{ backgroundImage: `url(${getR2Url(user.avatar_url) || '/images/default-avatar.png'})` }}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-sm truncate text-white">{user.username}</span>
                                                {user.is_verified && (
                                                    <span className="material-symbols-outlined text-blue-500 text-[14px] filled flex-shrink-0">verified</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 truncate">{user.bio || 'Aliado do Reino'}</span>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2 ml-3">
                                        <button
                                            onClick={() => handleFollow(user.id)}
                                            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all whitespace-nowrap shadow-lg shadow-primary/20"
                                        >
                                            Seguir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. Following Section (NEW) */}
                {followingUsers.length > 0 && (
                    <section>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">Pessoas que você segue</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {followingUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-[#1D4165] rounded-xl border border-white/5 transition-all">
                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-white/10 flex-shrink-0"
                                            style={{ backgroundImage: `url(${getR2Url(user.avatar_url) || '/images/default-avatar.png'})` }}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-sm truncate text-white">{user.username}</span>
                                                {user.is_verified && (
                                                    <span className="material-symbols-outlined text-blue-500 text-[14px] filled flex-shrink-0">verified</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 truncate">{user.bio || 'Seguindo'}</span>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2 ml-3">
                                        <button
                                            onClick={() => handleUnfollow(user.id)}
                                            className="bg-white/5 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all whitespace-nowrap"
                                        >
                                            Seguindo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Suggestions Section */}
                <section>
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-white">Sugestões de aliados</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-full flex justify-center p-8">
                                <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></span>
                            </div>
                        ) : filteredSuggestions.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-[#1D4165] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary/30 transition-colors flex-shrink-0"
                                        style={{ backgroundImage: `url(${getR2Url(user.avatar_url) || '/images/default-avatar.png'})` }}
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm truncate group-hover:text-primary transition-colors text-white">{user.username}</span>
                                            {user.is_verified && (
                                                <span className="material-symbols-outlined text-blue-500 text-[14px] filled flex-shrink-0">verified</span>
                                            )}
                                        </div>
                                        {user.bio && <span className="text-xs text-slate-400 truncate">{user.bio}</span>}
                                    </div>
                                </Link>
                                <div className="flex items-center gap-3 ml-3">
                                    {/* Hide Follow button if not logged in */}
                                    {currentUserId && (
                                        <button
                                            onClick={() => handleFollow(user.id)}
                                            className="bg-white/5 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary hover:border-primary transition-all whitespace-nowrap"
                                        >
                                            Seguir
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
