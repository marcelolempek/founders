'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface AdminPaginationProps {
    total: number;
    limit?: number;
}

export default function AdminPagination({ total, limit = 20 }: AdminPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of <span className="font-medium">{total}</span> results
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Previous
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple logic to show window around current page could be added, for now simple 1..5
                        let p = i + 1;
                        if (totalPages > 5) {
                            if (currentPage > 3) p = currentPage - 2 + i;
                            if (p > totalPages) p = i + (totalPages - 4); // Stick to end
                        }
                        return (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${currentPage === p
                                        ? 'bg-blue-600 text-slate-900'
                                        : 'bg-white dark:bg-[#1a202c] border border-gray-300 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
