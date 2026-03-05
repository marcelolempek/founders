'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Settings, LogOut, Plus, Shield } from 'lucide-react';
import { useTenants } from '@/context/TenantContext';

const LABEL = process.env.NEXT_PUBLIC_TENANT_LABEL || 'Founders';

export default function TenantSwitcher() {
    const { activeTenant, myTenants, switchTenant } = useTenants();
    const [isOpen, setIsOpen] = useState(false);

    if (!activeTenant) return null;

    return (
        <div className="relative font-display">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-2xl transition-all group"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                    {activeTenant.avatar_url ? (
                        <img src={activeTenant.avatar_url} alt={activeTenant.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <Globe className="w-5 h-5 text-white" />
                    )}
                </div>

                <div className="text-left hidden md:block">
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold leading-none mb-1">{LABEL}</p>
                    <h3 className="text-white text-sm font-bold leading-none">{activeTenant.name}</h3>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop para fechar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute mt-2 right-0 w-64 bg-[#0e2741] border border-blue-500/20 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-4 border-b border-blue-500/10">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 px-2">Meus Universos</p>

                                <div className="space-y-1">
                                    {myTenants.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                if (t.id !== activeTenant.id) switchTenant(t.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${t.id === activeTenant.id
                                                    ? 'bg-blue-600/20 border border-blue-500/30'
                                                    : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                                                {t.avatar_url ? (
                                                    <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400">{t.name[0]}</span>
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${t.id === activeTenant.id ? 'text-blue-400' : 'text-gray-300'}`}>
                                                {t.name}
                                            </span>
                                            {t.is_private && <Shield className="w-3 h-3 text-gray-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-2 bg-black/20">
                                <button
                                    className="w-full flex items-center gap-3 p-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                    onClick={() => {
                                        setIsOpen(false);
                                        // TODO: Navegar para Explorar Universos (Onboarding/Marketplace)
                                        window.location.href = '/onboarding'; // Ou disparar um evento para o Guard
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Descobrir Novos Grupos
                                </button>

                                <button className="w-full flex items-center gap-3 p-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Settings className="w-4 h-4" />
                                    Configurações do {LABEL}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
