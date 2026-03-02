'use client';

import React from 'react';

export default function BadgePaymentConfirmation() {
    return (
<>
{/*  TopNavBar  */}
<header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-surface-border bg-white dark:bg-[#111318] px-4 md:px-10 py-3">
<div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
{/*  Logo  */}
<div className="flex items-center gap-3 text-slate-900 dark:text-slate-900 cursor-pointer">
<div className="size-8 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">shield_person</span>
</div>
<h2 className="hidden md:block text-lg font-bold leading-tight tracking-[-0.015em]">Empreendedores de Cristo</h2>
</div>
{/*  Search Bar  */}
<label className="hidden md:flex flex-col min-w-40 h-10 w-full max-w-xs lg:max-w-[320px]">
<div className="flex w-full flex-1 items-stretch rounded-lg h-full group">
<div className="text-slate-400 flex border-none bg-slate-100 dark:bg-surface-border items-center justify-center pl-3 rounded-l-lg border-r-0">
<span className="material-symbols-outlined text-[20px]">search</span>
</div>
<input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-slate-900 focus:outline-0 focus:ring-0 placeholder:text-slate-400 px-3 pl-2 text-sm font-normal leading-normal transition-all" placeholder="Buscar Produtos/Servi�os..." defaultValue=""/>
</div>
</label>
</div>
{/*  Right Actions  */}
<div className="flex gap-2 md:gap-3">
<button className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-slate-900 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
<span className="material-symbols-outlined text-[20px]">account_circle</span>
</button>
<button className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-slate-900 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
<span className="material-symbols-outlined text-[20px]">menu</span>
</button>
</div>
</header>
{/*  Main Content Area  */}
<main className="flex-grow flex flex-col items-center justify-center py-8 px-4 md:px-6">
<div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start justify-center">
{/*  SCENARIO 1: SUCCESS STATE  */}
<div className="flex flex-col items-center w-full max-w-[440px] mx-auto animate-fade-in">
{/*  Status Tag (For demo purposes only)  */}
<div className="mb-6 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider">
                    Cenário: Sucesso
                </div>
{/*  Success Card  */}
<div className="w-full bg-white dark:bg-white border border-slate-200 dark:border-surface-border rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 md:p-8 relative">
{/*  Decorative Glow  */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
{/*  Icon  */}
<div className="relative mb-6">
<div className="size-20 bg-success/10 rounded-full flex items-center justify-center border border-success/20">
<span className="material-symbols-outlined text-success text-5xl filled">verified</span>
</div>
<div className="absolute -bottom-1 -right-1 bg-background-light dark:bg-white rounded-full p-1">
<div className="bg-primary size-6 rounded-full flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-slate-900 text-xs">thumb_up</span>
</div>
</div>
</div>
{/*  Main Text  */}
<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-900 text-center mb-3">Pagamento Aprovado!</h1>
<p className="text-slate-500 dark:text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-8">
                        Sua solicitação de verificação foi recebida. Nossa equipe irá analisar seus documentos em até 24 horas.
                    </p>
{/*  Order Summary Widget  */}
<div className="w-full bg-slate-50 dark:bg-[#111621] rounded-xl p-4 mb-8 border border-slate-100 dark:border-surface-border flex items-center gap-4">
<div className="size-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-surface-border" data-alt="Abstract representation of a digital security badge with metallic finish" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdM_9ou7Zww2WsunkDE6_h7BLHg4ngpUMK5seKwAPloiCO91PEpJKWTlxF0aNrYpbhgXbgBLxrGEUrgOXS0So4XLxqdATfF2zHcXIEVvbMhFKyCjHm-oCsqbU5DrVMNE52aeGkV40J5ban5MVQpp_lmdPMVvFU8rnAWavy-jvvpmipRYnJmQPUdWOs425E2mnIWZliDgl4tvafyJFrzRjIdy0TKarNRV4bFi0neUIEgRwt3tGAJtjLqTME8d3sggQ8M0QNSPKw-wyR')" }}></div>
<div className="flex flex-col flex-1 min-w-0">
<span className="text-sm font-bold text-slate-900 dark:text-slate-900 truncate">Selo de Verificado</span>
<span className="text-xs text-slate-500 dark:text-gray-400">Plano Anual • Aumenta a confiança no WhatsApp</span>
</div>
<span className="text-sm font-bold text-slate-900 dark:text-slate-900 whitespace-nowrap">R$ 29,90</span>
</div>
{/*  Actions  */}
<div className="flex flex-col w-full gap-3">
<button className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-slate-900 text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/20">
                            Voltar para o Feed
                        </button>
<button className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-600 text-sm font-semibold transition-all">
                            Ver Minhas Solicitações
                        </button>
</div>
</div>
</div>
{/*  SCENARIO 2: FAILURE STATE  */}
<div className="flex flex-col items-center w-full max-w-[440px] mx-auto">
{/*  Status Tag (For demo purposes only)  */}
<div className="mb-6 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-xs font-bold uppercase tracking-wider">
                    Cenário: Falha
                </div>
{/*  Failure Card  */}
<div className="w-full bg-white dark:bg-white border border-slate-200 dark:border-surface-border rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 md:p-8 relative">
{/*  Icon  */}
<div className="relative mb-6">
<div className="size-20 bg-error/10 rounded-full flex items-center justify-center border border-error/20">
<span className="material-symbols-outlined text-error text-5xl">warning</span>
</div>
</div>
{/*  Main Text  */}
<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-900 text-center mb-3">Pagamento não realizado</h1>
<p className="text-slate-500 dark:text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-8">
                        Não foi possível processar a transação. Verifique os dados do cartão, saldo disponível ou tente outro método.
                    </p>
{/*  Error Details Widget  */}
<div className="w-full bg-error/5 dark:bg-error/10 rounded-xl p-4 mb-8 border border-error/10 flex items-start gap-3">
<span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">credit_card_off</span>
<div className="flex flex-col flex-1">
<span className="text-sm font-bold text-slate-900 dark:text-slate-900">Erro 204: Recusado pelo banco</span>
<span className="text-xs text-slate-500 dark:text-gray-400 mt-1">A operadora do cartão recusou a compra. Entre em contato com seu banco.</span>
</div>
</div>
{/*  Actions  */}
<div className="flex flex-col w-full gap-3">
<button className="flex w-full items-center justify-center gap-2 rounded-lg h-12 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-slate-900 dark:text-slate-900 text-sm font-bold tracking-wide transition-all">
<span className="material-symbols-outlined text-lg">refresh</span>
                            Tentar Pagar Novamente
                        </button>
<button className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-600 text-sm font-semibold transition-all">
                            Falar com Suporte
                        </button>
</div>
</div>
</div>
</div>
</main>

    </>
);
}
