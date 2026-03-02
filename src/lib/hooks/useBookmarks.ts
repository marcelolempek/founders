import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

export function useBookmarks() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const checkIsBookmarked = async (postId: string): Promise<boolean> => {
        try {
            if (!user) return false;

            const { data, error } = await supabase
                .from('saved_posts')
                .select('*')
                .eq('user_id', user.id)
                .eq('post_id', postId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Error checking bookmark:', error);
            return false;
        }
    };

    const toggleBookmark = async (postId: string, currentlyBookmarked: boolean): Promise<boolean> => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            setLoading(true);

            if (currentlyBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('saved_posts')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId);

                if (error) throw error;
                return false;
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('saved_posts')
                    .insert({
                        user_id: user.id,
                        post_id: postId,
                    } as any);

                if (error) throw error;
                return true;
            }
        } catch (error) {
            console.error('Toggle bookmark error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        checkIsBookmarked,
        toggleBookmark,
        loading,
    };
}
