'use client';

import { useState, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';

// Interface for nested comment structure
export interface CommentWithReplies {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    isAuthor?: boolean;
    replies?: CommentWithReplies[];
}

export function useComments() {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentWithReplies[]>([]);

    /**
     * Fetch all comments for a post with nested replies
     */
    const fetchPostComments = useCallback(async (postId: string, authorId?: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();

            // Fetch all comments for the post
            const { data: allComments, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    user:profiles!comments_user_id_fkey(id, username, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Fetch user's likes on these comments
            let userLikes: Set<string> = new Set();
            if (user) {
                const commentIds = ((allComments || []) as any[]).map(c => c.id);
                if (commentIds.length > 0) {
                    const { data: likes } = await (supabase as any)
                        .from('comment_likes')
                        .select('comment_id')
                        .eq('user_id', user.id)
                        .in('comment_id', commentIds);
                    userLikes = new Set(((likes || []) as any[]).map(l => l.comment_id));
                }
            }

            // Build nested structure
            const commentMap = new Map<string, CommentWithReplies>();
            const rootComments: CommentWithReplies[] = [];

            // First pass: create all comment objects
            for (const c of (allComments || []) as any[]) {
                const comment: CommentWithReplies = {
                    id: c.id,
                    userId: c.user_id,
                    userName: c.user?.username || 'Usuário',
                    userAvatar: c.user?.avatar_url || '',
                    text: c.content,
                    timestamp: formatRelativeTime(c.created_at),
                    likes: c.likes_count || 0,
                    isLiked: userLikes.has(c.id),
                    isAuthor: authorId ? c.user_id === authorId : false,
                    replies: [],
                };
                commentMap.set(c.id, comment);
            }

            // Second pass: build tree structure
            for (const c of (allComments || []) as any[]) {
                const comment = commentMap.get(c.id)!;
                if (c.parent_id && commentMap.has(c.parent_id)) {
                    commentMap.get(c.parent_id)!.replies!.push(comment);
                } else {
                    rootComments.push(comment);
                }
            }

            setComments(rootComments);
            return { data: rootComments, error: null };
        } catch (err) {
            console.error('Fetch comments error:', err);
            return { data: [], error: err instanceof Error ? err.message : 'Failed to fetch comments' };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Add a comment to a post
     */
    const addPostComment = async (postId: string, text: string, parentId?: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            const insertData: any = {
                post_id: postId,
                user_id: user.id,
                content: text,
            };

            if (parentId) {
                insertData.parent_id = parentId;
            }

            const { data, error } = await supabase
                .from('comments')
                .insert(insertData as any)
                .select(`
                    *,
                    user:profiles!comments_user_id_fkey(id, username, avatar_url)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Add comment error:', err);
            return { data: null, error: err instanceof Error ? err.message : 'Failed to add comment' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Add a review to a user profile
     */
    const addReview = async (reviewedUserId: string, rating: number, text: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            const { data, error } = await supabase
                .from('reviews')
                // @ts-ignore - reviews table exists in database
                .insert({
                    reviewer_id: user.id,
                    reviewed_user_id: reviewedUserId,
                    rating,
                    comment: text,
                } as any)
                .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)
        `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Add review error:', err);
            return { data: null, error: err instanceof Error ? err.message : 'Failed to add review' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Like/unlike a comment
     */
    const toggleCommentLike = async (commentId: string, isLiked: boolean) => {
        try {
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            if (isLiked) {
                // Unlike
                await (supabase as any)
                    .from('comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', user.id);
            } else {
                // Like
                await (supabase as any)
                    .from('comment_likes')
                    // @ts-ignore - comment_likes table exists in database
                    .insert({
                        comment_id: commentId,
                        user_id: user.id,
                    });
            }

            return { error: null };
        } catch (err) {
            console.error('Toggle comment like error:', err);
            return { error: err instanceof Error ? err.message : 'Failed to toggle like' };
        }
    };

    /**
     * Fetch all comments for a profile with nested replies
     */
    const fetchProfileComments = useCallback(async (profileId: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();

            // Fetch all comments for the profile
            const { data: allComments, error } = await supabase
                .from('profile_comments')
                .select(`
                    *,
                    user:profiles!profile_comments_user_id_fkey(id, username, avatar_url)
                `)
                .eq('profile_id', profileId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Fetch user's likes on these comments
            let userLikes: Set<string> = new Set();
            if (user) {
                const commentIds = ((allComments || []) as any[]).map(c => c.id);
                if (commentIds.length > 0) {
                    const { data: likes } = await supabase
                        .from('profile_comment_likes')
                        .select('comment_id')
                        .eq('user_id', user.id)
                        .in('comment_id', commentIds);
                    userLikes = new Set(((likes || []) as any[]).map((l: any) => l.comment_id));
                }
            }

            // Build nested structure
            const commentMap = new Map<string, CommentWithReplies>();
            const rootComments: CommentWithReplies[] = [];

            // First pass: create all comment objects
            for (const c of (allComments || []) as any[]) {
                const comment: CommentWithReplies = {
                    id: c.id,
                    userId: c.user_id,
                    userName: c.user?.username || 'Usuário',
                    userAvatar: c.user?.avatar_url || '',
                    text: c.content,
                    timestamp: formatRelativeTime(c.created_at),
                    likes: c.likes_count || 0,
                    isLiked: userLikes.has(c.id),
                    isAuthor: c.user_id === profileId,
                    replies: [],
                };
                commentMap.set(c.id, comment);
            }

            // Second pass: build tree structure
            for (const c of (allComments || []) as any[]) {
                const comment = commentMap.get(c.id)!;
                if (c.parent_id && commentMap.has(c.parent_id)) {
                    commentMap.get(c.parent_id)!.replies!.push(comment);
                } else {
                    rootComments.push(comment);
                }
            }

            setComments(rootComments);
            return { data: rootComments, error: null };
        } catch (err) {
            console.error('Fetch profile comments error:', err);
            return { data: [], error: err instanceof Error ? err.message : 'Failed to fetch comments' };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Add a comment to a user profile
     */
    const addProfileComment = async (profileId: string, text: string, parentId?: string) => {
        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            const insertData: any = {
                profile_id: profileId,
                user_id: user.id,
                content: text,
            };

            if (parentId) {
                insertData.parent_id = parentId;
            }

            const { data, error } = await supabase
                .from('profile_comments')
                .insert(insertData as any)
                .select(`
                    *,
                    user:profiles!profile_comments_user_id_fkey(id, username, avatar_url)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Add profile comment error:', err);
            return { data: null, error: err instanceof Error ? err.message : 'Failed to add comment' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle like on a profile comment
     */
    const toggleProfileCommentLike = async (commentId: string, isLiked: boolean) => {
        try {
            const user = await getCurrentUser();
            if (!user) throw new Error('Login required');

            if (isLiked) {
                // Unlike
                await supabase
                    .from('profile_comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', user.id);
            } else {
                // Like
                await supabase
                    .from('profile_comment_likes')
                    // @ts-ignore - profile_comment_likes table exists in database
                    .insert({
                        comment_id: commentId,
                        user_id: user.id,
                    });
            }

            return { error: null };
        } catch (err) {
            console.error('Toggle profile comment like error:', err);
            return { error: err instanceof Error ? err.message : 'Failed to toggle like' };
        }
    };

    return {
        loading,
        comments,
        fetchPostComments,
        addPostComment,
        fetchProfileComments,
        addProfileComment,
        addReview,
        toggleCommentLike,
        toggleProfileCommentLike,
    };
}
