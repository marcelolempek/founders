import { Suspense } from 'react';
import FollowingScreen from '@/components/screens/profile/Following';

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[#111621] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
    );
}

export default function FollowingPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <FollowingScreen />
        </Suspense>
    );
}
