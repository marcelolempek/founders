'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Shield, Zap, ChevronRight, Rocket, Star, Briefcase, Church, Landmark, LayoutGrid, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const LABEL = process.env.NEXT_PUBLIC_TENANT_LABEL || 'Founders';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500/30 font-display overflow-hidden relative">
            {/* Background Decorative Elements - Refined for premium look */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-600/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />


                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-px h-px bg-white/20 rounded-full"
                        initial={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random()
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 2, 1]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 px-6">
                <div className="container mx-auto max-w-6xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-orange-400 text-xs font-bold mb-10 tracking-[0.2em] uppercase overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {typeof window !== 'undefined' && localStorage.getItem('pending_tenant_name') ? (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Você está se juntando ao Universo {localStorage.getItem('pending_tenant_name')}
                                </div>
                            ) : (
                                <>
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    O Futuro das Redes Sociais
                                </>
                            )}
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black mb-8 bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent leading-[1] md:leading-[0.9] tracking-tighter">
                            Seu Espaço Privado<br className="hidden md:block" /> no Universo <span className="text-orange-500 relative inline-block">
                                {LABEL}
                                <motion.span
                                    className="absolute -bottom-2 left-0 w-full h-1 bg-orange-500/30 blur-sm rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-14 leading-relaxed px-4 font-light">
                            Construa ecossistemas de negócios e networking com <span className="text-white font-medium italic">segurança absoluta</span> e propósito nobre.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/auth/signup"
                                className="w-full sm:w-auto px-10 py-5 bg-orange-600/90 backdrop-blur-xl hover:bg-orange-500 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.5)] border border-orange-400/30 flex items-center justify-center gap-3 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                Começar Agora <Rocket className="w-6 h-6 group-hover:translate-y-[-4px] group-hover:translate-x-[4px] transition-transform" />
                            </Link>

                            <Link href="/auth/login"
                                className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-2xl hover:bg-white/10 text-white rounded-2xl font-bold text-xl border border-white/10 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                            >
                                Já tenho conta <ChevronRight className="w-6 h-6 text-gray-400" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* App Mockup Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="mt-20 relative"
                    >
                        <div className="relative mx-auto max-w-5xl rounded-[2rem] md:rounded-[3rem] border border-white/10 p-1.5 md:p-3 bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden group/mockup">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-1000" />

                            <div className="aspect-[4/3] md:aspect-video bg-[#030712] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/[0.08] relative shadow-inner">
                                {/* Sidebar Mockup - Real Premium Feel */}
                                <div className="absolute left-0 top-0 bottom-0 w-14 md:w-24 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-6 md:py-8 gap-5 md:gap-8 z-10">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)] relative cursor-pointer hover:scale-105 transition-transform">
                                        <Globe className="w-5 h-5 md:w-7 md:h-7 text-white" />
                                        <div className="absolute -right-1 -top-1 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full border-4 border-[#030712]" />
                                    </div>
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all cursor-pointer">
                                        <Church className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-white/10 transition-all cursor-pointer">
                                        <Briefcase className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <div className="hidden md:flex w-14 h-14 bg-white/5 rounded-2xl border border-white/10 items-center justify-center text-gray-500 hover:bg-white/10 transition-all cursor-pointer">
                                        <LayoutGrid className="w-7 h-7" />
                                    </div>
                                    <div className="mt-auto mb-2 md:mb-0 w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-orange-500/20 p-1">
                                        <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full shadow-lg" />
                                    </div>
                                </div>

                                {/* Main Content Mockup - Glass Feed */}
                                <div className="absolute left-14 md:left-24 right-0 top-0 bottom-0 p-5 md:p-10 overflow-hidden">
                                    {/* Header Mockup */}
                                    <div className="flex items-center justify-between mb-6 md:mb-10 border-b border-white/5 pb-4 md:pb-6">
                                        <div className="flex items-center gap-3 md:gap-5">
                                            <div className="w-8 h-8 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                                                <Star className="w-4 h-4 md:w-7 md:h-7 text-orange-400" />
                                            </div>
                                            <div>
                                                <div className="h-3 md:h-5 w-24 md:w-48 bg-white/10 rounded-full mb-2 md:mb-3" />
                                                <div className="h-2 md:h-3 w-16 md:w-32 bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 md:gap-4">
                                            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><Heart className="w-4 h-4 md:w-6 md:h-6 text-orange-500/50" /></div>
                                            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-full border border-white/10" />
                                        </div>
                                    </div>

                                    {/* Feed Content */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                                        <div className="bg-white/[0.03] rounded-2xl md:rounded-[2rem] border border-white/10 overflow-hidden flex flex-col group/card transition-all hover:bg-white/[0.05] hover:scale-[1.02] duration-500">
                                            <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-blue-900/40 flex items-center justify-center relative">
                                                <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500/20 backdrop-blur-md text-orange-400 text-[8px] md:text-[10px] font-black rounded-full border border-orange-500/30">PREMIUM</div>
                                                <Briefcase className="w-8 h-8 md:w-14 md:h-14 text-orange-400/20 group-hover/card:scale-110 transition-transform duration-700" />
                                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[8px] md:text-xs text-white font-bold border border-white/10 uppercase tracking-widest">Marketplace</div>
                                            </div>
                                            <div className="p-5 md:p-8 flex-1">
                                                <div className="h-3 md:h-4 w-5/6 bg-white/20 rounded-full mb-3 md:mb-4" />
                                                <div className="h-2 md:h-3 w-1/2 bg-white/10 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="hidden md:flex bg-white/[0.03] rounded-[2rem] border border-white/10 overflow-hidden flex-col group/card transition-all hover:bg-white/[0.05] hover:scale-[1.02] duration-500">
                                            <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-orange-900/10 flex items-center justify-center relative">
                                                <Church className="w-14 h-14 text-blue-400/20 group-hover/card:scale-110 transition-transform duration-700" />
                                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-xs text-white font-bold border border-white/10 uppercase tracking-widest">Ministérios</div>
                                            </div>
                                            <div className="p-8 flex-1">
                                                <div className="h-4 w-5/6 bg-white/20 rounded-full mb-4" />
                                                <div className="flex -space-x-3 mt-4">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030712] bg-gray-800 shadow-lg overflow-hidden">
                                                            <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-orange-500/40' : 'from-blue-500/40'} to-transparent`} />
                                                        </div>
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full border-2 border-[#030712] bg-orange-600 flex items-center justify-center text-[10px] font-black shadow-lg">+24</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Floating Info - Positioned for impact */}
                                    <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 left-20 md:left-auto pointer-events-none">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.5 }}
                                            className="bg-orange-600/90 backdrop-blur-2xl border border-orange-400/50 p-3 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(234,88,12,0.3)] flex items-center md:items-start gap-3 md:gap-5"
                                        >
                                            <div className="w-8 h-8 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl">
                                                <Zap className="w-4 h-4 md:w-8 md:h-8 text-orange-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-white text-[10px] md:text-xl font-black md:mb-2 leading-tight">Troca de Universos</h4>
                                                <p className="hidden md:block text-orange-100 text-sm font-light opacity-80 leading-snug">Alternância fluida entre negócios e comunidade.</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Placeholder Label Overlay - Subtle Branding */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-white/[0.02] font-black text-[80px] md:text-[200px] transform rotate-[-15deg] uppercase select-none tracking-tighter">
                                        Founders
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sub-hero feature text */}
                        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left px-4 md:px-0">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Múltiplos Universos. Um só Usuário.</h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                    Navegue entre sua igreja, seu condomínio e seu clube de negócios com um único login. Cada espaço mantém sua privacidade e dados isolados.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-blue-400">Transborde seu Propósito</h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                    Uma rede feita por e para cristãos. Promova seus produtos, ofereça seus serviços e fortaleça a economia do Reino em um ambiente seguro.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Glass Cards */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: Shield,
                                title: 'Isolamento Total',
                                desc: 'Cada universo é completamente separado. Seus dados e conexões permanecem em ambientes exclusivos.',
                                color: 'border-orange-500/30'
                            },
                            {
                                icon: Users,
                                title: 'Economia do Reino',
                                desc: 'Ideal para negócios locais, igrejas e mentoria com base em valores cristãos.',
                                color: 'border-blue-500/30'
                            },
                            {
                                icon: Zap,
                                title: 'Performance Elite',
                                desc: 'Infraestrutura de ponta para conexões rápidas e transbordantes.',
                                color: 'border-white/20'
                            }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                viewport={{ once: true }}
                                className={`p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 hover:border-orange-500/40 transition-all duration-500 group relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-950 rounded-2xl flex items-center justify-center mb-8 text-orange-400 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl border border-white/5">
                                    <feat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 leading-tight">{feat.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer / CTA Footer */}
            <footer className="py-20 text-center border-t border-white/5">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-6 italic opacity-50">Explorar. Conectar. Transbordar.</h2>
                    <p className="text-gray-600 text-sm">© 2026 {LABEL} - Conectando Propósitos.</p>
                </div>
            </footer>
        </div>
    );
}
