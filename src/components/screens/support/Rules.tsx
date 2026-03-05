'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function RulesGuidelinesScreen1() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <Header />

            <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-8 pb-24 max-w-[640px] mx-auto w-full">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-primary text-[32px]">shield</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integridade e Profissionalismo</h1>
                    <p className="text-slate-900/60 text-base font-normal leading-relaxed max-w-[400px]">
                        Nossa comunidade prospera com confiança. Leia estas diretrizes cuidadosamente para manter o marketplace seguro para todos.
                    </p>
                </div>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        <h3 className="text-lg font-bold text-slate-900">O que é Permitido</h3>
                    </div>
                    <div className="bg-slate-400 rounded-xl p-5 border border-white/5 space-y-4">
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">check</span>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Serviços Profissionais</p>
                                <p className="text-slate-900/50 text-xs">Consultorias, mentorias, design, marketing e assistência profissional.</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-white/5"></div>
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">check</span>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Produtos e Negócios</p>
                                <p className="text-slate-900/50 text-xs">Equipamentos, materiais e produtos físicos para o dia a dia do empreendedor.</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-white/5"></div>
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">check</span>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Parcerias Estratégicas</p>
                                <p className="text-slate-900/50 text-xs">Networking, conexões e oportunidades reais de colaboração entre membros.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Prohibited Items */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-red-500">cancel</span>
                        <h3 className="text-lg font-bold text-slate-900">Estritamente Proibido</h3>
                    </div>
                    <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20 space-y-4 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-red-500/5 pointer-events-none">
                            <span className="material-symbols-outlined text-[100px] fill-1">block</span>
                        </div>
                        <div className="flex gap-3 items-start relative z-10">
                            <div className="size-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-red-500 text-[14px]">close</span>
                            </div>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Práticas Antiéticas</p>
                                <p className="text-slate-900/50 text-xs">Spam, esquemas de pirâmide, promessas irreais de ganhos e conduta imprópria entre membros.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start relative z-10">
                            <div className="size-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-red-500 text-[14px]">close</span>
                            </div>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Conteúdo Inadequado</p>
                                <p className="text-slate-900/50 text-xs">Linguagem ofensiva, desrespeito a valores cristãos e materiais sem direitos autorais.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start relative z-10">
                            <div className="size-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-red-500 text-[14px]">close</span>
                            </div>
                            <div>
                                <p className="text-slate-900 font-medium text-sm">Vendas Ilegais</p>
                                <p className="text-slate-900/50 text-xs">Qualquer produto ou serviço que viole as leis vigentes ou as diretrizes de integridade da plataforma.</p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* SECTION 3: Listing Standards */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        <h3 className="text-lg font-bold text-slate-900">Regras de Anúncio</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-400 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-white flex items-center justify-center text-primary border border-white/5">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Transparência em Ofertas</h4>
                                <p className="text-slate-900/60 text-xs mt-1 leading-relaxed">Todo anúncio deve ser transparente. Ofertas vagas ou sem propósito claro de negócio serão removidas.</p>
                            </div>
                        </div>
                        <div className="bg-slate-400 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                            <div className="size-10 rounded-lg bg-white flex items-center justify-center text-primary border border-white/5">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Descrição Detalhada</h4>
                                <p className="text-slate-900/60 text-xs mt-1 leading-relaxed">Forneça detalhes claros sobre o que você oferece. Isso ajuda a construir confiança e filtrar interessados qualificados.</p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Footer Text */}
                <div className="text-center pt-4 pb-2">
                    <p className="text-slate-900/30 text-xs">Última atualização: Março 2026</p>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
