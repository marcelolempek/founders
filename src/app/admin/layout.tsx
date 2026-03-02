'use client';

export const dynamic = 'force-dynamic';

import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/hooks/useAdmin';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Mapping paths to titles for mobile header
    const getMobileTitle = (path: string) => {
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/moderation')) return 'Moderation Queue';
        if (path.includes('/users')) return 'User Management';
        if (path.includes('/verification')) return 'Verification';
        if (path.includes('/analytics')) return 'Analytics';
        if (path.includes('/settings')) return 'Settings';
        return 'Admin Console';
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Admin Protection (Client-Side)
    const { isAdmin, isModerator, loading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin && !isModerator) {
            router.push('/?error=unauthorized');
        }
    }, [loading, isAdmin, isModerator, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#111621]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    <p className="text-slate-600 dark:text-gray-400 font-medium">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 fixed inset-y-0 z-50">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay & Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0d1117] shadow-xl animate-in slide-in-from-left duration-200">
                        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-slate-900 shadow-blue-900/20 shadow-lg">
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900">{getMobileTitle(pathname)}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/moderation" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            {/* <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-[#0d1117]"></span> */}
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-1 text-slate-600 dark:text-slate-300 bg-gray-100 dark:bg-white/10 rounded-md"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}
