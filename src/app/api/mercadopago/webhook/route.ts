import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase sob demanda (evita erro durante build)
let supabaseAdminInstance: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdminInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error('Supabase environment variables not configured');
        }
        supabaseAdminInstance = createClient(url, key);
    }
    return supabaseAdminInstance;
}

// Mapear planos para badges
const PLAN_TO_BADGE: Record<string, string> = {
    verified_seller: 'verified_seller',
    physical_store: 'physical_store',
    partner: 'partner',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Mercado Pago envia diferentes tipos de notificações
        const { type, data } = body;

        // Processar apenas notificações de pagamento
        if (type !== 'payment') {
            return NextResponse.json({ received: true });
        }

        const paymentId = data?.id;
        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID não encontrado' }, { status: 400 });
        }

        // Buscar detalhes do pagamento no Mercado Pago
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('MERCADOPAGO_ACCESS_TOKEN não configurado');
            return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 });
        }

        const paymentResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!paymentResponse.ok) {
            console.error('Erro ao buscar pagamento:', await paymentResponse.text());
            return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 });
        }

        const payment = await paymentResponse.json();
        const { status, external_reference, transaction_amount } = payment;

        // Parsear external_reference para obter dados do usuário
        let referenceData;
        try {
            referenceData = JSON.parse(external_reference);
        } catch {
            console.error('Erro ao parsear external_reference:', external_reference);
            return NextResponse.json({ error: 'Referência inválida' }, { status: 400 });
        }

        const { userId, planType, postId } = referenceData;

        // Atualizar preferência no banco
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
            .from('payment_preferences')
            .update({
                status: status,
                payment_id: paymentId,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('plan_type', planType)
            .eq('status', 'pending');

        // Se pagamento aprovado, aplicar benefícios
        if (status === 'approved') {
            // Verificação de idempotência - evitar processar pagamento duplicado
            const { data: existingTransaction } = await supabaseAdmin
                .from('transactions')
                .select('id')
                .eq('payment_id', paymentId)
                .single();

            if (existingTransaction) {
                console.log(`Payment ${paymentId} already processed, skipping...`);
                return NextResponse.json({ received: true, status: 'already_processed' });
            }

            await processApprovedPayment(userId, planType, postId, paymentId, transaction_amount);
        }

        return NextResponse.json({ received: true, status });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

async function processApprovedPayment(
    userId: string,
    planType: string,
    postId: string | null,
    paymentId: string,
    amount: number
) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        // Registrar transação
        await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            type: 'payment',
            amount: amount,
            status: 'completed',
            payment_id: paymentId,
            description: `Pagamento: ${planType}`,
            metadata: { planType, postId },
        });

        // Processar baseado no tipo de plano
        if (planType === 'boost_post' && postId) {
            // Impulsionar post
            const boostUntil = new Date();
            boostUntil.setDate(boostUntil.getDate() + 7); // 7 dias de boost

            await supabaseAdmin
                .from('posts')
                .update({
                    is_boosted: true,
                    boosted_until: boostUntil.toISOString(),
                    bumped_at: new Date().toISOString(),
                })
                .eq('id', postId);

            // Notificar usuário
            await supabaseAdmin.from('notifications').insert({
                user_id: userId,
                type: 'system',
                title: 'Anúncio Impulsionado!',
                body: 'Seu anúncio foi impulsionado com sucesso e aparecerá em destaque por 7 dias.',
                data: { postId, type: 'boost_success' },
            });
        } else if (PLAN_TO_BADGE[planType]) {
            // Adicionar badge de verificação
            const badgeType = PLAN_TO_BADGE[planType];

            // Buscar badge
            const { data: badge } = await supabaseAdmin
                .from('badges')
                .select('id')
                .eq('type', badgeType)
                .single();

            if (badge) {
                // Verificar se já tem o badge
                const { data: existingBadge } = await supabaseAdmin
                    .from('user_badges')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('badge_id', badge.id)
                    .single();

                if (existingBadge) {
                    // Atualizar badge existente para verificado
                    await supabaseAdmin
                        .from('user_badges')
                        .update({
                            verified: true,
                            verified_at: new Date().toISOString(),
                        })
                        .eq('id', existingBadge.id);
                } else {
                    // Criar novo badge verificado
                    await supabaseAdmin.from('user_badges').insert({
                        user_id: userId,
                        badge_id: badge.id,
                        verified: true,
                        verified_at: new Date().toISOString(),
                    });
                }

                // Atualizar perfil como verificado
                await supabaseAdmin
                    .from('profiles')
                    .update({ is_verified: true })
                    .eq('id', userId);

                // Notificar usuário
                const badgeNames: Record<string, string> = {
                    verified_seller: 'Vendedor Verificado',
                    physical_store: 'Loja Física',
                    partner: 'Parceiro Oficial',
                };

                await supabaseAdmin.from('notifications').insert({
                    user_id: userId,
                    type: 'system',
                    title: 'Verificação Aprovada!',
                    body: `Parabéns! Você agora tem o selo de ${badgeNames[planType] || 'Verificado'}.`,
                    data: { badgeType, type: 'verification_approved' },
                });
            }
        }

        // Criar assinatura se for plano de verificação
        if (planType !== 'boost_post') {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 ano de validade

            await supabaseAdmin.from('subscriptions').insert({
                user_id: userId,
                plan_type: planType,
                status: 'active',
                is_active: true,
                started_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                payment_id: paymentId,
                amount: amount,
            });
        }
    } catch (error) {
        console.error('Error processing approved payment:', error);
        throw error;
    }
}

// GET para verificação do webhook pelo Mercado Pago
export async function GET() {
    return NextResponse.json({ status: 'ok' });
}
