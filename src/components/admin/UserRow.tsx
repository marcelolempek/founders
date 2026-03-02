'use client';

import { Profile } from '@/lib/database.types';
import { adminService } from '@/services/admin';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { getR2Url } from '@/lib/images';


interface UserRowProps {
    user: Profile;
    isSelected: boolean;
    onSelect: (userId: string) => void;
    onViewDetails: (userId: string) => void;
}

export default function UserRow({ user: initialUser, isSelected, onSelect, onViewDetails }: UserRowProps) {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(false);

    // Construct location string from city and state
    const location = [user.location_city, user.location_state].filter(Boolean).join(', ') || 'Unknown Location';

    // Status Logic
    const isBanned = user.status === 'banned';

    const handleToggleBan = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(isBanned ? 'Desbanir este usuário?' : 'Tem certeza que deseja BANIR este usuário?')) return;

        setLoading(true);
        try {
            if (isBanned) {
                await adminService.unbanUser(user.id);
                setUser({ ...user, status: 'active' });
                toast.success('Usuário desbanido com sucesso');
            } else {
                await adminService.banUser(user.id);
                setUser({ ...user, status: 'banned' });
                toast.success('Usuário banido com sucesso');
            }
        } catch (error) {
            console.error('Error toggling ban:', error);
            toast.error('Erro ao alterar status do usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <article
            className={`bg-white dark:bg-[#1a202c] rounded-xl border ${isSelected ? 'border-primary ring-1 ring-primary' : isBanned ? 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800'
                } shadow-sm group hover:border-blue-500/30 transition-all hover:shadow-md cursor-pointer`}
            onClick={() => onSelect(user.id)}
        >
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 flex items-center gap-4">
                    <div onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={isSelected}
                            onChange={() => onSelect(user.id)}
                        />
                    </div>
                    <div className="relative shrink-0">
                        <div
                            className={`bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ${isBanned ? 'ring-red-500 grayscale' : 'ring-gray-100 dark:ring-white/5'}`}
                            style={{ backgroundImage: `url("${getR2Url(user.avatar_url) || '/images/default-avatar.png'}")` }}
                        ></div>

                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className={`text-sm font-bold truncate ${isBanned ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-900'}`}>{user.username}</h3>
                            {user.is_verified && <span className="material-symbols-outlined text-blue-500 text-[16px]" title="Verified Account">verified</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {user.id} • {location}</p>
                    </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                        {user.role}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isBanned
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-500/20'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-500/20'
                        }`}>
                        {user.status || 'Active'}
                    </span>
                </div>
                <div className="md:col-span-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="md:hidden text-xs text-slate-400 font-medium mr-2">Joined:</span>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="md:col-span-3 flex items-center justify-end gap-2 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-3 md:pt-0 mt-3 md:mt-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onViewDetails(user.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button
                        onClick={handleToggleBan}
                        disabled={loading}
                        className={`p-2 rounded-lg transition-colors ${isBanned
                            ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                        title={isBanned ? "Unban User" : "Ban User"}
                    >
                        <span className="material-symbols-outlined text-[20px]">{isBanned ? 'check_circle' : 'block'}</span>
                    </button>
                    <Link href={`/admin/moderation?search=${user.username}`} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors" title="View Reports">
                        <span className="material-symbols-outlined text-[20px]">flag</span>
                    </Link>
                </div>
            </div>
        </article>
    );
}
