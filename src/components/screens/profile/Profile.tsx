'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Comments } from '@/components/ui/Comments';
import { RatingSummary } from '@/components/user/RatingSummary';
import { ReportModal } from '@/components/ui/ReportModal';
import { useNavigation } from '@/context/NavigationContext';
import { useProfile, useUserPosts, useReviews } from '@/lib/hooks/useProfile';
import { useSubscription, useMyReports } from '@/lib/hooks/useSupport';
import { formatRelativeTime } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { PostCard, toPostCardData } from '@/components/shared/PostCard';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
// IMPORTANTE: Importar o contexto de usuário para pegar os dados do Google
import { useUser } from '@/context/UserContext';
import { getR2Url } from '@/lib/images';

export default function ProfileScreen() {
    const { user } = useUser(); // Pegando o usuário logado via Google
    const { openCreatePost, openPostDetail } = useNavigation();
    const [showReportModal, setShowReportModal] = useState(false);

    const { profile, loading: profileLoading, error: profileError } = useProfile();
    const { posts, loading: postsLoading, refetch: refetchPosts } = useUserPosts(profile?.id);
    const { reviews, averageRating, distribution, loading: reviewsLoading } = useReviews(profile?.id);

    // MUDANÇA AQUI: Definimos a foto do Google como prioridade absoluta
    const googlePhoto = getR2Url(user?.user_metadata?.avatar_url) || '/images/default-avatar.png';


    const saleListings = posts.filter(p => p.type === 'sale' && p.status === 'active');
    const soldListings = posts.filter(p => p.type === 'sale' && p.status === 'sold');
    const textPosts = posts.filter(p => p.type === 'text');

    const profileTabs = [
        { id: 'sales', label: 'Vendas', count: saleListings.length },
        { id: 'sold', label: 'Vendidos', count: soldListings.length },
        { id: 'posts', label: 'Posts', count: textPosts.length },
        { id: 'reviews', label: 'Avaliações', count: reviews.length }
    ];

    const { subscription } = useSubscription();

    const formattedReviews = reviews.map(review => ({
        id: review.id,
        userId: review.reviewer_id,
        userName: review.reviewer?.username || 'Usuário',
        userAvatar: getR2Url(review.reviewer?.avatar_url) || '',
        text: review.comment || `Avaliação: ${review.rating}/5`,
        timestamp: formatRelativeTime(review.created_at),
        likes: 0,
        isLiked: false,
        replies: [],
    }));

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-900 gap-4">
                <h2 className="text-xl font-bold">Você não está logado</h2>
                <Link href="/auth/login" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
                    Fazer Login
                </Link>
            </div>
        );
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Tem certeza que deseja excluir este item permanentemente?')) return;
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            toast.success('Item excluído com sucesso');
            refetchPosts();
        } catch (err) {
            toast.error('Erro ao excluir item');
        }
    };

    const handleReport = async (reason: string, details: string) => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado para denunciar');
                return;
            }
            const { error } = await (supabase.from('reports') as any).insert({
                reporter_id: currentUser.id,
                target_type: 'user',
                target_id: profile.id,
                reason: reason as any,
                details,
                status: 'pending',
            });
            if (error) throw error;
            toast.success('Denúncia enviada com sucesso');
            setShowReportModal(false);
        } catch (err) {
            toast.error('Erro ao enviar denúncia');
        }
    };

    const formatFollowerCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return count.toString();
    };

    return (
        <>
            <Header />

            <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-6 sm:px-0">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-200 shadow-xl overflow-hidden">
                                {/* AQUI: Substituímos profile.avatar_url por googlePhoto */}
                                <div
                                    className="w-full h-full bg-center bg-cover"
                                    style={{ backgroundImage: `url('${googlePhoto}')` }}
                                ></div>
                            </div>
                            <div className="absolute bottom-1 right-1 size-5 rounded-full bg-primary border-4 border-white"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1">
                                @{profile.username}
                                {profile.is_verified && (
                                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                )}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                                    <span className="material-symbols-outlined text-[14px]">sell</span>
                                    {profile.sold_count || 0} Vendas Verificadas
                                </div>
                                {reviews.length > 0 && (
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        {averageRating.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md text-center">
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {profile.bio || 'Sem biografia'}
                        </p>
                    </div>

                    <div className="flex w-full max-w-sm justify-around items-center py-2">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-slate-900">{profile.posts_count || 0}</span>
                            <span className="text-xs text-slate-500 font-medium">Posts</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50"></div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-slate-900">{formatFollowerCount(profile.followers_count || 0)}</span>
                            <span className="text-xs text-slate-500 font-medium">Seguidores</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50"></div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-slate-900">{formatFollowerCount(profile.following_count || 0)}</span>
                            <span className="text-xs text-slate-500 font-medium">Seguindo</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-full max-w-md gap-3">
                        <Link
                            href="/profile/edit"
                            className="w-full bg-slate-100 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            Editar Perfil
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href=""
                                className="bg-slate-100 border border-slate-200 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                                Configurações
                            </Link>

                            <button
                                onClick={async () => {
                                    const { signOut } = await import('@/lib/supabase');
                                    await signOut();
                                    window.location.href = '/auth/login';
                                }}
                                className="w-full cursor-pointer bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-xl transition-all text-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Tabs tabs={profileTabs} defaultTab="sales">
                        <TabPanel id="sales">
                            {saleListings.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">Nenhum item à venda</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {saleListings.map((item) => (
                                        <PostCard
                                            key={item.id}
                                            post={toPostCardData(item)}
                                            variant="grid"
                                            currentUserId={user?.id}
                                            onClick={() => openPostDetail(item.id)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabPanel>
                        {/* Outros painéis simplificados para brevidade */}
                        <TabPanel id="sold">
                            <div className="py-12 text-center text-slate-500">Itens vendidos aparecerão aqui</div>
                        </TabPanel>
                        <TabPanel id="posts">
                            {textPosts.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">Nenhum post de texto</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {textPosts.map((item) => (
                                        <PostCard
                                            key={item.id}
                                            post={toPostCardData(item)}
                                            variant="grid"
                                            currentUserId={user?.id}
                                            onClick={() => openPostDetail(item.id)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabPanel>
                        <TabPanel id="reviews">
                            <RatingSummary score={averageRating} totalReviews={reviews.length} distribution={distribution} />
                            <Comments comments={formattedReviews} showInput={false} />
                        </TabPanel>
                    </Tabs>
                </div>
            </main>

            <MobileNav />

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                type="user"
                targetName={profile.username}
            />
        </>
    );
}