'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserManagement, useAdminActions } from '@/lib/hooks/useAdmin';
import { formatRelativeTime } from '@/lib/utils';
import { getR2Url } from '@/lib/images';


export default function UserManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
    const [filterRole, setFilterRole] = useState<string>('');

    const { users, totalCount, loading, error, refetch } = useUserManagement({
        search: searchQuery || undefined,
        status: filterStatus,
        role: filterRole || undefined,
        limit: 50,
    });

    const { banUser, unbanUser, verifyUser, unverifyUser, loading: actionLoading } = useAdminActions();

    const handleBan = async (userId: string) => {
        const reason = prompt('Motivo do banimento:');
        if (!reason) return;
        const success = await banUser(userId, reason);
        if (success) refetch();
    };

    const handleUnban = async (userId: string) => {
        if (!confirm('Desbanir este usuário?')) return;
        const success = await unbanUser(userId);
        if (success) refetch();
    };

    const handleVerify = async (userId: string) => {
        if (!confirm('Verificar este usuário?')) return;
        const success = await verifyUser(userId);
        if (success) refetch();
    };

    // Calculate stats
    const activeUsers = users.filter(u => u.status === 'active').length;
    const bannedUsers = users.filter(u => u.status === 'banned').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    return (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-tight">Admin Console</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Usuários</p>
                            </div>
                        </div>
                        <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <div className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moderação</div>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/moderation">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>flag</span>
                        <span className="text-sm font-medium">Denúncias</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-slate-900 group transition-colors shadow-lg shadow-primary/20" href="/admin/users">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>group</span>
                        <span className="text-sm font-medium">Usuários</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/dashboard">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>monitoring</span>
                        <span className="text-sm font-medium">Estatísticas</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/badge-management">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified</span>
                        <span className="text-sm font-medium">Badges</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-slate-200">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 w-full transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                        <span className="text-sm font-medium">Voltar ao Site</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-white">
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <h2 className="text-lg font-bold">Usuários</h2>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                <header className="hidden lg:flex items-center justify-between border-b border-gray-200 dark:border-slate-200 bg-white/50 dark:bg-white/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
                        <span className="text-sm text-slate-500">{totalCount} usuários</span>
                    </div>
                    <button onClick={refetch} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">refresh</span>
                        <span className="text-sm">Atualizar</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto flex flex-col gap-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total</p>
                                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>group</span>
                                </div>
                                <p className="text-2xl font-bold">{totalCount}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ativos</p>
                                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>check_circle</span>
                                </div>
                                <p className="text-2xl font-bold">{activeUsers}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Banidos</p>
                                    <span className="material-symbols-outlined text-red-500" style={{ fontSize: "20px" }}>block</span>
                                </div>
                                <p className="text-2xl font-bold">{bannedUsers}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Admins</p>
                                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: "20px" }}>admin_panel_settings</span>
                                </div>
                                <p className="text-2xl font-bold">{adminUsers}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-0 pt-2 bg-background-light dark:bg-white pb-2">
                            <div className="relative w-full md:w-96">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>search</span>
                                </div>
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary shadow-sm"
                                    placeholder="Buscar por nome, ID ou email..."
                                    type="text"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterStatus('active')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'active' ? 'bg-green-500 text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Ativos
                                </button>
                                <button
                                    onClick={() => setFilterStatus('banned')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'banned' ? 'bg-red-500 text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Banidos
                                </button>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                                <p>{error}</p>
                                <button onClick={refetch} className="mt-2 text-sm underline">Tentar novamente</button>
                            </div>
                        )}

                        {/* User List */}
                        {!loading && !error && (
                            <div className="flex flex-col gap-3 pb-20">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <div className="col-span-4">Usuário</div>
                                    <div className="col-span-2">Função & Status</div>
                                    <div className="col-span-3">Info</div>
                                    <div className="col-span-3 text-right">Ações</div>
                                </div>

                                {users.map((user) => (
                                    <article key={user.id} className={`bg-white dark:bg-white rounded-xl border shadow-sm group transition-all hover:shadow-md ${user.status === 'banned' ? 'border-red-500/30 opacity-75' : 'border-gray-200 dark:border-slate-200 hover:border-primary/30'}`}>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-4 flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div
                                                        className={`bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ${user.status === 'banned' ? 'ring-red-500/20 grayscale' : 'ring-gray-100 dark:ring-white/5'}`}
                                                        style={{ backgroundImage: user.avatar_url ? `url("${getR2Url(user.avatar_url)}")` : undefined }}
                                                    />

                                                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-surface-dark ${user.status === 'banned' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className={`text-sm font-bold truncate ${user.status === 'banned' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-900'}`}>
                                                            {user.username}
                                                        </h3>
                                                        {user.is_verified && (
                                                            <span className="material-symbols-outlined text-blue-500" style={{ fontSize: "16px" }}>verified</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {user.id.slice(0, 8)}</p>
                                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                    {user.status === 'banned' ? 'Banido' : 'Ativo'}
                                                </span>
                                            </div>

                                            <div className="md:col-span-3 text-sm text-slate-600 dark:text-slate-300">
                                                <p>{formatRelativeTime(user.created_at)}</p>
                                                <p className="text-xs text-slate-400">{user.posts_count} posts • {user.reports_count} denúncias</p>
                                            </div>

                                            <div className="md:col-span-3 flex items-center justify-end gap-2">
                                                <Link href={`/profile/${user.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors" title="Ver Perfil">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>visibility</span>
                                                </Link>

                                                {!user.is_verified && user.status !== 'banned' && (
                                                    <button
                                                        onClick={() => handleVerify(user.id)}
                                                        disabled={actionLoading}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Verificar"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified_user</span>
                                                    </button>
                                                )}

                                                {user.status === 'banned' ? (
                                                    <button
                                                        onClick={() => handleUnban(user.id)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Desbanir"
                                                    >
                                                        Desbanir
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBan(user.id)}
                                                        disabled={actionLoading}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Banir"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>block</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {users.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">person_search</span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum usuário encontrado</h3>
                                        <p className="text-sm text-slate-400">Tente ajustar os filtros de busca</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
