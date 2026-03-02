import { useState } from 'react';
import { useNotify } from '@/components/ui/Toast';

export function useBoostPost() {
    const [loading, setLoading] = useState(false);
    const { error: notifyError, success: notifySuccess } = useNotify();

    const createBoostPayment = async (postId: string) => {
        try {
            setLoading(true);

            // Criar preferência de pagamento no Mercado Pago
            const response = await fetch('/api/mercadopago/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan_type: 'boost_post',
                    post_id: postId,
                    amount: 9.90,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar pagamento');
            }

            const { init_point } = await response.json();

            // Redirecionar para checkout do Mercado Pago
            window.location.href = init_point;
        } catch (error) {
            console.error('Boost payment error:', error);
            notifyError('Erro ao criar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return { createBoostPayment, loading };
}
