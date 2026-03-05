'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Globe, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTenants } from '@/context/TenantContext';
import { useUser } from '@/context/UserContext';

export default function TenantSlugPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { switchTenant, joinTenant, myTenants, activeTenant } = useTenants();

    const [status, setStatus] = useState<'searching' | 'switching' | 'confirm_join' | 'access_code' | 'joining' | 'error' | 'not_found' | 'success'>('searching');
    const [tenant, setTenant] = useState<any>(null);
    const [accessCode, setAccessCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (userLoading) return;
        handleTenantAccess();
    }, [slug, user, userLoading]);

    const handleTenantAccess = async () => {
        try {
            // 1. Buscar o tenant pelo slug
            const { data: tenantData, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug as string)
                .single();

            if (error || !tenantData) {
                setStatus('not_found');
                setTimeout(() => router.push('/'), 3000);
                return;
            }

            setTenant(tenantData);

            // 2. Se não estiver logado, salvar para o onboarding e mandar para cadastro
            if (!user) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('pending_tenant_id', tenantData.id);
                    localStorage.setItem('pending_tenant_name', tenantData.name);
                }
                router.push('/auth/signup');
                return;
            }

            // 3. Se estiver logado, verificar se já é membro
            const isMember = myTenants.some(t => t.id === tenantData.id);

            if (isMember) {
                if (activeTenant?.id === tenantData.id) {
                    setStatus('success');
                    setTimeout(() => router.push('/'), 1500);
                } else {
                    proceedToSwitch(tenantData.id);
                }
            } else {
                // Se não é membro, perguntar ou pedir senha
                if (tenantData.is_private) {
                    setStatus('access_code');
                } else {
                    setStatus('confirm_join');
                }
            }
        } catch (err) {
            console.error('Error in tenant redirect:', err);
            setStatus('error');
            setErrorMsg('Ocorreu um erro ao processar seu acesso.');
        }
    };

    const handleJoinAction = async () => {
        if (!tenant) return;

        setStatus('joining');
        const joinRes = await joinTenant(tenant.id, accessCode);

        if (!joinRes.success) {
            setErrorMsg(joinRes.message);
            setStatus(tenant.is_private ? 'access_code' : 'confirm_join');
            return;
        }

        proceedToSwitch(tenant.id);
    };

    const proceedToSwitch = async (id: string) => {
        setStatus('switching');
        // Pequeno delay para o usuário ver a transição "bonita"
        await new Promise(resolve => setTimeout(resolve, 800));
        await switchTenant(id);
        setStatus('success');
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-600/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 text-center relative z-10 shadow-2xl"
            >
                <AnimatePresence mode="wait">
                    {status === 'searching' && (
                        <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 relative">
                                <Globe className="w-10 h-10 text-blue-400 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Buscando Universo</h2>
                            <p className="text-gray-400 font-light">Validando coordenadas de acesso...</p>
                        </motion.div>
                    )}

                    {status === 'confirm_join' && (
                        <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8">
                                <Rocket className="w-10 h-10 text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Novo Destino Encontrado</h2>
                            <p className="text-gray-400 font-light mb-8">Você deseja se juntar ao universo <span className="text-white font-bold">{tenant?.name}</span>?</p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={handleJoinAction}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-900/40 transition-all active:scale-95"
                                >
                                    ENTRAR AGORA
                                </button>
                                <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white text-sm transition-colors">Talvez mais tarde</button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'access_code' && (
                        <motion.div key="code" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                                <Shield className="w-10 h-10 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Portal Privado</h2>
                            <p className="text-gray-400 font-light mb-6">Digite o código de acesso para entrar em <span className="text-white font-bold">{tenant?.name}</span></p>

                            <input
                                type="text"
                                maxLength={4}
                                value={accessCode}
                                onChange={(e) => {
                                    setAccessCode(e.target.value.toUpperCase());
                                    setErrorMsg('');
                                }}
                                placeholder="••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[1rem] text-white focus:outline-none focus:border-orange-500/50 mb-4"
                            />

                            {errorMsg && <p className="text-red-500 text-xs mb-4 font-bold">{errorMsg}</p>}

                            <button
                                onClick={handleJoinAction}
                                disabled={accessCode.length < 4}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg transition-all active:scale-95"
                            >
                                VALIDAR ACESSO
                            </button>
                            <button onClick={() => router.push('/')} className="mt-4 text-gray-500 hover:text-white text-sm transition-colors">Cancelar</button>
                        </motion.div>
                    )}

                    {status === 'joining' && (
                        <motion.div key="joining" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                <Sparkles className="w-10 h-10 text-orange-400 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Processando...</h2>
                            <p className="text-gray-400 font-light text-sm italic">Abrindo as portas do universo</p>
                        </motion.div>
                    )}

                    {status === 'switching' && (
                        <motion.div key="switching" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 relative">
                                <MapPin className="w-10 h-10 text-blue-400 animate-bounce" />
                            </div>
                            <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter leading-none">
                                Direcionando para <br />
                                <span className="text-orange-500">{tenant?.name}</span>
                            </h1>
                            <p className="text-gray-400 font-light">Sincronizando feed e configurações...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 relative">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Autenticado!</h2>
                            <p className="text-gray-400 font-light">Bem-vindo a bordo.</p>
                        </motion.div>
                    )}

                    {status === 'not_found' && (
                        <motion.div key="not_found" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                <Globe className="w-10 h-10 text-red-400 opacity-50" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter text-red-400">Não Encontrado</h2>
                            <p className="text-gray-400 font-light">Destino inválido no radar.</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-red-500">
                                <Rocket className="w-10 h-10 rotate-180" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Falha Crítica</h2>
                            <p className="text-red-400/80 font-medium mb-4">{errorMsg}</p>
                            <button onClick={() => router.push('/')} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm border border-white/10 transition-all">
                                Ignorar e Voltar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
