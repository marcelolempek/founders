'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { supabase } from '@/lib/supabase';
import { adminService } from '@/services/admin';
import { useNavigation } from '@/context/NavigationContext';
import { getR2Url } from '@/lib/images';

interface DashboardStats {
    pendingReports: number;
    pendingVerifications: number;
    totalUsers: number;
    verifiedUsers: number;
    totalPosts: number;
    activePosts: number;
    recentReports: any[];
    recentUsers: any[];
}

export default function AdminDashboardPage() {
    const { openPostDetail } = useNavigation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await adminService.getStats();

                // Fetch recent items
                const [recentReportsResult, recentUsersResult] = await Promise.all([
                    supabase.from('reports')
                        .select('*, reporter:profiles!reports_reporter_id_fkey(username)')
                        .order('created_at', { ascending: false })
                        .limit(5),
                    supabase.from('profiles')
                        .select('id, username, avatar_url, created_at, is_verified')
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

                setStats({
                    ...data,
                    recentReports: recentReportsResult.data || [],
                    recentUsers: recentUsersResult.data || []
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="Dashboard" />
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatsCard
                            label="Denúncias Pendentes"
                            value={loading ? '...' : stats?.pendingReports || 0}
                            icon="flag"
                            color="red"
                        />
                        <StatsCard
                            label="Verificações Pendentes"
                            value={loading ? '...' : stats?.pendingVerifications || 0}
                            icon="verified"
                            color="blue"
                        />
                        <StatsCard
                            label="Total de Usuários"
                            value={loading ? '...' : stats?.totalUsers || 0}
                            icon="group"
                            color="green"
                        />
                        <StatsCard
                            label="Anúncios Ativos"
                            value={loading ? '...' : stats?.activePosts || 0}
                            icon="inventory_2"
                            color="purple"
                        />
                        <StatsCard
                            label="Cliques WhatsApp"
                            value={loading ? '...' : stats?.totalContactViews || 0}
                            icon="message"
                            color="green"
                        />
                    </div>

                    {/* Widgets Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                        {/* Recent Reports */}
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">flag</span>
                                    Denúncias Recentes
                                </h3>
                                <Link href="/admin/moderation" className="text-sm text-primary hover:underline">
                                    Ver todas
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    </div>
                                ) : stats.recentReports.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">task_alt</span>
                                        <p>Nenhuma denúncia recente</p>
                                    </div>
                                ) : (
                                    stats.recentReports.map((report: any) => (
                                        <div
                                            key={report.id}
                                            className={`p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${report.target_type === 'post' ? 'cursor-pointer' : ''}`}
                                            onClick={() => report.target_type === 'post' && report.target_id && openPostDetail(report.target_id)}
                                        >
                                            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${report.status === 'pending'
                                                ? 'bg-amber-500/10 text-whitember-500'
                                                : report.status === 'resolved'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {report.target_type === 'post' ? 'inventory_2' : 'person'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 truncate">
                                                    {report.reason}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    por @{report.reporter?.username || 'Anônimo'} • {formatDate(report.created_at)}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'pending'
                                                ? 'bg-amber-500/10 text-whitember-600'
                                                : report.status === 'resolved'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-slate-500/10 text-slate-600'
                                                }`}>
                                                {report.status === 'pending' ? 'Pendente' : report.status === 'resolved' ? 'Resolvido' : 'Dispensado'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">group</span>
                                    Novos Usuários
                                </h3>
                                <Link href="/admin/users" className="text-sm text-primary hover:underline">
                                    Ver todos
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    </div>
                                ) : stats.recentUsers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                                        <p>Nenhum usuário recente</p>
                                    </div>
                                ) : (
                                    stats.recentUsers.map((user: any) => (
                                        <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5">
                                            <div
                                                className="size-10 rounded-full bg-cover bg-center bg-slate-200 dark:bg-slate-700 shrink-0"
                                                style={{ backgroundImage: user.avatar_url ? `url(${getR2Url(user.avatar_url)})` : undefined }}
                                            >
                                                {!user.avatar_url && (
                                                    <div className="size-full flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 truncate flex items-center gap-1">
                                                    @{user.username}
                                                    {user.is_verified && (
                                                        <span className="material-symbols-outlined text-blue-500 text-sm filled">verified</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Registrado em {formatDate(user.created_at)}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/profile/${user.id}`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Ver perfil
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 lg:col-span-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">analytics</span>
                                Resumo da Plataforma
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-900">
                                        {loading ? '...' : stats.totalUsers}
                                    </p>
                                    <p className="text-sm text-slate-500">Usuários</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {loading ? '...' : stats.verifiedUsers}
                                    </p>
                                    <p className="text-sm text-slate-500">Verificados</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <p className="text-3xl font-bold text-emerald-600">
                                        {loading ? '...' : stats.totalPosts}
                                    </p>
                                    <p className="text-sm text-slate-500">Anúncios</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <p className="text-3xl font-bold text-purple-600">
                                        {loading ? '...' : stats.activePosts}
                                    </p>
                                    <p className="text-sm text-slate-500">Ativos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
