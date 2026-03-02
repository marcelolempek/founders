'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBadgeManagement } from '@/lib/hooks/useAdmin';
import { formatRelativeTime } from '@/lib/utils';
import { getR2Url } from '@/lib/images';


export default function BadgeManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [filterTab, setFilterTab] = useState<'pending' | 'active' | 'all'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    // Grant Badge Modal State
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
    const [grantUserId, setGrantUserId] = useState('');
    const [grantBadgeId, setGrantBadgeId] = useState('');
    const [grantExpiresAt, setGrantExpiresAt] = useState('');
    const [grantLoading, setGrantLoading] = useState(false);

    // Create Badge Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBadgeName, setNewBadgeName] = useState('');
    const [newBadgeDescription, setNewBadgeDescription] = useState('');
    const [newBadgeIcon, setNewBadgeIcon] = useState('verified');
    const [newBadgeType, setNewBadgeType] = useState('achievement');
    const [newBadgeDuration, setNewBadgeDuration] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    const {
        badges,
        pendingRequests,
        activeBadges,
        loading,
        error,
        approveBadge,
        rejectBadge,
        grantBadge,
        revokeBadge,
        createBadge,
        refetch
    } = useBadgeManagement();

    const handleApprove = async (userBadgeId: string) => {
        // Implement expiration prompt if desired, for now simple approval
        if (!confirm('Aprovar este badge?')) return;
        await approveBadge(userBadgeId);
    };

    const handleReject = async (userBadgeId: string) => {
        if (!confirm('Rejeitar esta solicitação de badge?')) return;
        await rejectBadge(userBadgeId);
    };

    // Handle Badge Selection change to auto-set expiration
    const handleBadgeSelection = (badgeId: string) => {
        setGrantBadgeId(badgeId);
        const badge = badges.find(b => b.id === badgeId);
        if (badge && badge.default_duration_days) {
            const date = new Date();
            date.setDate(date.getDate() + badge.default_duration_days);
            // Format to datetime-local string: YYYY-MM-DDTHH:mm
            const isoString = date.toISOString().slice(0, 16);
            setGrantExpiresAt(isoString);
        } else {
            setGrantExpiresAt('');
        }
    };

    const handleGrantBadge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantUserId || !grantBadgeId) return;

        setGrantLoading(true);
        try {
            const expires = grantExpiresAt ? new Date(grantExpiresAt) : undefined;
            const success = await grantBadge(grantUserId, grantBadgeId, expires);
            if (success) {
                setIsGrantModalOpen(false);
                setGrantUserId('');
                setGrantBadgeId('');
                setGrantExpiresAt('');
                setGrantLoading(false); // Reset loading state
            }
        } finally {
            setGrantLoading(false);
        }
    };

    const handleCreateBadge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBadgeName) return;

        setCreateLoading(true);
        try {
            const success = await createBadge({
                name: newBadgeName,
                description: newBadgeDescription,
                icon: newBadgeIcon,
                type: newBadgeType,
                default_duration_days: newBadgeDuration ? parseInt(newBadgeDuration) : null
            });

            if (success) {
                setIsCreateModalOpen(false);
                setNewBadgeName('');
                setNewBadgeDescription('');
                setNewBadgeIcon('verified');
                setNewBadgeType('achievement');
                setNewBadgeDuration('');
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleRevoke = async (userBadgeId: string) => {
        if (!confirm('Tem certeza que deseja remover este badge do usuário?')) return;
        await revokeBadge(userBadgeId);
    };

    // Filter Logic
    const filteredRequests = pendingRequests.filter(req =>
        req.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.badge?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredActive = activeBadges.filter(req =>
        req.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.badge?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Create Badge Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-slate-900">Criar Novo Badge</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateBadge} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Nome do Badge</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    placeholder="Ex: Vendedor Verificado"
                                    value={newBadgeName}
                                    onChange={e => setNewBadgeName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Descrição</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    placeholder="Descrição curta do badge..."
                                    value={newBadgeDescription}
                                    onChange={e => setNewBadgeDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Ícone (Google Icon)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                        placeholder="verified, star, etc"
                                        value={newBadgeIcon}
                                        onChange={e => setNewBadgeIcon(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Tipo</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                        value={newBadgeType}
                                        onChange={e => setNewBadgeType(e.target.value)}
                                    >
                                        <option value="achievement">Conquista</option>
                                        <option value="role">Cargo</option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Validade Padrão (Dias)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    placeholder="Deixe em branco para permanente"
                                    value={newBadgeDuration}
                                    onChange={e => setNewBadgeDuration(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Tempo padrão sugerido ao conceder este badge.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 text-sm font-medium text-slate-900 bg-primary hover:bg-blue-600 rounded-lg disabled:opacity-50"
                                >
                                    {createLoading ? 'Criando...' : 'Criar Badge'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Grant Badge Modal */}
            {isGrantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-slate-900">Conceder Badge Manualmente</h3>
                            <button onClick={() => setIsGrantModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleGrantBadge} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">ID do Usuário</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    placeholder="UUID do usuário"
                                    value={grantUserId}
                                    onChange={e => setGrantUserId(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Badge</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    value={grantBadgeId}
                                    onChange={e => handleBadgeSelection(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione um badge</option>
                                    {badges.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} {b.default_duration_days ? `(${b.default_duration_days} dias)` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-600 mb-1">Expira em (Opcional)</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-black/20 dark:text-slate-900"
                                    value={grantExpiresAt}
                                    onChange={e => setGrantExpiresAt(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente se o badge tiver validade padrão.</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGrantModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={grantLoading}
                                    className="px-4 py-2 text-sm font-medium text-slate-900 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                                >
                                    {grantLoading ? 'Processando...' : 'Conceder Badge'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* ... existing sidebar code ... */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-slate-900">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-tight">Admin Console</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Badges</p>
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
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/admin/dashboard">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>monitoring</span>
                        <span className="text-sm font-medium">Estatísticas</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-slate-900 group transition-colors shadow-lg shadow-primary/20" href="/admin/badge-management">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified</span>
                        <span className="text-sm font-medium">Badges</span>
                        {pendingRequests.length > 0 && (
                            <span className="ml-auto bg-white/20 text-slate-900 text-xs py-0.5 px-2 rounded-full">{pendingRequests.length}</span>
                        )}
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
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <h2 className="text-lg font-bold">Badges</h2>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                <header className="hidden lg:flex items-center justify-between border-b border-gray-200 dark:border-slate-200 bg-white/50 dark:bg-white/50 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Gerenciamento de Badges</h2>
                        {pendingRequests.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold border border-blue-500/20">
                                {pendingRequests.length} solicitações pendentes
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Criar Badge
                        </button>
                        <button
                            onClick={() => setIsGrantModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-slate-900 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Conceder Badge
                        </button>
                        <button onClick={refetch} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors ml-2">
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pendentes</p>
                                    <span className="material-symbols-outlined text-orange-500" style={{ fontSize: "20px" }}>pending_actions</span>
                                </div>
                                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tipos de Badge</p>
                                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: "20px" }}>verified</span>
                                </div>
                                <p className="text-2xl font-bold">{badges.length}</p>
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-white border border-gray-200 dark:border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ativos</p>
                                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>check_circle</span>
                                </div>
                                <p className="text-2xl font-bold">{activeBadges.length}</p>
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
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary"
                                    placeholder="Buscar usuário..."
                                    type="text"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                                <button
                                    onClick={() => setFilterTab('pending')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterTab === 'pending' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Pendentes
                                </button>
                                <button
                                    onClick={() => setFilterTab('active')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterTab === 'active' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Ativos
                                </button>
                                <button
                                    onClick={() => setFilterTab('all')}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterTab === 'all' ? 'bg-primary text-slate-900' : 'bg-white dark:bg-white border border-gray-200 dark:border-slate-200 text-slate-600 dark:text-slate-300'}`}
                                >
                                    Tipos de Badges
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

                        {/* Pending Requests */}
                        {!loading && !error && filterTab === 'pending' && (
                            <div className="flex flex-col gap-4 pb-20">
                                {filteredRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">inbox</span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma solicitação pendente</h3>
                                        <p className="text-sm text-slate-400">Todas as solicitações foram processadas</p>
                                    </div>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <article key={request.id} className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm group hover:border-primary/30 transition-colors">
                                            {/* ... request card content ... */}
                                            <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="relative">
                                                    <div
                                                        className="bg-center bg-no-repeat bg-cover rounded-full size-16 ring-4 ring-gray-100 dark:ring-white/5"
                                                        style={{ backgroundImage: request.user?.avatar_url ? `url("${getR2Url(request.user.avatar_url)}")` : undefined }}
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 p-1 rounded-full border-2 border-surface-dark shadow-sm">
                                                        <span className="material-symbols-outlined text-xs leading-none">hourglass_top</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 text-center md:text-left space-y-2 w-full">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                                                @{request.user?.username || 'Usuário'}
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wide">
                                                                    Pendente
                                                                </span>
                                                            </h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                Solicitando: <span className="text-primary font-medium">{request.badge?.name || 'Badge'}</span>
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-slate-400">{formatRelativeTime(request.created_at)}</p>
                                                    </div>
                                                    {request.badge?.description && (
                                                        <p className="text-sm text-slate-500">{request.badge.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#151b26] p-3 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 dark:border-slate-200">
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium hover:bg-red-500 hover:text-slate-900 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span> Rejeitar
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="px-4 py-2 rounded-lg bg-primary text-slate-900 text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-lg">verified</span> Aprovar Badge
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Active Badges */}
                        {!loading && !error && filterTab === 'active' && (
                            <div className="flex flex-col gap-4 pb-20">
                                {filteredActive.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">verified_user</span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum badge ativo encontrado</h3>
                                        <p className="text-sm text-slate-400">Não há usuários com badges ativos no momento.</p>
                                    </div>
                                ) : (
                                    filteredActive.map((badgeItem) => {
                                        const isExpired = badgeItem.expires_at && new Date(badgeItem.expires_at) < new Date();
                                        return (
                                            <article key={badgeItem.id} className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 overflow-hidden shadow-sm group hover:border-primary/30 transition-colors">
                                                <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="relative">
                                                        <div
                                                            className="bg-center bg-no-repeat bg-cover rounded-full size-16 ring-4 ring-green-100 dark:ring-green-900/20"
                                                            style={{ backgroundImage: badgeItem.user?.avatar_url ? `url("${getR2Url(badgeItem.user.avatar_url)}")` : undefined }}
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-slate-900 p-1 rounded-full border-2 border-surface-dark shadow-sm">
                                                            <span className="material-symbols-outlined text-xs leading-none">verified</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left space-y-2 w-full">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                                                    @{badgeItem.user?.username || 'Usuário'}
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${isExpired
                                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                        }`}>
                                                                        {isExpired ? 'Expirado' : 'Ativo'}
                                                                    </span>
                                                                </h3>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                    Badge: <span className="text-primary font-medium">{badgeItem.badge?.name || 'Badge'}</span>
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-slate-400">Aprovado em: {new Date(badgeItem.verified_at!).toLocaleDateString()}</p>
                                                                {badgeItem.expires_at && (
                                                                    <p className={`text-xs ${isExpired ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                                                        Expira em: {new Date(badgeItem.expires_at).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-[#151b26] p-3 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 dark:border-slate-200">
                                                    <button
                                                        onClick={() => handleRevoke(badgeItem.id)}
                                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium hover:bg-red-500 hover:text-slate-900 transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span> Revogar
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* All Badges */}
                        {!loading && !error && filterTab === 'all' && (
                            <div className="flex flex-col gap-4 pb-20">
                                {badges.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">workspace_premium</span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum badge cadastrado</h3>
                                        <p className="text-sm text-slate-400">Clique em "Criar Badge" para começar.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {badges.map((badge) => (
                                            <div key={badge.id} className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 p-5 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-outlined">{badge.icon || 'verified'}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-900 dark:text-slate-900">{badge.name}</h3>
                                                        <p className="text-sm text-slate-500">{badge.description || 'Sem descrição'}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <p className="text-xs text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                                                                Type: {badge.type}
                                                            </p>
                                                            {badge.default_duration_days && (
                                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">timer</span>
                                                                    {badge.default_duration_days} dias
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
