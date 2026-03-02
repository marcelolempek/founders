'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { useMySupportTickets } from '@/lib/hooks/useSupport';
import { formatRelativeTime } from '@/lib/utils';

export default function MyTicketsScreen() {
    const router = useRouter();
    const { tickets, loading, error } = useMySupportTickets();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">Aberto</span>;
            case 'in_progress':
                return <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase">Em Análise</span>;
            case 'resolved':
                return <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Resolvido</span>;
            case 'closed':
                return <span className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-500 text-[10px] font-bold uppercase">Fechado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0e2741] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0e2741]/95 backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 lg:px-10 py-3 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors text-white">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-white">Meus Chamados</h1>
                    </div>
                    <Link href="/support/contact" className="text-sm text-primary font-bold hover:underline">
                        Novo Chamado
                    </Link>
                </div>
            </div>

            <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                        <p className="text-red-400">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline text-slate-900">Tentar novamente</button>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-slate-400 text-[40px]">confirmation_number</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Sem chamados ativos</h2>
                        <p className="text-slate-400 max-w-sm mb-8">
                            Você ainda não abriu nenhum ticket de suporte. Se precisar de ajuda, clique no botão abaixo.
                        </p>
                        <Link href="/support/contact" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
                            Abrir Novo Chamado
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="bg-[#1D4165] border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors shadow-sm">
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white capitalize">{ticket.topic}</span>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{formatRelativeTime(ticket.created_at)}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">ID: #{ticket.id.slice(0, 8)}</span>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {ticket.message}
                                        </p>
                                    </div>

                                    {ticket.response && (
                                        <div className="mt-2 border-l-2 border-primary pl-4 py-2 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[18px] fill">support_agent</span>
                                                <span className="text-xs font-bold text-primary">Resposta do Suporte</span>
                                                <span className="text-[10px] text-slate-400 ml-auto">{formatRelativeTime(ticket.responded_at)}</span>
                                            </div>
                                            <p className="text-sm text-white leading-relaxed">
                                                {ticket.response}
                                            </p>
                                        </div>
                                    )}

                                    {!ticket.response && ticket.status === 'open' && (
                                        <div className="flex items-center gap-2 text-[10px] text-yellow-500/70 py-2">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            <span>Aguardando resposta da nossa equipe em até 48h.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <MobileNav />
        </div>
    );
}
