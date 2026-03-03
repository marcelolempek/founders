'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Comments, Comment } from '@/components/ui/Comments';
import { ReportModal } from '@/components/ui/ReportModal';
import { ConfirmModal } from '@/components/ui/Modal';
import { PostHeader } from '@/components/post/PostHeader';
import { PostGallery } from '@/components/post/PostGallery';
import { PostActions } from '@/components/post/PostActions';
import { PostDescription } from '@/components/post/PostDescription';
import { RatingSummary } from '@/components/user/RatingSummary';
import { usePost, useComment, useUpdatePostStatus, useUpdatePost } from '@/lib/hooks/usePosts';
import { usePostContact } from '@/lib/hooks/usePostContact';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime, translateCondition } from '@/lib/utils';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useBoostPost } from '@/lib/hooks/useBoostPost';
import { useNotify } from '@/components/ui/Toast';
import { useViewerRole } from '@/lib/hooks/useViewerRole';
import { getImageUrl, getR2Url, getPostImageUrl } from '@/lib/images';



interface PostDetailProps {
    initialPostId?: string;
    isModal?: boolean;
}

export default function IndividualPostScreen1({ initialPostId, isModal = false }: PostDetailProps) {
    const searchParams = useSearchParams();
    const postId = initialPostId || searchParams.get('id');

    const { post, comments, loading, error, isLiked, refetch } = usePost(postId);

    const { addComment } = useComment();
    const { updateStatus } = useUpdatePostStatus();

    const { updatePost, loading: updatingPost } = useUpdatePost();
    const { getContact, loading: isContactLoading } = usePostContact();
    const { createBoostPayment, loading: boostLoading } = useBoostPost();
    const router = useRouter();
    const { error: notifyError, success: notifySuccess, warning: notifyWarning, info: notifyInfo } = useNotify();

    // Bookmark Logic
    const { checkIsBookmarked } = useBookmarks();
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (postId) {
            checkIsBookmarked(postId).then(setIsBookmarked);
        }
    }, [postId]);





    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');


    useEffect(() => {
        getCurrentUser().then(user => setCurrentUserId(user?.id || null));
    }, []);

    const viewerRole = useViewerRole(post?.user_id || '');
    const isSold = post?.status === 'sold';
    const isTextPost = post?.type === 'text';
    const isSalePost = post?.type === 'sale';

    // Format comments for the Comments component
    // Format comments and build tree structure
    const postComments: Comment[] = (() => {
        if (comments.length > 0) {
            console.log('Raw DB Comments:', comments.map(c => ({ id: c.id, content: c.content, pid: c.parent_id })));
        }

        // First map all to UI Comment format
        const mappedComments = comments.map(c => ({
            id: c.id,
            userId: c.user_id,
            userName: c.user?.username || 'User',
            userAvatar: getR2Url(c.user?.avatar_url) || '',
            text: c.content,
            timestamp: formatRelativeTime(c.created_at),
            likes: 0,
            isLiked: false,
            isAuthor: c.user_id === post?.user_id,
            replies: [] as Comment[],
            parentId: c.parent_id
        }));

        const commentMap: Record<string, any> = {};
        mappedComments.forEach(c => { commentMap[c.id] = c; });

        const rootComments: Comment[] = [];

        mappedComments.forEach(c => {
            if (c.parentId && commentMap[c.parentId]) {
                commentMap[c.parentId].replies.push(c);
            } else {
                rootComments.push(c);
            }
        });

        return rootComments;
    })();

    useEffect(() => {
        if (postComments.length > 0) {
            console.log('Processed Tree:', postComments);
        }
    }, [postComments]);



    const handleMarkAsSold = async () => {
        if (!postId) return;
        const newStatus = isSold ? 'active' : 'sold';
        const success = await updateStatus(postId, newStatus);
        if (success) refetch();
    };



    const handleAddComment = async (text: string) => {
        if (!postId || !text.trim()) return;
        await addComment(postId, text);
        refetch();
    };

    const handleReplyComment = async (parentId: string, text: string) => {
        if (!postId || !text.trim()) return;
        await addComment(postId, text, parentId);
        refetch();
    };

    const handleReport = async (reason: string, details: string): Promise<boolean> => {
        try {
            // const { supabase } = await import('@/lib/supabase'); // Removed
            const user = await getCurrentUser();

            if (!user) {
                notifyWarning('Você precisa estar logado');
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
                    details,
                    status: 'pending',
                });

            if (error) throw error;
            notifySuccess('Denúncia enviada com sucesso');
            // Don't close modal here, let ReportModal show success screen
            // setShowReportModal(false); 
            return true;
        } catch (err) {
            console.error('Report error:', err);
            notifyError('Erro ao denunciar');
            return false;
        }
    };

    const handleDelete = async () => {
        if (!postId) return;
        const success = await updateStatus(postId, 'archived');
        if (success) {
            window.location.href = '/';
        }
    };

    const handleOpenEdit = () => {
        if (post) {
            setEditTitle(post.title);
            setEditDescription(post.description);
            setEditPrice(post.price?.toString() || '');
            setShowEditModal(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!postId) return;
        const priceValue = editPrice ? parseInt(editPrice.replace(/\D/g, ''), 10) : null;
        const success = await updatePost(postId, {
            title: editTitle,
            description: editDescription,
            price: priceValue,
        });
        if (success) {
            setShowEditModal(false);
            refetch();
        }
    };


    // WhatsApp click handling is now moved to PostActions

    // Loading state
    if (loading) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-text-secondary">Carregando anúncio...</p>
            </div>
        );
    }

    // Error state
    if (error || !post) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">error</span>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Anúncio não encontrado</h2>
                <p className="text-text-secondary mb-4">{error || 'O anúncio pode ter sido removido ou não existe.'}</p>
                <Link href="/" className="text-primary hover:underline">Voltar ao feed</Link>
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col items-center ${isModal ? '' : 'min-h-screen bg-[#0E2741]'}`}>
            <div className={`w-full flex flex-col bg-[#0E2741] relative ${isModal ? '' : 'min-h-screen max-w-[600px] shadow-2xl border-x border-white/5'}`}>

                <PostHeader
                    authorId={post.user_id}
                    currentUserId={currentUserId || undefined}
                    username={post.user?.username || 'Unknown'}
                    userAvatar={getR2Url(post.user?.avatar_url) || ''}
                    location={`${post.location_city || ''}, ${post.location_state || ''}`}
                    timestamp={formatRelativeTime(post.created_at)}
                    isVerified={post.user?.is_verified ?? false}
                    onMenuClick={() => setShowReportModal(true)}
                />


                <main className="flex-1 flex flex-col pb-24">
                    {/* Image Post Layout */}
                    {post.images && post.images.length > 0 ? (
                        <>
                            <PostGallery
                                images={post.images.map(img =>
                                    getPostImageUrl(post.id, img.image_id, img.url, 'feed')
                                )}
                                price={isSalePost ? formatCurrency(post.price || 0, post.currency) : undefined}
                                conditionLabel={isSalePost ? (translateCondition(post.condition) || undefined) : undefined}
                                isTrade={false}
                                aspectRatio="portrait"
                            />

                            {/* Actions immediately after gallery */}
                            <div className="px-3 py-2">
                                <PostActions
                                    postId={postId || undefined}
                                    authorPhone={post.user?.phone || undefined}
                                    postTitle={post.title}
                                    isLikedInitial={isLiked}
                                    isBookmarkedInitial={isBookmarked}
                                    showWhatsApp={isSalePost}
                                    viewerRole={viewerRole}
                                    onEdit={handleOpenEdit}
                                    onDelete={() => setShowDeleteModal(true)}
                                    onMarkSold={handleMarkAsSold}
                                    onBoost={() => createBoostPayment(postId!)}
                                    onReport={() => setShowReportModal(true)}
                                    likesCount={post.likes_count || 0}
                                    commentsCount={post.comments_count || 0}
                                    onCommentClick={() => setShowComments(!showComments)}
                                />
                            </div>

                            {/* Description as Caption */}
                            <div className="px-5 pb-4">
                                <PostDescription
                                    authorId={post.user_id}
                                    username={post.user?.username || 'Vendedor'}
                                    description={post.description}
                                    maxLength={1000}
                                />
                            </div>
                        </>
                    ) : (
                        /* Text Post Layout (Hero Text) */
                        <>
                            {/* Hero Description matches FeedPostCard "Hero" logic */}
                            <div className="px-5 py-6">
                                {/* Title logic: Show only if distinct or just rely on Description as main content like Feed */}
                                {/* In Feed we decided to just show description. Let's do same here for consistency but keeping title if clearly distinct might differ.
                                    However user liked the Feed "Hero" text.
                                    PostDescription component includes username: description format.
                                    For Hero Text layout we want just the text.
                                    We should render a direct text block here instead of PostDescription to match Feed's clean look.
                                */}
                                <p className="text-white whitespace-pre-wrap leading-relaxed text-lg font-medium">
                                    {post.description}
                                </p>
                            </div>

                            {/* Actions below text */}
                            <div className="px-3 py-2">
                                <PostActions
                                    postId={postId || undefined}
                                    authorPhone={post.user?.phone || undefined}
                                    postTitle={post.title}
                                    isLikedInitial={isLiked}
                                    isBookmarkedInitial={isBookmarked}
                                    showWhatsApp={isSalePost}
                                    viewerRole={viewerRole}
                                    onEdit={handleOpenEdit}
                                    onDelete={() => setShowDeleteModal(true)}
                                    onMarkSold={handleMarkAsSold}
                                    onBoost={() => createBoostPayment(postId!)}
                                    onReport={() => setShowReportModal(true)}
                                    likesCount={post.likes_count || 0}
                                    commentsCount={post.comments_count || 0}
                                    onCommentClick={() => setShowComments(!showComments)}
                                />
                            </div>
                        </>
                    )}

                    {/* Sold Banner */}
                    {isSalePost && isSold && (
                        <div className="mx-5 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined">sell</span>
                            <span className="font-bold">Item Vendido</span>
                        </div>
                    )}

                    <div className="h-[1px] w-full bg-white/5"></div>

                    {/* Info Section (Category, Views) - Kept as extra detail */}
                    <div className="px-5 py-4 flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-gray-100 leading-tight">{post.title}</h3>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                {post.views_count} views
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">category</span>
                                {post.category}
                            </span>
                            {post.condition && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    {translateCondition(post.condition)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-white/5"></div>

                    {/* Seller Profile Summary */}
                    <Link href={`/profile/${post.user_id}`} className="p-5 hover:bg-white/5 transition-colors cursor-pointer group block">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-full border-2 border-white/10 overflow-hidden">
                                    <img
                                        src={getR2Url(post.user?.avatar_url) || '/images/default-avatar.png'}
                                        alt={post.user?.username || 'User'}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-lg group-hover:text-primary transition-colors">{post.user?.username}</span>
                                    <div className="mt-1">
                                        <RatingSummary score={post.user?.reputation_score || 5} totalReviews={0} variant="minimal" />
                                    </div>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                        </div>
                    </Link>

                    {/* Safety Tips */}
                    <div className="mx-5 mb-8 p-4 bg-[#2a2218] border border-yellow-800/40 rounded-lg flex gap-3 items-start">
                        <span className="material-symbols-outlined text-yellow-500 flex-shrink-0 mt-0.5">security</span>
                        <div className="flex flex-col gap-1">
                            <span className="text-yellow-500 font-bold text-sm">Dica de Segurança</span>
                            <p className="text-yellow-500/80 text-xs leading-relaxed">
                                Nunca faça pagamentos antecipados. Prefira encontrar em locais públicos para testar o equipamento.
                            </p>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#1f3629]"></div>

                    {/* Comments Section */}
                    <div className="p-5">
                        <div className="flex items-center justify-between w-full text-white font-bold text-lg mb-4">
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                Perguntas ({postComments.length})
                            </span>
                        </div>

                        <Comments
                            comments={postComments}
                            placeholder="Tire sua dúvida com o vendedor..."
                            onAddComment={handleAddComment}
                            onReply={handleReplyComment}
                        />
                    </div>
                </main>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                type="post"
                targetName={post.title}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Deletar Anúncio"
                message="Tem certeza que deseja excluir permanentemente este anúncio?"
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />

            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1D4165] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">Editar Anúncio</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Título</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full h-12 bg-[#0E2741] border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Título do anúncio"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Descrição</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#0E2741] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                    placeholder="Descrição do item"
                                />
                            </div>
                            {isSalePost && (
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Preço (R$)</label>
                                    <input
                                        type="text"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value.replace(/\D/g, ''))}
                                        className="w-full h-12 bg-[#0E2741] border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-4 border-t border-white/5">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={updatingPost || !editTitle || !editDescription}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {updatingPost ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
