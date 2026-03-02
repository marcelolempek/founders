'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';
import { FeedPostCard } from '@/components/shared/FeedPostCard';
import { StoriesViewer } from '@/components/stories/StoriesViewer';
import { useFeed } from '@/lib/hooks/useFeed';
import { useSocial } from '@/lib/hooks/useSocial';
import { useUser } from '@/context/UserContext';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { useNavigation } from '@/context/NavigationContext';
import { usePersistedPageState } from '@/lib/hooks/usePersistedPageState';
import { supabase } from '@/lib/supabase';
import type { FeedPost } from '@/lib/database.types';
import { ConfirmModal } from '@/components/ui/Modal';
import { useUpdatePostStatus } from '@/lib/hooks/usePosts';
import { toast } from '@/components/ui/Toast';
import { getR2Url } from '@/lib/images';


interface FeedPageData {
    followedUsers: any[];
}

interface StoryViewerState {
    isOpen: boolean;
    userId: string;
    username: string;
    userAvatar: string;
}

export default function FeedScreenHome1() {
    const { posts, loading, error, hasMore, loadMore, refresh } = useFeed({ limit: 20 });
    const { openCreatePost } = useNavigation();
    const { getFollowedUsers, followUser } = useSocial();
    const { user, loading: authLoading } = useUser();
    const [followedUsers, setFollowedUsers] = useState<any[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [suggestedOffset, setSuggestedOffset] = useState(0);
    const [loadingSuggested, setLoadingSuggested] = useState(false);
    const [hasMoreSuggested, setHasMoreSuggested] = useState(true);

    const { restoreState, saveState, isRestored } = usePersistedPageState<FeedPageData>('/');

    // Delete logic
    const { updateStatus } = useUpdatePostStatus();
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const checkDelete = (postId: string) => {
        setPostToDelete(postId);
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;
        const success = await updateStatus(postToDelete, 'archived');
        if (success) {
            refresh(); // Reload feed to remove item
            toast.success('Anúncio excluído com sucesso');
        }
        setPostToDelete(null);
    };

    // Restore followed users on mount
    useEffect(() => {
        const restored = restoreState();
        if (restored && restored.followedUsers) {
            setFollowedUsers(restored.followedUsers);
        } else {
            // Load fresh data only if not restored
            getFollowedUsers().then(users => setFollowedUsers(users));
        }
    }, []);

    // Load suggested users with pagination
    const loadSuggestedUsers = async (offset: number = 0) => {
        if (authLoading || loadingSuggested || !hasMoreSuggested) return;

        setLoadingSuggested(true);

        try {
            const BATCH_SIZE = 10;
            let query = supabase
                .from('profiles')
                .select('id, username, avatar_url, is_verified')
                .range(offset, offset + BATCH_SIZE - 1)
                .order('created_at', { ascending: false });

            if (user) {
                query = query.neq('id', user.id);
            }

            const { data } = await query;

            if (data) {
                // Client-side filter to exclude already followed users
                const followedIds = new Set(followedUsers.map((u: any) => u.id));
                const filtered = data.filter((u: any) => !followedIds.has(u.id) && u.id !== user?.id);

                if (offset === 0) {
                    setSuggestedUsers(filtered);
                } else {
                    setSuggestedUsers(prev => [...prev, ...filtered]);
                }

                // If we got less than BATCH_SIZE, we've reached the end
                setHasMoreSuggested(data.length === BATCH_SIZE);
                setSuggestedOffset(offset + BATCH_SIZE);
            }
        } catch (error) {
            console.error('Error loading suggested users:', error);
        } finally {
            setLoadingSuggested(false);
        }
    };

    useEffect(() => {
        if (followedUsers.length >= 0) {
            loadSuggestedUsers(0);
        }
    }, [user, followedUsers, authLoading]);

    // Save followed users when they change
    useEffect(() => {
        if (followedUsers.length > 0) {
            saveState({ followedUsers });
        }
    }, [followedUsers, saveState]);

    const handleFollow = async (userId: string) => {
        const success = await followUser(userId);
        if (success) {
            // Remove from suggestions and add to followed
            const userToFollow = suggestedUsers.find(u => u.id === userId);
            if (userToFollow) {
                setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
                setFollowedUsers(prev => [...prev, userToFollow]);
            }
        }
    };

    // Story viewer state
    const [storyViewer, setStoryViewer] = useState<{
        isOpen: boolean;
        initialUserId: string;
        users: any[];
    }>({
        isOpen: false,
        initialUserId: '',
        users: [],
    });

    // Track viewed stories locally to avoid backend complexity for now
    const [viewedStories, setViewedStories] = useState<Record<string, string>>({});

    useEffect(() => {
        const stored = localStorage.getItem('story_views');
        if (stored) {
            setViewedStories(JSON.parse(stored));
        }
    }, []);

    const markStoryAsViewed = (userId: string) => {
        const newViews = {
            ...viewedStories,
            [userId]: new Date().toISOString()
        };
        setViewedStories(newViews);
        localStorage.setItem('story_views', JSON.stringify(newViews));
    };

    const hasNewStories = (user: any) => {
        if (!user.latest_post_at) return false;

        const lastViewed = viewedStories[user.id];
        if (!lastViewed) return true;

        return new Date(user.latest_post_at) > new Date(lastViewed);
    };

    const openStoryViewer = (userId: string, sectionUsers: any[]) => {
        markStoryAsViewed(userId);
        setStoryViewer({
            isOpen: true,
            initialUserId: userId,
            users: sectionUsers,
        });
    };

    const closeStoryViewer = () => {
        setStoryViewer({
            isOpen: false,
            initialUserId: '',
            users: [],
        });
    };

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const suggestedScrollRef = useRef<HTMLDivElement>(null);

    // Infinite scroll observer for posts
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);

    // Infinite scroll observer for suggested users
    const handleSuggestedObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreSuggested && !loadingSuggested) {
            loadSuggestedUsers(suggestedOffset);
        }
    }, [hasMoreSuggested, loadingSuggested, suggestedOffset]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleObserver]);

    // Set up observer for suggested users horizontal scroll
    useEffect(() => {
        const suggestedObserver = new IntersectionObserver(handleSuggestedObserver, {
            root: null,
            rootMargin: '200px',
            threshold: 0.1,
        });

        if (suggestedScrollRef.current) {
            suggestedObserver.observe(suggestedScrollRef.current);
        }

        return () => {
            suggestedObserver.disconnect();
        };
    }, [handleSuggestedObserver]);

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 px-0 sm:px-4 lg:px-8">
                    <SidebarLeft />
                    <section className="col-span-1 md:col-span-9 lg:col-span-6 flex flex-col gap-6 pb-20">
                        {/* Stories / Quick Actions Bar */}
                        <div className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-0 [scrollbar-width:none] md:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block md:[&::-webkit-scrollbar]:h-2 md:[&::-webkit-scrollbar-thumb]:bg-slate-100 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-track]:bg-black/20">
                            {/* Post Button (Your Story) */}
                            <button onClick={openCreatePost} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer flex-shrink-0">
                                <div className="size-[68px] rounded-full bg-[#1D4165] p-[2px] relative group border border-white/5">
                                    <div className="size-full rounded-full border-2 border-[#1D4165] bg-[#1D4165] overflow-hidden">
                                        <div
                                            className="size-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                                            style={{ backgroundImage: `url("${getR2Url(user?.user_metadata?.avatar_url) || '/images/default-avatar.png'}")` }}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-[#1D4165] z-10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[12px] text-white font-bold block">add</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-white truncate max-w-[72px]">Postar</span>
                            </button>

                            {/* Followed Users Stories */}
                            {followedUsers.map((followedUser) => {
                                const isNew = hasNewStories(followedUser);
                                return (
                                    <button
                                        key={followedUser.id}
                                        onClick={() => openStoryViewer(followedUser.id, followedUsers)}
                                        className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer flex-shrink-0 group"
                                    >
                                        <div className={`size-[68px] rounded-full p-[2px] ${isNew
                                            ? 'bg-gradient-to-tr from-[#fec053] to-[#ff2192]'
                                            : 'bg-surface-light/20' // Gray ring for seen/old
                                            } group-hover:scale-105 transition-transform`}>
                                            <div className="size-full rounded-full border-2 border-white bg-white overflow-hidden">
                                                <div
                                                    className="size-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url("${getR2Url(followedUser.avatar_url) || '/images/default-avatar.png'}")` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors truncate max-w-[72px]">
                                            {followedUser.username}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Suggested Users */}
                            {suggestedUsers.filter(u => u.id !== user?.id).map((suggestedUser) => (
                                <div
                                    key={suggestedUser.id}
                                    className="flex flex-col items-center gap-2 min-w-[72px] flex-shrink-0 relative group"
                                >
                                    <button
                                        onClick={() => openStoryViewer(suggestedUser.id, suggestedUsers)}
                                        className="size-[68px] rounded-full p-[2px] bg-gradient-to-tr from-slate-700 to-slate-500 group-hover:scale-105 transition-transform cursor-pointer"
                                    >
                                        <div className="size-full rounded-full border-2 border-[#1D4165] bg-[#1D4165] overflow-hidden">
                                            <div
                                                className="size-full bg-cover bg-center opacity-60 group-hover:opacity-100 transition-opacity"
                                                style={{ backgroundImage: `url("${getR2Url(suggestedUser.avatar_url) || '/images/default-avatar.png'}")` }}
                                            />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleFollow(suggestedUser.id)}
                                        className="absolute bottom-12 right-0 bg-primary rounded-full p-1 border-2 border-[#1D4165] z-10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                                        title="Seguir"
                                    >
                                        <span className="material-symbols-outlined text-[12px] text-white font-bold block">person_add</span>
                                    </button>
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors truncate max-w-[72px]">
                                        {suggestedUser.username}
                                    </span>
                                </div>
                            ))}

                            {/* Sentinel element for infinite scroll */}
                            {hasMoreSuggested && (
                                <div
                                    ref={suggestedScrollRef}
                                    className="flex items-center justify-center min-w-[72px] flex-shrink-0"
                                >
                                    {loadingSuggested && (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    )}
                                </div>
                            )}
                        </div>



                        {/* Error State */}
                        {error && (
                            <div className="mx-4 sm:mx-0 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                                <p>{error}</p>
                                <button onClick={refresh} className="mt-2 text-sm underline">Tentar novamente</button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && posts.length === 0 && !error && (
                            <div className="mx-4 sm:mx-0 p-8 border border-white/10 rounded-lg text-center" style={{ backgroundColor: '#1d4165' }}>
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inventory_2</span>
                                <p className="text-slate-400">Nenhum anúncio encontrado</p>
                                <button onClick={openCreatePost} className="mt-4 inline-block text-primary hover:underline">
                                    Seja o primeiro a anunciar!
                                </button>
                            </div>
                        )}

                        {posts.map((post) => (
                            <FeedPostCard
                                key={post.id}
                                postId={post.id}
                                authorId={post.user_id}
                                username={post.author_username ?? 'Unknown'}
                                userAvatar={getR2Url(post.author_avatar) || ''}
                                timestamp={formatRelativeTime(post.created_at)}
                                location={`${post.location_city || ''}, ${post.location_state || ''}`}
                                distanceKm={post.distance_km}
                                imageUrl={getR2Url(post.cover_image_url) || ''}
                                price={post.type === 'sale' ? formatCurrency(post.price || 0, post.currency) : undefined}
                                title={post.title}
                                description={post.description}
                                postType={post.type}
                                isVerified={post.author_is_verified ?? false}
                                hasComments={(post.comments_count ?? 0) > 0}
                                isLiked={post.is_liked ?? false}
                                isSaved={post.is_saved ?? false}
                                likes={post.likes_count}
                                commentsCount={post.comments_count}
                                condition={post.condition}
                                isFollowed={post.author_is_followed}
                                onDelete={() => checkDelete(post.id)}
                            />
                        ))}

                        {/* Load More Trigger / Loading Indicator */}
                        <div ref={loadMoreRef} className="flex justify-center py-8">
                            {loading && (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            )}
                            {!loading && !hasMore && posts.length > 0 && (
                                <p className="text-slate-400 text-sm">Você viu todos os anúncios</p>
                            )}
                        </div>
                    </section>
                    <SidebarRight />
                </main>
            </div>

            <StoriesViewer
                users={storyViewer.users}
                initialUserId={storyViewer.initialUserId}
                isOpen={storyViewer.isOpen}
                onClose={closeStoryViewer}
            />

            <ConfirmModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Deletar Anúncio"
                message="Tem certeza que deseja excluir permanentemente este anúncio?"
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    );
}
