'use client';

import { VerificationRequest, Profile } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { getR2Url } from '@/lib/images';


interface VerificationCardProps {
    req: VerificationRequest & { user: Profile };
}

import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin';

export default function VerificationCard({ req }: VerificationCardProps) {
    const router = useRouter();

    // Função para visualizar documento de forma segura (admin-only)
    async function viewDocument(url: string) {
        try {
            // Extrair path da URL do storage
            const urlObj = new URL(url);
            const pathMatch = urlObj.pathname.match(/\/verification-documents\/(.+)$/);

            if (!pathMatch) {
                toast.error('URL de documento inválida');
                return;
            }

            const path = pathMatch[1];

            // Gerar signed URL com expiração de 1 hora (apenas admins conseguem via RLS)
            const { data, error } = await supabase.storage
                .from('verification-documents')
                .createSignedUrl(path, 3600);  // 1 hora

            if (error) {
                console.error('Error creating signed URL:', error);
                toast.error('Erro ao gerar link do documento');
                return;
            }

            if (data?.signedUrl) {
                // Abrir documento em nova aba
                window.open(data.signedUrl, '_blank');
            } else {
                toast.error('Não foi possível gerar link de acesso');
            }
        } catch (err) {
            console.error('Error viewing document:', err);
            toast.error('Erro ao carregar documento');
        }
    }

    const handleApprove = async () => {
        try {
            await adminService.approveVerification(req.id, req.user_id, req.type);
            toast.success('Solicitação aprovada com sucesso!');
            router.refresh();
        } catch (error) {
            console.error('Error approving verification:', error);
            toast.error('Erro ao aprovar solicitação');
        }
    };

    const handleReject = async () => {
        // Simple rejection for now, maybe add modal for reason later
        if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) return;

        try {
            await (supabase.from('verification_requests') as any).update({
                status: 'rejected',
                reviewed_at: new Date().toISOString()
            }).eq('id', req.id);
            toast.success('Solicitação rejeitada.');
            router.refresh();
        } catch (error) {
            console.error('Error rejecting verification:', error);
            toast.error('Erro ao rejeitar solicitação');
        }
    };

    // Adapter for documents since DB  uses document_urls string[]
    const documents = req.document_urls?.map((url, index) => ({
        name: `Document ${index + 1}`,
        size: 'Unknown size', // We don't have metadata in simple array
        url: url
    })) || [];

    return (
        <article className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm group hover:border-blue-500/30 transition-colors">
            <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-2.5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-lg">
                        {req.type === 'store' ? 'storefront' : 'badge'}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Solicitação: <span className="text-blue-500">{req.type} Badge</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Revisão Pendente
                </div>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-16 ring-4 ring-gray-100 dark:ring-white/5"
                        style={{ backgroundImage: `url("${getR2Url(req.user?.avatar_url) || '/images/default-avatar.png'}")` }}
                    />

                </div>
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 flex items-center gap-2">
                            @{req.user?.username}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">ID: {req.user?.id} • {req.user?.location_city}, {req.user?.location_state}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Documentos</p>
                            {documents.map((doc, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-[#151b26] rounded-lg p-2 border border-gray-200 dark:border-gray-800 flex items-center gap-3 mb-2">
                                    <div className="size-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">description</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{doc.name}</p>
                                        <p className="text-[10px] text-slate-500">{doc.size}</p>
                                    </div>
                                    <button
                                        onClick={() => viewDocument(doc.url)}
                                        className="text-blue-500 text-xs font-medium hover:underline whitespace-nowrap"
                                    >
                                        Visualizar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#151b26] p-3 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={handleReject}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium hover:bg-red-500 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">close</span> Rejeitar
                </button>
                <button
                    onClick={handleApprove}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-slate-900 text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">verified</span> Aprovar Badge
                </button>
            </div>
        </article>
    );
}
