'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavLinkProps {
    href: string;
    icon: string;
    label: string;
    badge?: number | string;
}

export default function AdminNavLink({ href, icon, label, badge }: AdminNavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
        >
            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            {badge && (
                <span className="ml-auto bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
}
