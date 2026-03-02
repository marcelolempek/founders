'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => Promise<boolean | void>;
    type: 'post' | 'user';
    targetName?: string;
}

const postReasons = [
    {
        id: 'prohibited',
        title: 'Item Proibido',
        description: 'Arma de fogo real, sem ponta laranja ou modificação ilegal',
        icon: 'report'
    },
    {
        id: 'scam',
        title: 'Golpe ou Suspeito',
        description: 'Vendedor fraudulento, fotos falsas ou pedido de pagamento fora da plataforma',
        icon: 'warning'
    },
    {
        id: 'wrong-category',
        title: 'Categoria ou Preço Incorreto',
        description: 'Preço enganoso (ex: R$1), tags irrelevantes ou seção errada',
        icon: 'category'
    },
    {
        id: 'abusive',
        title: 'Conteúdo Abusivo',
        description: 'Assédio, discurso de ódio ou linguagem ofensiva',
        icon: 'sentiment_very_dissatisfied'
    },
    {
        id: 'other',
        title: 'Outro',
        description: 'Outro motivo não listado acima',
        icon: 'more_horiz'
    }
];

const userReasons = [
    {
        id: 'harassment',
        title: 'Assédio',
        description: 'Este usuário está me assediando ou ameaçando.',
        icon: 'person_off'
    },
    {
        id: 'scam',
        title: 'Golpista',
        description: 'Este usuário me enganou ou tentou aplicar um golpe.',
        icon: 'gpp_bad'
    },
    {
        id: 'fake-profile',
        title: 'Perfil Falso',
        description: 'Este perfil é falso ou está se passando por outra pessoa.',
        icon: 'no_accounts'
    },
    {
        id: 'spam',
        title: 'Spam',
        description: 'Este usuário está enviando spam ou mensagens não solicitadas.',
        icon: 'mark_email_unread'
    },
    {
        id: 'other',
        title: 'Outro',
        description: 'Outro problema não listado acima.',
        icon: 'more_horiz'
    }
];

export function ReportModal({ isOpen, onClose, onSubmit, type, targetName }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const reasons = type === 'post' ? postReasons : userReasons;
    const title = type === 'post' ? 'Denunciar Anúncio' : `Denunciar ${targetName || 'Usuário'}`;

    const handleSubmit = async () => {
        if (selectedReason) {
            try {
                const success = await onSubmit(selectedReason, details);
                // Only show success screen if onSubmit returns true (or doesn't return false/throw)
                if (success !== false) {
                    setSubmitted(true);
                }
            } catch (error) {
                // If the parent handler throws, we also stay on the form
                console.error("Report submission failed", error);
            }
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setDetails('');
        setSubmitted(false);
        onClose();
    };

    if (submitted) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} size="md">
                <div className="flex flex-col items-center gap-6 py-8 px-4 text-center">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Denúncia Enviada</h3>
                        <p className="text-text-secondary text-sm leading-relaxed max-w-[280px] mx-auto">
                            Obrigado pela sua denúncia. Nossa equipe de moderação irá analisar em até 24 horas.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-full h-12 bg-primary text-white font-extrabold text-base rounded-xl hover:bg-[#0fd658] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(19,231,97,0.3)]"
                    >
                        Entendi
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500">
                        <span className="material-symbols-outlined text-[20px]">report</span>
                    </div>
                    <span className="text-lg font-bold">{title}</span>
                </div>
            }
            size="md"
        >
            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col gap-1">
                    <p className="text-base font-medium text-slate-900">Qual é o problema com este {type === 'post' ? 'anúncio' : 'usuário'}?</p>
                    <p className="text-sm text-text-secondary">Ajude-nos a manter a comunidade de Empreendedorismo segura e confiável.</p>
                </div>

                {/* Reason Options */}
                <div className="flex flex-col gap-3">
                    {reasons.map((reason) => (
                        <label
                            key={reason.id}
                            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${selectedReason === reason.id
                                ? 'border-primary bg-white'
                                : 'border-slate-200 bg-white/50 hover:border-primary/50'
                                }`}
                        >
                            <div className="flex grow flex-col">
                                <p className={`text-sm font-bold ${selectedReason === reason.id ? 'text-primary' : 'text-slate-900'}`}>
                                    {reason.title}
                                </p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    {reason.description}
                                </p>
                            </div>
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    name="report_reason"
                                    checked={selectedReason === reason.id}
                                    onChange={() => setSelectedReason(reason.id)}
                                    className="h-5 w-5 border-2 border-slate-200 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 transition-all checked:border-primary appearance-none rounded-full"
                                />
                                {selectedReason === reason.id && (
                                    <div className="absolute size-2.5 bg-primary rounded-full animate-in zoom-in-50 duration-200"></div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>

                {/* Additional Details */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-900">
                        Detalhes adicionais (Opcional)
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Forneça qualquer contexto extra para nos ajudar a analisar esta denúncia mais rapidamente..."
                        className="w-full min-h-[120px] bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col gap-3 mt-6 border-t border-slate-200/50 pt-5">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedReason}
                    className="w-full h-12 bg-primary text-white font-extrabold text-base rounded-xl hover:bg-[#0fd658] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_20px_rgba(19,231,97,0.3)]"
                >
                    Enviar Denúncia
                </button>
                <p className="text-center text-[10px] text-text-secondary/60">
                    Sua denúncia é anônima e será analisada em 24 horas.
                </p>
            </div>
        </Modal>
    );
}
