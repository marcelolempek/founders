'use client';

import Link from 'next/link';
import { SuggestedSellers } from '@/components/feed/SuggestedSellers';
import { MyActiveListings } from '@/components/feed/MyActiveListings';

export function SidebarRight() {
    return (
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit pl-4">
            {/* User's Active Listings */}
            <MyActiveListings />

            {/* Suggested Sellers */}
            <SuggestedSellers />

        </aside>
    );
}
