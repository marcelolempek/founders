'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard, toPostCardData } from '@/components/shared/PostCard';
import { FilterModal } from '@/components/ui/FilterModal';
import { useSearchPosts } from '@/lib/hooks/useFeed';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { FeedPost } from '@/lib/database.types';
import { usePersistedPageState } from '@/lib/hooks/usePersistedPageState';

interface FilterOptions {
    category: string | null;
    priceMin: string;
    priceMax: string;
    condition: string | null;
    location: string;
    sortBy: string;
    verifiedOnly: boolean;
}

interface ExplorePageData {
    searchQuery: string;
    filters: FilterOptions;
}

export default function SearchScreen1() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const { restoreState, saveState, isRestored } = usePersistedPageState<ExplorePageData>('/explore');

    // Restore state on mount
    useEffect(() => {
        const restored = restoreState();
        if (restored) {
            if (restored.searchQuery) setSearchQuery(restored.searchQuery);
            if (restored.filters) setFilters(restored.filters);
        }
    }, []);

    // Sync with URL params (but don't override restored state)
    useEffect(() => {
        if (!isRestored) {
            const q = searchParams.get('q');
            if (q !== null) {
                setSearchQuery(q);
            }
        }
    }, [searchParams, isRestored]);
    const [showFilters, setShowFilters] = useState(false);
    const router = useRouter();
    const { openCreatePost, openPostDetail } = useNavigation();
    const [filters, setFilters] = useState<FilterOptions>({
        category: null,
        priceMin: '',
        priceMax: '',
        condition: null,
        location: '',
        sortBy: 'recent',
        verifiedOnly: false,
    });

    const { posts, loading, loadingMore, search, loadMore, hasMore } = useSearchPosts({
        query: searchQuery,
        category: filters.category || undefined,
        priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
        condition: filters.condition || undefined,
        city: filters.location || undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
        limit: 20
    });

    // Infinite scroll observer
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
            loadMore();
        }
    }, [hasMore, loading, loadingMore, loadMore]);

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

    // Sort posts client-side
    const sortedPosts = [...posts].sort((a, b) => {
        switch (filters.sortBy) {
            case 'price-low':
                return (a.price || 0) - (b.price || 0);
            case 'price-high':
                return (b.price || 0) - (a.price || 0);
            default:
                return 0;
        }
    });

    const activeFiltersCount = [
        filters.category,
        filters.priceMin || filters.priceMax,
        filters.condition,
        filters.location,
        filters.verifiedOnly
    ].filter(Boolean).length;

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const clearFilter = (filterKey: keyof FilterOptions) => {
        if (filterKey === 'priceMin' || filterKey === 'priceMax') {
            setFilters(prev => ({ ...prev, priceMin: '', priceMax: '' }));
        } else if (filterKey === 'verifiedOnly') {
            setFilters(prev => ({ ...prev, verifiedOnly: false }));
        } else {
            setFilters(prev => ({ ...prev, [filterKey]: filterKey === 'sortBy' ? 'recent' : null }));
        }
    };

    // Save state when search query or filters change
    useEffect(() => {
        if (searchQuery || Object.values(filters).some(v => v)) {
            saveState({ searchQuery, filters });
        }
    }, [searchQuery, filters, saveState]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 w-full px-0 md:px-4 pt-4 pb-20">
                <div className="mx-auto max-w-5xl flex flex-col gap-6">
                    <section className="flex flex-col gap-4 px-4 md:px-0">
                        {/* Search Input */}
                        <div className="flex gap-2">
                            <div className="relative group flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="material-symbols-outlined text-[#94a3b8] group-focus-within:text-primary transition-colors">search</span>
                                </div>
                                <input
                                    autoFocus={true}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') search();
                                    }}
                                    className="block w-full rounded-2xl border border-white/5 bg-[#1D4165] py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-[#234b73] transition-all shadow-md text-sm md:text-base outline-none"
                                    placeholder="Buscar por serviços ou produtos..."
                                    type="text"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(true)}
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors relative ${activeFiltersCount > 0
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-[#1D4165] text-white hover:bg-[#234b73] border border-white/5'
                                    } `}
                            >
                                <span className="material-symbols-outlined">tune</span>
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-primary">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Active Filters Tags */}
                        {activeFiltersCount > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                {filters.category && (
                                    <button
                                        onClick={() => clearFilter('category')}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                                    >
                                        <span className="capitalize">{filters.category}</span>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                )}
                                {(filters.priceMin || filters.priceMax) && (
                                    <button
                                        onClick={() => clearFilter('priceMin')}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                                    >
                                        <span>
                                            {filters.priceMin && filters.priceMax
                                                ? `R$ ${filters.priceMin} - R$ ${filters.priceMax} `
                                                : filters.priceMin
                                                    ? `Min R$ ${filters.priceMin} `
                                                    : `Max R$ ${filters.priceMax} `
                                            }
                                        </span>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                )}
                                {filters.condition && (
                                    <button
                                        onClick={() => clearFilter('condition')}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                                    >
                                        <span className="capitalize">{filters.condition}</span>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                )}
                                {filters.location && (
                                    <button
                                        onClick={() => clearFilter('location')}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                                    >
                                        <span>{filters.location}</span>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                )}
                                {filters.verifiedOnly && (
                                    <button
                                        onClick={() => clearFilter('verifiedOnly')}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                                    >
                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        <span>Verificados</span>
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Trending Tags */}
                        {/* [].length > 0 check handled by .map([]) which returns empty */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex-shrink-0 flex items-center justify-center h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Sugestões
                            </div>
                        </div>
                    </section>

                    {/* Results Count */}
                    <div className="px-4 md:px-0 flex items-center justify-between">
                        <p className="text-sm text-text-secondary">
                            {sortedPosts.length} {sortedPosts.length === 1 ? 'resultado' : 'resultados'}
                            {searchQuery && ` para "${searchQuery}"`}
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {/* Products Grid */}
                    {!loading && sortedPosts.length > 0 ? (
                        <>
                            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-1 lg:gap-2">
                                {sortedPosts.map((product) => (
                                    <PostCard
                                        key={product.id}
                                        post={toPostCardData(product)}
                                        variant="grid"
                                        onClick={() => openPostDetail(product.id)}
                                        isBookmarked={product.is_saved ?? false}
                                    />
                                ))}
                            </section>
                            {/* Infinite Scroll Trigger */}
                            <div ref={loadMoreRef} className="py-4 flex justify-center">
                                {loadingMore && (
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                                )}
                                {!hasMore && sortedPosts.length > 0 && (
                                    <p className="text-sm text-text-secondary">Fim dos resultados</p>
                                )}
                            </div>
                        </>
                    ) : !loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <span className="material-symbols-outlined text-[64px] text-slate-500 mb-4 opacity-30">search_off</span>
                            <h3 className="text-lg font-bold text-white mb-2">Nenhum resultado encontrado</h3>
                            <p className="text-sm text-text-secondary max-w-sm">
                                Tente ajustar seus filtros ou buscar por outros termos
                            </p>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => setFilters({
                                        category: null,
                                        priceMin: '',
                                        priceMax: '',
                                        condition: null,
                                        location: '',
                                        sortBy: 'recent',
                                        verifiedOnly: false
                                    })}
                                    className="mt-4 px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <div className="fixed bottom-6 right-6 lg:right-1/4 lg:translate-x-32 z-50">
                <button onClick={openCreatePost} className="flex items-center justify-center h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform text-white">
                    <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
            </div>
            <MobileNav />

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
        </div>
    );
}
