'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVerificationRequest } from '@/lib/hooks/useVerification';
import { toast } from '@/components/ui/Toast';

export default function ApplyLojaFSicaVerificada() {
    const router = useRouter();
    const [documents, setDocuments] = useState<File[]>([]);
    const { requestVerification, loading } = useVerificationRequest();

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);

        if (files.length > 3) {
            toast.warning('Máximo 3 documentos permitidos');
            return;
        }

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

        const success = await requestVerification('store', documents);
        if (success) {
            router.push('/verification/application-success');
        }
    }
    return (
        <>
            {/*  Top Navigation  */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
                <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 text-slate-900 cursor-pointer group">
                        <div className="size-6 text-primary transition-transform group-hover:scale-110">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_6_330)">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                </defs>
                            </svg>
                        </div>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Empreendedores de Cristo</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="text-text-secondary hover:text-slate-900 transition-colors hidden sm:block">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                        </button>
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-slate-200 cursor-pointer hover:border-primary transition-colors" data-alt="User profile picture placeholder with abstract gradient" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAxQdmnWjFjdVRPKJTtzdBWItNycZ_i32yMUm9ZGDnenlAQMLMg0_SqPXUP4xCJQz-zSN1PP6yFx5JVQQThZUik6ELy-ulJmAjR3wPiiWr-8jF0N5eP8MPeSEYofm9zqp2PkbLzimgxL1LMOynqjQX1Yrbpvx1S48__RTKQ2s8mGmFZ95r5GD_eTUe06Z21oXKIpLsMvBQAOOxrfsd1tUMwOpxCCXkMusTlL5B8Ykc9xU0RfVQEhSLCAvpqdp7l4nhBX4fYUUiMOBH")' }}></div>
                    </div>
                </div>
            </header>
            {/*  Main Content  */}
            <main className="flex-1 w-full flex justify-center py-6 md:py-10">
                <div className="w-full max-w-[640px] px-4 flex flex-col gap-8">
                    {/*  Page Heading & Icon  */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="hidden sm:flex size-14 items-center justify-center rounded-xl bg-primary/20 text-primary shrink-0 mt-1">
                                <span className="material-symbols-outlined text-[32px]">verified_user</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 tracking-tight text-2xl md:text-[32px] font-bold leading-tight">Solicitar Selo: Loja Física Verificada</h1>
                                <p className="text-text-secondary text-sm md:text-base font-normal leading-relaxed">
                                    Destaque sua loja na comunidade. O selo comprova que você possui um endereço físico verificável e aumenta a confiança dos compradores.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/*  Form Container  */}
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {/*  Section: Business Info  */}
                        <div className="flex flex-col gap-5">
                            <h3 className="text-slate-900 text-lg font-semibold border-b border-slate-200 pb-2">Dados da Empresa</h3>
                            {/*  CNPJ  */}
                            <label className="flex flex-col w-full">
                                <span className="text-slate-900 text-sm font-medium leading-normal pb-2">CNPJ válido</span>
                                <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="00.000.000/0000-00" type="text" />
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/*  Razão Social  */}
                                <label className="flex flex-col w-full">
                                    <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Razão social</span>
                                    <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="Nome jurídico da empresa" type="text" />
                                </label>
                                {/*  Nome Fantasia  */}
                                <label className="flex flex-col w-full">
                                    <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Nome fantasia</span>
                                    <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="Como a loja é conhecida" type="text" />
                                </label>
                            </div>
                            {/*  Telefone  */}
                            <label className="flex flex-col w-full">
                                <span className="text-slate-900 text-sm font-medium leading-normal pb-2 flex items-center gap-2">
                                    Telefone comercial
                                    <span className="text-xs text-text-secondary font-normal">(WhatsApp preferencial)</span>
                                </span>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-lg">call</span>
                                    <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="(00) 00000-0000" type="tel" />
                                </div>
                            </label>
                        </div>
                        {/*  Section: Address  */}
                        <div className="flex flex-col gap-5 pt-2">
                            <h3 className="text-slate-900 text-lg font-semibold border-b border-slate-200 pb-2">Localização</h3>
                            {/*  Address  */}
                            <label className="flex flex-col w-full">
                                <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Endereço físico verificável</span>
                                <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="Rua, número, complemento e bairro" type="text" />
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-5">
                                {/*  City  */}
                                <label className="flex flex-col w-full">
                                    <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Cidade</span>
                                    <input className="form-input w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 placeholder:text-text-secondary text-base transition-colors" placeholder="Digite sua cidade" type="text" />
                                </label>
                                {/*  State  */}
                                <label className="flex flex-col w-full">
                                    <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Estado</span>
                                    <div className="relative">
                                        <select className="form-select w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-4 pr-10 text-slate-900 text-base transition-colors appearance-none cursor-pointer">
                                            <option disabled selected={true} value="">UF</option>
                                            <option value="SP">SP</option>
                                            <option value="RJ">RJ</option>
                                            <option value="MG">MG</option>
                                            <option value="RS">RS</option>
                                            <option value="PR">PR</option>
                                            <option value="SC">SC</option>
                                            {/*  Add other states as needed  */}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        {/*  Section: Documents  */}
                        <div className="flex flex-col gap-5 pt-2">
                            <h3 className="text-slate-900 text-lg font-semibold border-b border-slate-200 pb-2">Documentação</h3>
                            <label className="flex flex-col w-full">
                                <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Documentação da empresa (Contrato Social ou Alvará)</span>
                                <div className="upload-pattern relative flex flex-col items-center justify-center w-full h-40 rounded-xl bg-white/50 hover:bg-white transition-colors cursor-pointer group">
                                    <input
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                    <div className="flex flex-col items-center gap-3 text-center p-4">
                                        <div className="size-12 rounded-full bg-white flex items-center justify-center border border-input-border group-hover:border-primary group-hover:text-primary transition-all text-text-secondary">
                                            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">Clique para enviar ou arraste o arquivo</p>
                                            <p className="text-xs text-text-secondary">PDF, JPG ou PNG (max. 10MB, até 3 arquivos)</p>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            {/* Arquivos selecionados */}
                            {documents.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    {documents.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-input-border">
                                            <div className="size-10 rounded bg-white flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-xl">
                                                    {file.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                                <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(0)} KB</p>
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
                        </div>
                        {/*  Disclaimer  */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3 items-start mt-2">
                            <span className="material-symbols-outlined text-yellow-500 shrink-0 mt-0.5">info</span>
                            <div className="flex flex-col gap-1">
                                <p className="text-yellow-500 font-medium text-sm">Aviso Importante</p>
                                <p className="text-yellow-500/80 text-sm leading-relaxed">
                                    O selo "Loja Física Verificada" atesta apenas a existência de um endereço comercial válido.
                                    <strong className="text-yellow-500">O Empreendedores de Cristo não garante procedência de produtos, preços ou qualidade do atendimento.</strong>
                                </p>
                            </div>
                        </div>
                        {/*  Submit Button  */}
                        <div className="pt-4 pb-8">
                            <button
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-text-secondary text-xs mt-4">
                                Ao enviar, você concorda com os termos de verificação de parceiros da plataforma.
                            </p>
                        </div>
                    </form>
                </div>
            </main>

        </>
    );
}
