'use client';

import { useState } from 'react';
import { Report, Profile } from '@/lib/database.types';
import { supabase, getCurrentUser } from '@/lib/supabase';

interface ExtendedReport extends Report {
    reporter?: Profile;
    target_preview?: { image?: string; title?: string; username?: string };
}

interface ReportCardProps {
    report: ExtendedReport;
    onAction?: () => void;
    onViewPost?: (postId: string) => void;
}

export default function ReportCard({ report, onAction, onViewPost }: ReportCardProps) {
    const [loading, setLoading] = useState(false);

    const targetPreview = report.target_preview;
    const reporter = report.reporter;

    const handleDismiss = async () => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) return;

            const { error } = await supabase
                .from('reports')
                // @ts-ignore - reports table exists
                .update({
                    status: 'dismissed',
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.id,
                })
                .eq('id', report.id);

            if (error) throw error;
            onAction?.();
        } catch (err) {
            console.error('Error dismissing report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) return;

            const { error } = await supabase
                .from('reports')
                // @ts-ignore - reports table exists
                .update({
                    status: 'resolved',
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.id,
                })
                .eq('id', report.id);

            if (error) throw error;
            onAction?.();
        } catch (err) {
            console.error('Error resolving report:', err);
        } finally {
            setLoading(false);
        }
    };

    const isResolved = report.status !== 'pending';

    return (
        <article className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:border-blue-500/30 transition-all">
            <div className="p-4 flex flex-col md:flex-row gap-4">
                {/* Target Preview */}
                <div className="shrink-0">
                    {targetPreview?.image ? (
                        <div
                            className="size-24 rounded-lg bg-cover bg-center border border-gray-100 dark:border-gray-700 cursor-pointer"
                            style={{ backgroundImage: `url(${targetPreview.image})` }}
                            onClick={() => report.target_type === 'post' && report.target_id && onViewPost?.(report.target_id)}
                        />
                    ) : (
                        <div className="size-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-3xl">image_not_supported</span>
                        </div>
                    )}
                </div>

                {/* Report Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${report.target_type === 'post'
                                        ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
                                        : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                                    }`}>
                                    {report.target_type === 'post' ? 'Anúncio' : 'Usuário'}
                                </span>
                                {report.status !== 'pending' && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${report.status === 'resolved'
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
                                        }`}>
                                        {report.status === 'resolved' ? 'Resolvido' : 'Dispensado'}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-400">
                                {new Date(report.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-900 truncate">
                            {report.reason}: <span className="font-normal text-slate-600 dark:text-slate-300">
                                {targetPreview?.title || targetPreview?.username || 'Conteúdo removido'}
                            </span>
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Motivo:</span> "{report.details || 'Sem detalhes'}"
                        </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                        <span>Reportado por @{reporter?.username || 'Anônimo'}</span>
                        <span>•</span>
                        <span>ID: {report.id.slice(0, 8)}...</span>
                    </div>
                </div>

                {/* Actions */}
                {!isResolved && (
                    <div className="flex flex-row md:flex-col gap-2 justify-center md:border-l border-gray-100 dark:border-gray-800 md:pl-4 mt-4 md:mt-0">
                        <button
                            onClick={handleResolve}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Resolver
                        </button>
                        <button
                            onClick={handleDismiss}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                            Dispensar
                        </button>
                    </div>
                )}

                {isResolved && (
                    <div className="flex items-center justify-center md:border-l border-gray-100 dark:border-gray-800 md:pl-4 mt-4 md:mt-0">
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${report.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                            }`}>
                            <span className="material-symbols-outlined text-lg align-middle mr-1">
                                {report.status === 'resolved' ? 'verified' : 'cancel'}
                            </span>
                            {report.status === 'resolved' ? 'Resolvido' : 'Dispensado'}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
