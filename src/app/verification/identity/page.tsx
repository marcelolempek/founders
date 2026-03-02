'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useVerificationEligibility, useVerificationRequest, useUserVerificationStatus } from '@/lib/hooks/useVerification';

export default function IdentityVerificationPage() {
    const router = useRouter();
    const { eligibility, loading: eligibilityLoading } = useVerificationEligibility();
    const { currentRequest, loading: requestLoading } = useVerificationRequest();
    const { isVerified, loading: statusLoading } = useUserVerificationStatus();

    const loading = eligibilityLoading || requestLoading || statusLoading;

    // Se já está verificado, mostrar mensagem
    if (!loading && isVerified) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 px-4 w-full">
                    <div className="w-full max-w-[520px] flex flex-col items-center gap-6 text-center">
                        <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/30">
                            <span className="material-symbols-outlined filled !text-5xl">verified</span>
                        </div>
                        <h1 className="text-3xl font-bold">Você já está verificado!</h1>
                        <p className="text-slate-600 dark:text-[#9da6b8]">
                            Sua conta já possui o selo de Vendedor Verificado.
                        </p>
                        <Link href="/profile" className="bg-primary hover:bg-blue-700 text-slate-900 font-bold py-3 px-8 rounded-xl transition-colors">
                            Ver meu perfil
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Se já tem uma solicitação pendente
    if (!loading && currentRequest) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 px-4 w-full">
                    <div className="w-full max-w-[520px] flex flex-col items-center gap-6 text-center">
                        <div className="size-24 rounded-full bg-amber-500/10 flex items-center justify-center text-whitember-500 ring-1 ring-amber-500/30">
                            <span className="material-symbols-outlined filled !text-5xl">schedule</span>
                        </div>
                        <h1 className="text-3xl font-bold">Solicitação em análise</h1>
                        <p className="text-slate-600 dark:text-[#9da6b8]">
                            Sua solicitação de verificação está sendo analisada. Você receberá uma notificação quando houver uma atualização.
                        </p>
                        <div className="bg-white dark:bg-[#1c1f26] rounded-xl p-4 border border-slate-200 dark:border-[#292e38] w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Status:</span>
                                <span className="bg-amber-500/20 text-whitember-600 dark:text-whitember-400 text-xs font-bold px-2 py-1 rounded-full">
                                    Pendente
                                </span>
                            </div>
                        </div>
                        <Link href="/feed" className="text-primary hover:underline font-medium">
                            Voltar para o feed
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const handleProceed = () => {
        if (eligibility?.isEligible) {
            // Free Verification Update: Skip payment, go directly to request
            router.push('/verification/request-badge?type=identity');
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
            <Header />

            <main className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 w-full">
                <div className="w-full max-w-[520px] flex flex-col gap-8">

                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center pt-4">
                        <div className="relative mb-6">
                            <div className="size-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 ring-1 ring-blue-600/30">
                                <span className="material-symbols-outlined filled !text-5xl">verified</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#111621] rounded-full p-1">
                                <span className="material-symbols-outlined text-yellow-500 filled !text-2xl drop-shadow-lg">star</span>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-slate-900 tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-3">
                            Vendedor Verificado
                        </h1>
                        <p className="text-slate-600 dark:text-[#9da6b8] text-base md:text-lg font-normal leading-relaxed max-w-sm">
                            Aumente sua reputação e desbloqueie benefícios exclusivos na comunidade Empreendedores de Cristo.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 dark:text-slate-900 text-sm font-bold uppercase tracking-wider px-1 mb-1">Benefícios</h3>
                        <div className="grid gap-3">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-600">verified_user</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Selo de Confiança</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Exiba o ícone de verificado ao lado do seu nome em todos os anúncios e comentários.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-purple-500">trending_up</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Destaque no Feed</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Seus anúncios recebem prioridade no algoritmo e aparecem no topo das buscas.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-emerald-500">rocket_launch</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Vendas mais rápidas</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Vendedores verificados fecham negócios 3x mais rápido em média.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-2 pb-8">
                        <button
                            onClick={handleProceed}
                            disabled={loading}
                            className="group relative w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-slate-900 font-bold text-base h-14 rounded-xl transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                        >
                            <span>Solicitar Verificação Grátis</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <p className="text-center text-xs text-slate-500 dark:text-[#6b7280] mt-4">
                            Ao solicitar, você concorda com nossos <Link className="underline hover:text-slate-800 dark:hover:text-slate-400" href="/support/rules">Termos de Uso</Link>. Nossa equipe analisará seu perfil em até 24 horas.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
