import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

export function useSocial() {
    const [loading, setLoading] = useState(false);

    const checkIsFollowing = async (targetUserId: string): Promise<boolean> => {
        try {
            const user = await getCurrentUser();
            if (!user) return false;

            const { data, error } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Check follow error:', error);
            return false;
        }
    };

    const followUser = async (targetUserId: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Você precisa estar logado');

            if (user.id === targetUserId) {
                console.warn('Cannot follow yourself');
                return false;
            }

            const { error } = await supabase
                .from('follows')
                // @ts-ignore
                .insert({ follower_id: user.id, following_id: targetUserId } as any);

            if (error) {
                // If it's a conflict error (already following), we treat it as success
                if (error.code === '23505' || (error as any).status === 409) {
                    console.log('Already following this user');
                    return true;
                }
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Follow error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unfollowUser = async (targetUserId: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Você precisa estar logado');

            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Unfollow error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const blockUser = async (targetUserId: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Você precisa estar logado');

            // Trying with direct insert into blocks table if it exists
            const { error } = await supabase
                .from('blocks')
                // @ts-ignore
                .insert({ blocker_id: user.id, blocked_id: targetUserId } as any);

            if (error) {
                if (error.code === '23505' || (error as any).status === 409) {
                    return true;
                }
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Block error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unblockUser = async (targetUserId: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            const { error } = await supabase
                .from('blocks')
                .delete()
                .eq('blocker_id', user.id)
                .eq('blocked_id', targetUserId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Unblock error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getBlockedUsers = async () => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            const { data, error } = await supabase
                .from('blocks')
                .select(`
                    id,
                    created_at,
                    blocked:profiles!blocks_blocked_id_fkey (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .eq('blocker_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map((item: any) => ({
                ...item.blocked,
                blocked_at: item.created_at
            }));
        } catch (error) {
            console.error('Get blocked users error:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getFollowedUsers = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('follows')
                .select(`
                    following:profiles!follows_following_id_fkey (
                        id,
                        username,
                        avatar_url,
                        is_verified,
                        posts:posts(created_at)
                    )
                `)
                .eq('follower_id', user.id)
                .order('created_at', { foreignTable: 'following.posts', ascending: false })
                .limit(1, { foreignTable: 'following.posts' });

            if (error) throw error;

            return data.map((item: any) => ({
                ...item.following,
                latest_post_at: item.following.posts?.[0]?.created_at || null
            }));
        } catch (error) {
            console.error('Get followed users error:', error);
            return [];
        }
    };

    return {
        loading,
        checkIsFollowing,
        followUser,
        unfollowUser,
        blockUser,
        unblockUser,
        getBlockedUsers,
        getFollowedUsers
    };
}
