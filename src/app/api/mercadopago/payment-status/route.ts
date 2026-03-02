import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get('paymentId');

        if (!paymentId) {
            return NextResponse.json(
                { error: 'Payment ID não fornecido' },
                { status: 400 }
            );
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Configuração inválida' },
                { status: 500 }
            );
        }

        // Buscar status do pagamento no Mercado Pago
        const response = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Pagamento não encontrado' },
                { status: 404 }
            );
        }

        const payment = await response.json();

        return NextResponse.json({
            status: payment.status,
            statusDetail: payment.status_detail,
            paymentMethodId: payment.payment_method_id,
            transactionAmount: payment.transaction_amount,
            dateApproved: payment.date_approved,
        });
    } catch (error) {
        console.error('Payment status error:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar pagamento' },
            { status: 500 }
        );
    }
}
