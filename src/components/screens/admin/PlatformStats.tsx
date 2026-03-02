'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStats } from '@/lib/hooks/useAdmin';
import { formatRelativeTime } from '@/lib/utils';
import { useNavigation } from '@/context/NavigationContext';
import { getR2Url } from '@/lib/images';


export default function PlatformStats() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { stats, topSellers, recentActivity, loading, error, refetch } = usePlatformStats();
    const { openPostDetail } = useNavigation();

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
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Estatísticas</p>
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
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/users">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>group</span>
                        <span className="text-sm font-medium">Usuários</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-slate-900 group transition-colors shadow-lg shadow-primary/20" href="/admin/dashboard">
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

            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-white h-full overflow-hidden">
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined">monitoring</span>
                        </div>
                        <h2 className="text-lg font-bold">Estatísticas</h2>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                <header className="hidden lg:flex items-center justify-between border-b border-gray-200 dark:border-slate-200 bg-white/50 dark:bg-white/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Estatísticas da Plataforma</h2>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Dados em Tempo Real
                        </span>
                    </div>
                    <button onClick={refetch} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">refresh</span>
                        <span className="text-sm">Atualizar</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center max-w-lg mx-auto">
                            <p>{error}</p>
                            <button onClick={refetch} className="mt-2 text-sm underline">Tentar novamente</button>
                        </div>
                    )}

                    {!loading && !error && stats && (
                        <div className="max-w-7xl mx-auto flex flex-col gap-6">
                            {/* Main Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>group</span>
                                        </div>
                                        {stats.new_users_today > 0 && (
                                            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">+{stats.new_users_today} hoje</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Usuários</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.total_users.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>post_add</span>
                                        </div>
                                        {stats.new_posts_today > 0 && (
                                            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">+{stats.new_posts_today} hoje</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Posts</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.total_posts.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>inventory_2</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Posts Ativos</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.active_posts.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>handshake</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Vendas Concluídas</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.sold_posts.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reports Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>flag</span>
                                        </div>
                                        {stats.pending_reports > 0 && (
                                            <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded">{stats.pending_reports} pendentes</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Denúncias</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.total_reports.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                            <span className="material-symbols-outlined block" style={{ fontSize: "24px" }}>pending_actions</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Denúncias Pendentes</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 mt-1">{stats.pending_reports}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Sellers */}
                                <div className="bg-white dark:bg-white rounded-xl p-6 border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">Top Vendedores</h3>
                                        <span className="text-xs text-slate-500">Por vendas concluídas</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {topSellers.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-4">Nenhuma venda registrada</p>
                                        ) : (
                                            topSellers.map((seller: any, index: number) => (
                                                <div key={seller.user?.id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    <span className={`text-lg font-bold w-6 ${index < 3 ? 'text-primary' : 'text-slate-400'}`}>
                                                        #{index + 1}
                                                    </span>
                                                    <div
                                                        className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center"
                                                        style={{ backgroundImage: seller.user?.avatar_url ? `url("${getR2Url(seller.user.avatar_url)}")` : undefined }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 dark:text-slate-900 truncate flex items-center gap-1">
                                                            {seller.user?.username || 'Usuário'}
                                                            {seller.user?.is_verified && (
                                                                <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-500">{seller.count} vendas</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white dark:bg-white rounded-xl p-6 border border-gray-200 dark:border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900">Atividade Recente</h3>
                                        <span className="text-xs text-slate-500">Últimos posts</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {recentActivity.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade recente</p>
                                        ) : (
                                            recentActivity.map((activity: any) => (
                                                <button key={activity.id} onClick={() => openPostDetail(activity.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors w-full text-left">
                                                    <div
                                                        className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center"
                                                        style={{ backgroundImage: activity.user?.avatar_url ? `url("${getR2Url(activity.user.avatar_url)}")` : undefined }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 dark:text-slate-900 truncate">{activity.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            @{activity.user?.username} • {formatRelativeTime(activity.created_at)}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${activity.status === 'sold' ? 'bg-green-500/10 text-green-500' :
                                                        activity.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                        {activity.status === 'sold' ? 'Vendido' : activity.status === 'active' ? 'Ativo' : activity.status}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
