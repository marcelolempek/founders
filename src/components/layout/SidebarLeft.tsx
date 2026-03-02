'use client';
import Link from 'next/link';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useAdmin } from '@/lib/hooks/useAdmin';

export function SidebarLeft() {
    const { unreadCount } = useNotifications();
    const { isAdmin } = useAdmin();

    return (
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-24 h-fit">
            <nav className="flex-1 px-2 space-y-1">
                <Link href="/" className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined text-primary">home</span>
                    <span className="font-bold">Início</span>
                </Link>
                <Link href="/discover" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <span className="material-symbols-outlined">assignment</span>
                    <span>Profissionais</span>
                </Link>
                <Link href="/explore" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <span className="material-symbols-outlined">grid_view</span>
                    <span>Itens</span>
                </Link>
                <Link href="/post/saved-posts" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <span className="material-symbols-outlined">bookmark</span>
                    <span>Salvos</span>
                </Link>
                <Link href="/notifications" className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined">notifications</span>
                        <span>Notificações</span>
                    </div>
                    {unreadCount > 0 && (
                        <span className="flex items-center justify-center bg-primary text-slate-900 text-[10px] font-bold h-5 w-5 rounded-full ring-2 ring-background">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>
                <Link href="/profile/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <span className="material-symbols-outlined">person</span>
                    <span>Meu Perfil</span>
                </Link>
                <div className="my-2 border-t border-white/10" />
                {isAdmin && (
                    <Link href="/admin/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Painel Admin</span>
                    </Link>
                )}
                <Link href="/support/contact" className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <span className="material-symbols-outlined">help</span>
                    <span>Ajuda e Suporte</span>
                </Link>
            </nav>
        </aside>
    );
}
