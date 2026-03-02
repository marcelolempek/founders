'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { usePostContact } from '@/lib/hooks/usePostContact';
import { ViewerRole } from '@/types/post';
import { canPerformAction } from '@/lib/utils/postPermissions';
import { LikeButton } from './LikeButton';
import { BookmarkButton } from './BookmarkButton';
import { ShareButton } from './ShareButton';
import { getAbsolutePostUrl } from '@/lib/utils/postUrl';

interface PostActionsProps {
    whatsappUrl?: string;
    postId?: string;
    authorPhone?: string;
    postTitle?: string;

    // Context
    viewerRole?: ViewerRole;

    // Actions
    onBump?: () => void; // Deprecated, legacy support

    // Owner Actions
    onEdit?: () => void;
    onDelete?: () => void;
    onMarkSold?: () => void;
    onBoost?: () => void;

    // Viewer Actions
    onReport?: () => void;

    // State initialization
    isLikedInitial?: boolean;
    likesCount?: number;
    isBookmarkedInitial?: boolean;
    requireLogin?: boolean;
    showWhatsApp?: boolean;
    commentsCount?: number;
    sharesCount?: number;
    onCommentClick?: () => void;
}

export const PostActions = ({
    whatsappUrl,
    postId,
    authorPhone,
    postTitle,
    viewerRole = 'viewer', // Default behavior
    onBump,
    onEdit,
    onDelete,
    onMarkSold,
    onBoost,
    onReport,
    isLikedInitial = false,
    likesCount = 0,
    isBookmarkedInitial = false,
    requireLogin = true,
    showWhatsApp = true,
    commentsCount = 0,
    sharesCount = 0,
    onCommentClick
}: PostActionsProps) => {
    const { getContact, loading: isContactLoading } = usePostContact();
    const { user } = useUser();
    const router = useRouter();

    const handleWhatsAppClick = async () => {
        if (!user) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        try {
            if (postId) {
                const contact = await getContact(postId);
                const cleanPhone = contact.phone.replace(/\D/g, '');
                const postUrl = getAbsolutePostUrl(postId);

                // Construct message with clearer formatting
                const message = postTitle
                    ? `Olá ${contact.username}, tenho interesse no seu anúncio "${postTitle}" publicado no Empreendedores de Cristo.\n\nLink do item: ${postUrl}`
                    : `Olá ${contact.username}, tenho interesse no seu anúncio publicado no Empreendedores de Cristo.\n\nLink do item: ${postUrl}`;

                window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                return;
            }

            if (whatsappUrl && whatsappUrl !== '#') {
                window.open(whatsappUrl, '_blank');
                return;
            }

            if (authorPhone) {
                const cleanPhone = authorPhone.replace(/\D/g, '');
                const message = postTitle
                    ? `Olá, tenho interesse no seu anúncio "${postTitle}" publicado no Empreendedores de Cristo!`
                    : 'Olá, tenho interesse no seu anúncio publicado no Empreendedores de Cristo!';

                window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
            }
        } catch (error: any) {
            if (error.message === 'RATE_LIMIT') {
                import('@/components/ui/Toast').then(({ toast }) =>
                    toast.error('Limite de visualizações atingido. Tente novamente em 1 hora.')
                );
            } else {
                import('@/components/ui/Toast').then(({ toast }) =>
                    toast.error('Erro ao obter contato. Tente novamente.')
                );
            }
        }
    };

    // Permission checks
    const canWhatsapp = showWhatsApp && canPerformAction('whatsapp', viewerRole);
    const canEdit = canPerformAction('edit', viewerRole);
    const canBoost = canPerformAction('boost', viewerRole);
    const canMarkSold = canPerformAction('markSold', viewerRole);

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Social Actions (Icon Bar) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {postId && (
                        <LikeButton
                            postId={postId}
                            initialIsLiked={isLikedInitial}
                            initialLikesCount={likesCount}
                            className="transition-transform active:scale-110"
                        />
                    )}

                    <button
                        onClick={onCommentClick}
                        className="group flex items-center gap-1.5 text-white hover:text-primary transition-colors active:scale-110"
                        title="Comentar"
                    >
                        <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">chat_bubble_outline</span>
                        {commentsCount > 0 && (
                            <span className="text-white text-sm font-medium">{commentsCount}</span>
                        )}
                    </button>

                    {postId && (
                        <ShareButton
                            postId={postId}
                            postTitle={postTitle}
                            initialSharesCount={sharesCount}
                            className="active:scale-110 ml-2"
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {postId && (
                        <BookmarkButton
                            postId={postId}
                            initialIsBookmarked={isBookmarkedInitial}
                        />
                    )}
                </div>
            </div>

            {/* Row 2: Commerce/Management Actions (if applicable) */}
            {(canWhatsapp || canEdit || canBoost || (canMarkSold && onMarkSold)) && (
                <div className="w-full pt-1">
                    {/* Viewer: WhatsApp (Full Width CTA) */}
                    {canWhatsapp && !canEdit && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleWhatsAppClick}
                                className="w-full bg-white/5 hover:bg-primary/10 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm border border-primary/20 hover:shadow-lg hover:shadow-primary/10"
                                disabled={isContactLoading}
                            >
                                {isContactLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                )}
                                {isContactLoading ? 'Carregando...' : (user ? 'Negociar no WhatsApp' : 'Entrar para Negociar')}
                            </button>
                        </div>
                    )}

                    {/* Owner Management Buttons */}
                    {canEdit && (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={onEdit}
                                    className="bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm active:scale-[0.98] border border-white/5"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    <span>Editar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        if (onDelete) onDelete();
                                    }}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    <span>Excluir</span>
                                </button>
                            </div>
                            {/* Boost Button - Temporarily Disabled
                            {canBoost && (
                                <button
                                    onClick={onBoost ?? onBump}
                                    className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 border border-yellow-500/50 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                                    <span>Impulsionar</span>
                                </button>
                            )}
                            */}
                            {(canMarkSold && onMarkSold) && (
                                <button
                                    onClick={onMarkSold}
                                    className="bg-[#0E2741] text-slate-400 hover:text-white py-2 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Marcar como Vendido
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
