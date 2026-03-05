'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupportTicket, SupportTopic } from '@/lib/hooks/useSupport';
import { getCurrentUser } from '@/lib/supabase';
import NextImage from 'next/image';

export default function ContactScreen() {
    const router = useRouter();
    const { submitTicket, loading: isSubmitting } = useSupportTicket();

    const [formData, setFormData] = useState({
        topic: '' as SupportTopic | '',
        email: '',
        message: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Load user email if logged in
    useEffect(() => {
        const loadUserEmail = async () => {
            const user = await getCurrentUser();
            if (user?.email) {
                setFormData(prev => ({ ...prev, email: user.email || '' }));
            }
        };
        loadUserEmail();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'message') {
            setCharCount(value.length);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic || !formData.email || !formData.message) return;

        const success = await submitTicket({
            topic: formData.topic as SupportTopic,
            email: formData.email,
            message: formData.message,
        });

        if (success) {
            setIsSubmitted(true);
        }
    };

    const handleReset = () => {
        setFormData(prev => ({ ...prev, topic: '', message: '' }));
        setCharCount(0);
        setIsSubmitted(false);
    };

    const topicLabels: Record<SupportTopic, string> = {
        report: 'Denunciar um Anúncio',
        account: 'Suporte de Conta',
        partnership: 'Parceria',
        bug: 'Reportar um Bug',
        other: 'Outro',
    };

    if (isSubmitted) {
        return (
            <>
                <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0e2741]/80 backdrop-blur-md">
                    <div className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-3 max-w-[960px] mx-auto w-full">
                        <Link className="flex items-center gap-3 text-white group" href="/">
                            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                                <NextImage
                                    src="/logo.png"
                                    alt="Empreendedores de Cristo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <h2 className="hidden sm:block text-lg font-bold leading-tight tracking-[-0.015em] group-hover:text-primary transition-colors">Empreendedores de Cristo</h2>
                        </Link>
                    </div>
                </div>
                <div className="flex-1 flex justify-center items-center py-8 px-4 sm:px-6">
                    <div className="w-full max-w-[540px] flex flex-col items-center gap-6 text-center">
                        <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[40px]">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Mensagem Enviada!</h1>
                        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                            Obrigado por entrar em contato. Nossa equipe de suporte analisará sua mensagem e responderá em até 24-48 horas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-slate-100 border border-primary/50 text-white font-bold rounded-lg hover:bg-slate-50/50 transition-colors"
                            >
                                Enviar Outra Mensagem
                            </button>
                            <Link
                                href="/support/my-tickets"
                                className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Ver Meus Chamados
                            </Link>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-slate-100 border border-primary/50 text-white font-bold rounded-lg hover:bg-slate-50/50 transition-colors"
                            >
                                Voltar ao Início
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0e2741]/80 backdrop-blur-md">
                <div className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-3 max-w-[960px] mx-auto w-full">
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button onClick={() => router.back()} className="p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors text-white">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <Link className="flex items-center gap-3 text-white group" href="/">
                            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                                <NextImage
                                    src="/logo.png"
                                    alt="Empreendedores de Cristo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <h2 className="hidden sm:block text-lg font-bold leading-tight tracking-[-0.015em] group-hover:text-primary transition-colors">Empreendedores de Cristo</h2>
                        </Link>
                    </div>
                    <Link href="/support/my-tickets" className="text-sm font-bold text-primary hover:underline">
                        Ver Meus Chamados
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex justify-center py-8 px-4 sm:px-6">
                <div className="w-full max-w-[540px] flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex flex-col gap-2 text-center pb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Entre em Contato</h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            Tem uma dúvida sobre uma negociação, precisa de ajuda para verificar um usuário, ou tem uma sugestão de funcionalidade? Fale com nosso suporte.
                        </p>
                    </div>

                    {/* Contact Form Card */}
                    <div className="bg-slate-100 rounded-xl border border-primary/50 p-6 shadow-sm">
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            {/* Topic Select */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-white">Assunto <span className="text-primary">*</span></span>
                                <div className="relative">
                                    <select
                                        name="topic"
                                        value={formData.topic}
                                        onChange={handleInputChange}
                                        className="w-full h-12 rounded-lg border border-primary/50 bg-[#0e2741] text-white px-4 pr-10 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    >
                                        <option disabled value="">Selecione um assunto</option>
                                        {(Object.keys(topicLabels) as SupportTopic[]).map((key) => (
                                            <option key={key} value={key}>{topicLabels[key]}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                                </div>
                            </label>

                            {/* Email Input */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-white">Email <span className="text-primary">*</span></span>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full h-12 rounded-lg border border-primary/50 bg-[#0e2741] text-white px-4 pl-11 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Digite seu email"
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                                </div>
                            </label>

                            {/* Message Textarea */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-white">Mensagem <span className="text-primary">*</span></span>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                    className="w-full min-h-[140px] rounded-lg border border-primary/50 bg-[#0e2741] text-white p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y placeholder:text-slate-400"
                                    placeholder="Descreva seu problema ou sugestão em detalhes..."
                                />
                                <div className="flex justify-end">
                                    <span className={`text-xs ${charCount > 450 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                        {charCount}/500 caracteres
                                    </span>
                                </div>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!formData.topic || !formData.email || !formData.message || isSubmitting}
                                className="mt-2 w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar Mensagem</span>
                                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">send</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Alternative Contact Methods */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="mailto:suporte@founders.com"
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-primary/50 bg-slate-100 hover:bg-slate-50/50 transition-all group"
                        >
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-primary">email</span>
                            </div>
                            <h3 className="font-bold text-white text-sm">Suporte por Email</h3>
                            <p className="text-xs text-slate-400 mt-1">suporte@founders.com</p>
                        </a>
                        <a
  href="https://wa.me/5551983117180?text=Olá%20%20gostaria%20de%20ajuda%20na%20plataforma%20Founders."
  target="_blank"
  rel="noopener noreferrer"
  className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#25D366]/50 bg-slate-100 hover:bg-slate-50/50 transition-all group"
>
                            <div className="size-10 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-3 group-hover:bg-[#25D366]/20 transition-colors">
                                <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                                </svg>
                            </div>
                            <h3 className="font-bold text-white text-sm">WhatsApp</h3>
                            <p className="text-xs text-slate-400 mt-1">Resposta em ~5 minutos</p>
                        </a>
                    </div>

                    {/* Quick FAQ Links */}
                    <div className="pt-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Ajuda Rápida</h4>
                        <div className="flex flex-col gap-2">
                            <Link className="flex items-center justify-between p-3 rounded-lg bg-slate-100 hover:bg-slate-50/50 transition-colors group" href="/support/rules">
                                <span className="text-sm font-medium text-white">Como verificar um vendedor com segurança?</span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">chevron_right</span>
                            </Link>
                            <Link className="flex items-center justify-between p-3 rounded-lg bg-slate-100 hover:bg-slate-50/50 transition-colors group" href="/support/rules">
                                <span className="text-sm font-medium text-white">Regras e diretrizes do marketplace</span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">chevron_right</span>
                            </Link>
                            <Link className="flex items-center justify-between p-3 rounded-lg bg-slate-100 hover:bg-slate-50/50 transition-colors group" href="/auth/login">
                                <span className="text-sm font-medium text-white">Recuperar sua senha</span>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">chevron_right</span>
                            </Link>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 mt-4 pb-8 text-xs text-slate-400">
                        <Link className="hover:text-primary transition-colors" href="/support/rules">Política de Privacidade</Link>
                        <span className="text-slate-500">•</span>
                        <Link className="hover:text-primary transition-colors" href="/support/rules">Termos de Uso</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
