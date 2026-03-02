'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';

export default function PostDetailPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openPostDetail } = useNavigation();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const postId = searchParams.get('id');

        // If there's a post ID in the URL, redirect to home and open modal
        if (postId && !isRedirecting) {
            setIsRedirecting(true);

            // Small delay to ensure the modal context is ready
            setTimeout(() => {
                // Open the modal with the post
                openPostDetail(postId);

                // Redirect to home page
                // Using replace to avoid adding to history
                router.replace('/');
            }, 100);
        }
    }, [searchParams, openPostDetail, router, isRedirecting]);

    // This component will briefly show while redirecting
    // Show a loading state
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
}
