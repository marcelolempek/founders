'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';
import { toast } from '@/components/ui/Toast';
import { getImageUrl } from '@/lib/images';

// Extended profile with counts
export interface ProfileWithStats extends Profile {
    followers_count: number;
    following_count: number;
    posts_count: number;
    sold_count: number;
}

// Hook for fetching a user's profile with stats
export function useProfile(userId?: string | null) {
    const [profile, setProfile] = useState<ProfileWithStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let targetUserId = userId;

            // If no userId provided, get current user
            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setError('Usuário não autenticado');
                    return;
                }
                targetUserId = currentUser.id;
            }

            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (profileError) throw profileError;

            // Fetch all stats in one RPC call (optimized!)
            // @ts-ignore - get_profile_stats RPC exists in database
            const { data: stats, error: statsError } = await (supabase as any)
                .rpc('get_profile_stats', { p_user_id: targetUserId });

            if (statsError) {
                console.warn('Stats fetch error:', statsError);
                // Fallback to empty stats if RPC fails
                setProfile({
                    ...(profileData as Profile),
                    followers_count: 0,
                    following_count: 0,
                    posts_count: 0,
                    sold_count: 0,
                });
            } else {
                setProfile({
                    ...(profileData as Profile),
                    followers_count: stats?.followers_count || 0,
                    following_count: stats?.following_count || 0,
                    posts_count: stats?.posts_count || 0,
                    sold_count: stats?.sold_count || 0,
                });
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, refetch: fetchProfile };
}

// Interface for follower/following user
export interface FollowUser {
    id: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
    bio: string | null;
    isFollowing?: boolean;
    mutualFollowers?: number;
}

// Hook for fetching followers
export function useFollowers(userId?: string | null) {
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFollowers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let targetUserId = userId;

            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setError('Usuário não autenticado');
                    return;
                }
                targetUserId = currentUser.id;
            }

            // Get current user to check if following
            const currentUser = await getCurrentUser();

            // Fetch followers
            const { data, error: fetchError } = await supabase
                .from('follows')
                .select(`
                    follower:profiles!follows_follower_id_fkey(
                        id, username, avatar_url, is_verified, bio
                    )
                `)
                .eq('following_id', targetUserId);

            if (fetchError) throw fetchError;

            // Extract followers from the relation
            const followersList = (data || [])
                .map((item: any) => item.follower)
                .filter(Boolean) as FollowUser[];

            // If logged in, check which followers the current user is following
            if (currentUser) {
                const { data: myFollowing } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', currentUser.id);

                const myFollowingIds = new Set(((myFollowing || []) as any[]).map(f => f.following_id));

                followersList.forEach(follower => {
                    follower.isFollowing = myFollowingIds.has(follower.id);
                });
            }

            setFollowers(followersList);
        } catch (err) {
            console.error('Followers fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar seguidores');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFollowers();
    }, [fetchFollowers]);

    return { followers, loading, error, refetch: fetchFollowers };
}

// Hook for fetching following
export function useFollowing(userId?: string | null) {
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFollowing = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let targetUserId = userId;

            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setError('Usuário não autenticado');
                    return;
                }
                targetUserId = currentUser.id;
            }

            // Fetch following
            const { data, error: fetchError } = await supabase
                .from('follows')
                .select(`
                    following:profiles!follows_following_id_fkey(
                        id, username, avatar_url, is_verified, bio
                    )
                `)
                .eq('follower_id', targetUserId);

            if (fetchError) throw fetchError;

            // Extract following from the relation
            const followingList = (data || [])
                .map((item: any) => item.following)
                .filter(Boolean) as FollowUser[];

            // Mark all as following since this is the "following" list
            followingList.forEach(user => {
                user.isFollowing = true;
            });

            setFollowing(followingList);
        } catch (err) {
            console.error('Following fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar seguindo');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFollowing();
    }, [fetchFollowing]);

    return { following, loading, error, refetch: fetchFollowing };
}

// Interface for reviews
export interface Review {
    id: string;
    reviewer_id: string;
    reviewed_user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer?: {
        username: string;
        avatar_url: string | null;
    };
}

// Hook for fetching user reviews
export function useReviews(userId?: string | null) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(5);
    const [distribution, setDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let targetUserId = userId;

            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setError('Usuário não autenticado');
                    return;
                }
                targetUserId = currentUser.id;
            }

            // Fetch reviews with reviewer info
            const { data, error: fetchError } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)
                `)
                .eq('reviewed_user_id', targetUserId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const reviewsList = (data || []) as Review[];
            setReviews(reviewsList);

            // Calculate average and distribution
            if (reviewsList.length > 0) {
                const total = reviewsList.reduce((sum, r) => sum + r.rating, 0);
                setAverageRating(Math.round((total / reviewsList.length) * 10) / 10);

                const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                reviewsList.forEach(r => {
                    if (dist[r.rating] !== undefined) {
                        dist[r.rating]++;
                    }
                });

                // Convert to percentages
                Object.keys(dist).forEach(key => {
                    dist[Number(key)] = Math.round((dist[Number(key)] / reviewsList.length) * 100);
                });

                setDistribution(dist);
            }
        } catch (err) {
            console.error('Reviews fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Add a review
    const addReview = async (reviewedUserId: string, rating: number, comment?: string): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return false;
            }

            // Check if already reviewed
            const { data: existing } = await supabase
                .from('reviews')
                .select('id')
                .eq('reviewer_id', currentUser.id)
                .eq('reviewed_user_id', reviewedUserId)
                .maybeSingle();

            if (existing) {
                toast.info('Você já avaliou este usuário');
                return false;
            }

            const { error } = await supabase
                .from('reviews')
                // @ts-ignore - reviews table exists in database
                .insert({
                    reviewer_id: currentUser.id,
                    reviewed_user_id: reviewedUserId,
                    rating,
                    comment: comment || null,
                } as any);

            if (error) throw error;

            fetchReviews();
            return true;
        } catch (err) {
            console.error('Add review error:', err);
            toast.error('Erro ao adicionar avaliação');
            return false;
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, averageRating, distribution, loading, error, addReview, refetch: fetchReviews };
}

// Hook for user posts (for profile page)
export function useUserPosts(userId?: string | null) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let targetUserId = userId;

            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setError('Usuário não autenticado');
                    return;
                }
                targetUserId = currentUser.id;
            }

            const { data, error: fetchError } = await supabase
                .from('posts')
                .select(`
                    *,
                    images:post_images(url, image_id, is_cover)
                `)
                .eq('user_id', targetUserId)
                .neq('status', 'archived')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Add cover image URL to each post (R2-aware)
            const postsWithCover = ((data || []) as any[]).map(post => {
                let coverUrl = null;

                if (post.images && post.images.length > 0) {
                    const coverImg = post.images.find((img: any) => img.is_cover) || post.images[0];

                    // R2: use getImageUrl if image_id exists
                    if (coverImg.image_id) {
                        coverUrl = getImageUrl(post.id, coverImg.image_id, 'feed');
                    }
                    // Legacy Supabase
                    else if (coverImg.url) {
                        coverUrl = coverImg.url;
                    }
                }

                return {
                    ...post,
                    cover_image_url: coverUrl,
                };
            });

            setPosts(postsWithCover);
        } catch (err) {
            console.error('User posts fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar posts');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, loading, error, refetch: fetchPosts };
}

// Hook for updating profile
export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);

    const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return false;
            }

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore - profiles table exists in database
                .update(data)
                .eq('id', currentUser.id);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Update profile error:', err);
            toast.error('Erro ao atualizar perfil');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateAvatar = async (file: File): Promise<string | null> => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return null;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/avatar.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                // @ts-ignore - profiles table exists in database
                .update({ avatar_url: urlData.publicUrl })
                .eq('id', currentUser.id);

            if (updateError) throw updateError;

            return urlData.publicUrl;
        } catch (err) {
            console.error('Update avatar error:', err);
            toast.error('Erro ao atualizar avatar');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, updateAvatar, loading };
}
