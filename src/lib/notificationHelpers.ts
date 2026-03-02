// ============================================
// Empreendedores de Cristo - Notification Helpers
// ============================================
// Helper functions for notification system
// ============================================

import { getPostUrl } from '@/lib/utils/postUrl';

export interface NotificationData {
    post_id?: string;
    comment_id?: string;
    parent_comment_id?: string;
    commenter_id?: string;
    commenter_username?: string;
    replier_id?: string;
    replier_username?: string;
    reviewer_id?: string;
    reviewer_username?: string;
    reviewed_user_id?: string;
    rating?: number;
    post_title?: string;
    follower_id?: string;
    follower_username?: string;
}

export interface NotificationAction {
    label: string;
    url: string;
    variant?: 'primary' | 'secondary';
}

/**
 * Extract navigation URL from notification data based on type
 */
export function getNotificationUrl(type: string, data: NotificationData): string | null {
    switch (type) {
        case 'comment':
        case 'comment_reply':
            // Navigate to the post with the comment
            return data.post_id ? getPostUrl(data.post_id) : null;

        case 'review':
            // Navigate to the reviewer's profile or the post if available
            if (data.post_id) {
                return getPostUrl(data.post_id);
            }
            return data.reviewer_id ? `/profile/${data.reviewer_id}` : null;

        case 'like':
            // Navigate to the liked post
            return data.post_id ? getPostUrl(data.post_id) : null;

        case 'follow':
            // Navigate to the follower's profile
            return data.follower_id ? `/profile/${data.follower_id}` : null;

        case 'system':
        default:
            return null;
    }
}

/**
 * Get action buttons for notification based on type
 */
export function getNotificationActions(type: string, data: NotificationData): NotificationAction[] {
    const actions: NotificationAction[] = [];

    switch (type) {
        case 'comment':
        case 'comment_reply':
            if (data.post_id) {
                actions.push({
                    label: 'Ver Post',
                    url: getPostUrl(data.post_id),
                    variant: 'primary'
                });
            }
            break;

        case 'review':
            if (data.post_id) {
                actions.push({
                    label: 'Ver Post',
                    url: getPostUrl(data.post_id),
                    variant: 'primary'
                });
            }
            if (data.reviewer_id) {
                actions.push({
                    label: 'Ver Perfil',
                    url: `/profile/${data.reviewer_id}`,
                    variant: 'secondary'
                });
            }
            break;

        case 'like':
            if (data.post_id) {
                actions.push({
                    label: 'Ver Post',
                    url: getPostUrl(data.post_id),
                    variant: 'primary'
                });
            }
            break;

        case 'follow':
            if (data.follower_id) {
                actions.push({
                    label: 'Ver Perfil',
                    url: `/profile/${data.follower_id}`,
                    variant: 'primary'
                });
            }
            break;
    }

    return actions;
}

/**
 * Get avatar URL from notification data
 */
export function getNotificationAvatar(type: string, data: NotificationData): string | null {
    switch (type) {
        case 'comment':
            return data.commenter_id ? `/api/avatar/${data.commenter_id}` : null;

        case 'comment_reply':
            return data.replier_id ? `/api/avatar/${data.replier_id}` : null;

        case 'review':
            return data.reviewer_id ? `/api/avatar/${data.reviewer_id}` : null;

        case 'follow':
            return data.follower_id ? `/api/avatar/${data.follower_id}` : null;

        default:
            return null;
    }
}

/**
 * Get username from notification data
 */
export function getNotificationUsername(type: string, data: NotificationData): string | null {
    switch (type) {
        case 'comment':
            return data.commenter_username || null;

        case 'comment_reply':
            return data.replier_username || null;

        case 'review':
            return data.reviewer_username || null;

        case 'follow':
            return data.follower_username || null;

        default:
            return null;
    }
}

/**
 * Get icon name for notification type
 */
export function getNotificationIcon(type: string): string {
    switch (type) {
        case 'like':
            return 'thumb_up';
        case 'comment':
        case 'comment_reply':
            return 'chat_bubble';
        case 'follow':
            return 'person_add';
        case 'review':
            return 'star';
        case 'system':
            return 'notifications';
        default:
            return 'notifications';
    }
}

/**
 * Get color theme for notification type
 */
export function getNotificationColor(type: string): {
    bg: string;
    text: string;
    border: string;
} {
    switch (type) {
        case 'like':
            return {
                bg: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
                text: 'text-red-500',
                border: 'border-red-500/20'
            };
        case 'comment':
        case 'comment_reply':
            return {
                bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
                text: 'text-blue-500',
                border: 'border-blue-500/20'
            };
        case 'follow':
            return {
                bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
                text: 'text-primary',
                border: 'border-primary/20'
            };
        case 'review':
            return {
                bg: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
                text: 'text-yellow-500',
                border: 'border-yellow-500/20'
            };
        case 'system':
            return {
                bg: 'bg-gradient-to-br from-gray-700/20 to-gray-600/10',
                text: 'text-gray-400',
                border: 'border-gray-600/20'
            };
        default:
            return {
                bg: 'bg-white/50',
                text: 'text-gray-400',
                border: 'border-white/10'
            };
    }
}
