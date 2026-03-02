'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useNotify } from '@/components/ui/Toast';
import { uploadBlobToR2 } from '@/lib/images/uploadToR2';
import { resizeImage } from '@/lib/images/resizeImage';
import { IMAGE_SIZES } from '@/lib/images/imageSizes';
import { LocationSelector } from '@/components/shared/LocationSelector';
import { getR2Url } from '@/lib/images';
import type { GeocodingResult } from '@/services/geocoding';

import Logo from '@/components/shared/Logo';

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
            // Validate size (5MB) - Initial check before resize
            if (file.size > 5 * 1024 * 1024) {
                notifyError('A imagem deve ter no máximo 5MB');
                return;
            }

            // Validate type
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

                // Cleanup previous object URL to avoid leaks
                return () => URL.revokeObjectURL(objectUrl);
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
                .single() as any;

            // If profile already has phone, it's complete
            if (profile?.phone) {
                router.push('/');
                return;
            }

            // Pre-fill form with existing data (e.g. from Google)
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
                notifyError('Sessão expirada. Faça login novamente.');
                router.push('/auth/login');
                return;
            }

            let avatarUrl = null;
            if (avatarBlob) {
                try {
                    const fileName = `avatar.webp`;
                    const path = `avatars/${user.id}/${fileName}`;

                    await uploadBlobToR2(path, avatarBlob, 'image/webp');

                    // Construct public URL
                    const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
                    avatarUrl = `${r2Url}/${path}`;
                } catch (uploadErr: any) {
                    console.error('Avatar upload error:', uploadErr);
                    notifyError('Erro ao enviar foto: ' + uploadErr.message);
                    setLoading(false);
                    return;
                }
            }

            const updateData: any = {
                username: formData.username.toLowerCase().trim(),
                full_name: formData.full_name.trim(),
                phone: formData.phone.replace(/\D/g, ''),
                location_city: formData.location_city.trim() || null,
                location_state: formData.location_state || null,
                latitude: formData.latitude,
                longitude: formData.longitude,
                postal_code: formData.postal_code || null,
            };

            if (avatarUrl) {
                updateData.avatar_url = avatarUrl;
            }

            const { error } = await (supabase as any)
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);

            if (error) {
                if (error.message.includes('unique') || error.message.includes('duplicate')) {
                    notifyError('Este nome de usuário já está em uso. Escolha outro.');
                } else {
                    notifyError('Erro ao salvar perfil: ' + error.message);
                }
                return;
            }

            notifySuccess('Perfil completado com sucesso!');
            router.push('/');
        } catch (err: any) {
            notifyError('Erro inesperado: ' + (err.message || 'Tente novamente'));
            console.error('Profile completion error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark"></div>
                <div className="absolute inset-0 bg-blue-500/5 opacity-10"></div>
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4">
                <div className="w-full max-w-[480px] flex flex-col gap-8 animate-fade-in-up">

                    <div className="flex flex-col items-center gap-6 text-center">
                        <Logo width={240} height={60} showTagline={false} />
                        <div>
                            <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">
                                Complete seu Perfil
                            </h1>
                            <p className="text-[#94a3b8] text-base leading-relaxed">
                                Precisamos de algumas informações para personalizar sua experiência
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">

                        <div className="flex flex-col items-center gap-4 mb-2">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div
                                    className={`size-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary ${avatarPreview ? 'border-solid border-primary' : ''}`}
                                    style={avatarPreview ? { backgroundImage: `url("${getR2Url(avatarPreview)}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!avatarPreview && (
                                        <span className="material-symbols-outlined text-[#557761] text-3xl group-hover:text-primary transition-colors">add_a_photo</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-lg transform translate-x-1 translate-y-1">
                                    <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-xs text-[#557761]">Toque para adicionar uma foto</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold flex items-center gap-1">
                                Nome de Usuário
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">@</span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="seu_usuario"
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 placeholder-[#557761] focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                    pattern="[a-zA-Z0-9_]{3,20}"
                                    title="3-20 caracteres: letras, números e underscore"
                                />
                            </div>
                            <p className="text-xs text-[#557761]">3-20 caracteres (letras, números e _)</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold flex items-center gap-1">
                                Nome Completo
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="João Silva"
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-[#557761] focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold flex items-center gap-1">
                                WhatsApp
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </span>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        let formatted = value;
                                        if (value.length > 10) {
                                            formatted = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                                        } else if (value.length > 6) {
                                            formatted = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                                        } else if (value.length > 2) {
                                            formatted = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                                        } else if (value.length > 0) {
                                            formatted = value.replace(/^(\d*)/, '($1');
                                        }
                                        setFormData({ ...formData, phone: formatted });
                                    }}
                                    placeholder="(11) 98765-4321"
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 placeholder-[#557761] focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                    maxLength={15}
                                />
                            </div>
                            <p className="text-xs text-[#557761]">Será usado para contato nas negociações</p>
                        </div>


                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">
                                Localização <span className="text-red-500">*</span>
                            </label>

                            {!formData.location_city ? (
                                <div className="bg-white border border-slate-200 rounded-lg p-4">
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
                                <div className="flex items-center justify-between p-4 bg-white border border-primary/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">location_on</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">
                                                {formData.location_city}, {formData.location_state}
                                            </span>
                                            {formData.postal_code && (
                                                <span className="text-xs text-text-secondary">CEP: {formData.postal_code}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, location_city: '' }))}
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Alterar
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 rounded-lg bg-primary hover:bg-[#0fd658] h-12 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    <span>Completar Cadastro</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[#557761] text-sm">
                        Você poderá editar essas informações depois no seu perfil
                    </p>
                </div>
            </div>
        </div>
    );
}
