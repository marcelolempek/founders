'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getImageUrl, getR2Url, getPostImageUrl } from '@/lib/images';
import Link from 'next/link';


import { useSocial } from '@/lib/hooks/useSocial';
import { useUser } from '@/context/UserContext';
import { formatCurrency } from '@/lib/utils';
import { getPostUrl } from '@/lib/utils/postUrl';

interface Story {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
    price?: number;
    currency?: string;
    location_city?: string;
    location_state?: string;
    type?: string;
}

export interface UserStoryData {
    id: string;
    username: string;
    avatar_url: string | null;
}

interface StoriesViewerProps {
    users: UserStoryData[];
    initialUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function StoriesViewer({ users, initialUserId, isOpen, onClose }: StoriesViewerProps) {
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [stories, setStories] = useState<Story[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

    const currentUser = users[currentUserIndex];

    // Initialize/Reset when opening
    useEffect(() => {
        if (isOpen && initialUserId) {
            const index = users.findIndex(u => u.id === initialUserId);
            if (index !== -1) {
                setCurrentUserIndex(index);
                setCurrentIndex(0);
            }
        }
    }, [isOpen, initialUserId, users]);

    const [isFollowing, setIsFollowing] = useState(false);
    const { checkIsFollowing, followUser, unfollowUser } = useSocial();
    const { user } = useUser();

    useEffect(() => {
        if (currentUser && user && currentUser.id !== user.id) {
            checkIsFollowing(currentUser.id).then(setIsFollowing);
        } else {
            setIsFollowing(false);
        }
    }, [currentUser, user, checkIsFollowing]);

    const handleFollowClick = async () => {
        if (!process.env.NEXT_PUBLIC_ALLOW_UNSAFE_FOLLOW && !user) return;

        if (currentUser) {
            if (isFollowing) {
                const success = await unfollowUser(currentUser.id);
                if (success) setIsFollowing(false);
            } else {
                const success = await followUser(currentUser.id);
                if (success) setIsFollowing(true);
            }
        }
    };



    // Fetch user's posts
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const fetchStories = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id,
                    title,
                    description,
                    created_at,
                    price,
                    currency,
                    location_city,
                    location_state,
                    type,
                    images:post_images(url, image_id, is_cover)
                `)
                .eq('user_id', currentUser.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data && !error) {
                const formattedStories = data
                    .filter((post: any) => post.images && post.images.length > 0)
                    .map((post: any) => {
                        const coverImg = post.images.find((img: any) => img.is_cover) || post.images[0];
                        const imageUrl = getPostImageUrl(post.id, coverImg.image_id, coverImg.url, 'feed');

                        return {
                            id: post.id,
                            title: post.title,
                            description: post.description,
                            image_url: imageUrl,
                            created_at: post.created_at,
                            price: post.price,
                            currency: post.currency,
                            location_city: post.location_city,
                            location_state: post.location_state,
                            type: post.type,
                        };
                    });

                setStories(formattedStories);

                // Check saved status
                if (user && formattedStories.length > 0) {
                    const postIds = formattedStories.map((p: any) => p.id);
                    const { data: savedData } = await supabase
                        .from('saved_posts')
                        .select('post_id')
                        .eq('user_id', user.id)
                        .in('post_id', postIds);

                    if (savedData) {
                        setSavedPostIds(new Set(savedData.map((s: any) => s.post_id)));
                    } else {
                        setSavedPostIds(new Set());
                    }
                }

                // If user has no stories, try skipping to next user after a brief delay
                if (formattedStories.length === 0) {
                    // Optional: Logic to auto-skip could live here, but usually UI shows "no stories"
                    // For now we show the empty state
                } else {
                    // Ensure index is valid
                    setCurrentIndex(0);
                }
            }
            setLoading(false);
        };

        fetchStories();
    }, [currentUser, isOpen]);

    // Handle next story/user
    const handleNext = useCallback(() => {
        // If current user has stories and we are not at the end
        if (stories.length > 0 && currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // End of current user's stories -> Go to next user
            if (currentUserIndex < users.length - 1) {
                setCurrentUserIndex(prev => prev + 1);
                setCurrentIndex(0); // Reset for new user
            } else {
                // End of all users
                onClose();
            }
        }
    }, [currentIndex, stories.length, currentUserIndex, users.length, onClose]);

    // Handle previous story/user
    const handlePrevious = useCallback(() => {
        // If not at the start of current stories
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            // Start of current user -> Go to previous user
            if (currentUserIndex > 0) {
                setCurrentUserIndex(prev => prev - 1);
                // Ideally, we would set to the last story of the previous user, 
                // but we fetch stories asynchronously, so setting to 0 is safer/easier for now.
                // Or we can default to 0. User navigation usually starts fresh.
                setCurrentIndex(0);
            }
        }
    }, [currentIndex, currentUserIndex]);

    const toggleSave = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!process.env.NEXT_PUBLIC_ALLOW_UNSAFE_FOLLOW && !user) return; // Prevent if logic requires auth

        const isSaved = savedPostIds.has(postId);
        const newSaved = new Set(savedPostIds);

        if (isSaved) {
            newSaved.delete(postId);
            setSavedPostIds(newSaved);
            if (user?.id) {
                await supabase.from('saved_posts').delete().eq('user_id', user.id).eq('post_id', postId);
            }
        } else {
            newSaved.add(postId);
            setSavedPostIds(newSaved);
            if (user?.id) {
                // @ts-ignore
                await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId });
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrevious, onClose]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrevious();

        setTouchStart(0);
        setTouchEnd(0);
    };

    if (!isOpen || !currentUser) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center h-dvh w-screen touch-none cursor-pointer"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full max-w-md mx-auto flex items-center justify-center bg-black cursor-default overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 pb-12 pointer-events-none safe-area-top">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <Link href={`/profile/${currentUser.id}`} className="flex items-center gap-3" onClick={onClose}>
                            <div className="size-10 rounded-full overflow-hidden border-2 border-white">
                                <img
                                    src={getR2Url(currentUser.avatar_url) || '/images/default-avatar.png'}
                                    alt={currentUser.username}
                                    className="size-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                    }}
                                />
                            </div>
                            <span className="text-white font-semibold flex flex-col leading-tight">
                                {currentUser.username}
                                <span className="text-[10px] font-normal opacity-70 text-slate-300">
                                    {stories[currentIndex]?.created_at ? new Date(stories[currentIndex].created_at).toLocaleDateString() : ''}
                                </span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* Follow Toggle (Header) */}
                            {user && currentUser.id !== user.id && (
                                <button
                                    onClick={handleFollowClick}
                                    className={`px-3 py-1 text-xs font-bold rounded-full transition-transform hover:scale-105 cursor-pointer ${isFollowing
                                        ? 'bg-transparent border border-white text-white'
                                        : 'bg-primary text-white'
                                        }`}
                                >
                                    {isFollowing ? 'Seguindo' : 'Seguir'}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress bars */}
                    <div className="flex gap-1 mt-3">
                        {stories.map((_, index) => (
                            <div
                                key={index}
                                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                            >
                                <div
                                    className={`h-full bg-white transition-all duration-300 ${index === currentIndex ? 'w-full' : index < currentIndex ? 'w-full' : 'w-0'
                                        }`}
                                />
                            </div>
                        ))}
                        {stories.length === 0 && !loading && (
                            <div className="w-full h-0.5 bg-white/30 rounded-full"></div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
                ) : stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-white z-0 px-6 text-center">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">photo_library</span>
                        <p className="text-lg font-medium">Nenhum post disponível para este perfil</p>
                        <button onClick={handleNext} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-sm font-bold cursor-pointer">
                            Próximo perfil
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Navigation Zones (Overlay) */}
                        <div className="absolute inset-0 z-10 flex">
                            {/* Previous Zone (Left 25%) */}
                            <div className="w-1/4 h-full cursor-pointer" onClick={handlePrevious} />

                            {/* Center Zone (50%) - Click for post link if wanted, but navigation is mostly swipe/left-right */}
                            <div className="w-2/4 h-full" />

                            {/* Next Zone (Right 25%) */}
                            <div className="w-1/4 h-full cursor-pointer" onClick={handleNext} />
                        </div>

                        {/* Image */}
                        <img
                            src={stories[currentIndex]?.image_url}
                            alt={stories[currentIndex]?.title}
                            className="w-full h-full object-contain pointer-events-none select-none"
                        />

                        {/* Caption Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pb-20 pt-16 pointer-events-none z-20">
                            <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">
                                {stories[currentIndex]?.title}
                            </h3>
                            {stories[currentIndex]?.description && (
                                <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                                    {stories[currentIndex]?.description}
                                </p>
                            )}
                            <div className="mt-4 flex items-end justify-between pointer-events-auto w-full">
                                <div className="flex flex-col gap-3">
                                    {/* Metadata Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {stories[currentIndex]?.location_city && (
                                            <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] text-white/90">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {stories[currentIndex].location_city}
                                                {stories[currentIndex].location_state ? `, ${stories[currentIndex].location_state}` : ''}
                                            </span>
                                        )}
                                        {stories[currentIndex]?.type === 'sale' && stories[currentIndex]?.price && (
                                            <span className="inline-flex items-center gap-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-2.5 py-1 rounded text-[11px] text-green-400 font-bold">
                                                {formatCurrency(stories[currentIndex].price!)}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={getPostUrl(stories[currentIndex]?.id || '')}
                                        className="text-xs font-bold text-black bg-white px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all inline-block text-center w-fit shadow-lg transform active:scale-95"
                                        onClick={onClose}
                                    >
                                        Ver publicação completa
                                    </Link>
                                </div>

                                {/* Save Button */}
                                <button
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all mb-[2px] z-50 pointer-events-auto cursor-pointer flex items-center justify-center transform active:scale-90"
                                    title={stories[currentIndex] && savedPostIds.has(stories[currentIndex].id) ? "Remover dos salvos" : "Salvar"}
                                    onClick={(e) => {
                                        const currentId = stories[currentIndex]?.id;
                                        if (currentId) toggleSave(e, currentId);
                                    }}
                                >
                                    <span
                                        className={`material-symbols-outlined text-[24px] ${stories[currentIndex] && savedPostIds.has(stories[currentIndex].id) ? 'fill-current' : ''}`}
                                        style={{ fontVariationSettings: stories[currentIndex] && savedPostIds.has(stories[currentIndex].id) ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        bookmark
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
