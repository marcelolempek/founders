'use client';

import React, { useEffect, useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import {
    getNotificationUrl,
    getNotificationActions,
    getNotificationIcon,
    getNotificationColor,
    getNotificationUsername,
    type NotificationData
} from '@/lib/notificationHelpers';
import Image from 'next/image';
import { getR2Url } from '@/lib/images';


// We need a type for Notification since it is not in our typical types file clearly or we want a specific subset
interface NotificationItem {
    id: string;
    created_at: string;
    type: string; // 'like', 'comment', 'comment_reply', 'review', 'follow', 'system'
    read_at: string | null;
    is_read: boolean;
    data: NotificationData;
    title: string;
    message: string | null;
}

// Profile data for avatars
interface ProfileData {
    avatar_url: string | null;
    username: string;
}

export default function NotificationList() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setNotifications(data as any);

                    // Extract unique user IDs to fetch avatars
                    const userIds = new Set<string>();
                    data.forEach((notif: any) => {
                        const notifData = notif.data as NotificationData;
                        if (notifData.commenter_id) userIds.add(notifData.commenter_id);
                        if (notifData.replier_id) userIds.add(notifData.replier_id);
                        if (notifData.reviewer_id) userIds.add(notifData.reviewer_id);
                        if (notifData.follower_id) userIds.add(notifData.follower_id);
                    });

                    // Fetch profiles for avatars
                    if (userIds.size > 0) {
                        const { data: profilesData } = await supabase
                            .from('profiles')
                            .select('id, avatar_url, username')
                            .in('id', Array.from(userIds));

                        if (profilesData) {
                            const profileMap: Record<string, ProfileData> = {};
                            profilesData.forEach((profile: any) => {
                                profileMap[profile.id] = {
                                    avatar_url: profile.avatar_url,
                                    username: profile.username
                                };
                            });
                            setProfiles(profileMap);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading notifications', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            // @ts-ignore
            const { error } = await supabase.rpc('mark_notification_read', { p_notification_id: id });

            if (error) throw error;

            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
            ));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;

            // @ts-ignore
            const { error } = await supabase.rpc('mark_all_notifications_read', { p_user_id: user.id });
            if (error) throw error;

            const now = new Date().toISOString();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: now })));
        } catch (error) {
            console.error('Error mark all', error);
        }
    };

    const handleNotificationClick = async (notification: NotificationItem) => {
        // Mark as read if not already
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to the appropriate page
        const url = getNotificationUrl(notification.type, notification.data);
        if (url) {
            router.push(url);
        }
    };

    const getAvatarUrl = (notification: NotificationItem): string | null => {
        const { type, data } = notification;
        let userId: string | undefined;

        switch (type) {
            case 'comment':
                userId = data.commenter_id;
                break;
            case 'comment_reply':
                userId = data.replier_id;
                break;
            case 'review':
                userId = data.reviewer_id;
                break;
            case 'follow':
                userId = data.follower_id;
                break;
        }

        return userId ? getR2Url(profiles[userId]?.avatar_url) || null : null;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/*  Desktop Sidebar Placeholder */}
            <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-slate-100/50 backdrop-blur-sm h-full flex-shrink-0 z-20 p-6">
                <h1 className="text-xl font-bold tracking-tight text-white mb-8">Empreendedores de Cristo</h1>
                <nav className="flex flex-col gap-2">
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-white/5 transition-colors" href="/">
                        <span className="material-symbols-outlined">home</span>
                        <span className="font-medium">Feed do Mercado</span>
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <span className="material-symbols-outlined fill">notifications</span>
                        <span className="font-medium">Notificações</span>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-background">
                {/*  Mobile Header  */}
                <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-400 hover:text-slate-900 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-lg font-bold text-white">Notificações</h1>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-primary font-semibold hover:text-primary/80 transition-all active:scale-95"
                        >
                            Ler todas
                        </button>
                    )}
                </div>

                <div className="mobile-container pb-24 md:pb-10 pt-4 md:pt-10 px-4 md:px-0">
                    <div className="flex justify-between items-center mb-8 hidden md:flex max-w-[700px] mx-auto">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Notificações</h2>
                        {notifications.some(n => !n.is_read) && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-primary hover:text-primary/80 font-semibold transition-all active:scale-95"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 max-w-[700px] mx-auto w-full">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-primary/20"></div>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
                                    <span className="material-symbols-outlined text-2xl text-gray-700 relative">notifications_off</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">Nada por aqui ainda</h3>
                                <p className="text-sm text-gray-600">Você não tem notificações no momento</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const colors = getNotificationColor(notification.type);
                                const icon = getNotificationIcon(notification.type);
                                const avatarUrl = getAvatarUrl(notification);
                                const username = getNotificationUsername(notification.type, notification.data);
                                const actions = getNotificationActions(notification.type, notification.data);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`
                                            relative group flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                                            ${notification.is_read
                                                ? 'bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                                                : `${colors.bg} border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl`
                                            }
                                            transform hover:scale-[1.01] active:scale-[0.99]
                                        `}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className="absolute right-5 top-5 flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
                                            </div>
                                        )}

                                        {/* Avatar or Icon */}
                                        <div className="relative shrink-0">
                                            {avatarUrl ? (
                                                <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/10">
                                                    <Image
                                                        src={avatarUrl}
                                                        alt={username || 'User'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`
                                                    h-12 w-12 rounded-full flex items-center justify-center
                                                    ${colors.bg} ${colors.text} ring-2 ${colors.border}
                                                    backdrop-blur-sm
                                                `}>
                                                    <span className="material-symbols-outlined text-[22px] fill">
                                                        {icon}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-8">
                                            <h4 className={`text-sm mb-1 ${notification.is_read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
                                                {notification.message || ''}
                                            </p>

                                            {/* Actions */}
                                            {actions.length > 0 && (
                                                <div className="flex gap-2 mt-3">
                                                    {actions.map((action, idx) => (
                                                        <Link
                                                            key={idx}
                                                            href={action.url}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`
                                                                text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                                                                ${action.variant === 'primary'
                                                                    ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                                                                    : 'bg-white/5 text-slate-600 hover:bg-white/10 border border-white/10'
                                                                }
                                                                active:scale-95
                                                            `}
                                                        >
                                                            {action.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-[11px] text-gray-600 font-medium">
                                                    {formatRelativeTime(notification.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
