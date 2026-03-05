'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser as useAuth } from '@/context/UserContext';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { signOut } from '@/lib/supabase';
import { getR2Url, getBestAvatar } from '@/lib/images';
import TenantSwitcher from './TenantSwitcher';

export function Header() {
    const { user, profile } = useAuth();
    const { unreadCount } = useNotifications();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const userAvatar = getBestAvatar(profile, user);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            setShowUserMenu(false);
            const { error } = await signOut();
            if (error) console.error("Logout error:", error);
            router.push('/auth/login');
        } catch (err) {
            console.error("Logout unexpected error:", err);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#0E2741]/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-40 h-40 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo2.png"
                                alt="Empreendedores de Cristo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 md:gap-4">

                        {user && <TenantSwitcher />}

                        {user ? (
                            <>
                                {/* Notifications */}
                                <Link
                                    href="/notifications"
                                    className="relative p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">
                                        notifications
                                    </span>

                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 size-4 flex items-center justify-center bg-primary rounded-full text-[10px] font-bold text-white border border-[#0E2741]">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Avatar */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="relative rounded-full size-9 border-2 border-white/10 hover:border-primary transition-all active:scale-95 shadow-lg shadow-black/20 overflow-hidden group"
                                    >
                                        <img
                                            src={userAvatar}
                                            alt="User avatar"
                                            className="size-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                            }}
                                        />
                                    </button>

                                    {showUserMenu && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 border border-white/10 rounded-xl shadow-xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-white"
                                            style={{ backgroundColor: '#1d4165' }}
                                        >
                                            <div className="p-3 border-b border-white/10 bg-white/5">
                                                <p className="text-white font-bold text-sm truncate">
                                                    {profile?.username || user?.email}
                                                </p>
                                                <p className="text-slate-400 text-[10px] truncate">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    href="/profile/profile"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px] text-primary">
                                                        person
                                                    </span>
                                                    <span className="text-sm text-white font-medium">
                                                        Meu Perfil
                                                    </span>
                                                </Link>
                                            </div>

                                            <div className="border-t border-white/10 py-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 transition-colors w-full text-left font-bold cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        logout
                                                    </span>
                                                    <span className="text-sm">Sair</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Entrar
                                </Link>

                                <Link
                                    href="/auth/signup"
                                    className="hidden md:flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Criar Conta
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}

export default Header;