'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Profile } from '@/lib/database.types';
import { formatRelativeTime } from '@/lib/utils';
import { getR2Url } from '@/lib/images';


interface UserDetailModalProps {
    userId: string;
    onClose: () => void;
}

export default function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const details = await adminService.getUserDetails(userId);
                setData(details);
            } catch (error) {
                console.error('Failed to load user details', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId]);

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1a202c] z-10">
                    <h3 className="font-bold text-xl dark:text-slate-900">Detalhes do Usuário</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : data ? (
                    <div className="p-6 space-y-8">
                        {/* Header Profile */}
                        <div className="flex items-start gap-5">
                            <div
                                className="size-20 rounded-full bg-gray-200 bg-cover bg-center border-2 border-gray-100 dark:border-gray-700"
                                style={{ backgroundImage: data.profile.avatar_url ? `url("${getR2Url(data.profile.avatar_url)}")` : undefined }}
                            />

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-bold dark:text-slate-900">@{data.profile.username}</h2>
                                    {data.profile.is_verified && <span className="material-symbols-outlined text-blue-500">verified</span>}
                                    <span className={`px-2 py-0.5 text-xs rounded-full uppercase font-bold tracking-wide ${data.profile.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {data.profile.status || 'Active'}
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{data.profile.full_name || 'Sem nome completo'}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">mail</span> {data.profile.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span> {data.profile.location_city || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span> {new Date(data.profile.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <h4 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Badges</h4>
                            {data.badges.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {data.badges.map((b: any) => (
                                        <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-500/20">
                                            <span className="material-symbols-outlined text-[18px]">{b.badge?.icon || 'verified'}</span>
                                            <span className="text-sm font-medium">{b.badge?.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Nenhum badge atribuído.</p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold">Vendas</p>
                                <p className="text-2xl font-bold dark:text-slate-900 mt-1">{data.salesCount}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold">Posts</p>
                                <p className="text-2xl font-bold dark:text-slate-900 mt-1">{data.profile.posts_count || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold">Denúncias (Alvo)</p>
                                <p className="text-2xl font-bold dark:text-slate-900 mt-1">{data.reports.length}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase font-bold">Reputação</p>
                                <p className="text-2xl font-bold text-yellow-500 mt-1">{data.profile.reputation_score || 0}</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h4 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Posts Recentes</h4>
                            <div className="space-y-2">
                                {data.recentPosts.length > 0 ? (
                                    data.recentPosts.map((post: any) => (
                                        <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                            <div className="text-sm flex-1 font-medium dark:text-gray-200 truncate">{post.title}</div>
                                            <div className="text-xs text-gray-500">{formatRelativeTime(post.created_at)}</div>
                                            <div className={`text-xs px-2 py-0.5 rounded ${post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                {post.status}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Nenhum post recente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-red-500">Erro ao carregar dados do usuário.</div>
                )}
            </div>
        </div>
    );
}
