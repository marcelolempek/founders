'use client';

import React, { useState, useEffect } from 'react';
import { useGeocoding, maskCEP } from '@/lib/hooks/useGeocoding';
import type { GeocodingResult } from '@/services/geocoding';

const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface LocationSelectorProps {
    onSelect: (result: GeocodingResult) => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    initialLocation?: { city: string; state: string };
    confirmDisabled?: boolean;
}

export function LocationSelector({ onSelect, onCancel, onConfirm, initialLocation, confirmDisabled }: LocationSelectorProps) {
    const geocoding = useGeocoding();
    const [locationMode, setLocationMode] = useState<'cep' | 'city'>('cep');

    // Temporary values
    const [tempCEP, setTempCEP] = useState('');
    const [tempCity, setTempCity] = useState(initialLocation?.city || '');
    const [tempState, setTempState] = useState(initialLocation?.state || '');
    const [tempNeighborhood, setTempNeighborhood] = useState('');

    useEffect(() => {
        if (initialLocation) {
            setTempCity(initialLocation.city);
            setTempState(initialLocation.state);
        }
    }, [initialLocation]);

    const handleCEPSearch = async () => {
        const result = await geocoding.searchCEP(tempCEP);
        if (result) {
            onSelect(result);
            setTempCity(result.address.city || '');
            setTempState(result.address.stateCode || '');
            setTempNeighborhood(result.address.neighborhood || '');
        }
    };

    const handleCityStateSearch = async () => {
        const result = await geocoding.searchCityState(tempCity, tempState, tempNeighborhood);
        if (result) {
            onSelect(result);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 rounded-lg">
                <button
                    onClick={() => { setLocationMode('cep'); geocoding.clear(); }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${locationMode === 'cep'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-slate-900'
                        }`}
                >
                    Buscar por CEP
                </button>
                <button
                    onClick={() => { setLocationMode('city'); geocoding.clear(); }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${locationMode === 'city'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-slate-900'
                        }`}
                >
                    Cidade/Estado
                </button>
            </div>

            {locationMode === 'cep' ? (
                <>
                    {/* CEP Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-900">CEP</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tempCEP}
                                onChange={(e) => setTempCEP(maskCEP(e.target.value))}
                                placeholder="00000-000"
                                maxLength={9}
                                className="flex-1 h-12 bg-slate-100 border border-primary/50 rounded-lg px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={handleCEPSearch}
                                disabled={geocoding.isLoading || tempCEP.replace(/\D/g, '').length !== 8}
                                className="h-12 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {geocoding.isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={() => setLocationMode('city')}
                            className="text-xs text-text-secondary hover:text-primary transition-colors text-left"
                        >
                            Não sei meu CEP
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* City/State Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-900">Cidade</label>
                        <input
                            type="text"
                            value={tempCity}
                            onChange={(e) => setTempCity(e.target.value)}
                            placeholder="São Paulo"
                            className="w-full h-12 bg-slate-100 border border-primary/50 rounded-lg px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Estado</label>
                        <select
                            value={tempState}
                            onChange={(e) => setTempState(e.target.value)}
                            className="w-full h-12 bg-slate-100 border border-primary/50 rounded-lg px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                        >
                            <option value="">Selecione o estado</option>
                            {brazilianStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Bairro (opcional)</label>
                        <input
                            type="text"
                            value={tempNeighborhood}
                            onChange={(e) => setTempNeighborhood(e.target.value)}
                            placeholder="Centro"
                            className="w-full h-10 bg-slate-100 border border-primary/50 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button
                        onClick={handleCityStateSearch}
                        disabled={geocoding.isLoading || !tempCity || !tempState}
                        className="w-full h-10 bg-slate-100 border border-primary/50 text-slate-900 font-medium rounded-lg hover:bg-slate-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {geocoding.isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">search</span>
                                Buscar localização
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Error Message */}
            {geocoding.error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {geocoding.error}
                </div>
            )}

            {/* Result Preview */}
            {geocoding.result && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">location_on</span>
                        <div className="flex-1">
                            <p className="text-slate-900 font-medium text-sm">
                                {geocoding.result.address.city}, {geocoding.result.address.stateCode}
                            </p>
                            {geocoding.result.address.neighborhood && (
                                <p className="text-text-secondary text-xs mt-0.5">
                                    {geocoding.result.address.neighborhood}
                                </p>
                            )}
                            <p className="text-text-secondary text-xs mt-1 opacity-75">
                                {geocoding.result.displayName.slice(0, 80)}...
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                                <span>Lat: {geocoding.result.latitude.toFixed(4)}</span>
                                <span>Lon: {geocoding.result.longitude.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(onCancel || onConfirm) && (
                <div className="flex gap-3 justify-end pt-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2.5 bg-slate-100 border border-primary/50 text-slate-900 font-medium text-sm rounded-lg hover:bg-slate-50/50 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={confirmDisabled || (!geocoding.result && !tempCity)}
                            className="px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirmar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
