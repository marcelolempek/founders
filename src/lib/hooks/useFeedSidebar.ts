'use client';

import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { getImageUrl, getR2Url, getPostImageUrl } from '@/lib/images';

// Hook for trending categories
export function useTrendingCategories(limit: number = 5) {
    const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);

                // Get posts from last 30 days, group by category
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data, error } = await supabase
                    .from('posts')
                    .select('category')
                    .eq('status', 'active')
                    .eq('type', 'sale')
                    .gte('created_at', thirtyDaysAgo.toISOString());

                if (error) throw error;

                // Count by category
                const categoryCounts: Record<string, number> = {};
                data?.forEach((post: any) => {
                    if (post.category) {
                        categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
                    }
                });

                // Sort and limit
                const sorted = Object.entries(categoryCounts)
                    .map(([category, count]) => ({ category, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, limit);

                setCategories(sorted);
            } catch (err) {
                console.error('Error fetching trending categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, [limit]);

    return { categories, loading };
}

// Hook for suggested sellers
export function useSuggestedSellers(limit: number = 3) {
    const [sellers, setSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                setLoading(true);
                const user = await getCurrentUser();

                if (!user) {
                    setSellers([]);
                    setLoading(false);
                    return;
                }

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                // Get users already followed
                const { data: followedUsers } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', user.id);

                const followedIds = followedUsers?.map((f: any) => f.following_id) || [];

                // Build query
                let query = supabase
                    .from('profiles')
                    .select('id, username, avatar_url, reputation_score, sales_count, last_seen_at')
                    .neq('id', user.id)
                    .gte('reputation_score', 4.0)
                    .gt('sales_count', 0)
                    .gte('last_seen_at', thirtyDaysAgo.toISOString());

                // Only add the NOT IN filter if there are followed users
                if (followedIds.length > 0) {
                    query = query.not('id', 'in', `(${followedIds.join(',')})`);
                }

                const { data, error } = await query
                    .order('reputation_score', { ascending: false })
                    .order('sales_count', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                setSellers(data || []);
            } catch (err) {
                console.error('Error fetching suggested sellers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggested();
    }, [limit]);

    return { sellers, loading };
}

// Hook for user's active listings
export function useMyActiveListings(limit: number = 4) {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const user = await getCurrentUser();

                if (!user) {
                    setListings([]);
                    setLoading(false);
                    return;
                }

                const { data, error } = await (supabase.rpc as any)(
                    'get_my_active_listings',
                    {
                        p_user_id: user.id,
                        p_limit: limit
                    }
                );

                if (error) throw error;

                console.log('RPC retorno:', data);

                const cdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

                const mapped = (data || []).map((item: any) => {
                    let coverImageUrl = null;
                    if (item.images && item.images.length > 0) {
                        const coverImg = item.images.find((img: any) => img.is_cover) || item.images[0];
                        coverImageUrl = getPostImageUrl(item.id, coverImg.image_id, coverImg.url, 'feed');
                    }

                    return {
                        ...item,
                        cover_image_url: coverImageUrl,
                    };
                });

                setListings(mapped);

            } catch (err) {
                console.error('Error fetching active listings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [limit]);

    return { listings, loading };
}