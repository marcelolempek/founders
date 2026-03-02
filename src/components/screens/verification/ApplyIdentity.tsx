'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVerificationRequest } from '@/lib/hooks/useVerification';
import { toast } from '@/components/ui/Toast';

export default function ApplyIdentidadeVerificada() {
    const router = useRouter();
    const [documents, setDocuments] = useState<File[]>([]);
    const { requestVerification, loading } = useVerificationRequest();

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);

        // Validar quantidade (máx 3)
        if (files.length > 3) {
            toast.warning('Máximo 3 documentos permitidos');
            return;
        }

        // Validar cada arquivo
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Arquivo ${file.name} é muito grande (máx 10MB)`);
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error(`Tipo de arquivo inválido: ${file.name}`);
                return;
            }
        }

        setDocuments(files);
    }

    function removeDocument(index: number) {
        setDocuments(docs => docs.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (documents.length === 0) {
            toast.warning('Por favor, envie pelo menos um documento');
            return;
        }

        const success = await requestVerification('identity', documents);
        if (success) {
            router.push('/verification/application-success');
        }
    }

    return (
        <>
            {/*  Navbar  */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#292e38] bg-background-light dark:bg-white px-4 lg:px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-slate-900 cursor-pointer">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">token</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">Empreendedores de Cristo</h2>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center overflow-hidden rounded-lg size-10 bg-white dark:bg-[#292e38] text-slate-900 dark:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#323846] transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="flex items-center justify-center overflow-hidden rounded-lg size-10 bg-white dark:bg-[#292e38] text-slate-900 dark:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#323846] transition-colors">
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </header>
            {/*  Main Content  */}
            <main className="flex-1 flex justify-center py-6 px-4">
                <div className="w-full max-w-[600px] flex flex-col gap-6">
                    {/*  Hero Section  */}
                    <section className="flex flex-col gap-4 py-4">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/20 p-3 text-primary shrink-0">
                                <span className="material-symbols-outlined text-4xl filled">verified_user</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Identidade Verificada</h1>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-base font-normal leading-relaxed">
                                    Obtenha o selo oficial para aumentar a confiança em suas negociações.
                                </p>
                            </div>
                        </div>
                        {/*  Warning/Disclaimer Card  */}
                        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg flex gap-3 items-start mt-2">
                            <span className="material-symbols-outlined text-yellow-500 shrink-0">info</span>
                            <div className="flex flex-col gap-1">
                                <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">Aviso Importante</p>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-normal">
                                    O selo confirma sua identidade documental, mas <strong>não garante a segurança financeira</strong> das negociações. Sempre utilize meios de pagamento seguros e tenha cautela.
                                </p>
                            </div>
                        </div>
                    </section>
                    {/*  Form Section  */}
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {/*  Personal Info  */}
                        <div className="flex flex-col gap-5">
                            {/*  Name  */}
                            <label className="flex flex-col w-full">
                                <p className="text-slate-900 dark:text-slate-900 text-base font-medium leading-normal pb-2">Nome completo</p>
                                <input className="form-input w-full rounded-lg border-slate-200 dark:border-none bg-white dark:bg-input-dark h-14 px-4 text-base text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-[#9da6b8] focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Digite seu nome real como no documento" type="text" />
                            </label>
                            {/*  Phone (Validated)  */}
                            <label className="flex flex-col w-full">
                                <div className="flex justify-between items-end pb-2">
                                    <p className="text-slate-900 dark:text-slate-900 text-base font-medium leading-normal">Telefone</p>
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-wide flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        Validado via WhatsApp
                                    </span>
                                </div>
                                <div className="relative flex items-center w-full">
                                    <input className="form-input w-full rounded-lg border-slate-200 dark:border-none bg-slate-50 dark:bg-input-dark/50 h-14 px-4 text-base text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" disabled type="tel" defaultValue="+55 (11) 99876-5432" />
                                    <div className="absolute right-4 text-green-500 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 ml-1">Para alterar seu telefone, acesse as configurações de conta.</p>
                            </label>
                            {/*  Location Group  */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <label className="flex flex-col w-full md:w-1/3">
                                    <p className="text-slate-900 dark:text-slate-900 text-base font-medium leading-normal pb-2">Estado</p>
                                    <div className="relative">
                                        <select className="form-select w-full appearance-none rounded-lg border-slate-200 dark:border-none bg-white dark:bg-input-dark h-14 px-4 text-base text-slate-900 dark:text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer">
                                            <option disabled selected={true} value="">UF</option>
                                            <option value="SP">SP</option>
                                            <option value="RJ">RJ</option>
                                            <option value="MG">MG</option>
                                            <option value="RS">RS</option>
                                            <option value="PR">PR</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex flex-col w-full md:w-2/3">
                                    <p className="text-slate-900 dark:text-slate-900 text-base font-medium leading-normal pb-2">Cidade</p>
                                    <input className="form-input w-full rounded-lg border-slate-200 dark:border-none bg-white dark:bg-input-dark h-14 px-4 text-base text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-[#9da6b8] focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Ex: São Paulo" type="text" />
                                </label>
                            </div>
                        </div>
                        <hr className="border-slate-200 dark:border-[#292e38] my-2" />
                        {/*  Document Upload Section  */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-slate-900 text-lg font-bold">Documentação</p>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-sm">Precisamos validar que você é você. Envie uma foto legível do seu RG ou CNH (Frente e Verso).</p>
                            </div>
                            {/*  Upload Box  */}
                            <div className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-input-dark/30 hover:bg-slate-100 dark:hover:bg-input-dark hover:border-primary/50 transition-all cursor-pointer">
                                <input
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                <div className="flex flex-col items-center justify-center gap-3 text-center p-4 transition-transform group-hover:scale-105">
                                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                                        <span className="material-symbols-outlined">cloud_upload</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-900">Clique para enviar ou arraste o arquivo</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG ou PDF (Max 10MB, até 3 arquivos)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Arquivos selecionados */}
                            {documents.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    {documents.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-white rounded-lg border border-slate-200 dark:border-slate-200">
                                            <div className="size-10 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-xl">
                                                    {file.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 truncate">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(idx)}
                                                disabled={loading}
                                                className="text-red-500 hover:text-red-700 p-1 transition-colors disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-xl">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/*  Manual Analysis Option  */}
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-100 dark:bg-white border border-slate-200 dark:border-[#292e38]">
                                <div className="flex items-center h-5">
                                    <input className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" id="manual-analysis" type="checkbox" />
                                </div>
                                <label className="ms-2 text-sm font-medium text-slate-900 dark:text-slate-600" htmlFor="manual-analysis">
                                    <span className="block font-bold mb-0.5">Prefiro análise manual assistida</span>
                                    <span className="block font-normal text-slate-500 dark:text-slate-400 text-xs">Se você tiver dificuldades com o envio automático, nossa equipe entrará em contato via WhatsApp para auxiliar no processo.</span>
                                </label>
                            </div>
                        </div>
                        {/*  Spacer  */}
                        <div className="h-4"></div>
                        {/*  Submit Button  */}
                        <div className="sticky bottom-6 z-20">
                            <button
                                className="w-full flex items-center justify-center gap-2 h-14 bg-primary hover:bg-blue-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading || documents.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar Solicitação</span>
                                        <span className="material-symbols-outlined">send</span>
                                    </>
                                )}
                            </button>
                            {/*  Small footer text  */}
                            <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
                                Ao enviar, você concorda com os <Link className="underline hover:text-primary" href="/">Termos de Serviço</Link> do Empreendedores de Cristo.
                            </p>
                        </div>
                    </form>
                </div>
            </main>

        </>
    );
}
