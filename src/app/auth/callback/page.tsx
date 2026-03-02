'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Auth callback error:', sessionError);
                    setStatus('error');
                    setErrorMessage(sessionError.message);
                    setTimeout(() => router.replace('/auth/login'), 2000);
                    return;
                }

                if (session) {
                    // Fetch profile with proper typing to avoid lint errors
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('phone')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError && profileError.code !== 'PGRST116') {
                        console.error('Profile fetch error:', profileError);
                    }

                    // Type assertion to access 'phone' safely
                    const userProfile = profile as { phone?: string } | null;

                    if (!userProfile || !userProfile.phone) {
                        window.location.href = '/auth/complete-profile';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    setStatus('error');
                    setErrorMessage('Sessão não encontrada');
                    setTimeout(() => router.replace('/auth/login'), 2000);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setStatus('error');
                setTimeout(() => router.replace('/auth/login'), 2000);
            }
        };

        handleCallback();
    }, [router]);

    // Stealth UI - Full background matching the theme. 
    // No text or UI elements are shown during the 'loading' phase to make it invisible to the user.
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e2741]">
            {status === 'error' && (
                <div className="text-center bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-sm animate-fade-in">
                    <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
                    <h2 className="text-white text-lg font-bold">Falha na Autenticação</h2>
                    <p className="text-red-400 text-sm mt-2">{errorMessage || 'Não foi possível completar seu login.'}</p>
                    <p className="text-white/40 text-xs mt-4">Redirecionando...</p>
                </div>
            )}

            {/* 
               If loading or success, we show absolutely nothing. 
               The browser just sees the dark navy background while the redirect happens.
            */}
        </div>
    );
}
