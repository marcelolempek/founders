'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PostHeader } from '@/components/post/PostHeader';
import { PostGallery } from '@/components/post/PostGallery';
import { PostActions } from '@/components/post/PostActions';
import { PostDescription } from '@/components/post/PostDescription';
import { Comments } from '@/components/ui/Comments';
import { ReportModal } from '@/components/ui/ReportModal';
import { useLike, useComment } from '@/lib/hooks/usePosts';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime, translateCondition } from '@/lib/utils';
import { useNavigation } from '@/context/NavigationContext';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/Toast';
import { useViewerRole } from '@/lib/hooks/useViewerRole';
import { getR2Url, getBestAvatar } from '@/lib/images';


interface FeedPostCardProps {
    postId?: string;
    authorId?: string | null;
    username: string | null;
    userAvatar: string | null;
    timestamp: string | null;
    location: string | null;
    distanceKm?: number | null;
    imageUrl: string | null;
    images?: string[];
    price?: string;
    title: string | null;
    description: string | null;
    condition?: string | null;
    likes?: number | null;
    commentsCount?: number | null;
    isVerified?: boolean | null;
    isBumped?: boolean | null;
    isTrade?: boolean | null;
    hasComments?: boolean | null;
    isLiked?: boolean | null;
    isSaved?: boolean | null;
    sellerRating?: number | null;
    sellerReviews?: number | null;
    postType?: 'sale' | 'text' | null;
    showAllComments?: boolean;
    shares?: number;
    isFollowed?: boolean | null;
}

interface CommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    isAuthor?: boolean;
    replies?: CommentData[];
    parentId?: string | null;
}

export const FeedPostCard = ({
    postId,
    authorId,
    username,
    userAvatar,
    timestamp,
    location,
    distanceKm,
    imageUrl,
    images = [],
    price,
    title,
    description,
    condition,
    isVerified = false,
    isBumped = false,
    isTrade = false,
    isLiked: initialIsLiked = false,
    isSaved: initialIsSaved = false,
    postType = 'sale',
    showAllComments = false,
    likes = 0,
    commentsCount = 0,
    shares = 0,
    isFollowed = false,
    onDelete,
}: FeedPostCardProps & { onDelete?: () => void }) => {
    // Format distance for display
    const formatDistance = (km: number | null | undefined): string | null => {
        if (km === null || km === undefined) return null;
        if (km < 1) return '< 1 km';
        if (km < 10) return `${km.toFixed(1)} km`;
        return `${Math.round(km)} km`;
    };

    const formattedDistance = formatDistance(distanceKm);
    const locationWithDistance = formattedDistance
        ? `${location}${location ? ' • ' : ''}${formattedDistance}`
        : location;
    const { openPostDetail } = useNavigation();
    const { user, profile } = useUser(); // Use cached user and profile from context

    // Auto-calculate viewer role
    const viewerRole = useViewerRole(authorId || '');

    const [showReportModal, setShowReportModal] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [postComments, setPostComments] = useState<CommentData[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const { addComment } = useComment();

    const galleryImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);


    // Fetch comments for this post (only when user requests)
    const fetchComments = useCallback(async () => {
        if (!postId || loadingComments) return;

        try {
            setLoadingComments(true);
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles!comments_user_id_fkey(username, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Map all comments to UI format
            const allComments: CommentData[] = ((data as any[]) || []).map((comment) => ({
                id: comment.id,
                userId: comment.user_id,
                userName: comment.profiles?.username || 'Unknown',
                userAvatar: getR2Url(comment.profiles?.avatar_url) || '/images/default-avatar.png',
                text: comment.content,

                timestamp: formatRelativeTime(comment.created_at),
                likes: 0,
                isLiked: false,
                isAuthor: comment.user_id === user?.id,
                replies: [],
                parentId: comment.parent_id
            }));

            // Build comment tree
            const commentMap: Record<string, any> = {};
            allComments.forEach(c => { commentMap[c.id] = c; });

            const rootComments: CommentData[] = [];
            allComments.forEach(c => {
                if (c.parentId && commentMap[c.parentId]) {
                    commentMap[c.parentId].replies.push(c);
                } else if (!c.parentId) {
                    rootComments.push(c);
                }
            });

            // Limit to first 3 root comments (but keep their replies)
            setPostComments(rootComments.slice(0, 3));
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    }, [postId, loadingComments, user?.id]);

    // Toggle comments visibility
    const handleToggleComments = () => {
        if (!showComments && postComments.length === 0) {
            fetchComments();
        }
        setShowComments(!showComments);
    };


    const handleAddComment = async (text: string) => {
        if (!postId || !text.trim()) return;
        const newComment = await addComment(postId, text);
        if (newComment) {
            fetchComments();
        }
    };

    const handleReplyComment = async (parentId: string, text: string) => {
        if (!postId || !text.trim()) return;
        const newReply = await addComment(postId, text, parentId);
        if (newReply) {
            fetchComments();
        }
    };

    const handleReport = async (reason: string, details: string): Promise<boolean> => {
        try {
            if (!user) {
                toast.warning('Você precisa estar logado para denunciar');
                return false;
            }

            const { error } = await supabase
                .from('reports')
                // @ts-ignore
                .insert({
                    reporter_id: user.id,
                    target_type: 'post',
                    target_id: postId,
                    reason: reason as 'spam' | 'scam' | 'inappropriate' | 'illegal' | 'harassment' | 'other',
                    details: details,
                    status: 'pending',
                });

            if (error) throw error;
            toast.success('Denúncia enviada com sucesso');
            return true;
            // setShowReportModal(false);
        } catch (err) {
            console.error('Report error:', err);
            toast.error('Erro ao enviar denúncia');
            return false;
        }
    };

    return (
        <article className="bg-[#1D4165] rounded-xl shadow-lg overflow-hidden border border-white/5 flex flex-col transition-all hover:border-primary/50 group/card">
            <PostHeader
                authorId={authorId || 'default'}
                currentUserId={user?.id}
                username={username ?? 'Unknown'}
                userAvatar={userAvatar || '/images/default-avatar.png'}
                location={locationWithDistance ?? ''}
                timestamp={timestamp ?? ''}
                isVerified={isVerified ?? false}
                onMenuClick={() => setShowReportModal(true)}
                initialIsFollowing={!!isFollowed}
            />

            {galleryImages.length > 0 ? (
                <PostGallery
                    images={galleryImages as string[]}
                    price={postType === 'sale' ? price : undefined}
                    conditionLabel={postType === 'sale' ? (translateCondition(condition) || undefined) : undefined}
                    isTrade={postType === 'sale' ? (isTrade ?? false) : false}
                    onClick={() => postId && openPostDetail(postId)}
                />
            ) : (
                <div
                    className="px-4 py-6 cursor-pointer"
                    onClick={() => postId && openPostDetail(postId)}
                >
                    <p className="text-white whitespace-pre-wrap leading-relaxed text-lg font-medium">
                        {description}
                    </p>
                </div>
            )}

            <div className="px-3 py-2 flex flex-col gap-2">
                <PostActions
                    postId={postId}
                    postTitle={title ?? undefined}
                    isLikedInitial={initialIsLiked ?? false}
                    isBookmarkedInitial={initialIsSaved ?? false}
                    showWhatsApp={postType === 'sale'}
                    viewerRole={viewerRole}
                    onReport={() => setShowReportModal(true)}
                    likesCount={likes || 0}
                    commentsCount={commentsCount || 0}
                    sharesCount={shares || 0}
                    onCommentClick={handleToggleComments}
                    onDelete={onDelete}
                />

                {/* Caption - Only show if NOT in hero mode (i.e. if we have images) */}
                {galleryImages.length > 0 && (
                    <div className="text-sm text-white">
                        <span className="font-bold mr-2">{username}</span>
                        <span className="text-slate-400">{description}</span>
                    </div>
                )}

                {/* Inline Comments Section */}
                {showComments && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Comments
                            comments={postComments}
                            onAddComment={handleAddComment}
                            onReply={handleReplyComment}
                            showInput={false}
                            maxDisplayed={10}
                            emptyMessage="Nenhum comentário ainda. Seja o primeiro!"
                            onViewAll={() => postId && openPostDetail(postId)}
                        />
                        {/* Loading State */}
                        {loadingComments && (
                            <div className="flex justify-center py-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                )}


                {/* Add Comment Input (Always visible) */}
                <div className="flex items-center gap-3 mt-1 relative">
                    <div className="size-6 rounded-full bg-cover bg-center flex-shrink-0 overflow-hidden">
                        <img
                            src={getBestAvatar(profile, user)}
                            alt="Your avatar"
                            className="size-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                            }}
                        />
                    </div>
                    <input
                        id={`comment-input-${postId}`}
                        type="text"
                        placeholder="Adicione um comentário..."
                        className="bg-transparent text-sm text-white placeholder:text-slate-400 w-full focus:outline-none pr-20"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                handleAddComment(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                        onChange={(e) => {
                            const btn = document.getElementById(`publish-btn-${postId}`);
                            if (btn) {
                                btn.style.display = e.target.value.trim() ? 'block' : 'none';
                            }
                        }}
                    />
                    <button
                        id={`publish-btn-${postId}`}
                        onClick={() => {
                            const input = document.getElementById(`comment-input-${postId}`) as HTMLInputElement;
                            if (input && input.value.trim()) {
                                handleAddComment(input.value);
                                input.value = '';
                                const btn = document.getElementById(`publish-btn-${postId}`);
                                if (btn) btn.style.display = 'none';
                            }
                        }}
                        className="text-primary text-xs font-bold absolute right-0 hover:text-green-400 hidden"
                    >
                        Publicar
                    </button>
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                type="post"
                targetName={title ?? ''}
            />
        </article>
    );
}
