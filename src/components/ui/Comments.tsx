'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getR2Url } from '@/lib/images';


export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    isAuthor?: boolean;
    replies?: Comment[];
}

interface CommentsProps {
    comments: Comment[];
    onReply?: (commentId: string, text: string) => Promise<void> | void;
    onLike?: (commentId: string, isLiked: boolean) => Promise<void> | void;
    placeholder?: string;
    maxDisplayed?: number;
    showInput?: boolean;
    onAddComment?: (text: string) => Promise<void> | void;
    onViewAll?: () => void;
    emptyMessage?: string;
}

export const Comments = (props: CommentsProps) => {
    const {
        comments,
        onReply,
        onLike,
        placeholder = "Escreva um comentário...",
        maxDisplayed,
        showInput = true,
        onAddComment,
        onViewAll,
        emptyMessage
    } = props;

    const [localComments, setLocalComments] = useState<Comment[]>(comments);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser } = useCurrentUser();
    const router = useRouter();

    // Sync local comments with props
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    const handleLike = async (commentId: string) => {
        if (!currentUser) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        // Find the comment to get its current isLiked state
        const findComment = (list: Comment[]): Comment | undefined => {
            for (const c of list) {
                if (c.id === commentId) return c;
                if (c.replies) {
                    const found = findComment(c.replies);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const comment = findComment(localComments);
        if (!comment) return;

        // Optimistic update
        const updateLikes = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === commentId) {
                    return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
                }
                if (c.replies) {
                    return { ...c, replies: updateLikes(c.replies) };
                }
                return c;
            });
        };
        setLocalComments(updateLikes(localComments));

        // Call the callback if provided
        if (onLike) {
            await onLike(commentId, comment.isLiked);
        }
    };

    const handleSubmitReply = async (parentId: string | null = null) => {
        if (!currentUser) {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        const text = replyText.trim();
        if (!text || isSubmitting) return;

        setIsSubmitting(true);

        const newComment: Comment = {
            id: `new-${Date.now()}`,
            userId: currentUser?.id || 'current-user',
            userName: currentUser?.username || 'Você',
            userAvatar: getR2Url(currentUser?.avatar_url) || '/images/default-avatar.png',
            text: text,
            timestamp: 'Agora',
            likes: 0,
            isLiked: false,
            replies: []
        };

        try {
            if (parentId) {
                // Optimistic update for reply
                const addReply = (list: Comment[]): Comment[] => {
                    return list.map(c => {
                        if (c.id === parentId) {
                            return { ...c, replies: [...(c.replies || []), newComment] };
                        }
                        if (c.replies) {
                            return { ...c, replies: addReply(c.replies) };
                        }
                        return c;
                    });
                };
                setLocalComments(addReply(localComments));

                if (onReply) await onReply(parentId, text);
            } else {
                // Optimistic update for new comment
                setLocalComments([...localComments, newComment]);

                if (onAddComment) await onAddComment(text);
                else if (onReply) await onReply('root', text);
            }

            setReplyText('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error submitting comment:', error);
            // Revert optimistic update on error
            setLocalComments(comments);
        } finally {
            setIsSubmitting(false);
        }
    };

    const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
        const profileLink = comment.userId === currentUser?.id ? '/profile/profile' : `/profile/${comment.userId}`;

        return (
            <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-8 mt-2 pl-2 border-l border-white/5' : 'mt-4'}`}>
                <div className="flex gap-3">
                    <Link
                        href={profileLink}
                        className={`${depth > 0 ? 'size-6' : 'size-8'} rounded-full bg-cover bg-center border border-white/10 flex-shrink-0 shadow-sm hover:border-primary transition-colors block`}
                        style={{ backgroundImage: `url("${getR2Url(comment.userAvatar)}")` }}
                    ></Link>
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                            <Link
                                href={profileLink}
                                className="text-xs font-bold text-white hover:text-primary transition-colors cursor-pointer"
                            >
                                @{comment.userName}
                            </Link>
                            <span className="text-[10px] text-text-secondary">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{comment.text}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => handleLike(comment.id)}
                                className={`flex items-center gap-1 text-[11px] font-bold transition-all active:scale-125 ${comment.isLiked ? 'text-primary' : 'text-text-secondary hover:text-slate-900'}`}
                            >
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                                {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                            {onReply && (
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className={`text-[11px] font-bold transition-colors ${replyingTo === comment.id ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Responder
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {replyingTo === comment.id && (
                    <div className="ml-11 mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <input
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmitReply(comment.id);
                            }}
                            placeholder={`Respondendo a @${comment.userName}...`}
                            className="flex-1 bg-[#0E2741] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-primary outline-none"
                        />
                        <button
                            disabled={!replyText.trim() || isSubmitting}
                            onClick={() => handleSubmitReply(comment.id)}
                            className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-400 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? '...' : 'Postar'}
                        </button>
                    </div>
                )}

                {comment.replies && comment.replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
            </div>
        );
    };

    const displayedComments = maxDisplayed ? localComments.slice(0, maxDisplayed) : localComments;

    return (
        <div className="flex flex-col">
            {displayedComments.length === 0 && emptyMessage ? (
                <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/50 mb-2">chat_bubble_outline</span>
                    <p className="text-text-secondary text-sm">{emptyMessage}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {displayedComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}

            {maxDisplayed && localComments.length > maxDisplayed && (
                <button
                    onClick={onViewAll}
                    className="text-text-secondary hover:text-primary transition-colors text-xs font-bold mt-4 text-left w-full pl-11"
                >
                    Ver todos os {localComments.length} comentários
                </button>
            )}

            {showInput && (
                <div className={`flex items-center gap-3 ${displayedComments.length > 0 ? 'mt-5 pt-3 border-t border-white/5' : ''}`}>
                    <div
                        className="size-8 rounded-full bg-cover bg-center border border-white/10 flex-shrink-0"
                        style={{ backgroundImage: `url("${getR2Url(currentUser?.avatar_url) || '/images/default-avatar.png'}")` }}
                    ></div>
                    <div className="flex-1 relative">
                        <input
                            value={replyingTo === null ? replyText : ''}
                            onChange={(e) => {
                                if (replyingTo === null) setReplyText(e.target.value);
                            }}
                            onFocus={() => {
                                if (!currentUser) {
                                    router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && replyingTo === null && !isSubmitting) handleSubmitReply(null);
                            }}
                            disabled={isSubmitting}
                            placeholder={currentUser ? placeholder : "Entrar para comentar..."}
                            className="w-full bg-transparent text-sm text-gray-100 outline-none placeholder:text-text-secondary/60 py-1 disabled:opacity-50"
                        />
                        <button
                            disabled={!replyText.trim() || replyingTo !== null || isSubmitting}
                            onClick={() => handleSubmitReply(null)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-green-400 disabled:opacity-0 transition-all font-bold text-xs"
                        >
                            {isSubmitting ? '...' : 'Postar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const sampleComments: Comment[] = [
    {
        id: '1',
        userId: 'user-1',
        userName: 'SniperWolf',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9ZExMEjDmSnLlAXKbaMNYAEdkru60Xi3TTLVEERECxfwqTYr9Eh7Sl60SEU2lfEI7-efbU_iO-MoChcaGOBz3ZoqJGQUub35ILB4CNHFy8wfgDGTOlV745OoWkyHctOGugNEmCxBzxln8ue8_J82Mb5lB4a3v_yQbI0q0pGctMF3fCRIuoyhoV5l57w-exoGy7xG-4ToL5ek2KC2kd-He8JRJJKmbVkBpVnO9h7J04oW3GBBF26Xs3DoOj4t4fYn3H7SL23jUeZ0a',
        text: 'Aceita troca em uma Hi-Capa? Tenho uma TM Gold Match praticamente nova.',
        timestamp: '2h',
        likes: 1,
        isLiked: false,
        replies: [
            {
                id: '2',
                userId: 'user-2',
                userName: 'TacticalJoe',
                userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIBlMCNDt77PpBLAjiQdGf2bR_Q1jZ1e0xmD_-2bsronhDERncS5Ghi88rfMY7cSgcuQejnn1xIPiYqqiWkbYbszAo-aRFHSAYOfSfMy3xJPRuOGHc99__TK-gze060hDaYRhnRKTgeRYKdgaBFW0ZULWf0Kub_9UkW6RhHPEgiok3D44VuOQH9ber7npxyKGN9-Ts0iS3LMEJbJE2UgR60TX7XLeaKuJdbL9aEJyYeFJJnjfiQJ8UAxQnPGVbasUwpnTMBui77JGV',
                text: 'Opa, agradeço a oferta mano, mas to precisando da grana mesmo. Se tiver interesse na compra, me chama no zap!',
                timestamp: '1h',
                likes: 0,
                isLiked: false
            }
        ]
    }
];
