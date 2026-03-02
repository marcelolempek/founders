import { Suspense } from 'react';
import Search from '@/components/screens/feed/Search';

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[#111621] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Search />
        </Suspense>
    );
}
