'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce'; // Assuming this exists or I'll implement a simple one

export default function UserFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const filter = searchParams.get('filter') || 'all';

    // Configure debounce directly if hook not available, but let's try to use useEffect
    const debouncedSearch = useDebounce(search, 500);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== 'all') {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            // Reset page on filter change
            params.set('page', '1');
            return params.toString();
        },
        [searchParams]
    );

    useEffect(() => {
        // Only push if different to avoid loop or initial double fetch
        const currentSearch = searchParams.get('search') || '';
        if (debouncedSearch !== currentSearch) {
            router.push(`?${createQueryString('search', debouncedSearch)}`);
        }
    }, [debouncedSearch, router, createQueryString, searchParams]);

    const handleFilterChange = (newFilter: string) => {
        router.push(`?${createQueryString('filter', newFilter)}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 pt-2 pb-2 bg-[#f6f6f8] dark:bg-[#111621]">
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                </div>
                <input
                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-[#1a202c] text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-600 shadow-sm text-slate-900 dark:text-slate-900"
                    placeholder="Search by name, ID or email..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <button
                    onClick={() => handleFilterChange('all')}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' || !filter ? 'bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900' : 'bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-800 text-slate-600 dark:text-slate-300'}`}
                >
                    All Users
                </button>
                <button
                    onClick={() => handleFilterChange('verified')}
                    className={`shrink-0 px-4 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-1 ${filter === 'verified' ? 'bg-blue-600 text-slate-900 border-blue-600' : 'bg-white dark:bg-[#1a202c] border-gray-200 dark:border-gray-800 text-slate-600 dark:text-slate-300 hover:border-blue-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[16px] ${filter === 'verified' ? 'text-slate-900' : 'text-blue-500'}`}>verified</span> Verified
                </button>
                <button
                    onClick={() => handleFilterChange('admin')}
                    className={`shrink-0 px-4 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-1 ${filter === 'admin' ? 'bg-purple-600 text-slate-900 border-purple-600' : 'bg-white dark:bg-[#1a202c] border-gray-200 dark:border-gray-800 text-slate-600 dark:text-slate-300 hover:border-purple-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[16px] ${filter === 'admin' ? 'text-slate-900' : 'text-purple-500'}`}>shield_person</span> Admins
                </button>
            </div>
        </div>
    );
}
