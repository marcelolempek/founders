'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { toast } from '@/components/ui/Toast';

// Report interface
export interface Report {
    id: string;
    reporter_id: string;
    target_type: 'post' | 'user' | 'comment';
    target_id: string;
    reason: 'spam' | 'scam' | 'inappropriate' | 'illegal' | 'harassment' | 'other';
    details: string | null;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    reporter?: {
        username: string;
        avatar_url: string | null;
    };
    target_post?: {
        id: string;
        title: string;
        price: number | null;
        user_id: string;
        user?: {
            username: string;
            avatar_url: string | null;
        };
        images?: { url: string; is_cover: boolean }[];
    };
    target_user?: {
        id: string;
        username: string;
        avatar_url: string | null;
        created_at: string;
    };
}

// Hook for fetching and managing reports
export function useReports(options: {
    status?: string;
    type?: string;
    limit?: number;
} = {}) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        pending: 0,
        resolved: 0,
        dismissed: 0,
    });

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('reports')
                .select(`
                    *,
                    reporter:profiles!reports_reporter_id_fkey(username, avatar_url)
                `)
                .order('created_at', { ascending: false })
                .limit(options.limit || 50);

            if (options.status) {
                query = query.eq('status', options.status as any);
            }
            if (options.type) {
                query = query.eq('target_type', options.type as any);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Fetch additional data for each report based on target type
            const enrichedReports = await Promise.all(
                (data || []).map(async (report: any) => {
                    if (report.target_type === 'post') {
                        const { data: postData } = await supabase
                            .from('posts')
                            .select(`
                                id, title, price, user_id,
                                user:profiles!posts_user_id_fkey(username, avatar_url),
                                images:post_images(url, is_cover)
                            `)
                            .eq('id', report.target_id)
                            .single();
                        report.target_post = postData;
                    } else if (report.target_type === 'user') {
                        const { data: userData } = await supabase
                            .from('profiles')
                            .select('id, username, avatar_url, created_at')
                            .eq('id', report.target_id)
                            .single();
                        report.target_user = userData;
                    }
                    return report;
                })
            );

            setReports(enrichedReports);

            // Fetch stats
            const { count: pendingCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            const { count: resolvedCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'resolved');

            const { count: dismissedCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'dismissed');

            setStats({
                pending: pendingCount || 0,
                resolved: resolvedCount || 0,
                dismissed: dismissedCount || 0,
            });
        } catch (err) {
            console.error('Reports fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar denúncias');
        } finally {
            setLoading(false);
        }
    }, [options.status, options.type, options.limit]);

    const dismissReport = async (reportId: string): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return false;

            const { error } = await supabase
                .from('reports')
                // @ts-ignore - reports table exists in database
                .update({
                    status: 'dismissed',
                    resolved_at: new Date().toISOString(),
                    resolved_by: currentUser.id,
                })
                .eq('id', reportId);

            if (error) throw error;
            fetchReports();
            return true;
        } catch (err) {
            console.error('Dismiss report error:', err);
            return false;
        }
    };

    const resolveReport = async (reportId: string): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return false;

            const { error } = await supabase
                .from('reports')
                // @ts-ignore - reports table exists in database
                .update({
                    status: 'resolved',
                    resolved_at: new Date().toISOString(),
                    resolved_by: currentUser.id,
                })
                .eq('id', reportId);

            if (error) throw error;
            fetchReports();
            return true;
        } catch (err) {
            console.error('Resolve report error:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return { reports, stats, loading, error, dismissReport, resolveReport, refetch: fetchReports };
}

// Hook for admin actions
export function useAdminActions() {
    const [loading, setLoading] = useState(false);

    const banUser = async (userId: string, reason: string): Promise<boolean> => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return false;
            }

            // Try using RPC first
            // @ts-ignore - ban_user RPC exists in database
            const { error: rpcError } = await supabase.rpc('ban_user', {
                p_user_id: userId,
                p_reason: reason,
            });

            if (rpcError) {
                // Fallback to direct update
                const { error } = await (supabase as any)
                    .from('profiles')
                    .update({
                        status: 'banned'
                    })
                    .eq('id', userId);

                if (error) throw error;
            }

            return true;
        } catch (err) {
            console.error('Ban user error:', err);
            toast.error('Erro ao banir usuário');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unbanUser = async (userId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await (supabase as any)
                .from('profiles')
                .update({
                    status: 'active'
                })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Unban user error:', err);
            toast.error('Erro ao desbanir usuário');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removePost = async (postId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('posts')
                // @ts-ignore - posts table exists in database
                .update({ status: 'removed' })
                .eq('id', postId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Remove post error:', err);
            toast.error('Erro ao remover post');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const issueWarning = async (userId: string, reason: string): Promise<boolean> => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) return false;

            // Create a notification for the user
            const { error } = await supabase
                .from('notifications')
                // @ts-ignore - notifications table exists in database
                .insert({
                    user_id: userId,
                    type: 'system',
                    title: 'Aviso da Moderação',
                    body: reason,
                    data: { type: 'warning', issued_by: currentUser.id },
                } as any);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Issue warning error:', err);
            toast.error('Erro ao emitir aviso');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const verifyUser = async (userId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore - profiles table exists in database
                .update({ is_verified: true })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Verify user error:', err);
            toast.error('Erro ao verificar usuário');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unverifyUser = async (userId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore - profiles table exists in database
                .update({ is_verified: false })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Unverify user error:', err);
            toast.error('Erro ao remover verificação');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { banUser, unbanUser, removePost, issueWarning, verifyUser, unverifyUser, loading };
}

// Admin user interface
export interface AdminUser {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    is_verified: boolean;
    status: string;
    role: string;
    created_at: string;
    last_active_at: string | null;
    posts_count?: number;
    reports_count?: number;
}

// Hook for user management
export function useUserManagement(options: {
    search?: string;
    role?: string;
    status?: 'all' | 'active' | 'banned';
    limit?: number;
} = {}) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(options.limit || 50);

            if (options.search) {
                query = query.or(`username.ilike.%${options.search}%,email.ilike.%${options.search}%`);
            }
            if (options.role) {
                query = query.eq('role', options.role as any);
            }
            if (options.status === 'banned') {
                query = query.eq('status', 'banned');
            } else if (options.status === 'active') {
                query = query.eq('status', 'active');
            }

            const { data, error: fetchError, count } = await query;

            if (fetchError) throw fetchError;

            // Enrich with counts
            const enrichedUsers = await Promise.all(
                (data || []).map(async (user: any) => {
                    const { count: postsCount } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    const { count: reportsCount } = await supabase
                        .from('reports')
                        .select('*', { count: 'exact', head: true })
                        .eq('target_id', user.id)
                        .eq('target_type', 'user');

                    return {
                        ...user,
                        posts_count: postsCount || 0,
                        reports_count: reportsCount || 0,
                    };
                })
            );

            setUsers(enrichedUsers);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Users fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, [options.search, options.role, options.status, options.limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, totalCount, loading, error, refetch: fetchUsers };
}

// Platform stats interface
export interface PlatformStats {
    total_users: number;
    active_users_today: number;
    total_posts: number;
    active_posts: number;
    sold_posts: number;
    total_reports: number;
    pending_reports: number;
    new_users_today: number;
    new_posts_today: number;
}

// Hook for platform statistics
export function usePlatformStats() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [topSellers, setTopSellers] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISO = today.toISOString();

            // Total users
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // New users today
            const { count: newUsersToday } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO);

            // Total posts
            const { count: totalPosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true });

            // Active posts
            const { count: activePosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Sold posts
            const { count: soldPosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'sold');

            // New posts today
            const { count: newPostsToday } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO);

            // Total reports
            const { count: totalReports } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true });

            // Pending reports
            const { count: pendingReports } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            setStats({
                total_users: totalUsers || 0,
                active_users_today: 0, // Would need session tracking
                total_posts: totalPosts || 0,
                active_posts: activePosts || 0,
                sold_posts: soldPosts || 0,
                total_reports: totalReports || 0,
                pending_reports: pendingReports || 0,
                new_users_today: newUsersToday || 0,
                new_posts_today: newPostsToday || 0,
            });

            // Fetch top sellers (users with most sold posts)
            const { data: sellers } = await supabase
                .from('posts')
                .select(`
                    user_id,
                    user:profiles!posts_user_id_fkey(id, username, avatar_url, is_verified)
                `)
                .eq('status', 'sold')
                .limit(100);

            // Count by user
            const sellerCounts = (sellers || []).reduce((acc: any, post: any) => {
                const userId = post.user_id;
                if (!acc[userId]) {
                    acc[userId] = { user: post.user, count: 0 };
                }
                acc[userId].count++;
                return acc;
            }, {});

            const topSellersArray = Object.values(sellerCounts)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 10);

            setTopSellers(topSellersArray);

            // Fetch recent activity (latest posts)
            const { data: activity } = await supabase
                .from('posts')
                .select(`
                    id, title, status, created_at,
                    user:profiles!posts_user_id_fkey(username, avatar_url)
                `)
                .order('created_at', { ascending: false })
                .limit(10);

            setRecentActivity(activity || []);
        } catch (err) {
            console.error('Stats fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, topSellers, recentActivity, loading, error, refetch: fetchStats };
}

// Badge interface
export interface Badge {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    type: string;
    default_duration_days: number | null;
    created_at: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    verified: boolean;
    verified_at: string | null;
    expires_at: string | null;
    created_at: string;
    user?: {
        username: string;
        avatar_url: string | null;
    };
    badge?: Badge;
}

// Hook for badge management
export function useBadgeManagement() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserBadge[]>([]);
    const [activeBadges, setActiveBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all badges
            const { data: badgesData, error: badgesError } = await (supabase as any)
                .from('badges')
                .select('*')
                .order('created_at', { ascending: true });

            if (badgesError) throw badgesError;
            setBadges((badgesData as any) || []);

            // Fetch pending badge requests
            const { data: requestsData, error: requestsError } = await (supabase as any)
                .from('user_badges')
                .select(`
                    *,
                    user:profiles!user_badges_user_id_fkey(username, avatar_url),
                    badge:badges(*)
                `)
                .eq('verified', false)
                .order('created_at', { ascending: false });

            if (requestsError) throw requestsError;
            setPendingRequests((requestsData as any) || []);

            // Fetch active badges (verified=true)
            const { data: activeData, error: activeError } = await (supabase as any)
                .from('user_badges')
                .select(`
                    *,
                    user:profiles!user_badges_user_id_fkey(username, avatar_url),
                    badge:badges(*)
                `)
                .eq('verified', true)
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;
            setActiveBadges((activeData as any) || []);

        } catch (err) {
            console.error('Badge management fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar badges');
        } finally {
            setLoading(false);
        }
    }, []);

    const approveBadge = async (userBadgeId: string, expiresAt?: Date): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('user_badges')
                // @ts-ignore - user_badges table exists in database
                .update({
                    verified: true,
                    verified_at: new Date().toISOString(),
                    expires_at: expiresAt ? expiresAt.toISOString() : null
                })
                .eq('id', userBadgeId);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Approve badge error:', err);
            toast.error('Erro ao aprovar badge');
            return false;
        }
    };

    const rejectBadge = async (userBadgeId: string): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('user_badges')
                .delete()
                .eq('id', userBadgeId);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Reject badge error:', err);
            toast.error('Erro ao rejeitar badge');
            return false;
        }
    };

    const grantBadge = async (userId: string, badgeId: string, expiresAt?: Date): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('user_badges')
                .insert({
                    user_id: userId,
                    badge_id: badgeId,
                    verified: true,
                    verified_at: new Date().toISOString(),
                    expires_at: expiresAt ? expiresAt.toISOString() : null
                } as any);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Grant badge error:', err);
            toast.error('Erro ao conceder badge');
            return false;
        }
    };

    const revokeBadge = async (userBadgeId: string): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('user_badges')
                .delete()
                .eq('id', userBadgeId);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Revoke badge error:', err);
            toast.error('Erro ao remover badge');
            return false;
        }
    };

    const updateExpiration = async (userBadgeId: string, expiresAt: Date | null): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('user_badges')
                .update({
                    expires_at: expiresAt ? expiresAt.toISOString() : null
                })
                .eq('id', userBadgeId);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Update expiration error:', err);
            toast.error('Erro ao atualizar validade');
            return false;
        }
    };

    const createBadge = async (badge: Partial<Badge>): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                // @ts-ignore - badges table exists in database
                .from('badges')
                .insert(badge as any);

            if (error) throw error;
            fetchData();
            return true;
        } catch (err) {
            console.error('Create badge error:', err);
            toast.error('Erro ao criar badge');
            return false;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        badges,
        pendingRequests,
        activeBadges,
        loading,
        error,
        approveBadge,
        rejectBadge,
        grantBadge,
        revokeBadge,
        updateExpiration,
        createBadge,
        refetch: fetchData
    };
}

// Platform settings interface
export interface PlatformSetting {
    key: string;
    value: any;
    updated_at: string;
    updated_by: string | null;
}

// Hook for platform settings
export function usePlatformSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await (supabase as any)
                .from('platform_settings')
                .select('*');

            if (fetchError) throw fetchError;

            const settingsMap = (data || []).reduce((acc: Record<string, any>, item: any) => {
                acc[item.key] = item.value;
                return acc;
            }, {});

            setSettings(settingsMap);
        } catch (err) {
            console.error('Settings fetch error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSetting = async (key: string, value: any): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return false;

            const { error } = await (supabase as any)
                .from('platform_settings')
                .upsert({
                    key,
                    value,
                    updated_at: new Date().toISOString(),
                    updated_by: currentUser.id,
                });

            if (error) throw error;

            setSettings(prev => ({ ...prev, [key]: value }));
            return true;
        } catch (err) {
            console.error('Update setting error:', err);
            toast.error('Erro ao atualizar configuração');
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, loading, error, updateSetting, refetch: fetchSettings };
}

// Hook for checking admin/moderator access
export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setLoading(false);
                    return;
                }
                setUser(currentUser);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single();

                if (profile) {
                    setIsAdmin((profile as any).role === 'admin');
                    setIsModerator((profile as any).role === 'moderator' || (profile as any).role === 'admin');
                }
            } catch (error) {
                console.error('Error checking admin access:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAccess();
    }, []);

    return { isAdmin, isModerator, loading, user };
}
