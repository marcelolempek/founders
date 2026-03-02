'use client';

import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { signOut } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/auth/login';
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-1 max-w-lg mx-auto w-full p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Configurações</h1>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-200">
                        <Link
                            href="/profile/profile"
                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-text-secondary">person</span>
                                <span className="text-slate-900">Meu Perfil</span>
                            </div>
                            <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                        </Link>

                        <Link
                            href="/settings/blocked"
                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-text-secondary">block</span>
                                <span className="text-slate-900">Usuários Bloqueados</span>
                            </div>
                            <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors text-red-400 text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-medium">Sair da Conta</span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-text-secondary">
                    <p>Empreendedores de Cristo v0.1.0</p>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
