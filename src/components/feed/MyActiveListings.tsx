'use client';

import { useMyActiveListings } from '@/lib/hooks/useFeedSidebar';
import { formatCurrency } from '@/lib/utils';
import { ProductCard } from '@/components/shared/ProductCard';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';
import { getR2Url } from '@/lib/images';

export function MyActiveListings() {
    const { listings, loading } = useMyActiveListings(4);
    const { openPostDetail } = useNavigation();

    if (loading) {
        return (
            <div className="bg-[#1D4165] rounded-xl border border-white/10 p-5 mb-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-900 font-bold text-sm">Seus Anúncios Ativos</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (listings.length === 0) {
        return null; // Don't show if user has no active listings
    }

    return (
        <div className="bg-[#1D4165] rounded-xl border border-white/10 p-5 mb-6 shadow-xl text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-sm">Seus Anúncios Ativos</h3>
                <Link href="/profile/profile" className="text-xs text-primary font-medium hover:underline">
                    Ver Todos
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {listings.map((listing) => (
                    <ProductCard
                        key={listing.id}
                        image={getR2Url(listing.cover_image_url || listing.cover_image) || '/images/default-post.png'}
                        title={listing.title || ''}
                        price={formatCurrency(listing.price || 0, listing.currency || 'BRL')}
                        location=""
                        onClick={() => openPostDetail(listing.id)}
                    />
                ))}
            </div>
        </div>
    );
}
