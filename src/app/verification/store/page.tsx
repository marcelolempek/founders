import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function StoreVerificationPage() {
    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
            <Header />

            <main className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 w-full">
                <div className="w-full max-w-[520px] flex flex-col gap-8">

                    {/* Hero Section - Store Variant */}
                    <div className="flex flex-col items-center text-center pt-4">
                        <div className="relative mb-6">
                            <div className="size-24 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 ring-1 ring-purple-500/30">
                                <span className="material-symbols-outlined filled !text-5xl">storefront</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#111621] rounded-full p-1">
                                <span className="material-symbols-outlined text-purple-500 filled !text-2xl drop-shadow-lg">verified</span>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-slate-900 tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-3">
                            Loja Física
                        </h1>
                        <p className="text-slate-600 dark:text-[#9da6b8] text-base md:text-lg font-normal leading-relaxed max-w-sm">
                            Valide seu estabelecimento comercial e ganhe a confiança dos jogadores locais.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 dark:text-slate-900 text-sm font-bold uppercase tracking-wider px-1 mb-1">Vantagens Comerciais</h3>
                        <div className="grid gap-3">

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-purple-500">store</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Perfil de Loja</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Exiba endereço, horário de funcionamento e link direto para WhatsApp/Site.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] shadow-sm">
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-500">map</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-900 font-bold text-base">Mapa Empreendedorismo</h4>
                                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-0.5">Sua loja aparecerá no mapa de campos e lojas para jogadores próximos.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 dark:text-slate-900 text-sm font-bold uppercase tracking-wider px-1 mb-1">Documentação Necessária</h3>
                        <div className="bg-slate-100 dark:bg-[#15171e] rounded-xl p-5 border border-slate-200 dark:border-[#292e38]">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-[#9da6b8]">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                    CNPJ Ativo (Comércio de artigos esportivos/lazer)
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-[#9da6b8]">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                                    Comprovante de Endereço Comercial
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-[#9da6b8]">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">photo_camera</span>
                                    Fotos da Fachada e Interior da Loja
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 pb-8">
                        <Link href="/verification/payment" className="group relative w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-slate-900 font-bold text-base h-14 rounded-xl transition-all shadow-lg shadow-purple-600/25">
                            <span>Iniciar Validação da Loja</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
