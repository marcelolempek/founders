'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin';
import { useNotify } from '@/components/ui/Toast';
import {
    LayoutGrid,
    Plus,
    Trash,
    Shield,
    Globe,
    Search,
    X,
    Check,
    AlertCircle,
    User,
    Link as LinkIcon,
    FileText,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getR2Url } from '@/lib/images';
import { uploadBlobToR2 } from '@/lib/images/uploadToR2';
import { resizeImage } from '@/lib/images/resizeImage';
import { IMAGE_SIZES } from '@/lib/images/imageSizes';

export default function AdminTenantsPage() {
    const notify = useNotify();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        is_private: false,
        access_code: '',
        owner_id: '',
        avatar_url: ''
    });

    const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [searchUsers, setSearchUsers] = useState<any[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const data = await adminService.getTenants();
            setTenants(data);
        } catch (err: any) {
            notify.error('Erro ao carregar universos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSearch = async (term: string) => {
        setUserSearchTerm(term);
        if (term.length < 3) {
            setSearchUsers([]);
            return;
        }
        try {
            const { users } = await adminService.getUsers(1, 10, term);
            setSearchUsers(users);
            setShowUserDropdown(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resized = await resizeImage(file, IMAGE_SIZES.avatar);
                setAvatarBlob(resized);
                setAvatarPreview(URL.createObjectURL(resized));
            } catch (err) {
                notify.error('Erro ao processar imagem');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) {
            notify.error('Preencha os campos obrigatórios');
            return;
        }

        setSubmitting(true);
        try {
            let finalAvatarUrl = '';
            if (avatarBlob) {
                const path = `tenants/${formData.slug}/logo.webp`;
                await uploadBlobToR2(path, avatarBlob, 'image/webp');
                finalAvatarUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${path}`;
            }

            await adminService.createTenant({
                ...formData,
                avatar_url: finalAvatarUrl || undefined
            });

            notify.success('Universo criado com sucesso!');
            setIsAdding(false);
            setFormData({
                name: '',
                slug: '',
                description: '',
                is_private: false,
                access_code: '',
                owner_id: '',
                avatar_url: ''
            });
            setAvatarPreview(null);
            fetchTenants();
        } catch (err: any) {
            notify.error('Erro ao criar universo: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o universo "${name}"? Todos os dados vinculados podem ser afetados.`)) return;
        try {
            await adminService.deleteTenant(id);
            notify.success('Universo excluído.');
            fetchTenants();
        } catch (err: any) {
            notify.error('Erro ao excluir: ' + err.message);
        }
    };

    // Auto-generate slug
    useEffect(() => {
        if (!isAdding) return;
        const generated = formData.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        if (generated && !formData.slug) {
            setFormData(prev => ({ ...prev, slug: generated }));
        }
    }, [formData.name, isAdding]);

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-8 max-w-7xl mx-auto w-full text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-orange-500" /> Gestão de Grupos
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Configure seus grupos</p>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isAdding ? 'bg-white/10 text-white' : 'bg-orange-600 text-white shadow-orange-900/20 hover:bg-orange-500'
                        }`}
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdding ? 'Cancelar' : 'Novo Grupo'}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Branding */}
                                <div className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <div
                                        className="size-24 rounded-2xl bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-orange-500 transition-all shadow-sm"
                                        onClick={() => document.getElementById('tenant-avatar-input')?.click()}
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <input type="file" id="tenant-avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">Logo do Universo</p>
                                        <p className="text-xs text-gray-400">Clique para fazer upload</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-orange-500" /> Nome Fantasia *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Igreja Batista da Aliança"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 transition-all font-medium text-white placeholder:text-gray-600"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-orange-500" /> Slug da URL *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">founders.com/</span>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-[136px] pr-4 focus:outline-none focus:border-orange-500 transition-all font-bold text-orange-500"
                                            placeholder="igreja-batista"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-orange-500" /> Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 transition-all font-medium text-white placeholder:text-gray-600"
                                        placeholder="Descreva o propósito deste universo..."
                                    />
                                </div>

                                <div className="flex items-center gap-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-lg flex items-center justify-center transition-all ${formData.is_private ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'bg-blue-500 text-white shadow-lg shadow-blue-900/40'}`}>
                                            {formData.is_private ? <Shield className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase text-white">{formData.is_private ? 'Privado' : 'Público'}</p>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Tipo de Acesso</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_private: !formData.is_private })}
                                        className="ml-auto px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-all shadow-sm"
                                    >
                                        ALTERAR
                                    </button>
                                </div>

                                {formData.is_private && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                        <label className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <Check className="w-4 h-4 text-orange-500" /> Senha / Código de Acesso (4 dígitos)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={formData.access_code}
                                            onChange={(e) => setFormData({ ...formData, access_code: e.target.value.toUpperCase() })}
                                            className="w-full placeholder-white/20 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-3xl font-black text-orange-500 tracking-widest focus:outline-none focus:border-orange-500"
                                            placeholder="1234"
                                            required
                                        />
                                    </motion.div>
                                )}

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4 text-orange-500" /> Administrador Dono (Opcional)
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={userSearchTerm}
                                            onChange={(e) => handleUserSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-all font-medium text-white placeholder:text-gray-600"
                                            placeholder="Buscar por @username..."
                                        />

                                        {formData.owner_id && !userSearchTerm && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 flex items-center gap-2 font-bold text-sm">
                                                Dono Selecionado <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {showUserDropdown && searchUsers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                            {searchUsers.map(u => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, owner_id: u.id });
                                                        setUserSearchTerm('');
                                                        setShowUserDropdown(false);
                                                        notify.success(`Dono: @${u.username}`);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left border-b last:border-0 border-white/5"
                                                >
                                                    <img src={getR2Url(u.avatar_url) || '/images/default-avatar.png'} className="size-8 rounded-full bg-white/5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">@{u.username}</p>
                                                        <p className="text-xs text-gray-500">{u.full_name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-orange-900/40 hover:bg-orange-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Criando...' : 'GERAR UNIVERSO'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-500">
                    <div className="size-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <p className="font-bold uppercase tracking-widest text-xs">Acessando Banco de Dados</p>
                </div>
            ) : tenants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-orange-500/10 hover:border-orange-500/20 transition-all group flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.is_private ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {t.is_private ? 'Privado' : 'Público'}
                                </div>
                            </div>

                            <div className="flex items-start mb-4">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    {t.avatar_url ? (
                                        <img src={getR2Url(t.avatar_url)} className="w-full h-full object-cover" />
                                    ) : (
                                        <LayoutGrid className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{t.name}</h3>
                            <p className="text-orange-500 text-xs font-bold mb-3">founders.com/{t.slug}</p>

                            <p className="text-gray-400 text-sm font-medium line-clamp-2 mb-4 grow">{t.description || 'Sem descrição definida.'}</p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-6 rounded-full bg-white/10 overflow-hidden">
                                        <img src={getR2Url(t.owner?.avatar_url) || '/images/default-avatar.png'} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">@{t.owner?.username || 'founders'}</span>
                                </div>

                                <button
                                    onClick={() => handleDelete(t.id, t.name)}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] py-20 text-center">
                    <LayoutGrid className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 uppercase tracking-tighter">Nenhum Universo Criado</h2>
                    <p className="text-gray-600 font-medium max-w-sm mx-auto mt-2 px-6 text-sm">Clique em "Novo Universo" para segmentar sua plataforma por grupos, igrejas ou empresas.</p>
                </div>
            )}
        </div>
    );
}
