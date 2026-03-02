import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function PartnerVerificationPage() {
    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
            <Header />

            <main className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 w-full">
                <div className="w-full max-w-[520px] flex flex-col gap-8">

                    {/* Hero Section - Partner Variant */}
                    <div className="flex flex-col items-center text-center pt-4">
                        <div className="relative mb-6">
                            <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-500/30">
                                <span className="material-symbols-outlined filled !text-5xl">workspace_premium</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#111621] rounded-full p-1">
                                <span className="material-symbols-outlined text-emerald-500 filled !text-2xl drop-shadow-lg">handshake</span>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-slate-900 tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-3">
                            Parceiro Oficial
                        </h1>
                        <p className="text-slate-600 dark:text-[#9da6b8] text-base md:text-lg font-normal leading-relaxed max-w-sm">
                            Soluções exclusivas para grandes marcas, fabricantes e organizadores de eventos nacionais.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 dark:text-slate-900 text-sm font-bold uppercase tracking-wider px-1 mb-1">Benefícios Corporativos</h3>
                        <div className="grid gap-3">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-emerald-500">campaign</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Ads & Destaques</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Créditos mensais para impulsionar publicações e banners na home.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-500">support_agent</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Gerente de Conta</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Suporte dedicado para auxiliar em estratégias de venda e marketing.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 pb-8">
                        <Link href="/support/contact" className="group relative w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-slate-900 font-bold text-base h-14 rounded-xl transition-all shadow-lg shadow-emerald-600/25">
                            <span>Falar com Comercial</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                        <p className="text-center text-xs text-slate-500 dark:text-[#6b7280] mt-4">
                            Planos Enterprise sob consulta.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
