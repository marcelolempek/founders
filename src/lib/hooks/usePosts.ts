'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import type { Post, PostImage, Comment, Profile, PostCondition, ListingType } from '@/lib/database.types';
import { toast } from '@/components/ui/Toast';
import { storage } from '@/lib/storage';

// Hook for fetching a single post with details
export function usePost(postId: string | null) {
  const [post, setPost] = useState<(Post & { user: Profile; images: PostImage[] }) | null>(null);
  const [comments, setComments] = useState<(Comment & { user: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch post with user and images - Added retry for new posts with a small delay
      let { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          shares_count,
          user:profiles!posts_user_id_fkey(*),
          images:post_images(*)
        `)
        .eq('id', postId)
        .single();

      // Retry once if not found (common for new posts)
      if (postError && postError.code === 'PGRST116') { // PGRST116 is "No rows found"
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResult = await supabase
          .from('posts')
          .select(`
            *,
            shares_count,
            user:profiles!posts_user_id_fkey(*),
            images:post_images(*)
          `)
          .eq('id', postId)
          .single();
        postData = retryResult.data;
        postError = retryResult.error;
      }

      if (postError) throw postError;
      if (!postData) throw new Error('Post não encontrado');
      setPost(postData as unknown as Post & { user: Profile; images: PostImage[] });

      // Fetch comments with users
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles!comments_user_id_fkey(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData as (Comment & { user: Profile })[]);

      // Check if user has liked this post
      const user = await getCurrentUser();
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setIsLiked(!!likeData);
      }

      // Increment view count (debounced in real app)
      // @ts-ignore
      await supabase.rpc('increment_post_views', { p_post_id: postId });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar post';
      setError(message);
      console.error('Post fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, comments, loading, error, isLiked, setIsLiked, refetch: fetchPost };
}

// Hook for liking/unliking posts
export function useLike() {
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId: string, currentlyLiked: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('Você precisa estar logado');

      if (currentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id } as any);
        if (error) throw error;
        return true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao curtir';
      console.error('Like error:', err);
      toast.error(message);
      return currentlyLiked;
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading };
}

// Hook for adding comments
export function useComment() {
  const [loading, setLoading] = useState(false);

  const addComment = async (postId: string, content: string, parentId?: string): Promise<Comment | null> => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('Você precisa estar logado');

      // Rate limit check removed to allow unrestricted commenting
      const canComment = true;

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null,
        } as any)
        .select(`
          *,
          user:profiles!comments_user_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data as Comment & { user: Profile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao comentar';
      console.error('Comment error:', err);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addComment, loading };
}

// Interface for creating a post
interface CreatePostInput {
  title: string;
  description: string;
  price?: number | null; // Optional for text posts
  category?: string | null; // Optional for text posts
  condition?: PostCondition; // Optional for text posts
  type: ListingType;
  location_city: string | null;
  location_state: string | null;
  ships_nationwide?: boolean; // Optional: indicates nationwide shipping
  images: File[];
  // Geocoding data
  latitude?: number | null;
  longitude?: number | null;
  postal_code?: string | null;
  formatted_address?: string | null;
  neighborhood?: string | null;
}

// Hook for creating posts
export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const createPost = async (input: CreatePostInput): Promise<string | null> => {
    try {
      setLoading(true);
      setProgress(0);

      const user = await getCurrentUser();
      if (!user) throw new Error('Você precisa estar logado');

      // Rate limit check removed to allow unrestricted posting
      const canPost = true;

      setProgress(10);

      // Generate post ID first (needed for R2 path structure)
      const postId = crypto.randomUUID();

      // Upload images to R2
      const imageIds: string[] = [];
      for (let i = 0; i < input.images.length; i++) {
        const file = input.images[i];

        // Use R2 storage (now imported statically)
        const { imageId, error: uploadError } = await storage.uploadPostImageR2(postId, file);

        if (uploadError) throw new Error(uploadError);

        imageIds.push(imageId);
        setProgress(10 + ((i + 1) / input.images.length) * 60);
      }

      setProgress(70);

      // Create post with pre-generated ID
      const { data: postData, error: insertError } = await supabase
        .from('posts')
        .insert({
          id: postId, // Use pre-generated ID
          user_id: user.id,
          title: input.title.trim(),
          description: input.description.trim(),
          price: input.price,
          currency: 'BRL',
          location_city: input.location_city,
          location_state: input.location_state,
          category: input.category,
          condition: input.condition,
          type: input.type,
          status: 'active',
          ships_nationwide: input.ships_nationwide || false,
          // Geocoding data
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          postal_code: input.postal_code || null,
          formatted_address: input.formatted_address || null,
          neighborhood: input.neighborhood || null,
        } as any)
        .select()
        .single() as any;

      if (insertError) throw insertError;

      setProgress(85);

      // Insert images with image_id (R2 UUIDs)
      if (imageIds.length > 0) {
        const imageInserts = imageIds.map((imageId, idx) => ({
          post_id: postData.id,
          image_id: imageId,
          is_cover: idx === 0,
          display_order: idx,
        }));

        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageInserts as any);

        if (imageError) throw imageError;
      }

      setProgress(100);
      return postData.id;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar anúncio';
      console.error('Create post error:', err);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPost, loading, progress };
}

// Hook for updating post status (mark as sold)
export function useUpdatePostStatus() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (postId: string, status: 'active' | 'sold' | 'archived'): Promise<boolean> => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('Você precisa estar logado');

      const { error } = await supabase
        .from('posts')
        // @ts-ignore
        .update({
          status,
          sold_at: status === 'sold' ? new Date().toISOString() : null,
        })
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure ownership

      if (error) throw error;
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      console.error('Update status error:', err);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
}


// Interface for updating a post
interface UpdatePostInput {
  title?: string;
  description?: string;
  price?: number | null;
  category?: string | null;
  condition?: PostCondition;
  location_city?: string;
  location_state?: string;
}

// Hook for updating posts
export function useUpdatePost() {
  const [loading, setLoading] = useState(false);

  const updatePost = async (postId: string, input: UpdatePostInput): Promise<boolean> => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('Você precisa estar logado');

      const updateData: Record<string, unknown> = {};

      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description.trim();
      if (input.price !== undefined) updateData.price = input.price;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.condition !== undefined) updateData.condition = input.condition;
      if (input.location_city !== undefined) updateData.location_city = input.location_city;
      if (input.location_state !== undefined) updateData.location_state = input.location_state;

      const { error } = await supabase
        .from('posts')
        // @ts-ignore
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure ownership

      if (error) throw error;
      toast.success('Anúncio atualizado com sucesso!');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar anúncio';
      console.error('Update post error:', err);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updatePost, loading };
}

// Alias for usePost (for consistency with naming)
export const useFeedPost = usePost;
