'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePaymentStatus } from '@/lib/hooks/useMercadoPago';

function PaymentPendingContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference');

    const { checkStatus, status: paymentStatus, loading } = usePaymentStatus();
    const [referenceData, setReferenceData] = useState<any>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (externalReference) {
            try {
                setReferenceData(JSON.parse(externalReference));
            } catch {
                console.log('Could not parse external reference');
            }
        }
    }, [externalReference]);

    const handleCheckStatus = async () => {
        if (paymentId) {
            setChecking(true);
            await checkStatus(paymentId);
            setChecking(false);
        }
    };

    // Auto-check status every 30 seconds
    useEffect(() => {
        if (paymentId) {
            const interval = setInterval(() => {
                checkStatus(paymentId);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [paymentId, checkStatus]);

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
                    {/* Icon */}
                    <div className="relative mb-6">
                        <div className="size-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                            <span className="material-symbols-outlined text-whitember-500 text-5xl">schedule</span>
                        </div>
                    </div>

                    {/* Main Text */}
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-900 text-center mb-3">
                        Aguardando Pagamento
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-8">
                        Seu pagamento está sendo processado. Se você escolheu Boleto ou Pix, aguarde a confirmação do pagamento.
                    </p>

                    {/* Pending Details Widget */}
                    <div className="w-full bg-amber-500/5 dark:bg-amber-500/10 rounded-xl p-4 mb-6 border border-amber-500/10 flex items-start gap-3">
                        <span className="material-symbols-outlined text-whitember-500 text-xl shrink-0 mt-0.5 animate-pulse">hourglass_empty</span>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-900">
                                {referenceData?.planType ? planNames[referenceData.planType] : 'Pagamento'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                Assim que o pagamento for confirmado, você receberá uma notificação.
                            </span>
                        </div>
                    </div>

                    {/* Payment ID */}
                    {paymentId && (
                        <div className="w-full text-center mb-6">
                            <p className="text-xs text-slate-400 dark:text-gray-500">
                                ID do Pagamento: <span className="font-mono">{paymentId}</span>
                            </p>
                        </div>
                    )}

                    {/* Status indicator */}
                    {paymentStatus && (
                        <div className={`w-full text-center mb-6 px-4 py-2 rounded-lg ${
                            paymentStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            paymentStatus === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-amber-500/10 text-whitember-500'
                        }`}>
                            <p className="text-sm font-medium">
                                Status: {
                                    paymentStatus === 'approved' ? 'Aprovado!' :
                                    paymentStatus === 'rejected' ? 'Rejeitado' :
                                    paymentStatus === 'pending' ? 'Pendente' :
                                    paymentStatus
                                }
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checking || loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-slate-900 text-sm font-bold tracking-wide transition-all disabled:opacity-50"
                        >
                            {checking || loading ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    Verificar Status
                                </>
                            )}
                        </button>
                        <Link
                            href="/feed"
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-600 text-sm font-semibold transition-all"
                        >
                            Voltar para o Feed
                        </Link>
                    </div>

                    {/* Info note */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">
                            Para Boleto: o prazo de compensação é de até 3 dias úteis.<br />
                            Para Pix: a confirmação é instantânea após o pagamento.
                        </p>
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

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PaymentPendingContent />
        </Suspense>
    );
}
