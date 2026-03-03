'use client';
import Link from 'next/link';
import { useNavigation } from '@/context/NavigationContext';
import { useUser } from '@/context/UserContext';
import { getR2Url, getBestAvatar } from '@/lib/images';

export function MobileNav() {
    const { openCreatePost } = useNavigation();
    const { user, profile } = useUser();

    // Use profile first, then metadata avatar_url, then metadata picture (common for Google)
    const userAvatar = getBestAvatar(profile, user);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E2741]/95 backdrop-blur-md border-t border-white/10 flex justify-between items-center px-6 py-3 z-50 shadow-2xl">
            <Link href="/" className="flex flex-col items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[24px]">home</span>
            </Link>
            <Link href="/explore" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">explore</span>
            </Link>
            <button onClick={openCreatePost} className="bg-primary text-white rounded-full p-3 -mt-8 shadow-xl shadow-primary/30 border-4 border-[#0E2741]">
                <span className="material-symbols-outlined">add</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-text-secondary/50 cursor-not-allowed" disabled title="Em breve">
                <span className="material-symbols-outlined text-[24px]">chat</span>
            </button>
            <Link href="/profile/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                {/* Image */}
                <img
                    src={userAvatar}
                    alt="User profile avatar small"
                    className="size-6 rounded-full object-cover border border-transparent hover:border-white shadow-sm"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                    }}
                />
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors md:hidden">
                <span className="material-symbols-outlined text-[24px]">settings</span>
            </Link>
        </nav>
    );
}
