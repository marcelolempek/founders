'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMercadoPago, PLANS, formatPrice, PlanType } from '@/lib/hooks/useMercadoPago';

function BadgePaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planTypeParam = searchParams.get('plan') as PlanType | null;
    const postId = searchParams.get('postId');

    const { redirectToCheckout, loading, error, plans } = useMercadoPago();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>(planTypeParam || 'verified_seller');

    const plan = plans[selectedPlan];

    // Se veio um plano específico na URL, usar ele
    useEffect(() => {
        if (planTypeParam && plans[planTypeParam]) {
            setSelectedPlan(planTypeParam);
        }
    }, [planTypeParam, plans]);

    const handlePayment = async () => {
        // O ambiente (sandbox/produção) é determinado pelo Access Token configurado no servidor
        // Use TEST-xxx para testes e um token de produção para ambiente real
        await redirectToCheckout({
            planType: selectedPlan,
            postId: postId || undefined,
        });
    };

    return (
        <>
            {/* TopNavBar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-slate-200 bg-white dark:bg-white px-4 lg:px-10 py-3 shadow-sm">
                <div className="flex items-center gap-4 lg:gap-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 dark:text-text-secondary hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span className="text-sm font-medium hidden sm:inline">Voltar</span>
                    </button>
                    <Link href="/" className="flex items-center gap-2 lg:gap-4 text-slate-900 dark:text-slate-900 cursor-pointer">
                        <div className="size-8 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">shield_person</span>
                        </div>
                        <h2 className="hidden md:block text-lg font-bold leading-tight tracking-[-0.015em]">Empreendedores de Cristo</h2>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">lock</span>
                    <span className="text-xs text-slate-500 dark:text-text-secondary font-medium">Pagamento Seguro</span>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="layout-container flex h-full grow flex-col py-8 px-4 sm:px-6">
                {/* Centered Container for Mobile-First Focus */}
                <div className="mx-auto flex flex-col max-w-[560px] w-full gap-6">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-2 pt-4">
                        <h1 className="text-slate-900 dark:text-slate-900 tracking-tight text-[28px] sm:text-[32px] font-bold leading-tight">
                            Pagamento da Verificação
                        </h1>
                        <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal">
                            Você será redirecionado para o Mercado Pago para finalizar o pagamento de forma segura.
                        </p>
                    </div>

                    {/* Plan Selection (if no plan was specified) */}
                    {!planTypeParam && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-slate-900 dark:text-slate-900 text-base font-bold">Escolha seu plano</h3>
                            <div className="grid gap-3">
                                {(Object.entries(plans) as [PlanType, typeof plan][]).map(([key, planOption]) => (
                                    <label
                                        key={key}
                                        className={`group relative cursor-pointer flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                            selectedPlan === key
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-slate-200 bg-white dark:bg-white hover:border-primary/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={key}
                                            checked={selectedPlan === key}
                                            onChange={() => setSelectedPlan(key)}
                                            className="sr-only"
                                        />
                                        <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            selectedPlan === key
                                                ? 'border-primary bg-primary'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                            {selectedPlan === key && (
                                                <span className="material-symbols-outlined text-slate-900 text-xs">check</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-900 dark:text-slate-900 font-bold">{planOption.title}</span>
                                                <span className="text-primary font-bold">{formatPrice(planOption.price)}</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-text-secondary text-sm mt-1">{planOption.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Summary Card */}
                    <div className="rounded-xl shadow-sm bg-white dark:bg-white border border-gray-200 dark:border-slate-200 overflow-hidden">
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start">
                            {/* Product Image */}
                            <div className="w-full sm:w-28 sm:h-28 aspect-square shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-5xl">verified_user</span>
                            </div>
                            {/* Details */}
                            <div className="flex flex-col justify-center gap-1 w-full">
                                <div className="flex justify-between items-start w-full">
                                    <div>
                                        <h3 className="text-slate-900 dark:text-slate-900 text-lg font-bold leading-tight">{plan.title}</h3>
                                        <p className="text-primary text-sm font-bold mt-1">Plano Anual</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-900 dark:text-slate-900 text-xl font-bold">{formatPrice(plan.price)}</p>
                                        <p className="text-slate-500 dark:text-text-secondary text-xs">/ ano</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-gray-200 dark:bg-slate-200 my-3"></div>
                                <div className="flex flex-col gap-1">
                                    {plan.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                            <p className="text-slate-500 dark:text-text-secondary text-sm">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mercado Pago Info */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#00AEEF]/10 border border-[#00AEEF]/20">
                        <div className="size-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 50 50" className="size-8">
                                <path fill="#00AEEF" d="M25 2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2zm0 42c-10.5 0-19-8.5-19-19S14.5 6 25 6s19 8.5 19 19-8.5 19-19 19z"/>
                                <path fill="#00AEEF" d="M25 12c-7.2 0-13 5.8-13 13s5.8 13 13 13 13-5.8 13-13-5.8-13-13-13zm0 22c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z"/>
                                <circle fill="#00AEEF" cx="25" cy="25" r="5"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 dark:text-slate-900 font-bold text-sm">Pagamento via Mercado Pago</p>
                            <p className="text-slate-500 dark:text-text-secondary text-xs mt-0.5">
                                Pix, Cartão de Crédito, Boleto e mais opções disponíveis
                            </p>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Security & Footer Info */}
                    <div className="flex flex-col gap-6 mt-2">
                        {/* Action Button */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-14 bg-[#00AEEF] hover:bg-[#009ADF] text-slate-900 gap-2 text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-[#00AEEF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                    <span>Redirecionando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                    <span>Pagar {formatPrice(plan.price)} com Mercado Pago</span>
                                </>
                            )}
                        </button>

                        {/* Process Explanation */}
                        <div className="rounded-lg bg-gray-100 dark:bg-white/50 p-4 border border-transparent dark:border-slate-200 flex gap-3">
                            <span className="material-symbols-outlined text-slate-500 dark:text-text-secondary mt-0.5">info</span>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-text-secondary leading-relaxed">
                                <span className="font-bold text-slate-700 dark:text-slate-600">O que acontece agora?</span><br />
                                Você será redirecionado para o Mercado Pago para escolher sua forma de pagamento preferida. Assim que o pagamento for confirmado, sua solicitação será enviada automaticamente para análise.
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="flex items-center justify-center gap-6 mt-4 pb-8">
                            <div className="flex items-center gap-1.5 opacity-50">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-text-secondary">Pagamento Seguro</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-text-secondary opacity-30"></div>
                            <Link className="text-xs text-slate-500 dark:text-text-secondary hover:text-primary underline decoration-slate-400/30 dark:decoration-text-secondary/30 underline-offset-4" href="/support/rules">
                                Termos de Uso
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
    );
}

export default function BadgePaymentScreen() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <BadgePaymentContent />
        </Suspense>
    );
}
