'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Shield, ChevronRight, Search, Plus, Star } from 'lucide-react';
import { useTenants } from '@/context/TenantContext';
import { supabase } from '@/lib/supabase';

const LABEL = process.env.NEXT_PUBLIC_TENANT_LABEL || 'Founders';

export default function SpacePortal() {
    const { joinTenant } = useTenants();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [publicTenants, setPublicTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');

    const [pendingTenant, setPendingTenant] = useState<any>(null);

    useEffect(() => {
        const checkPending = async () => {
            const pendingId = typeof window !== 'undefined' ? localStorage.getItem('pending_tenant_id') : null;
            if (pendingId) {
                const { data } = await supabase.from('tenants').select('*').eq('id', pendingId).single();
                if (data) {
                    setPendingTenant(data);
                    setStep(0); // Passo especial para convite pendente
                }
            }
        };
        checkPending();
    }, []);

    useEffect(() => {
        if (step === 2) {
            fetchPublicTenants();
        }
    }, [step]);

    const fetchPublicTenants = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('is_private', false)
            .limit(10);

        if (!error && data) {
            setPublicTenants(data);
        }
        setLoading(false);
    };

    const handleJoin = async (id: string, code?: string) => {
        setError('');
        const res = await joinTenant(id, code);
        if (!res.success) {
            setError(res.message);
        }
    };

    const searchTenants = async () => {
        if (!searchQuery) return fetchPublicTenants();
        setLoading(true);
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .ilike('name', `%${searchQuery}%`)
            .limit(10);

        if (!error && data) {
            setPublicTenants(data);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050b14] overflow-hidden flex items-center justify-center font-display">
            {/* Estrelas Animadas de Fundo */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                        initial={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            scale: Math.random() * 1
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Portal Central (Nebula Effect) */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none"
                animate={{
                    scale: [1, 1.2, 1],
                    background: [
                        'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                        'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                        'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative z-10 w-full max-w-2xl px-6">
                <AnimatePresence mode="wait">
                    {step === 0 && pendingTenant && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 bg-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-500/30">
                                {pendingTenant.is_private ? <Shield className="w-12 h-12 text-orange-400" /> : <Rocket className="w-12 h-12 text-blue-400" />}
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-wider">
                                Universo <span className="text-orange-500">Encontrado</span>
                            </h1>

                            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                Você foi direcionado para se juntar ao <span className="text-white font-bold">{pendingTenant.name}</span>.
                                {pendingTenant.is_private ? " Este é um grupo privado e requer código de acesso." : " Deseja entrar agora?"}
                            </p>

                            {pendingTenant.is_private ? (
                                <div className="max-w-sm mx-auto">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={accessCode}
                                        onChange={(e) => {
                                            setAccessCode(e.target.value.toUpperCase());
                                            setError('');
                                        }}
                                        className="w-full bg-white/5 text-center text-4xl tracking-[1rem] font-black text-white py-6 rounded-2xl border border-white/10 mb-6 focus:border-orange-500/50 outline-none"
                                    />
                                    {error && <p className="text-red-500 text-sm mb-6 font-bold">{error}</p>}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('pending_tenant_id');
                                                localStorage.removeItem('pending_tenant_name');
                                                setStep(1);
                                            }}
                                            className="flex-1 px-4 py-4 text-gray-400 hover:text-white transition-colors font-bold"
                                        >
                                            Ignorar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const res = await joinTenant(pendingTenant.id, accessCode);
                                                if (res.success) {
                                                    localStorage.removeItem('pending_tenant_id');
                                                    localStorage.removeItem('pending_tenant_name');
                                                } else {
                                                    setError(res.message);
                                                }
                                            }}
                                            disabled={accessCode.length < 4}
                                            className="flex-[2] px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-900/40"
                                        >
                                            Validar e Entrar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={async () => {
                                            const res = await joinTenant(pendingTenant.id);
                                            if (res.success) {
                                                localStorage.removeItem('pending_tenant_id');
                                                localStorage.removeItem('pending_tenant_name');
                                            }
                                        }}
                                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 group"
                                    >
                                        Confirmar Entrada <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('pending_tenant_id');
                                            localStorage.removeItem('pending_tenant_name');
                                            setStep(1);
                                        }}
                                        className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 text-white rounded-2xl font-bold border border-gray-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        Explorar Outros
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <motion.div
                                className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Rocket className="w-12 h-12 text-blue-400" />
                            </motion.div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-wider">
                                Bem-vindo ao <span className="text-blue-500">Universo</span>
                            </h1>

                            <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                                Escolha seu primeiro <span className="text-blue-400 font-semibold">{LABEL}</span> para começar sua jornada na rede social.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 group"
                                >
                                    Explorar Universos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    className="px-8 py-4 bg-gray-800/50 hover:bg-gray-800 text-white rounded-2xl font-bold border border-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Falar com Suporte <Sparkles className="w-5 h-5 text-yellow-500" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-bold text-white">Explorar {LABEL}</h1>
                                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm">Voltar</button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={`Pesquisar por nome do ${LABEL}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchTenants()}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="py-12 text-center text-gray-500">Buscando universos...</div>
                                ) : publicTenants.length > 0 ? (
                                    publicTenants.map((t) => (
                                        <div
                                            key={t.id}
                                            className="bg-gray-900/40 border border-gray-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                                                    {t.avatar_url ? (
                                                        <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <span className="text-white font-bold">{t.name[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold">{t.name}</h3>
                                                    <p className="text-gray-400 text-xs truncate max-w-[200px]">{t.description || 'Nenhuma descrição'}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => t.is_private ? setShowCodeInput(t.id) : handleJoin(t.id)}
                                                className="bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                                {t.is_private ? 'Entrar com Código' : 'Entrar'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-500">Nenhum {LABEL} encontrado.</div>
                                )}
                            </div>

                            {/* Modal de Código de Acesso */}
                            <AnimatePresence>
                                {showCodeInput && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                                    >
                                        <div className="bg-[#0e2741] border border-blue-500/30 p-8 rounded-3xl w-full max-w-sm">
                                            <Shield className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
                                            <h2 className="text-xl font-bold text-white text-center mb-2">Grupo Privado</h2>
                                            <p className="text-gray-400 text-center text-sm mb-6">Digite o código de 4 caracteres para entrar.</p>

                                            <input
                                                type="text"
                                                maxLength={4}
                                                placeholder="••••"
                                                value={accessCode}
                                                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                                className="w-full bg-gray-900 text-center text-3xl tracking-[1rem] font-bold text-white py-4 rounded-2xl border border-gray-700 mb-4 focus:border-blue-500 outline-none"
                                            />

                                            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setShowCodeInput(null); setAccessCode(''); setError(''); }}
                                                    className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleJoin(showCodeInput, accessCode)}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                                                >
                                                    Confirmar
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-12 text-center">
                                <p className="text-gray-500 text-sm mb-4">Apenas administradores podem criar novos universos no momento.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
