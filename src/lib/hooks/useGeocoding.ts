import { useState, useCallback } from 'react';
import {
    GeocodingResult,
    searchByCEP,
    searchByCityState,
} from '@/services/geocoding';

interface UseGeocodingState {
    result: GeocodingResult | null;
    isLoading: boolean;
    error: string | null;
}

interface UseGeocodingReturn extends UseGeocodingState {
    searchCEP: (cep: string) => Promise<GeocodingResult | null>;
    searchCityState: (city: string, state: string, neighborhood?: string) => Promise<GeocodingResult | null>;
    clear: () => void;
}

/**
 * Hook para geocodificação de endereços
 * Usa a API Nominatim para buscar coordenadas a partir de CEP ou cidade/estado
 */
export function useGeocoding(): UseGeocodingReturn {
    const [state, setState] = useState<UseGeocodingState>({
        result: null,
        isLoading: false,
        error: null,
    });

    const searchCEP = useCallback(async (cep: string): Promise<GeocodingResult | null> => {
        // Remove caracteres não numéricos
        const cleanCEP = cep.replace(/\D/g, '');

        if (cleanCEP.length !== 8) {
            setState(prev => ({
                ...prev,
                error: 'CEP deve ter 8 dígitos',
                result: null,
            }));
            return null;
        }

        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            const result = await searchByCEP(cleanCEP);

            if (!result) {
                setState({
                    result: null,
                    isLoading: false,
                    error: 'CEP não encontrado. Verifique o número ou use a busca por cidade.',
                });
                return null;
            }

            setState({
                result,
                isLoading: false,
                error: null,
            });

            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao buscar CEP';
            setState({
                result: null,
                isLoading: false,
                error: message,
            });
            return null;
        }
    }, []);

    const searchCityState = useCallback(async (
        city: string,
        state: string,
        neighborhood?: string
    ): Promise<GeocodingResult | null> => {
        if (!city.trim() || !state.trim()) {
            setState(prev => ({
                ...prev,
                error: 'Cidade e estado são obrigatórios',
                result: null,
            }));
            return null;
        }

        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            const result = await searchByCityState(city.trim(), state.trim(), neighborhood?.trim());

            if (!result) {
                setState({
                    result: null,
                    isLoading: false,
                    error: 'Localização não encontrada. Verifique os dados informados.',
                });
                return null;
            }

            setState({
                result,
                isLoading: false,
                error: null,
            });

            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao buscar localização';
            setState({
                result: null,
                isLoading: false,
                error: message,
            });
            return null;
        }
    }, []);

    const clear = useCallback(() => {
        setState({
            result: null,
            isLoading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        searchCEP,
        searchCityState,
        clear,
    };
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCEPDisplay(cep: string): string {
    const clean = cep.replace(/\D/g, '');
    if (clean.length <= 5) return clean;
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
}

/**
 * Máscara de input para CEP
 */
export function maskCEP(value: string): string {
    const clean = value.replace(/\D/g, '').slice(0, 8);
    if (clean.length <= 5) return clean;
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}
