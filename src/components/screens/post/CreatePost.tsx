'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Modal } from '@/components/ui/Modal';
import { useCreatePost } from '@/lib/hooks/usePosts';
import { useNotify } from '@/components/ui/Toast';
import { getCurrentProfile } from '@/lib/supabase';
import { useNavigation } from '@/context/NavigationContext';
import { useGeocoding, maskCEP } from '@/lib/hooks/useGeocoding';
import { LocationSelector } from '@/components/shared/LocationSelector';
import { getR2Url } from '@/lib/images';
import type { GeocodingResult } from '@/services/geocoding';

import type { Profile, PostCondition } from '@/lib/database.types';

const categories = [
    { id: 'technology', label: 'Tecnologia', icon: 'dvr' },
    { id: 'services', label: 'Serviços', icon: 'business_center' },
    { id: 'consulting', label: 'Consultoria', icon: 'psychology' },
    { id: 'marketing', label: 'Marketing', icon: 'campaign' },
    { id: 'design', label: 'Design', icon: 'palette' },
    { id: 'products', label: 'Produtos', icon: 'inventory_2' },
    { id: 'tools', label: 'Ferramentas', icon: 'handyman' },
    { id: 'networking', label: 'Networking', icon: 'groups' },
    { id: 'legal', label: 'Jurídico', icon: 'gavel' },
    { id: 'other', label: 'Outros', icon: 'more_horiz' },
];



const conditions: { id: PostCondition; label: string }[] = [
    { id: 'new', label: 'Novo' },
    { id: 'like-new', label: 'Seminovo' },
    { id: 'good', label: 'Bom' },
    { id: 'fair', label: 'Regular' },
    { id: 'poor', label: 'Usado' },
];

interface CreatePostProps {
    isModal?: boolean;
    onClose?: () => void;
}

export default function CreatePost({ isModal, onClose }: CreatePostProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { createPost, loading, progress } = useCreatePost();
    const { error: notifyError } = useNotify();
    const { openPostDetail } = useNavigation();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [postType, setPostType] = useState<'sale' | 'text' | null>(null); // New: track selected post type
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState({ city: '', state: '' });
    const [category, setCategory] = useState<string | null>(null);
    const [condition, setCondition] = useState<PostCondition>('good');
    const [shipsNationwide, setShipsNationwide] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Geocoding state
    const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
    const geocoding = useGeocoding();

    // Modal states
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showConditionModal, setShowConditionModal] = useState(false);

    // Temporary values for modals
    const [tempPrice, setTempPrice] = useState('');
    const { user } = useUser();
    // Load user profile on mount
    useEffect(() => {
        getCurrentProfile().then(p => {
            if (p) {
                setProfile(p);
                if (p.location_city) setLocation({ city: p.location_city, state: p.location_state || '' });
                // Set default ships_nationwide from profile
                if (p.default_ships_nationwide) setShipsNationwide(p.default_ships_nationwide);
            }
        });
    }, []);

    const handlePriceSubmit = () => {
        setPrice(tempPrice);
        setShowPriceModal(false);
    };

    const handleLocationConfirm = () => {
        if (geocodingResult) {
            setLocation({
                city: geocodingResult.address.city || '',
                state: geocodingResult.address.stateCode || '',
            });
        }
        setShowLocationModal(false);
    };

    const handleLocationModalClose = () => {
        setShowLocationModal(false);
        // Clean up or reset if needed
        geocoding.clear();
    };

    const handleCategorySelect = (categoryId: string) => {
        setCategory(categoryId);
        setShowCategoryModal(false);
    };

    const handleConditionSelect = (conditionId: PostCondition) => {
        setCondition(conditionId);
        setShowConditionModal(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remainingSlots = 10 - imageFiles.length;
        const newFiles = files.slice(0, remainingSlots);

        // Create previews
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        setImageFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation based on post type
        // Validation based on post type
        if (postType === 'sale') {
            if (!description) {
                notifyError('Descreva o que você está vendendo');
                return;
            }
            if (!price) {
                notifyError('Defina um preço para o seu item');
                return;
            }
            if (!category) {
                notifyError('Selecione uma categoria para o anúncio');
                return;
            }
            if (!location.city) {
                notifyError('Informe a localização do item');
                return;
            }
        } else if (postType === 'text') {
            if (!description) {
                notifyError('Escreva algo para publicar antes de enviar');
                return;
            }
        }

        if (description.length < 5) {
            notifyError('A descrição está muito curta. Escreva pelo menos 5 caracteres.');
            return;
        }

        // Extract title from first line of description
        const title = description.split('\n')[0].slice(0, 100);
        const priceValue = parseInt(price.replace(/\D/g, ''), 10);

        const postId = await createPost({
            title,
            description,
            price: postType === 'sale' ? priceValue : null,
            category: postType === 'sale' ? category : null,
            condition: postType === 'sale' ? condition : 'good',
            type: postType || 'sale',
            location_city: location.city || null,
            location_state: location.state || null,
            ships_nationwide: postType === 'sale' ? shipsNationwide : false,
            images: imageFiles,
            // Geocoding data
            latitude: geocodingResult?.latitude || null,
            longitude: geocodingResult?.longitude || null,
            postal_code: geocodingResult?.address.postalCode || null,
            formatted_address: geocodingResult?.displayName || null,
            neighborhood: geocodingResult?.address.neighborhood || null,
        });

        if (postId) {
            if (isModal && onClose) {
                onClose();
            }
            openPostDetail(postId);
        }
    };

    const formatPrice = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (!numbers) return '';
        const amount = parseInt(numbers, 10);
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getCategoryLabel = () => {
        if (!category) return null;
        return categories.find(c => c.id === category)?.label;
    };

    const getLocationLabel = () => {
        if (!location.city && !location.state) return null;
        return `${location.city}, ${location.state}`;
    };


    // Type selection screen
    if (!postType) {
        return (
            <div className={`w-full bg-[#0e2741] border-x border-white/5 shadow-2xl relative flex flex-col min-h-screen ${isModal ? '!min-h-0 !bg-transparent !shadow-none !border-none' : ''}`}>
                {!isModal && (
                    <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-20 bg-[#0e2741]/95 backdrop-blur-md border-b border-white/10">
                        <Link href="/" aria-label="Cancel" className="group flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white">
                            <span className="material-symbols-outlined group-hover:text-red-400 transition-colors">close</span>
                        </Link>
                        <h2 className="text-lg font-bold tracking-tight text-white">Novo Post</h2>
                        <div className="w-10"></div>
                    </header>
                )}
                <main className="flex-1 flex flex-col items-center justify-center px-0 py-5 gap-6 w-full">
                    <div className="text-center mb-2">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            O que você quer fazer?
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Escolha o tipo de publicação
                        </p>
                    </div>

                    <div className="w-full  max-w-sm flex flex-col gap-4">
                        <button
                            onClick={() => setPostType('sale')}
                            className="flex cursor-pointer flex-col items-center gap-1 p-8 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all active:scale-[0.98]"
                        >
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[32px]">
                                    sell
                                </span>
                            </div>
                            <div className="text-center ">
                                <h4 className="text-lg font-bold text-white mb-1">
                                    Venda Comercial
                                </h4>
                                <p className="text-sm text-slate-400">
                                    Anuncie seus Produtos ou Serviços no Marketplace
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => setPostType('text')}
                            className="flex cursor-pointer flex-col items-center gap-4 p-8 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all active:scale-[0.98]"
                        >
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[32px]">
                                    article
                                </span>
                            </div>
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-white mb-1">
                                    Post de Conteúdo
                                </h4>
                                <p className="text-sm text-slate-400">
                                    Compartilhe dúvidas, eventos, discussões e dicas
                                </p>
                            </div>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <div className={`w-full max-w-lg bg-[#0e2741] border-x border-white/5 shadow-2xl relative flex flex-col min-h-screen ${isModal ? '!min-h-0 h-full !bg-transparent !shadow-none !border-none' : ''}`}>
                {/*  Header  */}
                <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-20 bg-[#0e2741]/95 backdrop-blur-md border-b border-white/10">
                    {isModal ? (
                        <button onClick={onClose} aria-label="Cancel" className="group flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer">
                            <span className="material-symbols-outlined group-hover:text-red-400 transition-colors">close</span>
                        </button>
                    ) : (
                        <Link href="/" aria-label="Cancel" className="group flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white">
                            <span className="material-symbols-outlined group-hover:text-red-400 transition-colors">close</span>
                        </Link>
                    )}
                    <h2 className="text-lg font-bold tracking-tight text-white">Nova Publicação</h2>
                    <button
                        onClick={() => setPostType(null)}
                        className="text-sm font-semibold text-[#2563eb] hover:text-[#2563eb]/80 px-4 py-2 rounded-lg hover:bg-[#2563eb]/10 transition-colors"
                    >
                        Voltar
                    </button>
                </header>
                {/*  Scrollable Content  */}
                <main className="flex-1 flex flex-col px-5 py-6 gap-6 overflow-y-auto bg-[#0e2741]">
                    {/*  User Context  */}
                    <div className="flex items-center gap-3 animate-fade-in">
                        {/* Div da Foto - Priorizando Google Metadata */}
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-[#334155] shrink-0"
                            style={{
                                backgroundImage: `url("${getR2Url(user?.user_metadata?.avatar_url || profile?.avatar_url) || '/images/default-avatar.png'}")`
                            }}
                        />


                        <div className="flex flex-col">
                            {/* Nome - Priorizando Nome do Google (full_name) */}
                            <span className="text-base font-bold text-white leading-tight">
                                {user?.user_metadata?.full_name || profile?.full_name || profile?.username || 'Carregando...'}
                            </span>

                            {/* Botão de Status/Privacidade */}
                            <button className="flex items-center gap-1 text-xs font-medium text-[#557761] bg-white px-2 py-0.5 rounded-full mt-1 w-fit border border-slate-200 hover:bg-slate-50 transition-all">
                                <span className="material-symbols-outlined text-[14px]">public</span>
                                <span>Público</span>
                                <span className="material-symbols-outlined text-[12px]">expand_more</span>
                            </button>
                        </div>
                    </div>
                    {/*  Text Input Area  */}
                    <div className="flex-1 min-h-[280px]">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-[1.1rem] placeholder-slate-500 text-white resize-none h-full p-0 leading-relaxed font-normal"
                            placeholder={postType === 'sale'
                                ? "O que você está negociando hoje? Descreva seu serviço ou produto em detalhes..."
                                : "Qual insight você quer compartilhar? Divida sua experiência com outros empreendedores..."}
                        />
                    </div>
                    {/*  Smart Options (Chips)  */}
                    <div className="flex gap-2 flex-wrap pb-2">
                        {postType === 'sale' && (
                            <button
                                onClick={() => {
                                    setTempPrice(price.replace(/\D/g, ''));
                                    setShowPriceModal(true);
                                }}
                                className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all group min-h-[44px] ${price
                                    ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                                    : 'bg-white border-slate-200 text-[#8aa895] hover:text-slate-900 hover:border-[#2563eb]/50 hover:bg-white/80'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#2563eb]">sell</span>
                                <span>{price || 'Preço'}</span>
                                {price && (
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setShowLocationModal(true);
                            }}
                            className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all group min-h-[44px] ${location.city
                                ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                                : 'bg-white border-slate-200 text-[#8aa895] hover:text-slate-900 hover:border-[#2563eb]/50 hover:bg-white/80'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px] text-[#2563eb]">location_on</span>
                            <span>{getLocationLabel() || 'Localização'}</span>
                            {location.city && (
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            )}
                        </button>

                        {postType === 'sale' && (
                            <button
                                onClick={() => setShowCategoryModal(true)}
                                className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all group min-h-[44px] ${category
                                    ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                                    : 'bg-white border-slate-200 text-[#8aa895] hover:text-slate-900 hover:border-[#2563eb]/50 hover:bg-white/80'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#2563eb]">category</span>
                                <span>{getCategoryLabel() || 'Categoria'}</span>
                                {category && (
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                )}
                            </button>
                        )}

                        {/* Ships Nationwide Checkbox - only for sale */}
                        {postType === 'sale' && (
                            <button
                                onClick={() => setShowConditionModal(true)}
                                className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all group min-h-[44px] ${condition
                                    ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                                    : 'bg-white border-slate-200 text-[#8aa895] hover:text-slate-900 hover:border-[#2563eb]/50 hover:bg-white/80'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#2563eb]">verified</span>
                                <span>{conditions.find(c => c.id === condition)?.label || 'Condição'}</span>
                                {condition && (
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                )}
                            </button>
                        )}

                        {postType === 'sale' && (
                            <button
                                onClick={() => setShipsNationwide(!shipsNationwide)}
                                className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all group min-h-[44px] ${shipsNationwide
                                    ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                                    : 'bg-white border-slate-200 text-[#8aa895] hover:text-slate-900 hover:border-[#2563eb]/50 hover:bg-white/80'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#2563eb]">local_shipping</span>
                                <span>Envio Nacional</span>
                                {shipsNationwide && (
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                )}
                            </button>
                        )}
                    </div>
                    {/*  Media Preview Section  */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">photo_library</span>
                                Fotos <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded ml-1 font-normal uppercase tracking-wider">4:5</span>
                            </h3>
                            <span className="text-xs font-medium text-slate-400">{imagePreviews.length}/10</span>
                        </div>
                        {/*  Horizontal Scroll for Images  */}
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide snap-x">
                            {/*  Upload Button  */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imagePreviews.length >= 10}
                                className="snap-start shrink-0 w-32 h-40 rounded-xl border-2 border-dashed border-[#3b5444] bg-white/30 hover:bg-[#2563eb]/10 hover:border-[#2563eb] flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-[#2563eb] transition-colors">
                                    <span className="material-symbols-outlined text-[#8aa895] group-hover:text-[#0f172a] text-2xl">add</span>
                                </div>
                                <span className="text-xs font-bold text-[#8aa895] group-hover:text-[#2563eb]">Adicionar</span>
                            </button>
                            {/*  Images  */}
                            {imagePreviews.map((image, index) => (
                                <div key={index} className="relative group snap-start shrink-0 w-32 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="bg-slate-50/80 hover:bg-red-500/90 text-slate-900 rounded-full p-1.5 backdrop-blur-sm transition-colors flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </div>
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105 duration-500"
                                        style={{ backgroundImage: `url("${image}")` }}
                                    />
                                    {/*  Cover Label for first image  */}
                                    {index === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider bg-[#2563eb] text-[#0f172a] px-1.5 py-0.5 rounded-sm">Capa</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                {/*  Footer Action  */}
                <div className="w-full z-20 p-5 border-t border-white/5 bg-[#0e2741] pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                    {loading && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-[#557761] mb-1">
                                <span>Publicando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-[#2563eb] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {!loading && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                Publicar em <strong>Feed Público</strong>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                Criptografado
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !description || (postType === 'sale' && (!price || !location.city || !category))}
                        className="w-full flex items-center justify-center h-14 rounded-2xl bg-primary hover:bg-primary-light active:scale-[0.98] text-white text-base font-bold tracking-wide transition-all shadow-lg shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale disabled:hover:bg-primary cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                Publicando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined mr-2">send</span>
                                Publicar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Price Modal */}
            <Modal isOpen={showPriceModal} onClose={() => setShowPriceModal(false)} title="Definir Preço" size="sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Preço (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                            <input
                                type="text"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value.replace(/\D/g, ''))}
                                placeholder="0"
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <p className="text-xs text-slate-400">
                            {tempPrice ? formatPrice(tempPrice) : 'Digite o preço do seu item'}
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end mt-2">
                        <button
                            onClick={() => setShowPriceModal(false)}
                            className="px-5 py-2.5 bg-white/5 text-white font-medium text-sm rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handlePriceSubmit}
                            disabled={!tempPrice}
                            className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Location Modal */}
            <Modal isOpen={showLocationModal} onClose={handleLocationModalClose} title="Definir Localização" size="sm">
                <LocationSelector
                    onSelect={(result) => setGeocodingResult(result)}
                    onConfirm={handleLocationConfirm}
                    onCancel={handleLocationModalClose}
                    initialLocation={{ city: location.city, state: location.state }}
                />
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Selecionar Categoria" size="md">
                <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left cursor-pointer ${category === cat.id
                                ? 'border-primary bg-primary/10'
                                : 'border-white/5 bg-white/5 hover:border-primary/50'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[24px] ${category === cat.id ? 'text-primary' : 'text-slate-400'
                                }`}>
                                {cat.icon}
                            </span>
                            <span className={`text-sm font-bold ${category === cat.id ? 'text-primary' : 'text-white'
                                }`}>
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Condition Modal */}
            <Modal isOpen={showConditionModal} onClose={() => setShowConditionModal(false)} title="Condição do Item" size="sm">
                <div className="flex flex-col gap-2">
                    {conditions.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleConditionSelect(item.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${condition === item.id
                                ? 'border-primary bg-primary/10'
                                : 'border-white/5 bg-white/5 hover:border-primary/50'
                                }`}
                        >
                            <span className={`text-sm font-bold ${condition === item.id ? 'text-primary' : 'text-white'}`}>
                                {item.label}
                            </span>
                            {condition === item.id && (
                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    );
}

