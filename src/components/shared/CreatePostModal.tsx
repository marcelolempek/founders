'use client';

import { useNavigation } from '@/context/NavigationContext';
import CreatePost from '@/components/screens/post/CreatePost';
import { useEffect } from 'react';

export default function CreatePostModal() {
    const { isCreatePostModalOpen, closeCreatePost } = useNavigation();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isCreatePostModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCreatePostModalOpen]);

    if (!isCreatePostModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-[#0e2741]/95 md:bg-black/80 md:backdrop-blur-sm md:items-center md:justify-center p-0 md:p-6 cursor-pointer"
            onClick={closeCreatePost}
        >
            {/* Content Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full max-w-2xl bg-[#1d4165] border border-white/10 md:rounded-2xl md:shadow-2xl flex flex-col md:max-h-[90vh] relative animate-in zoom-in-95 duration-200 cursor-default"
            >
                {/* Desktop Close Button */}
                <button
                    onClick={closeCreatePost}
                    className="absolute top-4 right-4 z-[60] size-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 hover:scale-110 transition-all cursor-pointer shadow-xl border border-white/10"
                >
                    <span className="material-symbols-outlined text-2xl font-bold">close</span>
                </button>

                {/* CreatePost component - it handles its own layout */}
                <CreatePost isModal={true} onClose={closeCreatePost} />
            </div>
        </div>
    );
}
