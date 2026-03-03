'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentProfile, supabase, getCurrentUser } from '@/lib/supabase';
import { Profile } from '@/lib/database.types';
import { uploadBlobToR2 } from '@/lib/images/uploadToR2';
import { resizeImage } from '@/lib/images/resizeImage';
import { IMAGE_SIZES } from '@/lib/images/imageSizes';
import { getR2Url } from '@/lib/images';
import { LocationSelector } from '@/components/shared/LocationSelector';


import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function EditProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [name, setName] = useState('');
    const [profession, setProfession] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [postalCode, setPostalCode] = useState('');

    const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
    const [showLocationSelector, setShowLocationSelector] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getCurrentProfile().then(p => {
            if (p) {
                setProfile(p);
                setName(p.username);
                setProfession(p.profession || '');
                setBio(p.bio || '');
                setWebsite(p.website || '');
                setAvatarUrl(p.avatar_url || '');
                setPhone(p.phone || '');
                setCity(p.location_city || '');
                setState(p.location_state || '');
                setLatitude(p.latitude || null);
                setLongitude(p.longitude || null);
                setPostalCode(p.postal_code || '');
            } else {
                // Redirect if not logged in
                router.push('/auth/login');
            }
        });
    }, [router]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Formato inválido. Use JPG, PNG ou WEBP.');
            return;
        }

        try {
            const resizedBlob = await resizeImage(file, IMAGE_SIZES.avatar);
            setAvatarBlob(resizedBlob);
            const objectUrl = URL.createObjectURL(resizedBlob);
            setAvatarUrl(objectUrl);
        } catch (err) {
            console.error('Error resizing avatar:', err);
            alert('Erro ao processar imagem.');
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        try {
            setLoading(true);
            const user = await getCurrentUser();
            if (!user) {
                alert('Você precisa estar logado.');
                return;
            }

            let newAvatarUrl = avatarUrl;

            if (avatarBlob) {
                try {
                    const fileName = `avatar.webp`;
                    const path = `avatars/${user.id}/${fileName}`;
                    await uploadBlobToR2(path, avatarBlob, 'image/webp');
                    const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
                    newAvatarUrl = `${r2Url}/${path}`;
                } catch (uploadErr: any) {
                    console.error('Avatar upload error:', uploadErr);
                    alert('Erro ao enviar foto: ' + uploadErr.message);
                    setLoading(false);
                    return;
                }
            }

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore - profiles table exists
                .update({
                    username: name.trim(),
                    profession: profession.trim() || null,
                    bio: bio.trim() || null,
                    website: website.trim() || null,
                    phone: phone.trim() || null,
                    location_city: city.trim() || null,
                    location_state: state || null,
                    avatar_url: newAvatarUrl,
                    latitude: latitude,
                    longitude: longitude,
                    postal_code: postalCode || null,
                })
                .eq('id', user.id);

            if (error) {
                console.error('Error saving profile:', error);
                alert('Erro ao salvar perfil.');
                return;
            }

            router.push('/profile/profile');
            router.refresh();
        } catch (err) {
            console.error('Save profile error:', err);
            alert('Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-6 sm:px-0">
                <div className="bg-card-dark rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Editar Perfil</h1>
                        <button
                            onClick={() => router.back()}
                            className="text-text-secondary hover:text-slate-900 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div
                                    className="size-24 rounded-full bg-cover bg-center border-2 border-primary/20"
                                    style={{ backgroundImage: `url(${avatarUrl || '/default-avatar.png'})` }}
                                >
                                    {!avatarUrl && (
                                        <div className="size-full rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        </div>
                                    )}
                                </div>
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-900 animate-spin">progress_activity</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <button
                                onClick={handleAvatarClick}
                                disabled={uploadingAvatar}
                                className="text-primary text-sm font-bold hover:text-primary/80 transition-colors disabled:opacity-50"
                            >
                                {uploadingAvatar ? 'Enviando...' : 'Alterar foto do perfil'}
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900">Nome de usuário</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-10 bg-slate-100 border border-primary/50 rounded-lg px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900">Profissão</label>
                                <input
                                    type="text"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    placeholder="Ex: Engenheiro, Designer, Logista..."
                                    className="w-full h-10 bg-slate-100 border border-primary/50 rounded-lg px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900">Telefone/WhatsApp</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '');
                                        if (value.length > 11) value = value.slice(0, 11);

                                        if (value.length > 10) {
                                            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                                        } else if (value.length > 5) {
                                            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                                        } else if (value.length > 2) {
                                            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                                        } else {
                                            value = value.replace(/^(\d*)/, '($1');
                                        }

                                        setPhone(value);
                                    }}
                                    className="w-full h-10 bg-slate-100 border border-primary/50 rounded-lg px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900 ">Localização</label>
                                {showLocationSelector ? (
                                    <div className="bg-slate-100 border border-primary/50 rounded-lg p-4">
                                        <LocationSelector
                                            onSelect={(result) => {
                                                setCity(result.address.city || '');
                                                setState(result.address.stateCode || '');
                                                setLatitude(result.latitude);
                                                setLongitude(result.longitude);
                                                setPostalCode(result.address.postalCode || '');
                                            }}
                                            onConfirm={() => setShowLocationSelector(false)}
                                            onCancel={() => setShowLocationSelector(false)}
                                            initialLocation={{ city, state }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-slate-100 border border-primary/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">location_on</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {city && state ? `${city}, ${state}` : 'Não definida'}
                                                </span>
                                                {postalCode && (
                                                    <span className="text-xs text-text-secondary">CEP: {postalCode}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowLocationSelector(true)}
                                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Alterar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    maxLength={160}
                                    className="w-full bg-slate-100 border border-primary/50 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                                    placeholder="Fale um pouco sobre você..."
                                />
                                <span className="text-xs text-text-secondary text-right">{bio.length}/160</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900">Site</label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full h-10 bg-slate-100 border border-primary/50 rounded-lg px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="https://seu-site.com"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => router.back()}
                                disabled={loading}
                                className="px-4 py-2 bg-slate-100 border border-primary/50 text-slate-900 font-medium text-sm rounded-lg hover:bg-slate-50/50 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || !name.trim()}
                                className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </>
    );
}
