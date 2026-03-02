import { supabase } from '@/lib/supabase';
import { Profile, Report, VerificationRequest } from '@/lib/database.types';

export const adminService = {
    async getStats() {
        const [reports, verifications, profiles, posts, contactViews] = await Promise.all([
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('profiles').select('is_verified', { count: 'exact' }),
            supabase.from('posts').select('category, status', { count: 'exact' }),
            supabase.from('contact_views').select('*', { count: 'exact', head: true })
        ]);

        // Aggregate User Stats
        const totalUsers = profiles.count || 0;
        const verifiedUsers = (profiles.data as any[])?.filter(p => p.is_verified).length || 0;

        // Aggregate Post Stats
        const totalPosts = posts.count || 0;
        const postsByCategory = ((posts.data as any[]) || []).reduce((acc: Record<string, number>, post) => {
            acc[post.category] = (acc[post.category] || 0) + 1;
            return acc;
        }, {});

        const postsByStatus = ((posts.data as any[]) || []).reduce((acc: Record<string, number>, post) => {
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
        }, {});


        return {
            pendingReports: reports.count || 0,
            pendingVerifications: verifications.count || 0,
            totalUsers,
            verifiedUsers,
            postsByCategory,
            postsByStatus,
            totalPosts,
            activePosts: postsByStatus['active'] || 0,
            totalContactViews: contactViews.count || 0
        };
    },

    async getWhatsAppStats(limit = 10) {
        const { data, error } = await supabase
            .from('v_whatsapp_stats')
            .select('*')
            .order('total_clicks', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async getSettings() {
        // @ts-ignore
        const { data, error } = await supabase
            .from('platform_settings' as any)
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is Row not found
        return data;
    },

    async updateSettings(settings: { platform_name?: string; support_email?: string; maintenance_mode?: boolean }) {
        // @ts-ignore
        const { data, error } = await supabase
            .from('platform_settings' as any)
            .upsert({ id: 1, ...settings } as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUsers(page = 1, limit = 20, search = '', filter = 'all') {
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (search) {
            query = query.ilike('username', `%${search}%`);
        }

        if (filter === 'verified') {
            query = query.eq('is_verified', true);
        } else if (filter === 'admin') {
            query = query.eq('role', 'admin');
        }

        const { data, count, error } = await query;

        if (error) throw error;
        return { users: data as Profile[], total: count || 0 };
    },

    async banUser(userId: string) {
        // Update status to 'banned'
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ status: 'banned' })
            .eq('id', userId);

        if (error) throw error;
    },

    async unbanUser(userId: string) {
        // Update status to 'active'
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', userId);

        if (error) throw error;
    },

    async getPendingReports() {
        return this.getReports('pending');
    },

    async getReports(status?: 'pending' | 'resolved' | 'dismissed' | 'all') {
        let query = supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reports_reporter_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Enrich reports with target preview
        const enrichedReports = await Promise.all(
            ((data || []) as (Report & { reporter: Profile })[]).map(async (report) => {
                let target_preview: any = {};

                if (report.target_type === 'post') {
                    const { data: post } = await supabase
                        .from('posts')
                        .select('title, images:post_images(url)')
                        .eq('id', report.target_id)
                        .single();
                    if (post) {
                        const p = post as any;
                        target_preview = {
                            title: p.title,
                            // @ts-ignore
                            image: p.images?.[0]?.url
                        };
                    }
                } else if (report.target_type === 'user') {
                    const { data: user } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', report.target_id)
                        .single();
                    if (user) {
                        const u = user as any;
                        target_preview = {
                            username: u.username,
                            image: u.avatar_url
                        };
                    }
                }

                return { ...report, target_preview };
            })
        );

        return enrichedReports;
    },

    async getPendingVerifications() {
        const { data, error } = await supabase
            .from('verification_requests')
            .select(`
                *,
                user:profiles!verification_requests_user_id_fkey(*)
            `)
            .eq('status', 'pending')
            .order('submitted_at', { ascending: true });

        if (error) throw error;
        return data as (VerificationRequest & { user: Profile })[];
    },

    async getUserDetails(userId: string) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Fetch related data in parallel
        const [posts, sales, badges, reports] = await Promise.all([
            supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'sold'),
            supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', userId),
            supabase.from('reports').select('*').eq('target_id', userId).eq('target_type', 'user')
        ]);

        return {
            profile,
            recentPosts: posts.data || [],
            salesCount: sales.count || 0,
            badges: badges.data || [],
            reports: reports.data || []
        };
    },

    async bulkBanUsers(userIds: string[]) {
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ status: 'banned' })
            .in('id', userIds);
        if (error) throw error;
    },

    async bulkVerifyUsers(userIds: string[]) {
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ is_verified: true })
            .in('id', userIds);
        if (error) throw error;
    },

    async resolveReport(reportId: string, resolution?: string) {
        const { error } = await (supabase as any)
            .from('reports')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                // details: resolution // optionally append resolution details
            })
            .eq('id', reportId);
        if (error) throw error;
    },

    async dismissReport(reportId: string) {
        const { error } = await (supabase as any)
            .from('reports')
            .update({
                status: 'dismissed',
                resolved_at: new Date().toISOString()
            })
            .eq('id', reportId);
        if (error) throw error;
    },

    async approveVerification(requestId: string, userId: string, type: 'identity' | 'store' | 'partner') {
        // 1. Get badge ID
        const badgeTypeMap: Record<string, string> = {
            identity: 'verified_seller',
            store: 'physical_store',
            partner: 'partner',
        };

        const { data: badge } = await (supabase as any)
            .from('badges')
            .select('id')
            .eq('type', badgeTypeMap[type])
            .single();

        if (badge) {
            // 2. Upsert user_badge with 1 year expiration
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 12 months validity

            await (supabase as any).from('user_badges').upsert({
                user_id: userId,
                badge_id: badge.id,
                verified: true,
                verified_at: new Date().toISOString(),
                expires_at: expirationDate.toISOString()
            }, { onConflict: 'user_id, badge_id' });
        }

        // 3. Update profile if identity
        if (type === 'identity') {
            await (supabase as any).from('profiles').update({ is_verified: true }).eq('id', userId);
        }

        // 4. Update request status
        await (supabase as any).from('verification_requests').update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id
        }).eq('id', requestId);

        // 5. Notify user
        await (supabase as any).from('notifications').insert({
            user_id: userId,
            type: 'system',
            title: 'Verificação Aprovada! 🎉',
            message: `Sua solicitação de verificação (${type}) foi aprovada. O selo ficará ativo por 12 meses.`,
            is_read: false
        });
    }
};
