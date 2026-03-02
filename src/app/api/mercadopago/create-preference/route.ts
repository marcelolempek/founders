import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase sob demanda (evita erro durante build)
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase environment variables not configured');
    }
    return createClient(url, key);
}

// Planos e preços (sincronizado com useMercadoPago.ts)
const PLANS: Record<string, { title: string; price: number; description: string }> = {
    verified_seller: {
        title: 'Vendedor Verificado - Empreendedores de Cristo',
        price: 29.90,
        description: 'Selo de verificação para vendedores individuais',
    },
    physical_store: {
        title: 'Loja Física Verificada - Empreendedores de Cristo',
        price: 99.90,
        description: 'Verificação para estabelecimentos comerciais',
    },
    partner: {
        title: 'Parceiro Oficial - Empreendedores de Cristo',
        price: 299.90,
        description: 'Para marcas e parceiros da plataforma',
    },
    boost_post: {
        title: 'Impulsionar Anúncio - Empreendedores de Cristo',
        price: 9.90,
        description: 'Destaque seu anúncio por 7 dias',
    },
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userEmail, planType, postId, metadata } = body;

        // Validar dados
        if (!userId || !planType) {
            return NextResponse.json(
                { error: 'Dados incompletos' },
                { status: 400 }
            );
        }

        const plan = PLANS[planType];
        if (!plan) {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            );
        }

        // Verificar se o Access Token está configurado
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('MERCADOPAGO_ACCESS_TOKEN não configurado');
            return NextResponse.json(
                { error: 'Configuração de pagamento inválida' },
                { status: 500 }
            );
        }

        // URLs de retorno
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/payment/success`;
        const failureUrl = `${baseUrl}/payment/failure`;
        const pendingUrl = `${baseUrl}/payment/pending`;

        // Criar preferência no Mercado Pago
        const preferenceData = {
            items: [
                {
                    id: planType,
                    title: plan.title,
                    description: plan.description,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: plan.price,
                },
            ],
            payer: {
                email: userEmail,
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            auto_return: 'approved',
            external_reference: JSON.stringify({
                userId,
                planType,
                postId: postId || null,
                ...metadata,
            }),
            notification_url: `${baseUrl}/api/mercadopago/webhook`,
            statement_descriptor: 'Empreendedores de Cristo',
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        };

        // Chamar API do Mercado Pago
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(preferenceData),
        });

        if (!mpResponse.ok) {
            const errorData = await mpResponse.json();
            console.error('Mercado Pago error:', errorData);
            return NextResponse.json(
                { error: 'Erro ao criar pagamento no Mercado Pago' },
                { status: 500 }
            );
        }

        const mpData = await mpResponse.json();

        // Salvar a preferência no banco para rastreamento
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin.from('payment_preferences').insert({
            user_id: userId,
            preference_id: mpData.id,
            plan_type: planType,
            post_id: postId || null,
            amount: plan.price,
            status: 'pending',
            metadata: metadata || {},
            expires_at: preferenceData.expiration_date_to,
        });

        return NextResponse.json({
            preferenceId: mpData.id,
            initPoint: mpData.init_point,
            sandboxInitPoint: mpData.sandbox_init_point,
        });
    } catch (error) {
        console.error('Create preference error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
