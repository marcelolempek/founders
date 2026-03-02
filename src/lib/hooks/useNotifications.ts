'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

export function useNotifications() {
    const { user } = useUser(); // ✅ Use cached user
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchUnreadCount = async () => {
        try {
            if (!user) return;

            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (!error) {
                setUnreadCount(count || 0);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let channel: any;

        const setupSubscription = async () => {
            await fetchUnreadCount();
            if (!user) return;

            channel = supabase
                .channel(`notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        fetchUnreadCount();
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user?.id]); // ✅ Depend on user.id

    return { unreadCount, loading, refetch: fetchUnreadCount };
}
