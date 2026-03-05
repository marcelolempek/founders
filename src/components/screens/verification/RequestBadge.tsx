'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import {
    useVerificationRequest,
    useUserVerificationStatus
} from '@/lib/hooks/useVerification';
import { toast } from '@/components/ui/Toast';

type BadgeType = 'identity' | 'store' | 'partner';

interface UploadSlot {
    key: string;
    label: string;
    description?: string;
    iconName: string;
    required: boolean;
    accept?: string;
}

const UPLOAD_SLOTS: Record<BadgeType, UploadSlot[]> = {
    identity: [
        {
            key: 'identity_front',
            label: 'Frente do Documento',
            description: 'RG, CNH ou Passaporte',
            iconName: 'badge',
            required: true
        },
        {
            key: 'identity_back',
            label: 'Verso do Documento',
            description: 'Se houver verso',
            iconName: 'description',
            required: true
        },
        {
            key: 'identity_selfie',
            label: 'Selfie com Documento',
            description: 'Segure o documento ao lado do rosto',
            iconName: 'photo_camera',
            required: true
        },
        {
            key: 'address_proof',
            label: 'Comprovante de Residência',
            description: 'Conta de luz, água ou banco (< 3 meses)',
            iconName: 'home_pin',
            required: true
        },
    ],
    store: [
        {
            key: 'cnpj_card',
            label: 'Cartão CNPJ',
            description: 'PDF ou imagem recente',
            iconName: 'article',
            required: true
        },
        {
            key: 'address_proof',
            label: 'Comprovante de Endereço Comercial',
            description: 'No nome da empresa',
            iconName: 'store',
            required: true
        },
        {
            key: 'store_facade',
            label: 'Foto da Fachada ou Escritório',
            description: 'Mostrando a identificação do seu negócio',
            iconName: 'storefront',
            required: true
        },
        {
            key: 'store_interior',
            label: 'Foto do Interior/Workspace',
            description: 'Mostrando sua estrutura de trabalho',
            iconName: 'workspaces',
            required: true
        },
    ],
    partner: [
        {
            key: 'partner_proposal',
            label: 'Proposta de Parceria/Mídia Kit',
            description: 'PDF com detalhes da parceria',
            iconName: 'handshake',
            required: true
        },
        {
            key: 'partner_identity',
            label: 'Identificação do Representante',
            description: 'RG ou CNH',
            iconName: 'badge',
            required: true
        },
    ]
};

export default function RequestVerifiedBadge() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type') as BadgeType | null;

    const [selectedType, setSelectedType] = useState<BadgeType>(
        (typeParam && ['identity', 'store', 'partner'].includes(typeParam)) ? typeParam : 'identity'
    );
    const [step, setStep] = useState<'upload' | 'confirm'>('upload');

    // State to hold files keyed by slot key
    const [filesMap, setFilesMap] = useState<Record<string, File>>({});
    const [dragActive, setDragActive] = useState<string | null>(null);

    const {
        currentRequest,
        requestVerification,
        loading: requestLoading
    } = useVerificationRequest();

    const { isVerified } = useUserVerificationStatus();

    const handleFileSelect = (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(slotKey, e.target.files[0]);
        }
    };

    const validateAndSetFile = (slotKey: string, file: File) => {
        // Validate size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(`Arquivo muito grande (máx 10MB): ${file.name}`);
            return;
        }
        // Validate type (basic check)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast.error(`Formato inválido: ${file.name}. Use JPG, PNG ou PDF.`);
            return;
        }

        setFilesMap(prev => ({
            ...prev,
            [slotKey]: file
        }));
    };

    const handleDrag = (slotKey: string, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(slotKey);
        } else if (e.type === 'dragleave') {
            setDragActive(null);
        }
    };

    const handleDrop = (slotKey: string, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(slotKey, e.dataTransfer.files[0]);
        }
    };

    const removeFile = (slotKey: string) => {
        setFilesMap(prev => {
            const newMap = { ...prev };
            delete newMap[slotKey];
            return newMap;
        });
    };

    const performRequest = async () => {
        const slots = UPLOAD_SLOTS[selectedType];

        // Validate required slots
        const missingSlots = slots.filter(slot => slot.required && !filesMap[slot.key]);
        if (missingSlots.length > 0) {
            toast.warning(`Por favor, envie: ${missingSlots.map(s => s.label).join(', ')}`);
            return;
        }

        // Prepare files list with renamed files to include context
        const filesToSend = Object.entries(filesMap).map(([key, file]) => {
            const newName = `${selectedType}_${key}_${file.name}`;
            return new File([file], newName, { type: file.type });
        });

        const success = await requestVerification(selectedType, filesToSend);
        if (success) {
            setStep('confirm');
        }
    };

    // Helper titles
    const getPageTitle = () => {
        switch (selectedType) {
            case 'identity': return 'Documentos de Identidade';
            case 'store': return 'Documentação da Loja';
            case 'partner': return 'Proposta de Parceria';
            default: return 'Verificação';
        }
    };

    const getPageDescription = () => {
        switch (selectedType) {
            case 'identity': return 'Para garantir a segurança da comunidade, precisamos confirmar que você é quem diz ser.';
            case 'store': return 'Validamos empresas para garantir transações seguras e profissionais.';
            case 'partner': return 'Envie sua proposta para analisarmos oportunidades de colaboração.';
            default: return '';
        }
    };

    // Render Logic
    if (step === 'confirm') {
        return (
            <div className="min-h-screen bg-black text-slate-900 pb-20">
                <MobileNav />
                <div className="max-w-md mx-auto pt-24 px-6 text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Solicitação Enviada!</h1>
                    <p className="text-gray-400 mb-8">
                        Recebemos seus documentos. Nossa equipe fará a análise em até 24 horas e você será notificado assim que concluirmos.
                    </p>
                    <Link
                        href="/verification"
                        className="block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Voltar para Verificação
                    </Link>
                </div>
            </div>
        );
    }

    if (currentRequest) {
        return (
            <div className="min-h-screen bg-black text-slate-900 pb-20">
                <MobileNav />
                <div className="max-w-md mx-auto pt-24 px-6 text-center">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-yellow-500">info</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Solicitação em Análise</h1>
                    <p className="text-gray-400 mb-8">
                        Já existe uma solicitação de verificação ({currentRequest.type}) em andamento. Aguarde a análise da nossa equipe.
                    </p>
                    <Link
                        href="/settings"
                        className="block w-full bg-zinc-800 text-slate-900 font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                        Voltar para Configurações
                    </Link>
                </div>
            </div>
        );
    }

    const currentSlots = UPLOAD_SLOTS[selectedType];

    return (
        <div className="min-h-screen bg-black text-slate-900 pb-24">
            <MobileNav />

            <div className="max-w-md mx-auto pt-20 px-6">
                <header className="mb-8">
                    <Link href="/verification" className="text-sm text-gray-500 mb-4 block hover:text-slate-900">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">{getPageTitle()}</h1>
                    <p className="text-gray-400 text-sm">
                        {getPageDescription()}
                    </p>
                </header>

                <div className="space-y-6">
                    {currentSlots.map((slot) => {
                        const file = filesMap[slot.key];
                        const isDragging = dragActive === slot.key;

                        return (
                            <div key={slot.key}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400 text-lg">{slot.iconName}</span>
                                        {slot.label}
                                        {slot.required && <span className="text-red-500">*</span>}
                                    </label>
                                </div>

                                {!file ? (
                                    <div
                                        className={`
                                            relative border-2 border-dashed rounded-xl p-6 text-center transition-colors
                                            ${isDragging ? 'border-primary bg-primary/10' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'}
                                        `}
                                        onDragEnter={(e) => handleDrag(slot.key, e)}
                                        onDragLeave={(e) => handleDrag(slot.key, e)}
                                        onDragOver={(e) => handleDrag(slot.key, e)}
                                        onDrop={(e) => handleDrop(slot.key, e)}
                                    >
                                        <input
                                            type="file"
                                            id={`file-${slot.key}`}
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(slot.key, e)}
                                            accept={slot.accept || "image/*,application/pdf"}
                                        />

                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-400">cloud_upload</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-600">
                                                    Clique para enviar ou arraste
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {slot.description}
                                                </p>
                                            </div>
                                            <label
                                                htmlFor={`file-${slot.key}`}
                                                className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-colors"
                                            >
                                                Selecionar Arquivo
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-zinc-900 border border-green-500/20 rounded-xl">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-green-500">check</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-green-500">
                                                    Pronto para enviar
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(slot.key)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg group transition-colors"
                                            title="Remover arquivo"
                                        >
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-red-500">close</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-6">
                        <button
                            onClick={performRequest}
                            disabled={requestLoading}
                            className={`
                                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2
                                ${requestLoading
                                    ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#00E369] text-black hover:bg-[#00c25a]'
                                }
                            `}
                        >
                            {requestLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Enviando Documentos...
                                </>
                            ) : (
                                'Enviar Solicitação'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
