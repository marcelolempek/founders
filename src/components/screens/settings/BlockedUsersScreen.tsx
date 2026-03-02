'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';
import { useSocial } from '@/lib/hooks/useSocial';
import { useNotify } from '@/components/ui/Toast';
import { formatRelativeTime } from '@/lib/utils';
import { getR2Url } from '@/lib/images';


export default function BlockedUsersScreen() {
    const { getBlockedUsers, unblockUser, loading } = useSocial();
    const { success: notifySuccess, error: notifyError } = useNotify();
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    const loadBlockedUsers = async () => {
        setFetching(true);
        const users = await getBlockedUsers();
        // @ts-ignore
        setBlockedUsers(users || []);
        setFetching(false);
    };

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const handleUnblock = async (userId: string, username: string) => {
        const success = await unblockUser(userId);
        if (success) {
            notifySuccess(`Você desbloqueou ${username}`);
            // Remove from list immediately
            setBlockedUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            notifyError('Erro ao desbloquear usuário');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 px-0 sm:px-4 lg:px-8">
                <SidebarLeft />
                <section className="col-span-1 md:col-span-9 lg:col-span-6 flex flex-col gap-6 pb-20">

                    {/* Page Header */}
                    <div className="flex items-center gap-4 px-4 sm:px-0 mb-2">
                        <Link href="/profile/profile" className="p-2 -ml-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-slate-900 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">Usuários Bloqueados</h1>
                    </div>

                    {/* Blocked List */}
                    <div className="flex flex-col gap-4 mx-4 sm:mx-0">
                        {fetching ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : blockedUsers.length === 0 ? (
                            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
                                <span className="material-symbols-outlined text-4xl text-text-secondary/50 mb-3">block</span>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum usuário bloqueado</h3>
                                <p className="text-sm text-text-secondary">
                                    Você não bloqueou ninguém ainda.
                                </p>
                            </div>
                        ) : (
                            blockedUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group transition-colors hover:border-slate-200/80">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-cover bg-center border border-white/10"
                                            style={{ backgroundImage: `url("${getR2Url(user.avatar_url) || '/images/default-avatar.png'}")` }}
                                        />

                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 leading-tight">{user.username}</span>
                                            <span className="text-xs text-text-secondary">
                                                Bloqueado há {formatRelativeTime(user.blocked_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnblock(user.id, user.username)}
                                        disabled={loading}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-slate-900 transition-colors"
                                    >
                                        Desbloquear
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <SidebarRight />
            </main>
            <MobileNav />
        </div>
    );
}
