'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentFailureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const externalReference = searchParams.get('external_reference');

    let referenceData: any = null;
    if (externalReference) {
        try {
            referenceData = JSON.parse(externalReference);
        } catch {
            console.log('Could not parse external reference');
        }
    }

    const handleRetry = () => {
        if (referenceData?.planType) {
            router.push(`/verification/payment?plan=${referenceData.planType}`);
        } else {
            router.push('/verification/payment');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-center whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-200 bg-white dark:bg-white px-4 py-3">
                <Link href="/" className="flex items-center gap-3 text-slate-900 dark:text-slate-900">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">shield_person</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Empreendedores de Cristo</h2>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[440px] bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 md:p-8 relative">
                    {/* Icon */}
                    <div className="relative mb-6">
                        <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                        </div>
                    </div>

                    {/* Main Text */}
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-900 text-center mb-3">
                        Pagamento não realizado
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-8">
                        Não foi possível processar o pagamento. Isso pode acontecer por diversos motivos como saldo insuficiente, dados incorretos ou limite do cartão.
                    </p>

                    {/* Error Details Widget */}
                    <div className="w-full bg-red-500/5 dark:bg-red-500/10 rounded-xl p-4 mb-8 border border-red-500/10 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 text-xl shrink-0 mt-0.5">credit_card_off</span>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-900">Pagamento recusado</span>
                            <span className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                Verifique os dados do seu cartão ou tente outra forma de pagamento no Mercado Pago.
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex w-full items-center justify-center gap-2 rounded-lg h-12 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-slate-900 dark:text-slate-900 text-sm font-bold tracking-wide transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">refresh</span>
                            Tentar Novamente
                        </button>
                        <Link
                            href="/support/contact"
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-600 text-sm font-semibold transition-all"
                        >
                            Falar com Suporte
                        </Link>
                        <Link
                            href="/"
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent text-slate-500 dark:text-gray-400 text-sm font-medium transition-all hover:text-slate-700 dark:hover:text-slate-600"
                        >
                            Voltar ao Início
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PaymentFailureContent />
        </Suspense>
    );
}
