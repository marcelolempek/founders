'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import { getCurrentUser } from '@/lib/supabase';

export default function Login() {
    const router = useRouter();
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const notifyError = (text: string) => setMessage({ text, type: 'error' });

    useEffect(() => {
        const checkUser = async () => {
            const user = await getCurrentUser();
            if (user) {
                router.push('/');
            }
        };
        checkUser();
    }, [router]);

    return (
        <>
            {/* Background Layer */}
            <div className="fixed inset-0 z-0 bg-[#0e2741]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4">
                {/* Login Card */}
                <div className="w-full max-w-[420px] flex flex-col items-center gap-8 animate-fade-in-up">
                    {/* Branding Header */}
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/" className="">
                            <Logo width={240} height={60} showTagline={false} />
                        </Link>
                    </div>

                    {/* Hero Text */}
                    <div className="flex flex-col gap-2 text-center">
                        {/* <h1 className="text-white text-[32px] font-bold leading-[1.15] tracking-tight">
                            Negocie seus Produtos/Serviços de Empreendedorismo
                        </h1> */}
                        <p className="text-white text-base font-normal leading-relaxed px-4">
                            A maneira mais rápida de contratar, comprar e vender seus Produtos/Serviços.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full flex flex-col gap-4 mt-2">
                        {message && (
                            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-2 px-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-white text-primary focus:ring-primary focus:ring-offset-background-dark"
                                />
                            </div>
                            <div className="text-xs text-white">
                                <label htmlFor="terms" className="font-medium">
                                    Li e aceito os <Link href="/support/rules" target="_blank" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/support/rules" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
                                </label>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            disabled={!acceptedTerms}
                            onClick={async () => {
                                if (!acceptedTerms) {
                                    notifyError('Você precisa aceitar os termos para continuar.');
                                    return;
                                }

                                const { supabase } = await import('@/lib/supabase');
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                });

                                if (error) {
                                    notifyError('Erro ao fazer login com Google: ' + error.message);
                                }
                            }}
                            className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-5 border transition-all duration-200 active:scale-[0.98]
    
    ${acceptedTerms
                                    ? 'bg-primary border-primary text-white shadow-lg hover:brightness-110 cursor-pointer'
                                    : 'bg-gray-400 border-gray-400 text-gray-600 cursor-not-allowed opacity-70'
                                }
  `}
                        >
                            {/* Google Icon */}
                            <div className="bg-white p-1 rounded-full flex items-center justify-center size-6">
                                <svg className="size-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>

                            <span className="text-base font-bold tracking-wide">
                                Login com Google
                            </span>
                        </button>

                        {/* Trust Indicator */}
                        <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
                            <span className="material-symbols-outlined text-white text-sm">lock</span>
                            <span className="text-white text-sm font-medium">Seguro & Criptografado</span>
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="mt-auto pt-6 text-center">
                        <p className="text-[#ffffff] opacity-20 text-sm font-small leading-normal px-6">
                            Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço do Google.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
