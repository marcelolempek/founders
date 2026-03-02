'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePaymentStatus } from '@/lib/hooks/useMercadoPago';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    const { checkStatus, status: paymentStatus, loading } = usePaymentStatus();
    const [referenceData, setReferenceData] = useState<any>(null);

    useEffect(() => {
        // Verificar status do pagamento
        if (paymentId) {
            checkStatus(paymentId);
        }

        // Parsear referência externa
        if (externalReference) {
            try {
                setReferenceData(JSON.parse(externalReference));
            } catch {
                console.log('Could not parse external reference');
            }
        }
    }, [paymentId, externalReference, checkStatus]);

    const planNames: Record<string, string> = {
        verified_seller: 'Vendedor Verificado',
        physical_store: 'Loja Física',
        partner: 'Parceiro Oficial',
        boost_post: 'Impulsionar Anúncio',
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
                    {/* Decorative Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                    {/* Icon */}
                    <div className="relative mb-6">
                        <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <span className="material-symbols-outlined text-emerald-500 text-5xl filled">verified</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-white rounded-full p-1">
                            <div className="bg-primary size-6 rounded-full flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-slate-900 text-xs">thumb_up</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Text */}
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-900 text-center mb-3">
                        Pagamento Aprovado!
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-8">
                        {referenceData?.planType === 'boost_post'
                            ? 'Seu anúncio foi impulsionado com sucesso e aparecerá em destaque por 7 dias.'
                            : 'Sua solicitação de verificação foi recebida. Nossa equipe irá analisar em até 24 horas.'}
                    </p>

                    {/* Order Summary Widget */}
                    <div className="w-full bg-slate-50 dark:bg-[#111621] rounded-xl p-4 mb-8 border border-slate-100 dark:border-slate-200 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-900 truncate">
                                {referenceData?.planType ? planNames[referenceData.planType] : 'Verificação'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                                {status === 'approved' ? 'Pagamento confirmado' : 'Processando...'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                    </div>

                    {/* Payment ID */}
                    {paymentId && (
                        <div className="w-full text-center mb-6">
                            <p className="text-xs text-slate-400 dark:text-gray-500">
                                ID do Pagamento: <span className="font-mono">{paymentId}</span>
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        <Link
                            href="/feed"
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-slate-900 text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/20"
                        >
                            Voltar para o Feed
                        </Link>
                        <Link
                            href="/profile"
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-600 text-sm font-semibold transition-all"
                        >
                            Ver Meu Perfil
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

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
