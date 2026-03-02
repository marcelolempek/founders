import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function VerificationSelectionPage() {
    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] flex flex-col font-sans text-slate-900 dark:text-slate-900 pb-20 md:pb-0">
            <Header />

            <main className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 w-full">
                <div className="w-full max-w-[520px] md:max-w-5xl flex flex-col gap-8">

                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center pt-4">
                        <div className="relative mb-6">
                            <div className="size-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 ring-1 ring-blue-600/30">
                                <span className="material-symbols-outlined filled !text-5xl">shield_person</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#111621] rounded-full p-1">
                                <span className="material-symbols-outlined text-yellow-500 filled !text-2xl drop-shadow-lg">lock</span>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-slate-900 tracking-tight text-3xl md:text-4xl font-bold leading-tight mb-3">
                            Solicitar Verificação
                        </h1>
                        <p className="text-slate-600 dark:text-[#9da6b8] text-base md:text-lg font-normal leading-relaxed max-w-lg">
                            Escolha o selo que corresponde ao seu perfil. A verificação valida a identidade e o tipo da conta com validade de 12 meses.
                        </p>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-4 text-left">
                        <div className="shrink-0">
                            <span className="material-symbols-outlined text-orange-500 filled">warning</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-orange-600 dark:text-orange-400 font-bold text-sm">Informação Importante</h4>
                            <p className="text-sm text-slate-600 dark:text-[#9da6b8] leading-relaxed">
                                Os selos de verificação servem para identificar o tipo de conta (Usuário, Loja Física ou Parceiro). Eles <strong>não garantem a qualidade das transações</strong>, dos produtos ou a idoneidade das negociações. A Empreendedores de Cristo não se responsabiliza por acordos entre usuários.
                            </p>
                        </div>
                    </div>

                    {/* Selection Grid */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-slate-900 dark:text-slate-900 text-sm font-bold uppercase tracking-wider px-1">Selecione o Tipo de Badge</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Identity Verification Card */}
                            <div className="flex flex-col h-full bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] rounded-xl p-5 hover:border-blue-600/50 dark:hover:border-blue-600/50 transition-colors shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <span className="material-symbols-outlined !text-2xl">person</span>
                                </div>
                                <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mb-4 text-blue-600">
                                    <span className="material-symbols-outlined filled">verified</span>
                                </div>
                                <h4 className="text-slate-900 dark:text-slate-900 font-bold text-lg">Identidade Verificada</h4>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-2 mb-6 flex-grow">
                                    Ideal para jogadores e vendedores individuais. Validamos seus documentos pessoais para confirmar sua identidade real.
                                </p>
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#292e38] w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pessoal</span>
                                        <span className="text-sm font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">Validade: 12 meses</span>
                                    </div>
                                    <Link href="/verification/identity" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-blue-600/20">
                                        Solicitar Identidade
                                    </Link>
                                </div>
                            </div>

                            {/* Store Verification Card */}
                            <div className="flex flex-col h-full bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] rounded-xl p-5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <span className="material-symbols-outlined !text-2xl">storefront</span>
                                </div>
                                <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mb-4 text-purple-500">
                                    <span className="material-symbols-outlined filled">storefront</span>
                                </div>
                                <h4 className="text-slate-900 dark:text-slate-900 font-bold text-lg">Loja Física Verificada</h4>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-2 mb-6 flex-grow">
                                    Para comércios com ponto de venda. Verificamos CNPJ e endereço físico para confirmar a existência do estabelecimento.
                                </p>
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#292e38] w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comercial</span>
                                        <span className="text-sm font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full">Validade: 12 meses</span>
                                    </div>
                                    <Link href="/verification/store" className="block w-full text-center bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
                                        Solicitar Loja Física
                                    </Link>
                                </div>
                            </div>

                            {/* Partner Verification Card */}
                            <div className="flex flex-col h-full bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#292e38] rounded-xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <span className="material-symbols-outlined !text-2xl">workspace_premium</span>
                                </div>
                                <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mb-4 text-emerald-500">
                                    <span className="material-symbols-outlined filled">verified</span>
                                </div>
                                <h4 className="text-slate-900 dark:text-slate-900 font-bold text-lg">Loja Oficial / Parceira</h4>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-2 mb-6 flex-grow">
                                    Para grandes marcas e distribuidores. Um selo exclusivo que denota parceria direta com a plataforma.
                                </p>
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#292e38] w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parceiro</span>
                                        <span className="text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full">Validade: 12 meses</span>
                                    </div>
                                    <Link href="/verification/partner" className="block w-full text-center bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
                                        Solicitar Parceria
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="pt-4 pb-8 border-t border-slate-200 dark:border-[#292e38] mt-4">
                        <p className="text-center text-xs text-slate-500 dark:text-[#6b7280]">
                            Ao clicar em solicitar, você será direcionado para o envio de documentos. <br className="hidden md:inline" />Ao prosseguir, você concorda com nossos <Link className="underline hover:text-slate-800 dark:hover:text-slate-400" href="/support/rules">Termos de Uso</Link>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
