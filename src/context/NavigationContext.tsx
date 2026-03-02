'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
    isCreatePostModalOpen: boolean;
    openCreatePost: () => void;
    closeCreatePost: () => void;

    isPostDetailModalOpen: boolean;
    currentPostId: string | null;
    openPostDetail: (postId: string) => void;
    closePostDetail: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);

    const openCreatePost = () => setIsCreatePostModalOpen(true);
    const closeCreatePost = () => setIsCreatePostModalOpen(false);



    const openPostDetail = (postId: string) => {
        setCurrentPostId(postId);
        setIsPostDetailModalOpen(true);
    };
    const closePostDetail = () => {
        setIsPostDetailModalOpen(false);
        setCurrentPostId(null);
    };

    return (
        <NavigationContext.Provider value={{
            isCreatePostModalOpen, openCreatePost, closeCreatePost,
            isPostDetailModalOpen, currentPostId, openPostDetail, closePostDetail
        }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
