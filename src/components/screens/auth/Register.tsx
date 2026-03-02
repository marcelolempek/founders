'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/shared/Logo';

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        state: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            const { error } = await (supabase as any)
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    phone: formData.phone,
                    location_city: formData.city,
                    location_state: formData.state,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;

            router.push('/');
        } catch (error: any) {
            console.error('Erro ao salvar perfil:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white flex flex-col">
                <header className="p-6">
                    <Logo width={180} height={45} showTagline={false} />
                </header>

                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-[480px] bg-card-dark border border-slate-200 rounded-2xl p-8 shadow-2xl animate-fade-in">
                        <div className="flex flex-col gap-2 mb-8">
                            <h1 className="text-2xl font-bold text-slate-900">Complete seu cadastro</h1>
                            <p className="text-[#ffffff]">Precisamos de mais algumas informações para você começar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="fullName">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-200 bg-white dark:bg-white px-4 py-3.5 text-base text-gray-900 dark:text-slate-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                        id="fullName"
                                        placeholder="Seu nome"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-primary">
                                        <span className="material-symbols-outlined text-xl">check_circle</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex gap-1 text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="phone">
                                    WhatsApp / Telefone <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 dark:text-[#94a3b8]">
                                        <span className="material-symbols-outlined text-xl">call</span>
                                    </div>
                                    <input
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-200 bg-white dark:bg-white pl-11 pr-4 py-3.5 text-base text-gray-900 dark:text-slate-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                        id="phone"
                                        placeholder="(00) 00000-0000"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-[#94a3b8]/70">
                                    Utilizaremos este número apenas para negociações.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-[3] flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="city">
                                        Cidade
                                    </label>
                                    <input
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-200 bg-white dark:bg-white px-4 py-3.5 text-base text-gray-900 dark:text-slate-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                        id="city"
                                        placeholder="Ex: São Paulo"
                                        type="text"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="flex flex-[1] flex-col gap-2 min-w-[80px]">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="state">
                                        UF
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none rounded-lg border border-gray-300 dark:border-slate-200 bg-white dark:bg-white px-4 py-3.5 text-base text-gray-900 dark:text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors cursor-pointer"
                                            id="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option disabled value="">UF</option>
                                            <option value="SP">SP</option>
                                            <option value="RJ">RJ</option>
                                            <option value="MG">MG</option>
                                            <option value="RS">RS</option>
                                            <option value="PR">PR</option>
                                            <option value="SC">SC</option>
                                            <option value="BA">BA</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#1d4ed8] px-6 py-4 text-base font-bold text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(19,231,97,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                <span>{loading ? 'Salvando...' : 'Acessar Plataforma'}</span>
                                {!loading && <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>}
                            </button>
                        </form>
                    </div>
                </main>

                <footer className="py-6 text-center flex flex-col gap-2">
                    <Link href="/auth/login" className="text-sm text-gray-500 dark:text-[#94a3b8] hover:text-primary transition-colors">
                        Already have an account? <span className="font-bold">Login</span>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]/50">
                        Ao continuar, você concorda com nossos <Link href="/support/rules" className="underline hover:text-primary">Termos de Uso</Link>.
                    </p>
                </footer>
            </div>
        </>
    );
}
