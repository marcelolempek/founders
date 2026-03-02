import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { getViewerRole } from '@/lib/utils/postPermissions';
import { ViewerRole } from '@/types/post';

export function useViewerRole(authorId: string): ViewerRole {
    const { user, loading } = useUser();

    return useMemo(() => {
        if (loading) return 'guest'; // Default to guest while loading

        // Assuming user object has a role property, if not defaulting to 'user'
        // Adjust type casting based on actual User type if needed
        const userRole = (user as any)?.role as 'user' | 'admin' | 'moderator' | undefined;

        return getViewerRole(user?.id, authorId, userRole);
    }, [user, loading, authorId]);
}
