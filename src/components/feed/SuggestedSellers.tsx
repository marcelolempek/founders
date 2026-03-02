'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSuggestedSellers } from '@/lib/hooks/useFeedSidebar';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { getR2Url } from '@/lib/images';
import { useSocial } from '@/lib/hooks/useSocial';


export function SuggestedSellers() {
    const { sellers, loading } = useSuggestedSellers(3);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const { followUser, unfollowUser, loading: socialLoading } = useSocial();
    const [localLoadingFollow, setLocalLoadingFollow] = useState<Set<string>>(new Set());

    const handleFollow = async (sellerId: string) => {
        try {
            setLocalLoadingFollow(prev => new Set(prev).add(sellerId));
            const user = await getCurrentUser();
            if (!user) return;

            const isFollowing = followingIds.has(sellerId);

            if (isFollowing) {
                const success = await unfollowUser(sellerId);
                if (success) {
                    setFollowingIds(prev => {
                        const next = new Set(prev);
                        next.delete(sellerId);
                        return next;
                    });
                }
            } else {
                const success = await followUser(sellerId);
                if (success) {
                    setFollowingIds(prev => new Set(prev).add(sellerId));
                }
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        } finally {
            setLocalLoadingFollow(prev => {
                const next = new Set(prev);
                next.delete(sellerId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-[#1D4165] rounded-xl border border-white/10 p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-sm">Vendedores Sugeridos</h3>
                </div>
                <div className="flex flex-col gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-9 rounded-full bg-slate-100 animate-pulse"></div>
                                <div className="flex flex-col gap-1">
                                    <div className="h-3 bg-slate-100 rounded w-20 animate-pulse"></div>
                                    <div className="h-2 bg-slate-100 rounded w-16 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (sellers.length === 0) {
        return null; // Don't show if no suggestions
    }

    return (
        <div className="bg-[#1D4165] rounded-xl border border-white/10 p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-sm">Vendedores Sugeridos</h3>
            </div>
            <div className="flex flex-col gap-4">
                {sellers.map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="size-9 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${getR2Url(seller.avatar_url) || '/images/default-avatar.png'}")` }}
                            />

                            <div className="flex flex-col">
                                <Link
                                    href={`/profile/${seller.id}`}
                                    className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer"
                                >
                                    {seller.username}
                                </Link>
                                <span className="text-[10px] text-slate-400">
                                    ⭐ {seller.reputation_score.toFixed(1)} • {seller.sales_count} vendas
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleFollow(seller.id)}
                            disabled={localLoadingFollow.has(seller.id)}
                            className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${followingIds.has(seller.id)
                                ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110'
                                } disabled:opacity-50 active:scale-95`}
                        >
                            {followingIds.has(seller.id) ? 'Seguindo' : 'Seguir'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
