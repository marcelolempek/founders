'use client';

import React, { useEffect, useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import Link from 'next/link';
import { getCurrentProfile, supabase } from '@/lib/supabase';
import { useProfile, useUserPosts } from '@/lib/hooks/useProfile';
import { formatRelativeTime } from '@/lib/utils';
import { useNavigation } from '@/context/NavigationContext';
import { formatCurrency } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui/Modal';
import { useNotify } from '@/components/ui/Toast';
import { getR2Url } from '@/lib/images';


export default function SimplifiedUserProfileScreen() {
    const { profile, loading: profileLoading } = useProfile();
    const { posts, loading: postsLoading } = useUserPosts(profile?.id);
    const { openCreatePost } = useNavigation();
    const { success, error: notifyError } = useNotify();

    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loading = profileLoading || postsLoading;

    const handleDeleteClick = (postId: string) => {
        setPostToDelete(postId);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postToDelete);

            if (error) throw error;

            success('Anúncio removido com sucesso!');
            // Refresh list (hooks should handle this if we use a global state or simple reload)
            window.location.reload();
        } catch (err: any) {
            notifyError('Erro ao remover anúncio: ' + err.message);
        } finally {
            setIsDeleting(false);
            setPostToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-white">
                {/*  Desktop Sidebar (Hidden on small mobile, visible on larger screens)  */}
                <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/50 backdrop-blur-sm h-full flex-shrink-0 z-20">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined fill">local_police</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Empreendedores de Cristo</h1>
                        </div>
                        <nav className="flex flex-col gap-2">
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-white/5 transition-colors" href="/">
                                <span className="material-symbols-outlined">home</span>
                                <span className="font-medium">Feed do Mercado</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20" href="/profile/profile">
                                <span className="material-symbols-outlined fill">person</span>
                                <span className="font-medium">Meu Perfil</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-white/5 transition-colors" href="/messages">
                                <span className="material-symbols-outlined">chat</span>
                                <span className="font-medium">Mensagens</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-white/5 transition-colors" href="/settings">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="font-medium">Configurações</span>
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-6 border-t border-white/10">
                        {profile && (
                            <div className="flex items-center gap-3">
                                <div
                                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 bg-gray-700"
                                    style={{ backgroundImage: `url("${getR2Url(profile.avatar_url) || '/images/default-avatar.png'}")` }}
                                ></div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-slate-900 mb-0.5 max-w-[120px] truncate">{profile.username}</p>
                                    <p className="text-xs text-primary truncate max-w-[120px]">{profile.phone || 'No phone'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
                {/*  Main Content Area  */}
                <main className="flex-1 overflow-y-auto relative scroll-smooth bg-white">
                    {/*  Mobile Sticky Header  */}
                    <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                        <h1 className="text-lg font-bold text-slate-900">Meu Perfil</h1>
                        <button className="text-gray-400 hover:text-slate-900">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>

                    {!profile ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Login Necessário</h2>
                            <p className="text-gray-400 mb-6">Por favor, faça login para ver seu perfil.</p>
                            <Link href="/auth/login" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                Login
                            </Link>
                        </div>
                    ) : (
                        <div className="mobile-container pb-24 md:pb-10 pt-6 md:pt-10 px-4 md:px-0">
                            {/*  Profile Header  */}
                            <div className="flex flex-col items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative group cursor-pointer">
                                    <div
                                        className="size-32 rounded-full border-4 border-surface-dark bg-gray-800 bg-center bg-cover"
                                        style={{ backgroundImage: `url("${getR2Url(profile.avatar_url) || '/images/default-avatar.png'}")` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-slate-900">camera_alt</span>
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.full_name || profile.username || 'User'}</h2>
                                    <div className="flex items-center justify-center gap-2 text-primary/80 mb-4">
                                        <span className="material-symbols-outlined text-[18px] fill">verified</span>
                                        <span className="text-sm font-medium">{profile.is_verified ? 'Verificado' : 'Membro'}</span>
                                    </div>
                                    <button className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-slate-900 text-sm font-medium transition-all w-full max-w-[200px]">
                                        <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                                        Editar Perfil
                                    </button>
                                </div>
                                {/*  Meta / Info Box  */}
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 w-full max-w-[400px] flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">info</span>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Os compradores entrarão em contato diretamente via <span className="text-slate-900 font-semibold">WhatsApp</span> usando seu número cadastrado.
                                    </p>
                                </div>
                            </div>
                            {/*  Section Divider  */}
                            <div className="flex items-center justify-between mb-6 px-1 max-w-[600px] mx-auto w-full">
                                <h3 className="text-xl font-bold text-slate-900">Seu Arsenal</h3>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-gray-400 border border-white/10">
                                    {posts.length} Ativos
                                </span>
                            </div>
                            {/*  Listings Feed  */}
                            <div className="flex flex-col gap-4 max-w-[600px] mx-auto w-full">
                                {posts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl">
                                        <div className="size-16 rounded-full bg-white flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-gray-600 text-3xl">inventory_2</span>
                                        </div>
                                        <h3 className="text-slate-900 font-bold mb-1">Seu arsenal está vazio</h3>
                                        <p className="text-gray-500 text-sm">Anuncie seus Produtos/Servi�os para começar a negociar.</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="bg-white border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
                                            <div className="p-3 flex gap-4">
                                                {/*  Image  */}
                                                <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-800">
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                        style={{ backgroundImage: `url("${getR2Url(((post as any).images?.find((img: any) => img.is_cover)?.url) || ((post as any).images?.[0]?.url)) || '/images/default-post.png'}")` }}
                                                    ></div>
                                                    <div className="absolute top-1 left-1 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase">
                                                        {post.status}
                                                    </div>
                                                </div>
                                                {/*  Content  */}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-slate-900 font-bold text-lg leading-tight line-clamp-1">{post.title}</h4>
                                                            <p className="text-primary font-bold text-lg ml-2">{formatCurrency(post.price || 0)}</p>
                                                        </div>
                                                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{post.description}</p>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleDeleteClick(post.id)}
                                                            className="p-2 h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-900 hover:bg-white/10 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                        <Link href={`/post/edit?id=${post.id}`} className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-900 text-xs font-semibold border border-white/10 transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                                            Gerenciar
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/*  Floating Action Button  */}
                    <button onClick={openCreatePost} className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-primary hover:bg-[#0fd056] text-white h-14 w-14 rounded-full shadow-[0_0_20px_rgba(19,231,97,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group">
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                </main>
                {/*  Mobile Bottom Nav  */}
                <MobileNav />
            </div>

            <ConfirmModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={confirmDelete}
                title="Remover Anúncio"
                message="Tem certeza que deseja remover este anúncio? Esta ação não pode ser desfeita."
                confirmText={isDeleting ? "Removendo..." : "Remover"}
                variant="danger"
            />
        </>
    );
}
