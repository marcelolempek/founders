'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    AtSign,
    Phone,
    MapPin,
    Camera,
    CheckCircle2,
    Rocket,
    ArrowRight
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useNotify } from '@/components/ui/Toast';
import { uploadBlobToR2 } from '@/lib/images/uploadToR2';
import { resizeImage } from '@/lib/images/resizeImage';
import { IMAGE_SIZES } from '@/lib/images/imageSizes';
import { LocationSelector } from '@/components/shared/LocationSelector';
import { getR2Url } from '@/lib/images';
import Logo from '@/components/shared/Logo';

const LABEL = process.env.NEXT_PUBLIC_TENANT_LABEL || 'Founders';

export default function CompleteProfilePage() {
    const router = useRouter();
    const { error: notifyError, success: notifySuccess } = useNotify();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        location_city: '',
        location_state: '',
        latitude: null as number | null,
        longitude: null as number | null,
        postal_code: '',
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                notifyError('A imagem deve ter no máximo 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                notifyError('Formato inválido. Use JPG, PNG ou WEBP');
                return;
            }

            try {
                const resizedBlob = await resizeImage(file, IMAGE_SIZES.avatar);
                setAvatarBlob(resizedBlob);
                const objectUrl = URL.createObjectURL(resizedBlob);
                setAvatarPreview(objectUrl);
            } catch (err) {
                console.error('Error resizing avatar:', err);
                notifyError('Erro ao processar imagem');
            }
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('username, full_name, phone, avatar_url')
                .eq('id', user.id)
                .maybeSingle() as any;

            if (profile?.phone) {
                router.push('/');
                return;
            }

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    username: profile.username || '',
                    full_name: profile.full_name || '',
                }));

                if (profile.avatar_url) {
                    setAvatarPreview(getR2Url(profile.avatar_url));
                }
            }

            setCheckingAuth(false);
        };

        checkUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.full_name || !formData.phone || !formData.location_city || !formData.location_state) {
            notifyError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            let avatarUrl = null;
            if (avatarBlob) {
                const path = `avatars/${user.id}/avatar.webp`;
                await uploadBlobToR2(path, avatarBlob, 'image/webp');
                const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
                avatarUrl = `${r2Url}/${path}`;
            }

            const updateData: any = {
                username: formData.username.toLowerCase().trim(),
                full_name: formData.full_name.trim(),
                phone: formData.phone.replace(/\D/g, ''),
                location_city: formData.location_city.trim(),
                location_state: formData.location_state,
                latitude: formData.latitude,
                longitude: formData.longitude,
                postal_code: formData.postal_code || null,
                onboarding_completed: true,
                id: user.id
            };

            if (avatarUrl) updateData.avatar_url = avatarUrl;

            const { error } = await (supabase as any)
                .from('profiles')
                .upsert(updateData);

            if (error) {
                if (error.message.includes('unique')) {
                    notifyError('Este nome de usuário já está em uso.');
                } else {
                    notifyError('Erro ao salvar perfil: ' + error.message);
                }
                return;
            }

            notifySuccess('Perfil configurado com sucesso!');
            router.push('/');
        } catch (err: any) {
            notifyError('Erro inesperado: ' + (err.message || 'Tente novamente'));
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500/30 font-display relative overflow-hidden flex flex-col items-center justify-center p-6">
            {/* Premium Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-600/5 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="flex justify-center mb-10">
                    <Logo width={200} height={50} showTagline={false} />
                </div>

                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-transparent pointer-events-none" />

                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tighter uppercase leading-none">
                            Quase Lá, <br />
                            <span className="text-orange-500">Comandante</span>
                        </h1>
                        <p className="text-gray-400 font-light text-lg">Precisamos de alguns detalhes para sua entrada oficial.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4 mb-10 group/avatar">
                            <div
                                className="relative w-32 h-32 rounded-3xl overflow-hidden cursor-pointer border-2 border-white/10 group-hover/avatar:border-orange-500/50 transition-all shadow-2xl"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-gray-400">
                                        <Camera className="w-10 h-10 mb-2 opacity-30" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Foto</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    <AtSign className="w-3 h-3" /> Identificador
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                        placeholder="seu_nome"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                    placeholder="João da Silva"
                                    required
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <Phone className="w-3 h-3" /> WhatsApp de Negócios
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData({ ...formData, phone: val });
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                placeholder="(11) 99999-9999"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Localização Estratégica
                            </label>

                            {!formData.location_city ? (
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all hover:border-blue-500/30">
                                    <LocationSelector
                                        onSelect={(result) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                location_city: result.address.city || '',
                                                location_state: result.address.stateCode || '',
                                                latitude: result.latitude,
                                                longitude: result.longitude,
                                                postal_code: result.address.postalCode || '',
                                            }));
                                        }}
                                        initialLocation={{ city: formData.location_city, state: formData.location_state }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl group/loc transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-black text-lg uppercase tracking-tight">{formData.location_city}, {formData.location_state}</div>
                                            <div className="text-xs text-blue-400/60 font-bold tracking-widest uppercase">Base Confirmada</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, location_city: '' }))}
                                        className="text-xs font-black text-gray-500 hover:text-white transition-colors p-2"
                                    >
                                        ALTERAR
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden group/btn"
                        >
                            <div className={`w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)] flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}>
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        ATIVAR PERFIL <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-gray-500 text-sm font-medium tracking-wide">
                    Sua identidade no <span className="text-gray-400">Universo {LABEL}</span> é protegida e exclusiva.
                </p>
            </motion.div>
        </div>
    );
}
