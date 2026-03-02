'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '@/lib/supabase';

interface FilterOptions {
    category: string | null;
    priceMin: string;
    priceMax: string;
    condition: string | null;
    location: string;
    sortBy: string;
    verifiedOnly: boolean;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    initialFilters?: Partial<FilterOptions>;
}

const categories = [
    { id: 'rifles', label: 'Rifles' },
    { id: 'pistols', label: 'Pistolas' },
    { id: 'smgs', label: 'SMGs' },
    { id: 'shotguns', label: 'Shotguns' },
    { id: 'snipers', label: 'Snipers' },
    { id: 'gear', label: 'Produtos/Serviços' },
    { id: 'accessories', label: 'Acessórios' },
    { id: 'parts', label: 'Peças' },
    { id: 'clothing', label: 'Vestuário' },
];

const conditions = [
    { id: 'new', label: 'Novo' },
    { id: 'like-new', label: 'Seminovo' },
    { id: 'good', label: 'Bom Estado' },
    { id: 'fair', label: 'Usado' },
    { id: 'poor', label: 'Defeito / Ruim' },
];

const sortOptions = [
    { id: 'recent', label: 'Mais Recentes' },
    { id: 'price-low', label: 'Menor Preço' },
    { id: 'price-high', label: 'Maior Preço' },
    { id: 'popular', label: 'Mais Populares' },
];

export function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterOptions>({
        category: initialFilters?.category || null,
        priceMin: initialFilters?.priceMin || '',
        priceMax: initialFilters?.priceMax || '',
        condition: initialFilters?.condition || null,
        location: initialFilters?.location || '',
        sortBy: initialFilters?.sortBy || 'recent',
        verifiedOnly: initialFilters?.verifiedOnly || false,
    });

    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
        const fetchCities = async () => {
            if (isOpen) {
                setLoadingCities(true);
                const { data } = await supabase
                    .from('posts')
                    .select('location_city')
                    .eq('status', 'active')
                    .not('location_city', 'is', null);

                if (data) {
                    const uniqueCities = Array.from(new Set((data as any[]).map(p => p.location_city?.toUpperCase())))
                        .filter(Boolean)
                        .sort() as string[];
                    setCities(uniqueCities);
                }
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, [isOpen]);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            category: null,
            priceMin: '',
            priceMax: '',
            condition: null,
            location: '',
            sortBy: 'recent',
            verifiedOnly: false,
        });
    };

    const activeFiltersCount = [
        filters.category,
        filters.priceMin || filters.priceMax,
        filters.condition,
        filters.location,
    ].filter(Boolean).length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Filtros" size="md">
            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                {/* Sort By */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Ordenar por</label>
                    <div className="flex flex-wrap gap-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setFilters(prev => ({ ...prev, sortBy: option.id }))}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.sortBy === option.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-[#1D4165] border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Categoria</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    category: prev.category === cat.id ? null : cat.id
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.category === cat.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-[#1D4165] border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Faixa de Preço</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                            <input
                                type="text"
                                value={filters.priceMin}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value.replace(/\D/g, '') }))}
                                placeholder="Min"
                                className="w-full h-10 bg-[#0E2741] border border-white/10 rounded-lg pl-10 pr-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <span className="text-slate-500">-</span>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                            <input
                                type="text"
                                value={filters.priceMax}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value.replace(/\D/g, '') }))}
                                placeholder="Max"
                                className="w-full h-10 bg-[#0E2741] border border-white/10 rounded-lg pl-10 pr-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Condition */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Condição</label>
                    <div className="flex flex-wrap gap-2">
                        {conditions.map((cond) => (
                            <button
                                key={cond.id}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    condition: prev.condition === cond.id ? null : cond.id
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.condition === cond.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-[#1D4165] border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {cond.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Localização (Cidade)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">location_on</span>
                        <select
                            value={filters.location}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full h-10 bg-[#0E2741] border border-white/10 rounded-lg pl-10 pr-8 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        >
                            <option value="">Todas as cidades</option>
                            {loadingCities ? (
                                <option disabled>Carregando...</option>
                            ) : (
                                cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))
                            )}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#1D4165] -mx-6 px-6 -mb-6 pb-6">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-medium text-sm rounded-lg hover:bg-white/10 transition-colors"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        Aplicar
                        {activeFiltersCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-white text-primary text-[10px] font-bold rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
