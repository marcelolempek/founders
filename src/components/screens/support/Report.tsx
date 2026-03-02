'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReportPost, ReportReason } from '@/lib/hooks/useSupport';

interface ReportOption {
    value: ReportReason;
    title: string;
    description: string;
}

const reportOptions: ReportOption[] = [
    {
        value: 'prohibited_item',
        title: 'Item Proibido',
        description: 'Arma de fogo real, sem ponteira laranja, ou modificação ilegal'
    },
    {
        value: 'scam',
        title: 'Golpe ou Suspeito',
        description: 'Vendedor fraudulento, fotos falsas, ou pagamento fora da plataforma'
    },
    {
        value: 'wrong_category',
        title: 'Categoria ou Preço Errado',
        description: 'Preço enganoso (ex: R$ 1), tags irrelevantes, ou seção errada'
    },
    {
        value: 'abusive',
        title: 'Conteúdo Abusivo',
        description: 'Assédio, discurso de ódio, ou linguagem ofensiva'
    },
    {
        value: 'other',
        title: 'Outro',
        description: 'Algo não listado acima'
    }
];

interface ReportScreenProps {
    postId?: string;
    onClose?: () => void;
    isModal?: boolean;
}

export default function ReportScreen({ postId: propPostId, onClose, isModal = false }: ReportScreenProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postIdFromUrl = searchParams.get('postId');
    const postId = propPostId || postIdFromUrl || '';

    const { reportPost, loading, error } = useReportPost();

    const [selectedReason, setSelectedReason] = useState<ReportReason>('prohibited_item');
    const [details, setDetails] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDetails(e.target.value);
        setCharCount(e.target.value.length);
    };

    const handleSubmit = async () => {
        if (!postId) {
            alert('ID do anúncio não fornecido');
            return;
        }

        const success = await reportPost({
            postId,
            reason: selectedReason,
            details: details || undefined,
        });

        if (success) {
            setIsSubmitted(true);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    // Success state
    if (isSubmitted) {
        return (
            <main className={`w-full ${isModal ? '' : 'max-w-[480px] mx-auto'} h-full max-h-[90vh] flex flex-col bg-white dark:bg-white rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-200 relative`}>
                <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-200 bg-white dark:bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-8 rounded-full bg-emerald-500/10 text-emerald-500">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-900">Denúncia Enviada</h1>
                    </div>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined filled text-emerald-500 text-[40px]">verified</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 mb-2">Obrigado!</h2>
                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm max-w-xs">
                        Sua denúncia foi enviada e será analisada pela nossa equipe de moderação em até 24 horas.
                    </p>
                </div>
                <div className="p-5 border-t border-gray-100 dark:border-slate-200 bg-white dark:bg-white">
                    <button
                        onClick={handleClose}
                        className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary hover:bg-blue-600 transition-all text-slate-900 text-base font-bold"
                    >
                        Fechar
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={`w-full ${isModal ? '' : 'max-w-[480px] mx-auto'} h-full max-h-[90vh] flex flex-col bg-white dark:bg-white rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-200 relative`}>
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-200 bg-white dark:bg-white z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500">
                        <span className="material-symbols-outlined text-[20px]">report</span>
                    </div>
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-900">Denunciar Anúncio</h1>
                </div>
                <button
                    onClick={handleClose}
                    className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#292e38] transition-colors text-gray-500 dark:text-gray-400"
                >
                    <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 custom-scrollbar">
                {/* Context Text */}
                <div className="mb-6">
                    <p className="text-base font-medium text-gray-900 dark:text-slate-900 mb-1">Qual é o problema com este anúncio?</p>
                    <p className="text-sm text-gray-500 dark:text-[#9da6b8]">Ajude-nos a manter a comunidade de Empreendedorismo segura e confiável.</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Radio Options */}
                <div className="flex flex-col gap-3">
                    {reportOptions.map((option) => (
                        <label
                            key={option.value}
                            className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedReason === option.value
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-gray-200 dark:border-[#3c4453] bg-gray-50 dark:bg-white hover:border-primary/50'
                            }`}
                        >
                            <div className="flex grow flex-col">
                                <p className="text-sm font-bold text-gray-900 dark:text-slate-900">{option.title}</p>
                                <p className="text-xs text-gray-500 dark:text-[#9da6b8] mt-0.5">{option.description}</p>
                            </div>
                            <input
                                type="radio"
                                name="report_reason"
                                value={option.value}
                                checked={selectedReason === option.value}
                                onChange={() => setSelectedReason(option.value)}
                                className="h-5 w-5 border-2 border-gray-300 dark:border-[#52705e] bg-transparent text-primary focus:ring-0 focus:ring-offset-0 transition-colors"
                            />
                        </label>
                    ))}

                    {/* Text Area */}
                    <div className="mt-4">
                        <label className="block mb-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-slate-900">Detalhes adicionais (Opcional)</span>
                        </label>
                        <textarea
                            value={details}
                            onChange={handleDetailsChange}
                            maxLength={500}
                            className="w-full resize-none rounded-xl border border-gray-200 dark:border-[#3c4453] bg-white dark:bg-white text-gray-900 dark:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary p-4 text-sm leading-normal placeholder:text-gray-400 dark:placeholder:text-[#52705e] min-h-[120px]"
                            placeholder="Forneça mais contexto para nos ajudar a analisar esta denúncia mais rapidamente..."
                        />
                        <div className="flex justify-end mt-1">
                            <span className={`text-xs ${charCount > 450 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                {charCount}/500 caracteres
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 dark:border-slate-200 bg-white dark:bg-white z-10 sticky bottom-0">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !postId}
                    className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-slate-900 text-base font-bold leading-normal tracking-wide shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span>
                            Enviando...
                        </>
                    ) : (
                        'Enviar Denúncia'
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 dark:text-[#52705e] mt-3">
                    Sua denúncia é anônima e será analisada em até 24 horas.
                </p>
            </div>
        </main>
    );
}
