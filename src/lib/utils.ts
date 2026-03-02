import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function formatRelativeTime(dateString: string | null | undefined): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export function translateCondition(condition: string | null | undefined): string | null {
    if (!condition) return null;
    const map: Record<string, string> = {
        'new': 'Novo',
        'like-new': 'Seminovo',
        'good': 'Bom',
        'fair': 'Regular',
        'poor': 'Usado'
    };
    return map[condition] || condition;
}
