'use client';

import React from 'react';
import Link from 'next/link';
import LogoIcon from '@/components/shared/LogoIcon';

export default function BadgeApplicationConfirmation() {
    return (
        <>
            {/*  Top Navigation Bar  */}
            <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-solid border-gray-200 dark:border-slate-200 bg-white/80 dark:bg-[#111318]/90 backdrop-blur-md px-4 py-3 md:px-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <LogoIcon size={32} />
                        <h2 className="text-lg font-black leading-tight tracking-[-0.015em] hidden sm:block">Empreendedores de Cristo</h2>
                    </Link>
                </div>
                {/*  Desktop Nav Links  */}
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">Feed</Link>
                    <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">Market</Link>
                    <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">Events</Link>
                    <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">Profile</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                    </button>
                    <div className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-slate-200 ml-2" data-alt="User profile avatar showing a Christian entrepreneur" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBKT3smSPdCExygBF6-QMX2_vdkCamirf9-haHrSOLogeIB5JLVOEwbSMghU3I0uRwrDzhG9o4h3eDgM741mFn9tDVVMzniaB31oYLDmDrv5LdE8UC44y8_doj2feP6XssQQv-NyIKZlr5HWdq0t3WCqNOZZJqiWbrdrQ75D1xUDspqNsGt4rCUCqDxrxOl1jEpnJD6k0nslBVfNNngS97iagAkDYnGyXh53o5DOKndLuaiMjA6kPDXL8OxA_TmnoKk2phYLIESV27y")' }}>
                    </div>
                </div>
            </header>
            {/*  Main Content Area  */}
            <main className="flex-1 flex flex-col items-center py-8 px-4 w-full">
                {/*  Mobile-first container  */}
                <div className="w-full max-w-[500px] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/*  Success Hero Section  */}
                    <div className="flex flex-col items-center text-center pt-8 pb-4">
                        <div className="relative mb-6 group">
                            <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative size-24 bg-white border-2 border-primary rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-5xl">verified</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-white">
                                <span className="material-symbols-outlined text-slate-900 text-sm font-bold">check</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">Solicitação Recebida!</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed px-4">
                            Obrigado por enviar sua documentação para o selo de verificação. O processo foi iniciado com sucesso.
                        </p>
                    </div>
                    {/*  Status Timeline  */}
                    <div className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Status do Pedido</h3>
                        <div className="grid grid-cols-[32px_1fr] gap-x-4">
                            {/*  Step 1: Done  */}
                            <div className="flex flex-col items-center">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center z-10">
                                    <span className="material-symbols-outlined text-slate-900 text-sm">check</span>
                                </div>
                                <div className="w-0.5 bg-primary h-full min-h-[40px]"></div>
                            </div>
                            <div className="pb-8 pt-1">
                                <p className="font-bold text-base">Solicitação Enviada</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Documentação recebida em 14/10/2023</p>
                            </div>
                            {/*  Step 2: Active  */}
                            <div className="flex flex-col items-center">
                                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 box-border">
                                    <span className="material-symbols-outlined text-primary text-sm animate-spin" style={{ animationDuration: "3s" }}>sync</span>
                                </div>
                                <div className="w-0.5 bg-gray-200 dark:bg-slate-200 h-full min-h-[40px]"></div>
                            </div>
                            <div className="pb-8 pt-1">
                                <p className="font-bold text-base text-primary">Em Análise</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Nossa equipe está revisando seus dados.</p>
                            </div>
                            {/*  Step 3: Pending  */}
                            <div className="flex flex-col items-center">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-slate-200 flex items-center justify-center z-10">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">military_tech</span>
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="font-medium text-base text-gray-400">Selo Concedido</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Aprovação final pendente.</p>
                            </div>
                        </div>
                    </div>
                    {/*  Informational Card  */}
                    <div className="bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-slate-200 p-5 shadow-sm">
                        <div className="flex gap-4">
                            <div className="shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">info</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-base mb-1">O que acontece agora?</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                    A análise manual leva em média <span className="text-slate-900 font-medium">24 a 48 horas</span>. Você receberá uma notificação aqui e via WhatsApp assim que concluirmos.
                                </p>
                                <div className="bg-background-light dark:bg-white rounded-lg p-3 border border-gray-200 dark:border-slate-200 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm mt-0.5">payments</span>
                                    <p className="text-xs font-medium text-gray-600 dark:text-slate-600">
                                        Lembre-se: A taxa de verificação será cobrada apenas após a aprovação preliminar do seu perfil.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  Action Area  */}
                    <div className="flex flex-col gap-3 mt-4">
                        <button className="w-full h-12 bg-primary hover:bg-blue-600 text-slate-900 font-bold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(25,93,230,0.5)] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            Voltar ao Perfil
                        </button>
                        <button className="w-full h-12 bg-transparent hover:bg-white/5 border border-gray-200 dark:border-slate-200 text-gray-900 dark:text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">feed</span>
                            Ir para o Feed
                        </button>
                    </div>
                </div>
            </main>

        </>
    );
}
