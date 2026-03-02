'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReports, useAdminActions } from '@/lib/hooks/useAdmin';
import { useNavigation } from '@/context/NavigationContext';
import { formatRelativeTime } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui/Modal';
import { getR2Url } from '@/lib/images';


export default function ModerationQueue() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('pending');
    const [filterType, setFilterType] = useState<string>('');
    const { openPostDetail } = useNavigation();

    const { reports, stats, loading, error, dismissReport, resolveReport, refetch } = useReports({
        status: filterStatus || undefined,
        type: filterType || undefined,
        limit: 50,
    });

    const { banUser, removePost, issueWarning, loading: actionLoading } = useAdminActions();

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'default';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'default'
    });

    const handleDismiss = (reportId: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Descartar Denúncia',
            message: 'Tem certeza que deseja descartar esta denúncia?',
            onConfirm: () => dismissReport(reportId),
            variant: 'default'
        });
    };

    const handleRemovePost = (reportId: string, postId: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Remover Post',
            message: 'Tem certeza que deseja remover este post? Esta ação não pode ser desfeita.',
            onConfirm: async () => {
                const success = await removePost(postId);
                if (success) {
                    await resolveReport(reportId);
                }
            },
            variant: 'danger'
        });
    };

    const handleBanUser = (reportId: string, userId: string) => {
        const reason = prompt('Motivo do banimento:');
        if (!reason) return;
        setConfirmState({
            isOpen: true,
            title: 'Banir Usuário',
            message: `Tem certeza que deseja banir este usuário pelo motivo: "${reason}"?`,
            onConfirm: async () => {
                const success = await banUser(userId, reason);
                if (success) {
                    await resolveReport(reportId);
                }
            },
            variant: 'danger'
        });
    };

    const handleWarn = (reportId: string, userId: string) => {
        const reason = prompt('Mensagem de aviso:');
        if (!reason) return;
        setConfirmState({
            isOpen: true,
            title: 'Enviar Aviso',
            message: `Enviar o seguinte aviso ao usuário: "${reason}"?`,
            onConfirm: async () => {
                const success = await issueWarning(userId, reason);
                if (success) {
                    await resolveReport(reportId);
                }
            },
            variant: 'warning'
        });
    };

    const getReasonBadge = (reason: string) => {
        const badges: Record<string, { bg: string; text: string; icon: string }> = {
            scam: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', icon: 'warning' },
            spam: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500', icon: 'report' },
            inappropriate: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-500', icon: 'policy' },
            harassment: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-500', icon: 'record_voice_over' },
            illegal: { bg: 'bg-red-700/10 border-red-700/20', text: 'text-red-700', icon: 'gavel' },
            other: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', icon: 'help' },
        };
        return badges[reason] || badges.other;
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-white overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-tight">Painel Admin</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Moderação</p>
                            </div>
                        </div>
                        <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <div className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moderação</div>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-slate-900 group transition-colors" href="/admin/moderation">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>flag</span>
                        <span className="text-sm font-medium">Denúncias</span>
                        {stats.pending > 0 && (
                            <span className="ml-auto bg-white/20 text-slate-900 text-xs py-0.5 px-2 rounded-full">{stats.pending}</span>
                        )}
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/users">
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
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/settings">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>settings</span>
                        <span className="text-sm font-medium">Configurações</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-200">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 w-full transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                        <span className="text-sm font-medium">Voltar ao Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-white">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined">shield</span>
                        </div>
                        <h2 className="text-lg font-bold">Moderação</h2>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                {/* Desktop Top Bar */}
                <header className="hidden lg:flex items-center justify-between border-b border-gray-200 dark:border-slate-200 bg-white/50 dark:bg-white/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Fila de Moderação</h2>
                        {stats.pending > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold border border-orange-500/20">
                                {stats.pending} pendentes
                            </span>
                        )}
                    </div>
                    <button onClick={refetch} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">refresh</span>
                        <span className="text-sm">Atualizar</span>
                    </button>
                </header>

                {/* Scrollable Feed */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pendentes</p>
                                    <span className="material-symbols-outlined text-orange-500" style={{ fontSize: "20px" }}>pending_actions</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Resolvidas</p>
                                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>check_circle</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.resolved}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Descartadas</p>
                                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>cancel</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.dismissed}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-0 pt-2 bg-background-light dark:bg-white pb-2">
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'pending' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}
                                >
                                    Pendentes
                                </button>
                                <button
                                    onClick={() => setFilterStatus('resolved')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === 'resolved' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}
                                >
                                    Resolvidas
                                </button>
                                <button
                                    onClick={() => setFilterStatus('')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === '' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}
                                >
                                    Todas
                                </button>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
                                <button
                                    onClick={() => setFilterType('')}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === '' ? 'bg-slate-700 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-900'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterType('post')}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === 'post' ? 'bg-slate-700 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-900'}`}
                                >
                                    Posts
                                </button>
                                <button
                                    onClick={() => setFilterType('user')}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === 'user' ? 'bg-slate-700 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-900'}`}
                                >
                                    Usuários
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                                <p>{error}</p>
                                <button onClick={refetch} className="mt-2 text-sm underline">Tentar novamente</button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && reports.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">inbox</span>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma denúncia</h3>
                                <p className="text-sm text-slate-400">Não há denúncias {filterStatus === 'pending' ? 'pendentes' : ''} no momento</p>
                            </div>
                        )}

                        {/* Feed Items */}
                        <div className="flex flex-col gap-4 pb-20">
                            {reports.map((report) => {
                                const badge = getReasonBadge(report.reason);
                                return (
                                    <article key={report.id} className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm group hover:border-primary/30 transition-colors">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-200/50">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 bg-slate-700"
                                                    style={{ backgroundImage: report.reporter?.avatar_url ? `url("${getR2Url(report.reporter.avatar_url)}")` : undefined }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-900">
                                                        Denunciado por <span className="text-primary hover:underline cursor-pointer">@{report.reporter?.username || 'Anônimo'}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500">{formatRelativeTime(report.created_at)} • ID: #{report.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${badge.bg} border`}>
                                                <span className={`material-symbols-outlined ${badge.text} text-base`}>{badge.icon}</span>
                                                <span className={`text-xs font-bold ${badge.text} uppercase`}>{report.reason}</span>
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-4 flex flex-col md:flex-row gap-4">
                                            {/* Post Report */}
                                            {report.target_type === 'post' && report.target_post && (
                                                <>
                                                    <div className="w-full md:w-48 shrink-0">
                                                        <div
                                                            className="aspect-[4/3] rounded-lg bg-cover bg-center border border-gray-700 relative"
                                                            style={{ backgroundImage: `url("${getR2Url(report.target_post.images?.[0]?.url) || '/images/default-post.png'}")` }}
                                                        >
                                                            <div
                                                                onClick={() => openPostDetail(report.target_post!.id)}
                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                            >
                                                                <span className="px-3 py-1 bg-black/60 text-slate-900 text-xs rounded-full backdrop-blur-sm">Ver Anúncio</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{report.target_post.title}</h3>
                                                            <span className="text-green-400 font-mono font-bold text-lg">R$ {report.target_post.price}</span>
                                                        </div>
                                                        {report.details && (
                                                            <p className="text-sm text-slate-400 line-clamp-2">{report.details}</p>
                                                        )}
                                                        <div className="mt-auto pt-2 flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">person</span>
                                                                Vendedor: <span className="text-slate-300">@{report.target_post.user?.username || 'Unknown'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* User Report */}
                                            {report.target_type === 'user' && report.target_user && (
                                                <div className="flex gap-4 items-center w-full">
                                                    <div
                                                        className="size-16 rounded-full bg-slate-700 bg-cover bg-center"
                                                        style={{ backgroundImage: `url("${getR2Url(report.target_user.avatar_url) || '/images/default-avatar.png'}")` }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-slate-900">Usuário: @{report.target_user.username}</h3>
                                                        {report.details && (
                                                            <p className="text-sm text-slate-400 mt-1">{report.details}</p>
                                                        )}
                                                        <div className="mt-2 flex gap-2">
                                                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                                Membro desde: {new Date(report.target_user.created_at).getFullYear()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Toolbar */}
                                        {report.status === 'pending' && (
                                            <div className="bg-gray-50 dark:bg-[#151b26] p-3 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 dark:border-slate-200">
                                                <button
                                                    onClick={() => handleDismiss(report.id)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                                                >
                                                    Descartar
                                                </button>

                                                {report.target_type === 'post' && report.target_post && (
                                                    <button
                                                        onClick={() => handleRemovePost(report.id, report.target_post!.id)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium hover:bg-red-500 hover:text-slate-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span> Remover Post
                                                    </button>
                                                )}

                                                {report.target_type === 'user' && report.target_user && (
                                                    <button
                                                        onClick={() => handleWarn(report.id, report.target_user!.id)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm font-medium hover:bg-orange-500 hover:text-slate-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">warning</span> Aviso
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleBanUser(report.id, report.target_type === 'post' ? report.target_post?.user_id || '' : report.target_user?.id || '')}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 rounded-lg bg-red-600 text-slate-900 text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-lg">gavel</span> Banir
                                                </button>
                                            </div>
                                        )}

                                        {/* Resolved Status */}
                                        {report.status !== 'pending' && (
                                            <div className="bg-gray-50 dark:bg-[#151b26] p-3 border-t border-gray-200 dark:border-slate-200">
                                                <span className={`text-sm font-medium ${report.status === 'resolved' ? 'text-green-500' : 'text-slate-400'}`}>
                                                    {report.status === 'resolved' ? 'Resolvida' : 'Descartada'}
                                                </span>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    confirmState.onConfirm();
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }}
                title={confirmState.title}
                message={confirmState.message}
                variant={confirmState.variant}
            />
        </div >
    );
}
