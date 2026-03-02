'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';
import { getCurrentProfile } from '@/lib/supabase';
import { Profile } from '@/lib/database.types';
import { useUser } from '@/context/UserContext';
import { getR2Url } from '@/lib/images';


export default function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { openCreatePost } = useNavigation();
    const { user } = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        getCurrentProfile().then((p) => setProfile(p as any));
    }, []);

    const handleCreatePost = () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        openCreatePost();
    };

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0E2741]/95 backdrop-blur-md border-t border-white/10 pt-2 pb-5 px-6 z-50 flex items-center justify-between shadow-2xl">
            <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-slate-400'}`}>
                <span className={`material-symbols-outlined text-[28px] ${isActive('/') ? 'filled' : ''}`}>home</span>
            </Link>

            <Link href="/post/saved-posts" className={`flex flex-col items-center gap-1 ${isActive('/post/saved-posts') ? 'text-primary' : 'text-slate-400'}`}>
                <span className={`material-symbols-outlined text-[28px] ${isActive('/post/saved-posts') ? 'filled' : ''}`}>bookmark</span>
            </Link>



            <Link
                href="/discover"
                className="flex items-center justify-center p-2"
            >
                {/* Military tech icon for Soldados/Discover */}
                <span className={`material-symbols-outlined text-[32px] ${isActive('/discover') ? 'text-primary filled' : 'text-slate-400'}`}>military_tech</span>
            </Link>

            <Link href="/explore" className={`flex flex-col items-center gap-1 ${isActive('/explore') ? 'text-primary' : 'text-slate-400'}`}>
                <span className={`material-symbols-outlined text-[28px] ${isActive('/explore') ? 'filled' : ''}`}>search</span>
            </Link>

            <Link href="/profile/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile/profile') ? 'text-primary' : 'text-slate-400'}`}>
                {/* Use profile avatar specifically */}
                <div className={`size-7 rounded-full bg-[#1D4165] bg-cover bg-center border-2 ${isActive('/profile/profile') ? 'border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/20' : 'border-transparent'}`}
                    style={{ backgroundImage: `url(${getR2Url(profile?.avatar_url) || '/images/default-avatar.png'})` }}
                />
            </Link>
        </nav>
    );
}
