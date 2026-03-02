'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';
import PostDetail from '@/components/screens/post/PostDetail';
import { getCurrentUser } from '@/lib/supabase';

export default function PostDetailModal() {
    const { isPostDetailModalOpen, currentPostId, closePostDetail } = useNavigation();
    // const { post, loading } = usePost(currentPostId); // Removed as PostDetail handles fetching
    const router = useRouter();

    // Redirect to full page if user is the owner
    useEffect(() => {
        const checkOwnership = async () => {
            if (currentPostId) {
                const user = await getCurrentUser();
                // We could check ownership here if we fetch post, but PostDetail component handles Owner UI now.
                // Or we can let the full page redirect happen inside PostDetail if we really wanted to.
                // For now, let's keep it in modal for everyone, or restore logic if needed.
                // But since we don't have 'post' object here anymore without fetching, 
                // we'll rely on PostDetail or remove this check.

                // Ideally, we want consistent experience. If we remove this redirect, owners can edit in modal!
                // This is actually BETTER.
            }
        };
        // checkOwnership(); // Disabled the redirect loop
    }, [currentPostId]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isPostDetailModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPostDetailModalOpen]);

    if (!isPostDetailModalOpen || !currentPostId) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col cursor-pointer"
            onClick={closePostDetail}
        >
            <div
                className="flex-1 flex flex-col w-full h-full overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0E2741]/95 backdrop-blur-md border-b border-white/5 shrink-0">
                    <h2 className="text-lg font-bold text-white">Anúncio</h2>
                    <button
                        onClick={closePostDetail}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex justify-center items-start bg-[#0E2741]">
                    <div className="w-full max-w-[600px] bg-[#0E2741] min-h-full shadow-2xl border-x border-white/5">
                        {currentPostId ? (
                            <PostDetail initialPostId={currentPostId} isModal={true} />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
