'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

// Support ticket types
export type SupportTopic = 'report' | 'account' | 'partnership' | 'bug' | 'other';

// Report reason types
export type ReportReason =
    | 'prohibited_item'
    | 'scam'
    | 'wrong_category'
    | 'abusive'
    | 'spam'
    | 'illegal'
    | 'other';

export interface SupportTicket {
    id: string;
    user_id: string;
    topic: SupportTopic;
    email: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved';
    created_at: string;
}

// Hook for submitting support tickets (Contact form)
export function useSupportTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitTicket = async (data: {
        topic: SupportTopic;
        email: string;
        message: string;
    }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();

            const { error: ticketError } = await (supabase as any)
                .from('support_tickets')
                .insert({
                    user_id: currentUser?.id || null,
                    email: data.email,
                    topic: data.topic,
                    message: data.message,
                    status: 'open',
                } as any);

            if (ticketError) throw ticketError;

            const { error: notifError } = await (supabase as any)
                .from('notifications')
                .insert({
                    user_id: currentUser?.id || null, // In a real app, this would be admin_user_id
                    type: 'system',
                    title: `Novo Ticket: ${data.topic}`,
                    body: data.message.substring(0, 200),
                    data: {
                        type: 'support_ticket',
                        topic: data.topic,
                        email: data.email,
                    },
                } as any);

            return true;
        } catch (err) {
            console.error('Support ticket error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { submitTicket, loading, error };
}

// Hook for reporting posts
export function useReportPost() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reportPost = async (data: {
        postId: string;
        reason: ReportReason;
        details?: string;
    }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                setError('Você precisa estar logado para denunciar');
                return false;
            }

            // Rate limit check removed to allow unrestricted reporting
            const rateLimitOk = true;

            const { data: existing } = await (supabase as any)
                .from('reports')
                .select('id')
                .eq('reporter_id', currentUser.id)
                .eq('target_id', data.postId)
                .eq('target_type', 'post')
                .single();

            if (existing) {
                setError('Você já denunciou este anúncio');
                return false;
            }

            // Create report
            const { error: reportError } = await (supabase as any)
                .from('reports')
                .insert({
                    reporter_id: currentUser.id,
                    target_id: data.postId,
                    target_type: 'post',
                    reason: data.reason,
                    description: data.details || null,
                    status: 'pending',
                } as any);

            if (reportError) throw reportError;

            return true;
        } catch (err) {
            console.error('Report post error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao enviar denúncia');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { reportPost, loading, error };
}

// Hook for reporting users
export function useReportUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reportUser = async (data: {
        userId: string;
        reason: ReportReason;
        details?: string;
    }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                setError('Você precisa estar logado para denunciar');
                return false;
            }

            // Can't report yourself
            if (currentUser.id === data.userId) {
                setError('Você não pode denunciar a si mesmo');
                return false;
            }

            // Rate limit check removed to allow unrestricted reporting
            const rateLimitOk = true;

            // Check if already reported this user recently
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const { data: existing } = await (supabase as any)
                .from('reports')
                .select('id')
                .eq('reporter_id', currentUser.id)
                .eq('target_id', data.userId)
                .eq('target_type', 'user')
                .gte('created_at', oneDayAgo.toISOString())
                .single();

            if (existing) {
                setError('Você já denunciou este usuário recentemente');
                return false;
            }

            // Create report
            const { error: reportError } = await (supabase as any)
                .from('reports')
                .insert({
                    reporter_id: currentUser.id,
                    target_id: data.userId,
                    target_type: 'user',
                    reason: data.reason,
                    description: data.details || null,
                    status: 'pending',
                } as any);

            if (reportError) throw reportError;

            return true;
        } catch (err) {
            console.error('Report user error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao enviar denúncia');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { reportUser, loading, error };
}

// Hook for fetching user's own reports
export function useMyReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                setError('Usuário não autenticado');
                return;
            }

            // @ts-ignore
            const { data, error: fetchError } = await (supabase as any)
                .from('reports')
                .select('*')
                .eq('reporter_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setReports(data || []);
        } catch (err) {
            console.error('Fetch reports error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar denúncias');
        } finally {
            setLoading(false);
        }
    }, []);

    return { reports, loading, error, refetch: fetchReports };
}

// Hook for fetching user's own support tickets
export function useMySupportTickets() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            const { data, error: fetchError } = await (supabase as any)
                .from('support_tickets')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setTickets(data || []);
        } catch (err) {
            console.error('Fetch tickets error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return { tickets, loading, error, refetch: fetchTickets };
}

// Hook for fetching user's subscription status
export function useSubscription() {
    const [subscription, setSubscription] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) return;

                const { data, error } = await (supabase as any)
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .eq('is_active', true)
                    .order('expires_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (!error) {
                    setSubscription(data);
                }
            } catch (err) {
                console.error('Error fetching subscription:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    return { subscription, loading };
}
