'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostHeader } from '@/components/post/PostHeader';
import { PostGallery } from '@/components/post/PostGallery';
import { PostActions } from '@/components/post/PostActions';
import { PostDescription } from '@/components/post/PostDescription';
import { Comments, Comment } from '@/components/ui/Comments';
import { useLike, useComment } from '@/lib/hooks/usePosts';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useNavigation } from '@/context/NavigationContext';
import { useUser } from '@/context/UserContext';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { useViewerRole } from '@/lib/hooks/useViewerRole';
import { ViewerRole } from '@/types/post';
import { ReportModal } from '@/components/ui/ReportModal';
import { getImageUrl, getR2Url } from '@/lib/images';
import { getAbsolutePostUrl } from '@/lib/utils/postUrl';


export interface PostCardData {
    id: string;
    userId: string | null;
    username: string | null;
    userAvatar: string | null;
    isVerified?: boolean | null;
    title: string | null;
    description: string | null;
    price?: number | null;
    currency?: string | null;
    coverImage: string | null;
    images?: string[];
    location?: string | null;
    locationCity?: string | null;
    locationState?: string | null;
    createdAt: string | null;
    type: 'sale' | 'text' | null;
    status?: 'active' | 'sold' | 'archived' | 'banned' | null;
    isTrade?: boolean | null;
    isLiked?: boolean | null;
    isFollowingAuthor?: boolean | null;
    likesCount?: number | null;
    commentsCount?: number | null;
    viewsCount?: number | null;
    sharesCount?: number | null;
}

export type PostCardVariant = 'feed' | 'grid' | 'compact' | 'detail';

interface PostCardProps {
    post: PostCardData;
    variant?: PostCardVariant;
    showComments?: boolean;
    showActions?: boolean;
    showHeader?: boolean;
    maxComments?: number;
    onClick?: () => void;
    currentUserId?: string;
    isBookmarked?: boolean;
    viewerRole?: ViewerRole;
    onEdit?: () => void;
    onDelete?: () => void;
    onMarkSold?: () => void;
    onBoost?: () => void;
}


export const PostCard = ({
    post,
    variant = 'feed',
    showComments = true,
    showActions = true,
    showHeader = true,
    maxComments = 2,
    onClick,
    currentUserId: propCurrentUserId,
    isBookmarked: propIsBookmarked,
    viewerRole: propViewerRole,
    onEdit,
    onDelete,
    onMarkSold,
    onBoost
}: PostCardProps) => {
    const { openPostDetail } = useNavigation();
    const { user } = useUser();
    const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
    const [isBookmarked, setIsBookmarked] = useState(propIsBookmarked ?? false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(post.likesCount || 0);

    // Sync state with props (Important for data updates)
    useEffect(() => {
        setIsLiked(post.isLiked ?? false);
    }, [post.isLiked]);

    useEffect(() => {
        setCurrentLikes(post.likesCount || 0);
    }, [post.likesCount]);

    const [currentCommentsCount, setCurrentCommentsCount] = useState(post.commentsCount || 0);

    useEffect(() => {
        setCurrentCommentsCount(post.commentsCount || 0);
    }, [post.commentsCount]);

    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        setIsBookmarked(propIsBookmarked ?? false);
    }, [propIsBookmarked]);

    const hookViewerRole = useViewerRole(post.userId || '');
    const viewerRole = propViewerRole || hookViewerRole;

    const { toggleLike } = useLike();
    const { addComment } = useComment();
    const { toggleBookmark } = useBookmarks();

    const galleryImages = post.images && post.images.length > 0 ? post.images : [post.coverImage ?? ''];
    const location = post.location || `${post.locationCity || ''}, ${post.locationState || ''}`;
    const formattedPrice = post.price ? formatCurrency(post.price, post.currency || 'BRL') : undefined;


    const currentUserId = propCurrentUserId || user?.id; // ✅ Use user from context

    // Fetch comments for feed variant
    useEffect(() => {
        if (variant === 'feed' && showComments && post.id) {
            fetchComments();
        }
    }, [variant, showComments, post.id]);

    const fetchComments = async () => {
        if (!post.id) return;
        try {
            setLoadingComments(true);
            const { data, error, count } = await supabase
                .from('comments')
                .select(`
                    *,
                    user:profiles!comments_user_id_fkey(username, avatar_url)
                `, { count: 'exact' })
                .eq('post_id', post.id)
                .is('parent_id', null)
                .order('created_at', { ascending: true })
                .limit(maxComments + 1);

            if (error) throw error;

            // Update local count with true count from DB if available
            if (count !== null) {
                setCurrentCommentsCount(count);
            }

            const formattedComments: Comment[] = ((data as any[]) || []).map((c) => ({
                id: c.id,
                userId: c.user_id,
                userName: c.user?.username || 'User',
                userAvatar: getR2Url(c.user?.avatar_url) || '',
                text: c.content,
                timestamp: formatRelativeTime(c.created_at),
                likes: 0,
                isLiked: false,
                isAuthor: c.user_id === post.userId,
                replies: [],
            }));

            setComments(formattedComments);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            openPostDetail(post.id);
        }
    };

    const handleLike = async () => {
        const previousLiked = isLiked;
        // Optimistic update
        setIsLiked(!previousLiked);
        setCurrentLikes(prev => (previousLiked ? prev - 1 : prev + 1));

        try {
            const newLikedState = await toggleLike(post.id, !previousLiked);
            if (newLikedState !== !previousLiked) {
                setIsLiked(newLikedState);
                setCurrentLikes(prev => (newLikedState ? prev + 1 : prev - 1));
            }
        } catch (error) {
            setIsLiked(previousLiked);
            setCurrentLikes(prev => (previousLiked ? prev + 1 : prev - 1));
        }
    };

    const handleBookmark = async () => {
        const newBookmarkedState = await toggleBookmark(post.id, isBookmarked ?? false);
        setIsBookmarked(newBookmarkedState);
    };

    const handleShare = async () => {
        const shareUrl = getAbsolutePostUrl(post.id);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title ?? undefined,
                    text: `Confira: ${post.title ?? ''}`,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copiado!');
        }
    };

    const handleAddComment = async (text: string) => {
        if (!post.id || !text.trim()) return;
        const newComment = await addComment(post.id, text);
        if (newComment) {
            fetchComments();
            setCurrentCommentsCount(prev => prev + 1);
        }
    };

    // Grid variant - compact card for explore/search results
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
                    target_id: post.id,
                    reason: reason as any,
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

    if (variant === 'grid') {
        // A post is a text post ONLY if it has no cover image
        const isTextPost = !post.coverImage;

        return (
            <div
                onClick={handleClick}
                className="group relative block overflow-hidden rounded-xl bg-card-dark w-full text-left transition-all hover:ring-2 hover:ring-primary/30 aspect-square cursor-pointer"
            >
                {isTextPost ? (
                    <div className="absolute inset-0 p-4 bg-[#1D4165] flex flex-col items-center justify-center text-center">
                        <div className="w-full flex-1 flex items-center justify-center">
                            <p className="text-white font-bold text-xs md:text-sm line-clamp-6 break-words italic">
                                "{post.description}"
                            </p>
                        </div>
                        {/* Decorative background icon */}
                        <div className="absolute top-2 right-2 opacity-10">
                            <span className="material-symbols-outlined text-primary text-[40px]">format_quote</span>
                        </div>
                        {/* Decorative bottom fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1D4165] to-transparent"></div>
                    </div>
                ) : (
                    <>
                        <div className="aspect-square w-full overflow-hidden">
                            <img
                                alt={post.title ?? 'Listing'}
                                className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${post.status === 'sold' ? 'grayscale opacity-70' : ''}`}
                                src={post.coverImage ?? ''}
                            />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>
                    </>
                )}

                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    {!isTextPost && galleryImages.length > 1 && (
                        <div className="absolute top-2 right-2 pointer-events-none">
                            <span className="material-symbols-outlined text-white drop-shadow-md text-[20px]">filter_none</span>
                        </div>
                    )}

                    {(onEdit || onDelete) && (
                        <div className="absolute top-2 left-2 z-20 flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="size-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-primary transition-colors backdrop-blur-sm"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="size-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-red-400 transition-colors backdrop-blur-sm"
                                    title="Excluir"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            )}
                        </div>
                    )}

                    {!isTextPost && (post.type === 'sale' || post.status === 'sold') && (
                        <p className={`font-extrabold text-sm md:text-lg drop-shadow-lg shadow-black leading-none mb-1 ${post.status === 'sold' ? 'text-red-400' : 'text-primary'}`}>
                            {post.status === 'sold' ? 'VENDIDO' : formattedPrice || 'GRÁTIS'}
                        </p>
                    )}

                    {!isTextPost && (
                        <h3 className="text-white font-bold text-xs truncate mb-1">{post.title}</h3>
                    )}

                    {isTextPost && (
                        <div className="w-full flex justify-between items-end mt-1 border-t border-white/10 pt-2">
                            <span className="text-[10px] text-gray-400 font-medium">{formatRelativeTime(post.createdAt)}</span>
                        </div>
                    )}

                    {!isTextPost && location && (
                        <div className="flex items-center gap-0.5 text-gray-200 text-[10px] font-medium">
                            <span className="material-symbols-outlined text-[12px] text-slate-600">location_on</span>
                            <span className="truncate">{location}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Compact variant - minimal info for lists
    if (variant === 'compact') {
        return (
            <div
                onClick={handleClick}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1D4165] border border-white/5 hover:border-primary/50 transition-all w-full text-left relative group cursor-pointer"
            >
                <div
                    className="size-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${post.coverImage}')` }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{post.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{location}</p>
                    {formattedPrice && (
                        <p className="text-sm font-bold text-primary mt-1">{formattedPrice}</p>
                    )}
                </div>
                {(onEdit || onDelete) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-primary transition-colors"
                                title="Editar"
                            >
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                                title="Excluir"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Feed variant - full card with all features (default)
    return (
        <article className="bg-[#1D4165] rounded-xl shadow-lg overflow-hidden border border-white/5 flex flex-col transition-all hover:border-primary/20">
            {showHeader && (
                <PostHeader
                    authorId={post.userId || 'default'}
                    currentUserId={currentUserId}
                    username={post.username ?? 'Unknown'}
                    userAvatar={post.userAvatar ?? ''}
                    location={location}
                    timestamp={formatRelativeTime(post.createdAt)}
                    isVerified={post.isVerified ?? false}
                    initialIsFollowing={post.isFollowingAuthor ?? false}
                />
            )}

            <PostGallery
                images={galleryImages as string[]}
                price={post.type === 'sale' ? formattedPrice : undefined}
                isTrade={post.type === 'sale' ? (post.isTrade ?? false) : false}
                onClick={handleClick}
            />

            <div className="px-3 py-2 flex flex-col gap-2">
                {showActions && (
                    <PostActions
                        postId={post.id}
                        postTitle={post.title ?? undefined}
                        isLikedInitial={isLiked}
                        isBookmarkedInitial={isBookmarked}
                        showWhatsApp={post.type === 'sale'}
                        viewerRole={viewerRole}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMarkSold={onMarkSold}
                        onBoost={onBoost}
                        onReport={() => setShowReportModal(true)}
                        likesCount={currentLikes}
                        commentsCount={currentCommentsCount}
                        sharesCount={post.sharesCount ?? 0}
                        onCommentClick={handleClick}
                    />
                )}

                <div className="flex flex-col gap-1">
                    <div className="text-sm text-white">
                        <span className="font-bold mr-2">{post.username}</span>
                        <span className="text-slate-200">{post.description}</span>
                    </div>
                </div>

                {showComments && variant === 'feed' && (
                    <>
                        {/* View All Comments Link */}
                        {post.commentsCount && post.commentsCount > 0 ? (
                            <button
                                onClick={handleClick}
                                className="text-text-secondary text-sm font-medium hover:text-slate-900 transition-colors text-left"
                            >
                                Ver todos os {currentCommentsCount} comentários
                            </button>
                        ) : null}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-3 mt-1 relative">
                            <div
                                className="size-6 rounded-full bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url("${getR2Url(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) || '/images/default-avatar.png'}")` }}
                            ></div>
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Adicione um comentário..."
                                className="bg-transparent text-sm text-white placeholder-slate-400 w-full focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commentText.trim()) {
                                        handleAddComment(commentText);
                                        setCommentText('');
                                    }
                                }}
                            />
                            {commentText.trim() && (
                                <button
                                    onClick={() => {
                                        handleAddComment(commentText);
                                        setCommentText('');
                                    }}
                                    className="text-primary text-xs font-bold absolute right-0 hover:text-green-400"
                                >
                                    Publicar
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                type="post"
                targetName={post.title ?? ''}
            />
        </article >
    );
};

// Helper function to convert FeedPost to PostCardData


export function toPostCardData(feedPost: any): PostCardData {
    const postId = feedPost.id;

    // Resolve cover image (R2-aware)
    let derivedCoverImage: string | null = null;

    if (Array.isArray(feedPost.images) && feedPost.images.length > 0) {
        const coverObj = feedPost.images.find((img: any) => typeof img === 'object' && img.is_cover);
        const firstImage = coverObj || feedPost.images[0];

        if (firstImage && typeof firstImage === 'object') {
            // R2: image_id exists, use helper
            if (firstImage.image_id) {
                derivedCoverImage = getImageUrl(postId, firstImage.image_id, 'feed');
            }
            // Legacy Supabase: url exists
            else if (firstImage.url) {
                derivedCoverImage = getR2Url(firstImage.url);
            }
        } else if (typeof firstImage === 'string') {
            // Direct URL (legacy)
            derivedCoverImage = getR2Url(firstImage);
        }
    }

    // Fallback if still null
    if (!derivedCoverImage) {
        derivedCoverImage = getR2Url(feedPost.cover_image_url || feedPost.cover_image || feedPost.coverImage) || null;
    }

    // Map all images
    const mappedImages: string[] = [];
    if (Array.isArray(feedPost.images)) {
        feedPost.images.forEach((img: any) => {
            if (typeof img === 'object') {
                if (img.image_id) {
                    // R2
                    mappedImages.push(getImageUrl(postId, img.image_id, 'feed'));
                } else if (img.url) {
                    // Legacy Supabase
                    mappedImages.push(getR2Url(img.url));
                }
            } else if (typeof img === 'string') {
                mappedImages.push(getR2Url(img));
            }
        });
    }

    return {
        id: postId,
        userId: feedPost.user_id || feedPost.userId || null,
        username: feedPost.author_username || feedPost.user?.username || feedPost.username || null,
        userAvatar: getR2Url(feedPost.author_avatar || feedPost.user?.avatar_url || feedPost.userAvatar) || null,
        isVerified: feedPost.author_is_verified ?? feedPost.user?.is_verified ?? feedPost.isVerified ?? false,
        title: feedPost.title || null,
        description: feedPost.description || null,
        price: feedPost.price,
        currency: feedPost.currency || 'BRL',
        coverImage: derivedCoverImage,
        images: mappedImages,
        location: feedPost.location || null,
        locationCity: feedPost.location_city || feedPost.locationCity || null,
        locationState: feedPost.location_state || feedPost.locationState || null,
        createdAt: feedPost.created_at || feedPost.createdAt || null,
        type: feedPost.type || 'sale',
        status: feedPost.status || 'active',
        isTrade: feedPost.is_trade ?? feedPost.isTrade ?? false,
        isLiked: feedPost.is_liked ?? feedPost.isLiked ?? false,
        isFollowingAuthor: feedPost.author_is_followed ?? feedPost.authorIsFollowed ?? false,
        likesCount: feedPost.likes_count ?? feedPost.likesCount ?? 0,
        commentsCount: feedPost.comments_count ?? feedPost.commentsCount ?? 0,
        viewsCount: feedPost.views_count ?? feedPost.viewsCount ?? 0,
        sharesCount: feedPost.shares_count ?? feedPost.sharesCount ?? 0,
    };
}

export default PostCard;
