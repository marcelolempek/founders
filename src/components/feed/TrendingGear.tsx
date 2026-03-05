'use client';

import Link from 'next/link';
import { useTrendingCategories } from '@/lib/hooks/useFeedSidebar';

const categoryLabels: Record<string, string> = {
    technology: 'Tecnologia',
    services: 'Serviços',
    consulting: 'Consultoria',
    marketing: 'Marketing',
    design: 'Design',
    products: 'Produtos',
    tools: 'Ferramentas',
    networking: 'Networking',
    legal: 'Jurídico',
    other: 'Outros',
};

export function TrendingGear() {
    const { categories, loading } = useTrendingCategories(5);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="text-slate-900 font-bold text-sm mb-4">Categorias em Alta</h3>
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="h-4 bg-slate-100 rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-slate-100 rounded w-12 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return null; // Don't show if no trending categories
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
            <h3 className="text-slate-900 font-bold text-sm mb-4">Categorias em Alta</h3>
            <div className="flex flex-col gap-3">
                {categories.map(({ category, count }) => (
                    <Link
                        key={category}
                        className="flex justify-between items-center group"
                        href={`/explore?category=${category}`}
                    >
                        <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">
                            {categoryLabels[category] || category}
                        </span>
                        <span className="text-xs text-[#546e5f]">
                            {count} {count === 1 ? 'post' : 'posts'}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
