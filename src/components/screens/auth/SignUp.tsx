'use client';

import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useNotify } from '@/components/ui/Toast';
import Logo from '@/components/shared/Logo';

export default function SignUpScreen() {
    const notify = useNotify();
    const [message, setMessage] = React.useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [acceptedTerms, setAcceptedTerms] = React.useState(false);

    const notifyError = (text: string) => setMessage({ type: 'error', text });

    return (
        <>
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                    style={{ backgroundImage: "url('/entrepreneur_background_1772656875289.png')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 min-h-screen">
                <div className="w-full max-w-[420px] flex flex-col items-center gap-8 animate-fade-in-up">

                    {/* Branding */}
                    <div className="flex flex-col items-center gap-4">
                        <Logo width={240} height={60} showTagline={false} />
                    </div>

                    {/* Hero Text */}
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-slate-900 text-[32px] font-bold leading-[1.15] tracking-tight">
                            Criar Conta
                        </h1>
                        <p className="text-[#94a3b8] text-base font-normal leading-relaxed px-4">
                            Junte-se à comunidade e comece a negociar hoje.
                        </p>
                    </div>

                    {/* Form */}
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
                                    id="terms-signup"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-white text-primary focus:ring-primary focus:ring-offset-background-dark"
                                />
                            </div>
                            <div className="text-xs text-[#94a3b8]">
                                <label htmlFor="terms-signup" className="font-medium">
                                    Li e aceito os <Link href="/support/rules" target="_blank" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/support/rules" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
                                </label>
                            </div>
                        </div>

                        {/* Google Login (Same as Login) */}
                        <button
                            type="button"
                            disabled={!acceptedTerms}
                            onClick={async () => {
                                if (!acceptedTerms) {
                                    notifyError('Você precisa aceitar os termos para continuar.');
                                    return;
                                }
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                });
                                if (error) notifyError('Erro ao cadastrar com Google: ' + error.message);
                            }}
                            className={`group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-5 border transition-all duration-200 active:scale-[0.98] ${acceptedTerms
                                ? 'bg-white dark:bg-[#1A2621]/50 border-gray-200 dark:border-slate-200 hover:bg-gray-50 dark:hover:bg-slate-100'
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                }`}>
                            <div className="bg-white p-1 rounded-full flex items-center justify-center size-6">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="size-4" />
                            </div>
                            <span className="text-gray-700 dark:text-slate-900 text-base font-bold tracking-wide">Cadastrar com Google</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <span className="text-[#94a3b8] text-sm">Já tem uma conta?</span>
                        <Link href="/auth/login" className="text-primary hover:text-slate-900 font-bold text-sm transition-colors">
                            Entrar
                        </Link>
                    </div>

                    <div className="mt-auto pt-6 text-center">
                        <p className="text-[#4e6356] text-sm font-normal leading-normal px-6">
                            Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço do Google.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
