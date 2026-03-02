'use client';

import React, { useState } from 'react';
import { uploadBlobToR2 } from '@/lib/images/uploadToR2';
import { resizeImage } from '@/lib/images/resizeImage';
import { IMAGE_SIZES } from '@/lib/images/imageSizes';

// Disable SSR for this page since it uses browser APIs
export const dynamic = 'force-dynamic';

export default function TestUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [status, setStatus] = useState<string>('Pronto para testar');
    const [error, setError] = useState<string>('');
    const [uploadedUrl, setUploadedUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
            setStatus('Arquivo selecionado: ' + selectedFile.name);
            addLog(`📁 Arquivo selecionado: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)}KB)`);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Selecione uma imagem primeiro');
            return;
        }

        setLoading(true);
        setError('');
        setLogs([]);
        setStatus('Iniciando upload...');
        addLog('🚀 Iniciando processo de upload...');

        try {
            // Step 1: Generate UUID for image
            addLog('1️⃣ Gerando UUIDs...');
            const postId = crypto.randomUUID();
            const imageId = crypto.randomUUID();
            addLog(`✅ Post ID: ${postId.substring(0, 8)}...`);
            addLog(`✅ Image ID: ${imageId.substring(0, 8)}...`);
            setStatus('UUIDs gerados');

            // Step 2: Resize image
            addLog('2️⃣ Redimensionando imagem...');
            setStatus('Redimensionando imagem...');
            const resizedBlob = await resizeImage(file, IMAGE_SIZES.feed);
            addLog(`✅ Imagem redimensionada: ${Math.round(resizedBlob.size / 1024)}KB`);
            setStatus(`Imagem redimensionada: ${Math.round(resizedBlob.size / 1024)}KB`);

            // Step 3: Upload to R2
            addLog('3️⃣ Fazendo upload para R2...');
            setStatus('Fazendo upload para R2...');
            const path = `posts/${postId}/feed/${imageId}.webp`;
            await uploadBlobToR2(path, resizedBlob);
            addLog(`✅ Upload concluído: ${path}`);

            const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${path}`;
            setUploadedUrl(publicUrl);
            setStatus('✅ Upload concluído com sucesso!');
            addLog(`🎉 SUCESSO! URL: ${publicUrl}`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
            const errorStack = err instanceof Error ? err.stack : 'N/A';
            addLog(`❌ ERRO FATAL: ${errorMsg}`);
            addLog(`❌ Stack trace: ${errorStack}`);
            setError('❌ Erro: ' + errorMsg);
            setStatus('Falhou');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-8 border border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">🧪 Teste de Upload de Imagem</h1>
                    <p className="text-text-secondary mb-8">
                        Página de debug para testar upload com logs detalhados do PICA
                    </p>

                    <div className="space-y-6">
                        {/* File Input */}
                        <div>
                            <label className="block text-slate-900 font-medium mb-2">
                                Selecione uma imagem
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-text-secondary
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary file:text-white
                                    hover:file:bg-primary/90
                                    file:cursor-pointer"
                            />
                        </div>

                        {/* Preview */}
                        {preview && (
                            <div>
                                <p className="text-slate-900 font-medium mb-2">Preview:</p>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-w-md rounded-lg border border-slate-200"
                                />
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processando...' : 'Testar Upload Completo'}
                        </button>

                        {/* Status */}
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-sm font-mono text-slate-900">
                                <span className="text-primary">Status:</span> {status}
                            </p>
                        </div>

                        {/* Logs */}
                        {logs.length > 0 && (
                            <div className="bg-black rounded-lg p-4 border border-slate-200 max-h-96 overflow-y-auto">
                                <p className="text-primary font-bold mb-2">📋 Logs Detalhados:</p>
                                {logs.map((log, i) => (
                                    <p key={i} className="text-xs font-mono text-green-400 mb-1">
                                        {log}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-500 font-mono text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success */}
                        {uploadedUrl && (
                            <div className="bg-primary/10 border border-primary/50 rounded-lg p-4">
                                <p className="text-primary font-medium mb-2">✅ Imagem enviada!</p>
                                <p className="text-xs text-text-secondary break-all font-mono">
                                    {uploadedUrl}
                                </p>
                                <img
                                    src={uploadedUrl}
                                    alt="Uploaded"
                                    className="mt-4 max-w-md rounded-lg"
                                />
                            </div>
                        )}

                        {/* Debug Info */}
                        <details className="bg-white rounded-lg border border-slate-200">
                            <summary className="p-4 cursor-pointer text-slate-900 font-medium">
                                🔍 Informações de Debug
                            </summary>
                            <div className="p-4 pt-0 space-y-2 text-sm font-mono text-text-secondary">
                                <p>• Browser: {typeof window !== 'undefined' ? navigator.userAgent : 'Server'}</p>
                                <p>• WebP Support: {typeof window !== 'undefined' && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0 ? '✅' : '❌'}</p>
                                <p>• Crypto API: {typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? '✅' : '❌'}</p>
                                <p>• Canvas API: {typeof window !== 'undefined' && !!document.createElement('canvas').getContext ? '✅' : '❌'}</p>
                                <p>• R2 URL: {process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '❌ Não configurado'}</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
