'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import type { FeedPost } from '@/lib/database.types';
import { getImageUrl, getR2Url, getPostImageUrl } from '@/lib/images';

interface UseFeedOptions {
  category?: string | null;
  limit?: number;
}

interface UseFeedReturn {
  posts: FeedPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { category = null, limit = 20 } = options;
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();
  const offsetRef = useRef(0);
  const fetchIdRef = useRef(0);

  const fetchPosts = useCallback(async (reset = false) => {
    const fetchId = ++fetchIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offsetRef.current;

      // Use the get_feed_posts RPC function
      const { data, error: fetchError } = await (supabase as any).rpc('get_feed_posts', {
        p_user_id: user?.id || undefined,
        p_category: category || undefined,
        p_limit: limit,
        p_offset: currentOffset,
      });

      // If this is not the latest fetch, ignore the result
      if (fetchId !== fetchIdRef.current) return;

      if (fetchError) throw fetchError;

      if (data) {
        if (reset) {
          setPosts((data as any[]) || []);
          offsetRef.current = limit;
          setOffset(limit);
        } else {
          setPosts(prev => [...prev, ...((data as any[]) || [])]);
          offsetRef.current += limit;
          setOffset(prev => prev + limit);
        }
        setHasMore(data.length === limit);
      }
    } catch (err: unknown) {
      if (fetchId !== fetchIdRef.current) return; // Ignore errors from stale fetches too
      const message = err instanceof Error ? err.message : 'Erro ao carregar posts';
      setError(message);
      console.error('Feed error:', err);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [category, limit, user?.id]);

  // Initial fetch
  useEffect(() => {
    offsetRef.current = 0;
    fetchPosts(true);
  }, [fetchPosts]);

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchPosts(false);
    }
  };

  const refresh = async () => {
    offsetRef.current = 0;
    setOffset(0);
    await fetchPosts(true);
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// Hook for searching posts with infinite scroll
interface UseSearchOptions {
  query: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  state?: string;
  city?: string;
  verifiedOnly?: boolean;
  limit?: number;
}

export function useSearchPosts(options: UseSearchOptions) {
  const { query, category, priceMin, priceMax, condition, state, city, verifiedOnly, limit = 20 } = options;
  const { user } = useUser();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const transformPosts = useCallback((data: Record<string, unknown>[], savedPostIds: Set<string>): FeedPost[] => {
    return data.map((post: Record<string, unknown>) => ({
      id: post.id as string,
      user_id: post.user_id as string,
      title: post.title as string,
      description: post.description as string,
      price: post.price as number | null,
      currency: post.currency as string,
      location_city: post.location_city as string | null,
      location_state: post.location_state as string | null,
      latitude: post.latitude as number | null,
      longitude: post.longitude as number | null,
      postal_code: post.postal_code as string | null,
      neighborhood: post.neighborhood as string | null,
      distance_km: null, // Calculated in RPC, not available in simple search yet or needs calculation
      category: (post.category || undefined) as string,
      condition: (post.condition || 'good') as any, // Cast to any to satisfy enum
      views_count: post.views_count as number,
      likes_count: post.likes_count as number,
      comments_count: post.comments_count as number,
      status: post.status as FeedPost['status'],
      type: post.type as FeedPost['type'],
      shares_count: (post.shares_count as number) || 0,
      is_boosted: post.is_boosted as boolean || false,
      boosted_until: post.boosted_until as string | null,
      ships_nationwide: post.ships_nationwide as boolean || false,
      created_at: post.created_at as string,
      author_username: (post.user as Record<string, unknown>)?.username as string || 'Unknown',
      author_avatar: getR2Url((post.user as Record<string, unknown>)?.avatar_url as string || null),
      author_is_verified: (post.user as Record<string, unknown>)?.is_verified as boolean || false,
      author_reputation_score: (post.user as Record<string, unknown>)?.reputation_score as number || null,
      author_sales_count: (post.user as Record<string, unknown>)?.sales_count as number || null,
      // R2-aware cover image URL construction
      cover_image_url: (() => {
        const images = post.images as Record<string, unknown>[] | undefined;
        if (!images || images.length === 0) return null;

        const coverImg = images.find((i: Record<string, unknown>) => i.is_cover) || images[0];
        if (!coverImg) return null;

        return getPostImageUrl(
          post.id as string,
          (coverImg.image_id as string) || null,
          (coverImg.url as string) || null,
          'feed'
        );
      })(),
      is_liked: false,
      is_saved: savedPostIds.has(post.id as string),
      relevance_score: null, // Not calculated in search, only in feed RPC
      author_is_followed: null, // Not available in simple search
    })) as FeedPost[];
  }, []);

  const fetchPosts = useCallback(async (currentOffset: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Determine select string based on verified filter
      // If verifiedOnly, we need !inner to filter by the user relation status
      const selectString = verifiedOnly
        ? `*, user:profiles!posts_user_id_fkey!inner(username, avatar_url, is_verified, phone, reputation_score, sales_count), images:post_images(url, image_id, is_cover)`
        : `*, user:profiles!posts_user_id_fkey(username, avatar_url, is_verified, phone, reputation_score, sales_count), images:post_images(url, image_id, is_cover)`;

      let queryBuilder = supabase
        .from('posts')
        .select(selectString)
        .eq('status', 'active')
        .eq('type', 'sale')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1) as any;

      // Apply verified filter if needed
      if (verifiedOnly) {
        queryBuilder = queryBuilder.eq('user.is_verified', true);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }
      if (priceMin !== undefined) {
        queryBuilder = queryBuilder.gte('price', priceMin);
      }
      if (priceMax !== undefined) {
        queryBuilder = queryBuilder.lte('price', priceMax);
      }
      if (condition) {
        queryBuilder = queryBuilder.eq('condition', condition as any);
      }
      if (state) {
        queryBuilder = queryBuilder.eq('location_state', state);
      }
      if (city) {
        queryBuilder = queryBuilder.ilike('location_city', city);
      }

      const { data, error: fetchError } = await queryBuilder;

      if (fetchError) throw fetchError;

      let savedPostIds: Set<string> = new Set();
      if (user && data && (data as any[]).length > 0) {
        const postIds = (data as any[]).map((p: any) => p.id);
        const { data: savedPosts } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        savedPostIds = new Set((savedPosts as any[])?.map((sp: any) => sp.post_id) || []);
      }

      const transformedPosts = transformPosts(data || [], savedPostIds);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      setHasMore(data?.length === limit);
      setOffset(currentOffset + limit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na busca';
      setError(message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, category, priceMin, priceMax, condition, state, city, limit, user?.id, transformPosts]);

  const search = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchPosts(0, false);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(offset, true);
    }
  }, [fetchPosts, offset, loadingMore, hasMore]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, category, priceMin, priceMax, condition, state, city, verifiedOnly]);

  return { posts, loading, loadingMore, error, search, loadMore, hasMore };
}
