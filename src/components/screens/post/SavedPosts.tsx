'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { Post } from '@/lib/database.types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useNavigation } from '@/context/NavigationContext';
import { PostCard, toPostCardData } from '@/components/shared/PostCard';

export default function SavedPostsScreen() {
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toggleBookmark } = useBookmarks();
    const { openPostDetail } = useNavigation();

    useEffect(() => {
        const loadSavedPosts = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('saved_posts')
                    .select(`
                        post:posts (
                            *,
                            user:profiles!posts_user_id_fkey(username, avatar_url),
                            images:post_images(url, image_id, is_cover)
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching saved:", error);
                } else if (data) {
                    const posts = data.map((item: any) => item.post).filter(Boolean);
                    setSavedPosts(posts);
                }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadSavedPosts();
    }, []);

    // Filter posts by search query
    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) return savedPosts;
        const q = searchQuery.toLowerCase();
        return savedPosts.filter(post =>
            (post.title?.toLowerCase().includes(q)) ||
            (post.description?.toLowerCase().includes(q))
        );
    }, [savedPosts, searchQuery]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            {/*  Desktop Sidebar (Simplified) */}
            <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-slate-100/50 h-full flex-shrink-0 z-20 p-6">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-slate-900 mb-8">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar ao Feed
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Salvos</h1>
            </aside>

            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-100">
                {/*  Mobile Header  */}
                <div className="md:hidden sticky top-0 z-30 bg-slate-100/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                    <Link href="/" className="text-gray-400 hover:text-slate-900">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900">Itens Salvos</h1>
                    <div className="w-6"></div>
                </div>

                <div className="mobile-container pb-24 md:pb-10 pt-4 md:pt-10 px-4 md:px-0">
                    <div className="flex flex-col gap-6 max-w-[960px] mx-auto w-full">

                        <div className="hidden md:block">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Seus Itens Salvos</h1>
                            <p className="text-gray-400">{filteredPosts.length} itens guardados para depois</p>
                        </div>

                        {/* Search Section */}
                        {savedPosts.length > 0 && (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar nos seus itens salvos..."
                                    className="bg-transparent text-slate-900 text-sm w-full focus:outline-none placeholder-gray-500"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-slate-900">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                            </div>
                        ) : savedPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">bookmark_border</span>
                                <h3 className="text-lg font-bold text-gray-400">Nenhum item salvo</h3>
                                <p className="mb-4">Salve anúncios para vê-los aqui.</p>
                                <Link href="/" className="text-primary hover:underline">Explorar Feed</Link>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">filter_alt_off</span>
                                <h3 className="text-lg font-bold text-gray-400">Nenhum item nesta categoria</h3>
                                <p className="mb-4">Tente outro filtro.</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-primary hover:underline"
                                >
                                    Ver todos
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:gap-6">
                                {filteredPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={toPostCardData(post)}
                                        variant="grid"
                                        onClick={() => openPostDetail(post.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
