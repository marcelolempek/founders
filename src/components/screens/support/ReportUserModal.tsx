'use client';

import React, { useState, useEffect } from 'react';
import { useReportUser, ReportReason } from '@/lib/hooks/useSupport';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/images';


interface UserInfo {
    id: string;
    username: string;
    avatar_url: string | null;
    created_at: string | null;
}

interface ReportOption {
    value: ReportReason;
    title: string;
    description: string;
}

const reportOptions: ReportOption[] = [
    {
        value: 'scam',
        title: 'Tentativa de Golpe / Fraude',
        description: 'Venda falsa, solicitação de pagamento indevido'
    },
    {
        value: 'illegal',
        title: 'Item Proibido / Ilegal',
        description: 'Armas de fogo reais, explosivos, drogas'
    },
    {
        value: 'abusive',
        title: 'Comportamento Abusivo',
        description: 'Assédio, discurso de ódio, ameaças'
    },
    {
        value: 'spam',
        title: 'Spam / Propaganda',
        description: 'Anúncios repetidos, links externos suspeitos'
    },
    {
        value: 'other',
        title: 'Outro motivo',
        description: ''
    }
];

interface ReportUserModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportUserModal({ userId, isOpen, onClose }: ReportUserModalProps) {
    const { reportUser, loading, error } = useReportUser();

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [selectedReason, setSelectedReason] = useState<ReportReason>('scam');
    const [details, setDetails] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;

            setLoadingUser(true);
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, created_at')
                    .eq('id', userId)
                    .single();

                if (data) {
                    setUserInfo(data);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoadingUser(false);
            }
        };

        if (isOpen) {
            fetchUser();
        }
    }, [userId, isOpen]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.slice(0, 500);
        setDetails(value);
        setCharCount(value.length);
    };

    const handleSubmit = async () => {
        if (!userId) return;

        const success = await reportUser({
            userId,
            reason: selectedReason,
            details: details || undefined,
        });

        if (success) {
            setIsSubmitted(true);
        }
    };

    const handleClose = () => {
        setIsSubmitted(false);
        setSelectedReason('scam');
        setDetails('');
        setCharCount(0);
        onClose();
    };

    // Format member since date
    const getMemberSince = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.getFullYear().toString();
    };

    if (!isOpen) return null;

    // Success state
    if (isSubmitted) {
        return (
            <>
                <div aria-hidden="true" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity" onClick={handleClose}></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-[520px] flex flex-col bg-white dark:bg-slate-50 rounded-2xl border border-slate-200 dark:border-border-color shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-border-color bg-slate-50 dark:bg-white/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 tracking-tight">Denúncia Enviada</h2>
                            <button
                                onClick={handleClose}
                                className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-900 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined filled text-emerald-500 text-[40px]">verified</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 mb-2">Obrigado!</h3>
                            <p className="text-slate-500 dark:text-text-secondary text-sm max-w-xs">
                                Sua denúncia foi enviada com sucesso e será analisada pela nossa equipe de moderação em até 24 horas.
                            </p>
                        </div>
                        <div className="flex items-center justify-center px-6 py-5 border-t border-slate-200 dark:border-border-color bg-slate-50 dark:bg-white/50">
                            <button
                                onClick={handleClose}
                                className="px-8 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-primary hover:bg-primary/90 transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Modal Overlay Backdrop */}
            <div aria-hidden="true" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity" onClick={handleClose}></div>

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-[520px] max-h-[90vh] flex flex-col bg-white dark:bg-slate-50 rounded-2xl border border-slate-200 dark:border-border-color shadow-2xl overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-border-color bg-slate-50 dark:bg-white/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 tracking-tight">Denunciar Usuário</h2>
                        <button
                            onClick={handleClose}
                            className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-900 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <div className="px-6 py-6 flex flex-col gap-6">
                            {/* Target User Context */}
                            {loadingUser ? (
                                <div className="flex items-center gap-4 bg-slate-100 dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-border-color/50 animate-pulse">
                                    <div className="size-14 rounded-full bg-slate-200 dark:bg-[#292e38]"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-5 w-32 bg-slate-200 dark:bg-[#292e38] rounded"></div>
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-[#292e38] rounded"></div>
                                    </div>
                                </div>
                            ) : userInfo ? (
                                <div className="flex items-center gap-4 bg-slate-100 dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-border-color/50">
                                    <div className="relative h-14 w-14 shrink-0">
                                        {userInfo.avatar_url ? (
                                            <div
                                                className="h-full w-full rounded-full bg-cover bg-center border-2 border-primary/30"
                                                style={{ backgroundImage: `url("${getR2Url(userInfo.avatar_url)}")` }}
                                            />

                                        ) : (
                                            <div className="h-full w-full rounded-full bg-slate-200 dark:bg-[#292e38] flex items-center justify-center border-2 border-primary/30">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-[#9da6b8] text-2xl">person</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-primary border-2 border-white dark:border-[#1e293b]"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-slate-900 dark:text-slate-900 text-lg font-bold leading-tight">{userInfo.username}</p>
                                        <p className="text-slate-500 dark:text-text-secondary text-sm">
                                            ID: #{userId.substring(0, 6)} • Membro desde {getMemberSince(userInfo.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Instructions */}
                            <div>
                                <p className="text-slate-500 dark:text-text-secondary text-sm font-medium leading-relaxed">
                                    Selecione o motivo que melhor descreve a violação. Sua denúncia é anônima e será analisada pela nossa equipe de moderação.
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Reasons Radio List */}
                            <div className="flex flex-col gap-3">
                                {reportOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${selectedReason === option.value
                                            ? 'bg-primary/10 border-primary'
                                            : 'border-slate-200 dark:border-border-color bg-slate-50 dark:bg-white/30 hover:bg-slate-100 dark:hover:bg-white hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="report_reason"
                                                value={option.value}
                                                checked={selectedReason === option.value}
                                                onChange={() => setSelectedReason(option.value)}
                                                className="peer h-5 w-5 border-2 border-slate-300 dark:border-text-secondary bg-transparent text-primary focus:ring-primary/20 focus:ring-offset-0 checked:border-primary checked:bg-primary"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-base font-medium transition-colors ${selectedReason === option.value ? 'text-primary' : 'text-slate-900 dark:text-slate-900 group-hover:text-primary'
                                                }`}>
                                                {option.title}
                                            </span>
                                            {option.description && (
                                                <span className="text-slate-500 dark:text-text-secondary text-xs mt-0.5">{option.description}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Text Area Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 dark:text-slate-900 text-sm font-semibold pl-1" htmlFor="details">
                                    Detalhes adicionais (opcional)
                                </label>
                                <textarea
                                    id="details"
                                    value={details}
                                    onChange={handleDetailsChange}
                                    maxLength={500}
                                    className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 dark:border-border-color bg-white dark:bg-white text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm leading-relaxed transition-all hover:border-slate-300 dark:hover:border-text-secondary"
                                    placeholder="Descreva o ocorrido com mais detalhes para nos ajudar a entender a situação..."
                                />
                                <p className={`text-right text-xs ${charCount > 450 ? 'text-whitember-500' : 'text-slate-400 dark:text-text-secondary/70'}`}>
                                    {charCount}/500 caracteres
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-200 dark:border-border-color bg-slate-50 dark:bg-white/50">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-900 bg-transparent border border-slate-200 dark:border-border-color hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Enviar Denúncia
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
