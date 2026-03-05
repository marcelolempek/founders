'use client';

import React from 'react';
import Link from 'next/link';

export default function Parceira() {
    return (
        <>
            {/*  TopNavBar  */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-[#292e38] bg-background-light dark:bg-[#111318] px-4 py-3 md:px-10">
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-3 text-[#111318] dark:text-slate-900 cursor-pointer">
                        <div className="size-6 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="4"></path>
                                <path d="M24 14L34 24L24 34L14 24L24 14Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Empreendedores de Cristo</h2>
                    </div>
                    {/*  Search Bar (Hidden on very small screens, expanded on desktop)  */}
                    <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64 group">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#e5e7eb] dark:bg-[#292e38] group-focus-within:ring-2 group-focus-within:ring-primary/50 transition-all">
                            <div className="text-[#6b7280] dark:text-[#9da6b8] flex border-none items-center justify-center pl-3 pr-2">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[#111318] dark:text-slate-900 focus:outline-0 bg-transparent placeholder:text-[#6b7280] dark:placeholder:text-[#9da6b8] text-sm font-normal leading-normal" placeholder="Buscar..." />
                        </div>
                    </label>
                </div>
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-[#111318] dark:text-slate-900">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-[#e5e7eb] dark:border-[#292e38]" data-alt="User profile avatar showing a Christian entrepreneur" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-c58QVvU4dcZm43oZ59Yhpgz0JRgvXpEBodw0Q7ZrXNoVkSqpW0Bb6YfM8ZD6OnmVrQFexdCe_UyHwzScQDAc7Z9P18Cq1f4bbVxxnaK-xHrd9jV-e1fBPT3brVfA0-XAH_3XrNLdfzeF1f9tEfhFk2Oer3mcn4Zkfs8-tElRF530TLFWPef-LpuCF2t3dnuG1bgP1Rn-O5KhCzgJEdz9jk10PLL05SXEiLI0jGtsX9vBezKD6Ynizt3txUal-gD7Ho0UFFEKioQ2")' }}></div>
                    </div>
                </div>
            </header>
            {/*  Main Content Layout  */}
            <main className="flex-1 flex justify-center py-6 px-4 md:px-6">
                <div className="flex flex-col w-full max-w-[600px] gap-6">
                    {/*  Page Heading & Hero  */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-[#111318] dark:text-slate-900 tracking-tight text-2xl md:text-[32px] font-bold leading-tight">Torne-se uma Loja Oficial</h1>
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </div>
                                <p className="text-[#6b7280] dark:text-[#9da6b8] text-sm md:text-base font-normal leading-relaxed">
                                    Obtenha o selo de verificação e destaque seus produtos no Empreendedores de Cristo. Garanta mais confiança para seus compradores.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/*  Disclaimer Box  */}
                    <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                        <span className="material-symbols-outlined shrink-0 mt-0.5">warning</span>
                        <div className="flex flex-col gap-1 text-sm">
                            <span className="font-bold">Aviso Importante</span>
                            <p className="leading-normal opacity-90">O selo "Loja Oficial" valida a identidade da empresa, mas <strong>não garante negociações</strong>. O Empreendedores de Cristo não se responsabiliza por transações ou logística.</p>
                        </div>
                    </div>
                    {/*  Timeline / Process Status (Simplified Horizontal)  */}
                    <div className="flex w-full items-center justify-between px-2 py-4 relative">
                        {/*  Line background  */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#e5e7eb] dark:bg-[#292e38] -z-10 transform -translate-y-1/2"></div>
                        {/*  Step 1  */}
                        <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-white px-2 z-10">
                            <div className="size-8 rounded-full bg-primary text-slate-900 flex items-center justify-center font-bold text-sm shadow-[0_0_0_4px_rgba(25,93,230,0.2)]">1</div>
                            <span className="text-xs font-medium text-primary">Solicitação</span>
                        </div>
                        {/*  Step 2  */}
                        <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-white px-2 z-10">
                            <div className="size-8 rounded-full bg-[#e5e7eb] dark:bg-[#292e38] text-[#6b7280] dark:text-[#9da6b8] flex items-center justify-center font-bold text-sm border border-[#d1d5db] dark:border-[#3c4453]">2</div>
                            <span className="text-xs font-medium text-[#6b7280] dark:text-[#9da6b8]">Análise</span>
                        </div>
                        {/*  Step 3  */}
                        <div className="flex flex-col items-center gap-2 bg-background-light dark:bg-white px-2 z-10">
                            <div className="size-8 rounded-full bg-[#e5e7eb] dark:bg-[#292e38] text-[#6b7280] dark:text-[#9da6b8] flex items-center justify-center font-bold text-sm border border-[#d1d5db] dark:border-[#3c4453]">3</div>
                            <span className="text-xs font-medium text-[#6b7280] dark:text-[#9da6b8]">Aprovação</span>
                        </div>
                    </div>
                    {/*  Form Container  */}
                    <form className="flex flex-col gap-6 bg-white dark:bg-[#1c1f26] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#292e38] shadow-sm">
                        {/*  CNPJ Field  */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#111318] dark:text-slate-900 text-sm font-medium leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#9da6b8]">badge</span>
                                CNPJ da Empresa
                            </label>
                            <input className="form-input flex w-full rounded-lg text-[#111318] dark:text-slate-900 bg-background-light dark:bg-[#111318] border border-[#d1d5db] dark:border-[#3c4453] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#6b7280] dark:placeholder:text-[#6b7280] text-base font-normal transition-colors" placeholder="00.000.000/0000-00" type="text" />
                            <p className="text-xs text-[#6b7280] dark:text-[#6b7280]">Apenas números. Validaremos automaticamente na Receita Federal.</p>
                        </div>
                        {/*  Contract Upload  */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#111318] dark:text-slate-900 text-sm font-medium leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#9da6b8]">description</span>
                                Contrato Social ou Acordo
                            </label>
                            <div className="group relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-[#d1d5db] dark:border-[#3c4453] hover:border-primary dark:hover:border-primary bg-background-light dark:bg-[#111318] transition-colors cursor-pointer">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <span className="material-symbols-outlined text-3xl mb-2 text-[#9da6b8] group-hover:text-primary transition-colors">cloud_upload</span>
                                    <p className="mb-1 text-sm text-[#6b7280] dark:text-[#9da6b8]"><span className="font-semibold text-primary">Clique para enviar</span> ou arraste o arquivo</p>
                                    <p className="text-xs text-[#9da6b8] dark:text-[#6b7280]">PDF, JPG ou PNG (MAX. 5MB)</p>
                                </div>
                                <input className="hidden" type="file" />
                            </div>
                        </div>
                        {/*  Brand Recognition Checkbox  */}
                        <div className="flex flex-col gap-3 pt-2">
                            <label className="text-[#111318] dark:text-slate-900 text-sm font-medium leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#9da6b8]">storefront</span>
                                Reconhecimento de Marca
                            </label>
                            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#292e38] bg-background-light dark:bg-[#111318] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#161a22] transition-colors">
                                <input className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-[#292e38]" type="checkbox" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#111318] dark:text-slate-900">Minha marca é reconhecida no mercado</span>
                                    <span className="text-xs text-[#6b7280] dark:text-[#9da6b8] mt-1">Declaro que possuo presença ativa e verificável no mercado de Empreendedorismo. Sujeito à análise da equipe.</span>
                                </div>
                            </label>
                        </div>
                        {/*  Submit Button  */}
                        <div className="pt-4">
                            <button className="w-full h-12 bg-primary hover:bg-blue-600 text-slate-900 font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2" type="button">
                                <span>Enviar Solicitação</span>
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                            <p className="text-center text-xs text-[#6b7280] dark:text-[#6b7280] mt-3">
                                Ao enviar, você concorda com os <Link className="underline hover:text-primary" href="/">Termos de Parceria</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </main>
            {/*  Simple Bottom Footer for context  */}
            <footer className="mt-auto py-6 text-center border-t border-[#e5e7eb] dark:border-[#292e38] bg-white dark:bg-[#111318]">
                <p className="text-xs text-[#6b7280] dark:text-[#6b7280]">Empreendedores de Cristo © 2026. Todos os direitos reservados.</p>
            </footer>

        </>
    );
}
