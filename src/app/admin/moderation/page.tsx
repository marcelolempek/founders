'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import AdminHeader from '@/components/admin/AdminHeader';
import ReportCard from '@/components/admin/ReportCard';
import { adminService } from '@/services/admin';

type ReportStatus = 'all' | 'pending' | 'resolved' | 'dismissed';

export default function AdminModerationPage() {
    const { openPostDetail } = useNavigation();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<ReportStatus>('pending');

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.getReports(activeFilter);
            setReports(data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filters: { key: ReportStatus; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'pending', label: 'Pendentes' },
        { key: 'resolved', label: 'Resolvidos' },
        { key: 'dismissed', label: 'Dispensados' },
    ];

    return (
        <>
            <div className="hidden lg:block">
                <AdminHeader title="Fila de Moderação" />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-20">
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter.key
                                    ? 'bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900'
                                    : 'bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-800 text-slate-600 dark:text-slate-300 hover:border-blue-500/50'
                                    }`}
                            >
                                {filter.label}
                                {filter.key === 'pending' && reports.length > 0 && activeFilter === 'pending' && (
                                    <span className="ml-2 bg-red-500 text-slate-900 text-xs px-1.5 py-0.5 rounded-full">
                                        {reports.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Reports List */}
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white dark:bg-[#1a202c] rounded-xl p-6 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="size-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
                                    {activeFilter === 'pending' ? 'task_alt' : 'inbox'}
                                </span>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                                    {activeFilter === 'pending'
                                        ? 'Nenhuma denúncia pendente. Bom trabalho!'
                                        : activeFilter === 'all'
                                            ? 'Nenhuma denúncia encontrada.'
                                            : `Nenhuma denúncia ${activeFilter === 'resolved' ? 'resolvida' : 'dispensada'}.`
                                    }
                                </p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onAction={fetchReports}
                                    onViewPost={openPostDetail}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
