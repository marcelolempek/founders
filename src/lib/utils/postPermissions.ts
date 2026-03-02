import { ViewerRole, PostAction } from '@/types/post';

/**
 * Determines the role of the current user relative to the post.
 */
export function getViewerRole(
    currentUserId: string | null | undefined,
    authorId: string,
    userRole?: 'user' | 'admin' | 'moderator' | null
): ViewerRole {
    if (!currentUserId) return 'guest';
    if (userRole === 'admin' || userRole === 'moderator') return 'admin';
    if (currentUserId === authorId) return 'owner';
    return 'viewer';
}

/**
 * Checks if a specific action is allowed for a given viewer role.
 */
export function canPerformAction(
    action: PostAction,
    viewerRole: ViewerRole
): boolean {
    const permissions: Record<PostAction, ViewerRole[]> = {
        view: ['owner', 'viewer', 'admin', 'guest'],
        edit: ['owner'], // Admin could edit too depending on business rules, strictly owner for now
        delete: ['owner', 'admin'],
        markSold: ['owner'], // Admin could mark as sold too
        boost: ['owner'],
        report: ['viewer'], // Owner doesn't report own post, Admin deletes directly
        block: ['viewer'], // Owner doesn't block himself, Admin bans user
        like: ['owner', 'viewer', 'admin'],
        bookmark: ['owner', 'viewer', 'admin'],
        share: ['owner', 'viewer', 'admin', 'guest'],
        whatsapp: ['viewer', 'admin'], // Owner doesn't need whatsapp link to himself
    };

    return permissions[action]?.includes(viewerRole) ?? false;
}
