'use client';

import { useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/supabase';

// Tipos de planos disponíveis
export type PlanType = 'verified_seller' | 'physical_store' | 'partner' | 'boost_post';

export interface PlanDetails {
    id: PlanType;
    title: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
}

// Planos disponíveis
export const PLANS: Record<PlanType, PlanDetails> = {
    verified_seller: {
        id: 'verified_seller',
        title: 'Vendedor Verificado',
        description: 'Selo de verificação para vendedores individuais',
        price: 29.90,
        currency: 'BRL',
        features: [
            'Selo de verificação no perfil',
            'Destaque nos resultados de busca',
            'Badge exclusivo nos anúncios',
            'Suporte prioritário',
        ],
    },
    physical_store: {
        id: 'physical_store',
        title: 'Loja Física',
        description: 'Verificação para estabelecimentos comerciais',
        price: 99.90,
        currency: 'BRL',
        features: [
            'Selo de Loja Física verificada',
            'Página de perfil personalizada',
            'Destaque máximo no feed',
            'Estatísticas avançadas',
            'Suporte VIP',
        ],
    },
    partner: {
        id: 'partner',
        title: 'Parceiro Oficial',
        description: 'Para marcas e parceiros da plataforma',
        price: 299.90,
        currency: 'BRL',
        features: [
            'Selo de Parceiro Oficial',
            'Anúncios em destaque',
            'Acesso antecipado a recursos',
            'Co-marketing com Empreendedores de Cristo',
            'Gerente de conta dedicado',
        ],
    },
    boost_post: {
        id: 'boost_post',
        title: 'Impulsionar Anúncio',
        description: 'Destaque seu anúncio por 7 dias',
        price: 9.90,
        currency: 'BRL',
        features: [
            'Destaque no topo do feed',
            'Badge "Impulsionado"',
            'Duração: 7 dias',
        ],
    },
};

export interface PaymentPreference {
    preferenceId: string;
    initPoint: string; // URL para redirecionar ao checkout do Mercado Pago
    sandboxInitPoint: string; // URL para ambiente de teste
}

export interface CreatePreferenceParams {
    planType: PlanType;
    postId?: string; // Para boost de post específico
    metadata?: Record<string, any>;
}

// Hook para criar preferência de pagamento e redirecionar ao Mercado Pago
export function useMercadoPago() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPreference = async (params: CreatePreferenceParams): Promise<PaymentPreference | null> => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                setError('Você precisa estar logado para fazer pagamentos');
                return null;
            }

            const plan = PLANS[params.planType];
            if (!plan) {
                setError('Plano inválido');
                return null;
            }

            // Chamar API para criar preferência no Mercado Pago
            const response = await fetch('/api/mercadopago/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    userEmail: currentUser.email,
                    planType: params.planType,
                    postId: params.postId,
                    metadata: params.metadata,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar pagamento');
            }

            const data = await response.json();
            return data as PaymentPreference;
        } catch (err) {
            console.error('Create preference error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Redirecionar para o checkout do Mercado Pago
    // O ambiente (sandbox/produção) é determinado pelo Access Token configurado no servidor
    const redirectToCheckout = async (params: CreatePreferenceParams): Promise<void> => {
        const preference = await createPreference(params);
        if (preference) {
            // Redirecionar para o checkout do Mercado Pago
            // init_point sempre funciona - o ambiente é definido pelo token do servidor
            window.location.href = preference.initPoint;
        }
    };

    return {
        createPreference,
        redirectToCheckout,
        loading,
        error,
        plans: PLANS,
    };
}

// Hook para verificar status de um pagamento
export function usePaymentStatus() {
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'cancelled' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async (id: string): Promise<string | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/mercadopago/payment-status?paymentId=${id}`);

            if (!response.ok) {
                throw new Error('Erro ao verificar pagamento');
            }

            const data = await response.json();
            setStatus(data.status);
            return data.status;
        } catch (err) {
            console.error('Check payment status error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao verificar pagamento');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { status, checkStatus, loading, error };
}

// Utilitário para formatar preço em BRL
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
}
