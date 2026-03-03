'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import Link from 'next/link';
import { useProfile, useUserPosts, useReviews } from '@/lib/hooks/useProfile';
import { Header } from '@/components/layout/Header';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { RatingSummary } from '@/components/user/RatingSummary';
import { Comments, Comment } from '@/components/ui/Comments';
import { useNavigation } from '@/context/NavigationContext';
import { useRouter } from 'next/navigation';
import { useSocial } from '@/lib/hooks/useSocial';
import { useComments } from '@/lib/hooks/useComments';
import { useNotify } from '@/components/ui/Toast';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { PostCard, toPostCardData } from '@/components/shared/PostCard';
import { getR2Url } from '@/lib/images';


interface PublicProfileProps {
    userId: string;
}

export default function PublicProfile({ userId }: PublicProfileProps) {
    const { openPostDetail } = useNavigation();
    const router = useRouter();
    const { error: notifyError, success: notifySuccess, warning: notifyWarning } = useNotify();
    const { profile, loading: profileLoading, error: profileError } = useProfile(userId);
    const { posts, loading: postsLoading } = useUserPosts(userId);
    const { reviews, averageRating, distribution, loading: reviewsLoading, addReview } = useReviews(userId);
    const { checkIsFollowing, followUser, unfollowUser, blockUser, loading: socialLoading } = useSocial();
    const {
        comments: profileComments,
        fetchProfileComments,
        addProfileComment,
        toggleProfileCommentLike,
        loading: commentsLoading
    } = useComments();

    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const user = await getCurrentUser();
            if (user) {
                setCurrentUserId(user.id);
                const following = await checkIsFollowing(userId);
                setIsFollowing(following);
            }
        };
        checkStatus();
    }, [userId, checkIsFollowing]);

    // Fetch profile comments
    useEffect(() => {
        if (userId) {
            fetchProfileComments(userId);
        }
    }, [userId, fetchProfileComments]);

    if (profileLoading || profileError || !profile) {
        if (profileLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
                <span className="material-symbols-outlined text-4xl text-gray-500">person_off</span>
                <h2 className="text-xl font-bold">Usuário não encontrado</h2>
                <Link href="/" className="text-primary hover:underline">Voltar ao Feed</Link>
            </div>
        );
    }

    const saleListings = posts.filter(p => p.type === 'sale' && p.status === 'active');
    const soldListings = posts.filter(p => p.type === 'sale' && p.status === 'sold');
    const textPosts = posts.filter(p => p.type === 'text');

    const profileTabs = [
        { id: 'sales', label: 'Vendas', count: saleListings.length },
        { id: 'sold', label: 'Vendidos', count: soldListings.length },
        { id: 'posts', label: 'Posts', count: textPosts.length },
        { id: 'comments', label: 'Mural', count: profileComments.length },
        { id: 'reviews', label: 'Avaliações', count: reviews.length }
    ];

    const isMe = currentUserId === userId;

    const handleFollowToggle = async () => {
        if (!currentUserId) {
            notifyWarning("Faça login para seguir.");
            return;
        }
        if (isFollowing) {
            const success = await unfollowUser(userId);
            if (success) setIsFollowing(false);
        } else {
            const success = await followUser(userId);
            if (success) setIsFollowing(true);
        }
    };

    const handleBlock = async () => {
        if (!confirm("Tem certeza que deseja bloquear este usuário? Você não verá mais os posts dele.")) return;
        const success = await blockUser(userId);
        if (success) {
            notifySuccess("Usuário bloqueado.");
            router.push('/');
        }
    };

    const handleAddReview = async () => {
        if (!userId || !newReviewText.trim() || !currentUserId) return;

        setIsSubmittingReview(true);
        const success = await addReview(userId, newReviewRating, newReviewText);
        setIsSubmittingReview(false);

        if (success) {
            setNewReviewText('');
            setNewReviewRating(5);
        }
    };

    const userHasReviewed = reviews.some(r => r.reviewer_id === currentUserId);

    // Handler for adding profile comments
    const handleAddProfileComment = async (text: string) => {
        if (!userId || !text.trim()) return;
        const result = await addProfileComment(userId, text);
        if (result.data) {
            // Refetch comments after adding
            fetchProfileComments(userId);
        }
    };

    // Handler for replying to profile comments
    const handleReplyProfileComment = async (commentId: string, text: string) => {
        if (!userId || !text.trim()) return;
        const result = await addProfileComment(userId, text, commentId);
        if (result.data) {
            fetchProfileComments(userId);
        }
    };

    // Handler for liking profile comments
    const handleLikeProfileComment = async (commentId: string, isLiked: boolean) => {
        await toggleProfileCommentLike(commentId, isLiked);
        fetchProfileComments(userId);
    };

    // Format reviews for Comments component
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

    const formatFollowerCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <>
            <Header />

            <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-6 sm:px-0">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-card-dark bg-card-dark shadow-xl overflow-hidden">
                                <img
                                    src={getR2Url(profile.avatar_url) || '/images/default-avatar.png'}
                                    alt={profile.username}
                                    className="size-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                    }}
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 size-5 rounded-full bg-primary border-4 border-white"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-1">
                                @{profile.username}
                                {profile.is_verified && (
                                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                )}
                            </h1>

                            <div className="flex items-center gap-2 mt-2">
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
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {profile.bio || 'Sem biografia'}
                        </p>
                    </div>

                    <div className="flex w-full max-w-sm justify-around items-center py-2">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-white">{posts.length}</span>
                            <span className="text-xs text-text-secondary font-medium">Posts</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50"></div>
                        <Link href={`/profile/followers?id=${profile.id}`} className="flex flex-col items-center justify-center hover:text-primary transition-colors">
                            <span className="text-lg font-bold text-white">{formatFollowerCount(profile.followers_count || 0)}</span>
                            <span className="text-xs text-text-secondary font-medium">Seguidores</span>
                        </Link>
                        <div className="w-px h-8 bg-slate-200/50"></div>
                        <Link href={`/profile/following?id=${profile.id}`} className="flex flex-col items-center justify-center hover:text-primary transition-colors">
                            <span className="text-lg font-bold text-white">{formatFollowerCount(profile.following_count || 0)}</span>
                            <span className="text-xs text-text-secondary font-medium">Seguindo</span>
                        </Link>
                    </div>

                    {!isMe && (
                        <div className="flex w-full max-w-md gap-3">
                            <button
                                onClick={handleFollowToggle}
                                disabled={socialLoading}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all active:scale-95 text-sm border flex items-center justify-center gap-2 ${isFollowing
                                    ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/10"
                                    : "bg-primary text-white border-primary/20 hover:bg-primary/90"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{isFollowing ? 'person_remove' : 'person_add'}</span>
                                {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                            <button
                                onClick={handleBlock}
                                className="px-4 rounded-lg bg-white/[0.08] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-95"
                                title="Bloquear Usuário"
                            >
                                <span className="material-symbols-outlined text-[20px]">block</span>
                            </button>
                        </div>
                    )}

                    {isMe && (
                        <div className="flex w-full max-w-md gap-3">
                            <Link
                                href="/profile/profile"
                                className="flex-1 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-95 text-sm border border-white/10 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Ver meu Painel
                            </Link>
                        </div>
                    )}
                </div>

                <div className="sticky top-16 z-30 mt-8 pt-2 pb-4 bg-transparent">
                    <Tabs tabs={profileTabs} defaultTab="sales">
                        <TabPanel id="sales">
                            {postsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : saleListings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">inventory_2</span>
                                    <p className="text-text-secondary">Nenhum item à venda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pb-24">
                                    {saleListings.map((item: any) => (
                                        <PostCard
                                            key={item.id}
                                            post={toPostCardData(item)}
                                            variant="grid"
                                            onClick={() => openPostDetail(item.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabPanel>

                        <TabPanel id="sold">
                            {postsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : soldListings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">check_circle</span>
                                    <p className="text-text-secondary">Nenhum item vendido ainda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pb-24">
                                    {soldListings.map((item: any) => (
                                        <PostCard
                                            key={item.id}
                                            post={toPostCardData(item)}
                                            variant="grid"
                                        />
                                    ))}
                                </div>
                            )}
                        </TabPanel>

                        <TabPanel id="posts">
                            {postsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : textPosts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">article</span>
                                    <p className="text-text-secondary">Nenhum post ainda</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 pb-24">
                                    {textPosts.map((item: any) => (
                                        <PostCard
                                            key={item.id}
                                            post={toPostCardData(item)}
                                            variant="compact"
                                            onClick={() => openPostDetail(item.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabPanel>

                        <TabPanel id="comments">
                            <div className="pb-24">
                                {commentsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <Comments
                                        comments={profileComments}
                                        placeholder={`Deixe uma mensagem para @${profile.username}...`}
                                        showInput={!isMe}
                                        emptyMessage="Nenhuma mensagem ainda. Seja o primeiro a deixar uma mensagem!"
                                        onAddComment={handleAddProfileComment}
                                        onReply={handleReplyProfileComment}
                                        onLike={handleLikeProfileComment}
                                    />
                                )}
                            </div>
                        </TabPanel>

                        <TabPanel id="reviews">
                            <div className="pb-24">
                                {reviewsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-6">
                                            <RatingSummary
                                                score={averageRating}
                                                totalReviews={reviews.length}
                                                distribution={distribution}
                                            />
                                        </div>

                                        {/* Review Input Section */}
                                        {!isMe && !userHasReviewed && (
                                            <div className="mb-8 bg-card-dark p-4 rounded-xl border border-slate-200/50 shadow-sm">
                                                <h4 className="text-white font-bold mb-3">Avalie sua experiência</h4>

                                                <div className="flex gap-1 mb-4">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setNewReviewRating(star)}
                                                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                                            type="button"
                                                        >
                                                            <span
                                                                className={`material-symbols-outlined text-[28px] transition-colors ${star <= newReviewRating ? 'text-yellow-500' : 'text-gray-600'}`}
                                                                style={{ fontVariationSettings: star <= newReviewRating ? "'FILL' 1" : "'FILL' 0" }}
                                                            >
                                                                star
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="flex gap-3">
                                                    <div
                                                        className="size-8 rounded-full bg-cover bg-center border border-slate-200 flex-shrink-0 hidden sm:block"
                                                        style={{ backgroundImage: `url("${getR2Url((profile as any).avatar_url) || '/images/default-avatar.png'}")` }}
                                                    // Note: Ideally show CURRENT USER avatar here, not profile. 
                                                    // But safely ignoring for now or fetching current user avatar correctly if available in context.
                                                    ></div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={newReviewText}
                                                            onChange={(e) => setNewReviewText(e.target.value)}
                                                            placeholder={`Escreva uma avaliação sobre @${profile.username}...`}
                                                            className="w-full bg-white/10 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all pr-20"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddReview()}
                                                            disabled={isSubmittingReview}
                                                        />
                                                        <button
                                                            disabled={!newReviewText.trim() || isSubmittingReview}
                                                            onClick={handleAddReview}
                                                            className="absolute right-1 top-1 bottom-1 bg-primary text-white px-3 rounded-md text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none"
                                                        >
                                                            {isSubmittingReview ? '...' : 'Enviar'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {reviews.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                                {!userHasReviewed ? (
                                                    <p>Seja o primeiro a avaliar!</p>
                                                ) : (
                                                    <p>Nenhuma outra avaliação ainda.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <Comments
                                                comments={formattedReviews}
                                                showInput={false} // Disable default comments input since we use custom review form
                                                emptyMessage="Nenhuma avaliação encontrada."
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
            </main>

            <MobileNav />
        </>
    );
}
