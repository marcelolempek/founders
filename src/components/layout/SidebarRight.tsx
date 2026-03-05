'use client';

import Link from 'next/link';
import { SuggestedSellers } from '@/components/feed/SuggestedSellers';
import { MyActiveListings } from '@/components/feed/MyActiveListings';

export function SidebarRight() {
    return (
        <aside className="hidden lg:flex lg:flex-col lg:col-span-3 sticky top-[100px] h-fit gap-10">
            {/* User's Active Listings */}
            <MyActiveListings />

            {/* Suggested Sellers */}
            <SuggestedSellers />
        </aside>
    );
}
