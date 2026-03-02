import { Suspense } from 'react';
import PostDetailPageClient from './PostDetailPageClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <PostDetailPageClient />
    </Suspense>
  );
}
