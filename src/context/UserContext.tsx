'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Definimos o tipo do perfil que vem do seu banco de dados
interface UserProfile {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
    is_verified: boolean;
}

interface UserContextType {
    user: User | null;
    profile: UserProfile | null; // Adicionamos o perfil aqui
    loading: boolean;
    refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            setUser(currentUser);

            if (currentUser) {
                // Buscamos os dados REAIS e ATUALIZADOS da tabela de perfis
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, full_name, is_verified')
                    .eq('id', currentUser.id)
                    .single();

                if (!error && data) {
                    setProfile(data);
                }
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Error fetching user/profile:', error);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Opcional: Escutar mudanças na autenticação em tempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchData();
        });

        return () => subscription.unsubscribe();
    }, []);

    const refresh = async () => {
        await fetchData();
    };

    return (
        <UserContext.Provider value={{ user, profile, loading, refresh }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}