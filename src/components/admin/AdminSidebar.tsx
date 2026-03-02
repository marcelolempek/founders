'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavLink from './AdminNavLink';
import { getCurrentProfile } from '@/lib/supabase';
import { Profile } from '@/lib/database.types';
import { adminService } from '@/services/admin';
import { getR2Url } from '@/lib/images';

interface AdminSidebarProps {
    className?: string;
    onClose?: () => void;
}

export default function AdminSidebar({ className = '', onClose }: AdminSidebarProps) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [pendingVerifications, setPendingVerifications] = useState(0);

    useEffect(() => {
        getCurrentProfile().then((p) => setProfile(p as any));
        adminService.getStats().then(stats => setPendingVerifications(stats.pendingVerifications));
    }, []);

    return (
        <aside className={`flex flex-col bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-gray-800 h-full ${className}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border-2 border-blue-600/30 shrink-0"
                        style={{ backgroundImage: `url(${getR2Url(profile?.avatar_url) || '/images/default-avatar.png'})` }}
                    ></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-slate-900">Painel Admin</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Moderador: {profile?.username || 'Carregando...'}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
                <AdminNavLink href="/admin/dashboard" icon="dashboard" label="Dashboard" />

                <div className="px-2 mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moderation</div>

                <AdminNavLink href="/admin/moderation" icon="flag" label="Conteúdo Denunciado" />

                <div className="px-2 mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gestão de Usuários</div>

                <AdminNavLink href="/admin/users" icon="group" label="Todos Usuários" />
                <AdminNavLink href="/admin/verification" icon="verified" label="Verificação" badge={pendingVerifications > 0 ? pendingVerifications : undefined} />

                <div className="px-2 mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plataforma</div>

                <AdminNavLink href="/admin/analytics" icon="monitoring" label="Analytics" />
                <AdminNavLink href="/admin/settings" icon="settings" label="Configurações" />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm font-medium">Sair do Admin</span>
                </Link>
            </div>
        </aside>
    );
}
