/**
 * Serviço de Geocodificação usando API Nominatim (OpenStreetMap)
 *
 * Rate Limiting: Máximo 1 requisição por segundo (conforme TOS)
 * User-Agent: Obrigatório identificar a aplicação
 */

// Tipos de dados retornados pela API Nominatim
export interface NominatimAddress {
    road?: string;
    suburb?: string; // Bairro
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
}

export interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: NominatimAddress;
    class: string;
    type: string;
    importance: number;
    boundingbox: string[];
}

// Resultado processado para uso na aplicação
export interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName: string;
    address: {
        road?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        stateCode?: string;
        postalCode?: string;
        country?: string;
    };
    type: string;
    confidence: 'high' | 'medium' | 'low';
    raw: NominatimResult;
}

// Interface ViaCEP
export interface ViaCEPResult {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

// Mapeamento de estados brasileiros
const BRAZIL_STATES: Record<string, string> = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO',
};

const BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Empreendedores de Cristo/1.0 (https://Empreendedores de Cristo.com)';

// Rate limiting simples - última requisição
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 segundos para garantir

// Cache de CEPs
const cepCache = new Map<string, GeocodingResult>();

/**
 * Aguarda para respeitar o rate limit
 */
async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;

    if (elapsed < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
    }

    lastRequestTime = Date.now();
}

/**
 * Formata CEP removendo caracteres especiais
 */
function formatCEP(cep: string): string {
    return cep.replace(/\D/g, '');
}

/**
 * Extrai a sigla do estado do nome completo
 */
function getStateCode(stateName: string | undefined): string | undefined {
    if (!stateName) return undefined;

    // Se já é uma sigla de 2 caracteres
    if (stateName.length === 2) {
        return stateName.toUpperCase();
    }

    // Procura no mapeamento
    return BRAZIL_STATES[stateName];
}

/**
 * Determina a confiança do resultado
 */
function getConfidence(result: NominatimResult): 'high' | 'medium' | 'low' {
    // CEP exato = alta confiança
    if (result.type === 'postcode') return 'high';

    // Endereço específico = alta confiança
    if (result.address.road) return 'high';

    // Cidade/bairro = média confiança
    if (result.address.suburb || result.address.city) return 'medium';

    return 'low';
}

/**
 * Normaliza endereço para busca (remove acentos, caracteres especiais)
 */
function normalizeAddress(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s]/g, ' ') // Remove caracteres especiais
        .replace(/\s+/g, ' ') // Remove espaços duplicados
        .trim();
}

/**
 * Busca endereço no ViaCEP
 */
async function fetchViaCEP(cep: string): Promise<ViaCEPResult | null> {
    const formattedCEP = formatCEP(cep);

    try {
        const response = await fetch(`https://viacep.com.br/ws/${formattedCEP}/json/`);

        if (!response.ok) {
            return null;
        }

        const data: ViaCEPResult = await response.json();

        // ViaCEP retorna {erro: true} quando não encontra
        if (data.erro) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar ViaCEP:', error);
        return null;
    }
}

/**
 * Processa resultado do Nominatim
 */
function processResult(result: NominatimResult): GeocodingResult {
    const city = result.address.city ||
        result.address.town ||
        result.address.village ||
        result.address.municipality;

    return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        address: {
            road: result.address.road,
            neighborhood: result.address.suburb,
            city,
            state: result.address.state,
            stateCode: getStateCode(result.address.state),
            postalCode: result.address.postcode,
            country: result.address.country,
        },
        type: result.type,
        confidence: getConfidence(result),
        raw: result,
    };
}

/**
 * Busca por CEP (com fallback ViaCEP → Nominatim)
 * 
 * Fluxo:
 * 1. Tenta buscar CEP direto no Nominatim
 * 2. Se não encontrar, busca endereço no ViaCEP
 * 3. Usa o endereço do ViaCEP para buscar coordenadas no Nominatim
 */
export async function searchByCEP(cep: string): Promise<GeocodingResult | null> {
    const formattedCEP = formatCEP(cep);

    if (formattedCEP.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
    }

    // Verifica cache
    const cached = cepCache.get(formattedCEP);
    if (cached) {
        return cached;
    }

    // TENTATIVA 1: Busca direta no Nominatim (rápido, mas nem sempre funciona)
    await waitForRateLimit();

    const params = new URLSearchParams({
        postalcode: formattedCEP,
        countrycodes: 'br',
        format: 'json',
        addressdetails: '1',
        limit: '1',
    });

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (response.ok) {
            const data: NominatimResult[] = await response.json();

            if (data && data.length > 0) {
                const result = processResult(data[0]);
                cepCache.set(formattedCEP, result);
                return result;
            }
        }
    } catch (error) {
        console.warn('Nominatim direto falhou, tentando ViaCEP fallback:', error);
    }

    // TENTATIVA 2: Fallback ViaCEP → Nominatim (padrão de produção)
    console.log('CEP não encontrado no Nominatim, usando fallback ViaCEP');

    const viaCepData = await fetchViaCEP(formattedCEP);

    if (!viaCepData) {
        return null; // CEP inválido
    }

    // Monta query de busca normalizada
    const addressParts = [
        viaCepData.logradouro,
        viaCepData.bairro,
        viaCepData.localidade,
        viaCepData.uf,
        'Brasil'
    ].filter(Boolean);

    const normalizedQuery = normalizeAddress(addressParts.join(' '));

    // Busca coordenadas no Nominatim usando o endereço do ViaCEP
    await waitForRateLimit();

    const searchParams = new URLSearchParams({
        q: normalizedQuery,
        countrycodes: 'br',
        format: 'json',
        addressdetails: '1',
        limit: '1',
    });

    try {
        const response = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data: NominatimResult[] = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        // Enriquece o resultado com dados do ViaCEP
        const result = processResult(data[0]);

        // Sobrescreve com dados mais precisos do ViaCEP
        result.address = {
            ...result.address,
            road: viaCepData.logradouro || result.address.road,
            neighborhood: viaCepData.bairro || result.address.neighborhood,
            city: viaCepData.localidade || result.address.city,
            state: viaCepData.uf,
            stateCode: viaCepData.uf,
            postalCode: viaCepData.cep,
        };

        // Salva no cache
        cepCache.set(formattedCEP, result);

        return result;
    } catch (error) {
        console.error('Erro ao buscar CEP com fallback:', error);
        throw error;
    }
}

/**
 * Busca por Cidade + Estado (Fallback)
 */
export async function searchByCityState(
    city: string,
    state: string,
    neighborhood?: string
): Promise<GeocodingResult | null> {
    if (!city || !state) {
        throw new Error('Cidade e estado são obrigatórios');
    }

    await waitForRateLimit();

    const params = new URLSearchParams({
        countrycodes: 'br',
        format: 'json',
        addressdetails: '1',
        limit: '1',
    });

    // Se tem bairro, usa busca livre que funciona melhor para hierarquia
    if (neighborhood) {
        params.append('q', `${neighborhood}, ${city}, ${state}, Brasil`);
    } else {
        // Busca estruturada para cidade/estado
        params.append('city', city);
        params.append('state', state);
    }

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data: NominatimResult[] = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        return processResult(data[0]);
    } catch (error) {
        console.error('Erro ao buscar cidade/estado:', error);
        throw error;
    }
}

/**
 * Busca livre (menos precisa, usar com cautela)
 */
export async function searchFreeForm(query: string): Promise<GeocodingResult | null> {
    if (!query || query.length < 3) {
        throw new Error('Query deve ter pelo menos 3 caracteres');
    }

    await waitForRateLimit();

    const params = new URLSearchParams({
        q: query,
        countrycodes: 'br',
        format: 'json',
        addressdetails: '1',
        limit: '1',
    });

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data: NominatimResult[] = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        return processResult(data[0]);
    } catch (error) {
        console.error('Erro na busca livre:', error);
        throw error;
    }
}

/**
 * Limpa o cache de CEPs
 */
export function clearCache(): void {
    cepCache.clear();
}

/**
 * Exporta o serviço como objeto
 */
export const geocodingService = {
    searchByCEP,
    searchByCityState,
    searchFreeForm,
    clearCache,
};
