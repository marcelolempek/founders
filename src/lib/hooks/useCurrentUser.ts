'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import type { Profile } from '@/lib/database.types';

/**
 * Hook to get the current logged-in user's profile data.
 * Always returns the logged-in user, never the profile being viewed.
 * Use this in headers, navigation, etc. to show current user info.
 */
export function useCurrentUser() {
    const { user: authUser, loading: authLoading } = useUser(); // ✅ Use cached user
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!authUser) {
                    if (isMounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }

                // Fetch full profile data
                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) {
                    console.error('Error loading user profile:', profileError);
                    if (isMounted) {
                        setError(profileError.message);
                        setLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    setUser(data as Profile);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error in useCurrentUser:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            loadUser();
        }

        return () => {
            isMounted = false;
        };
    }, [authUser, authLoading]);

    return { user, loading: loading || authLoading, error };
}
