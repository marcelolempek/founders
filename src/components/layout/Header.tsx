'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser as useAuth } from '@/context/UserContext';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { signOut } from '@/lib/supabase';
import { getR2Url } from '@/lib/images/imageUrl';

export function Header() {
    const { user, profile } = useAuth();
    const { unreadCount } = useNotifications();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const userAvatar =
        getR2Url(user?.user_metadata?.avatar_url) ||
        '/images/default-avatar.png';

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
                <div className="flex h-16 items-center justify-between gap-4">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">

                        {/* IMAGEM NO LUGAR DO ÍCONE */}
                        <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo.png"
                                alt="Empreendedores de Cristo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg leading-none">
                                Empreendedores de Cristo
                            </span>
                            <span className="text-slate-400 font-medium text-xs mt-1">
                                Conectando negócios e propósitos
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-md">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar produtos, serviços ou pessoas..."
                                className="w-full bg-[#1D4165] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <>
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

                                {/* User Avatar Dropdown */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white/10 hover:border-primary transition-all active:scale-95 shadow-lg shadow-black/20"
                                        style={{ backgroundImage: `url("${userAvatar}")` }}
                                    />

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