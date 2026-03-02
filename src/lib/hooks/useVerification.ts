'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// Eligibility status interface
export interface EligibilityStatus {
    accountAge: boolean; // Account > 30 days
    phoneVerified: boolean;
    hasTransactions: boolean;
    noRecentReports: boolean;
    isEligible: boolean;
}

// Hook for checking verification eligibility
export function useVerificationEligibility() {
    const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkEligibility = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                // If checking auth is the only thing we do, we might want to just set eligible false or error
                // But usually this runs where protected.
                setError('Usuário não autenticado');
                return;
            }

            let accountAge = false;
            let phoneVerified = false;
            let hasTransactions = false;
            let noRecentReports = false;

            try {
                // 1. Fetch profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('created_at, phone, phone_verified')
                    .eq('id', currentUser.id)
                    .single() as any;

                if (profileError) throw profileError;

                if (profile) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    accountAge = new Date(profile.created_at) < thirtyDaysAgo;
                    phoneVerified = profile.phone_verified === true;
                }

                // 2. Check for completed transactions (sold posts)
                const { count: soldCount, error: postsError } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id)
                    .eq('status', 'sold');

                if (postsError) throw postsError;
                hasTransactions = (soldCount || 0) >= 1;

                // 3. Check for recent reports against this user
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { count: reportsCount, error: reportsError } = await supabase
                    .from('reports')
                    .select('*', { count: 'exact', head: true })
                    .eq('target_id', currentUser.id)
                    .eq('target_type', 'user')
                    .gte('created_at', sevenDaysAgo.toISOString())
                    .eq('status', 'pending');

                if (reportsError) throw reportsError;
                noRecentReports = (reportsCount || 0) === 0;

            } catch (detailsError) {
                console.warn('Error fetching eligibility details (non-blocking):', detailsError);
                // We continue, leaving the specific checks as false (default)
                // This ensures the user can still proceed as verified/eligible is forced to true
            }

            const status: EligibilityStatus = {
                accountAge,
                phoneVerified,
                hasTransactions,
                noRecentReports,
                // Free Verification Update: Everyone is eligible now, regardless of the above checks
                isEligible: true,
            };

            setEligibility(status);
        } catch (err) {
            console.error('Critical eligibility check error:', err);
            // Even in critical error, we might want to allow access or at least show a specific error
            setError(err instanceof Error ? err.message : 'Erro ao verificar elegibilidade');

            // Fallback for critical failure
            setEligibility({
                accountAge: false,
                phoneVerified: false,
                hasTransactions: false,
                noRecentReports: false,
                isEligible: true // Fail open
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkEligibility();
    }, [checkEligibility]);

    return { eligibility, loading, error, refetch: checkEligibility };
}

// Verification request interface
export interface VerificationRequest {
    id: string;
    user_id: string;
    type: 'identity' | 'store' | 'partner';
    status: 'pending' | 'approved' | 'rejected';
    documents?: string[];
    notes?: string;
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
}

// Hook for requesting verification
export function useVerificationRequest() {
    const [loading, setLoading] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<VerificationRequest | null>(null);

    // Check if user already has a pending request
    const checkExistingRequest = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            // Check user_badges for pending verification badge
            const { data: existingBadge } = await (supabase as any)
                .from('user_badges')
                .select(`
                    *,
                    badge:badges(type, name)
                `)
                .eq('user_id', currentUser.id)
                .eq('verified', false)
                .single();

            if (existingBadge) {
                const badge = existingBadge as any;
                setCurrentRequest({
                    id: badge.id,
                    user_id: badge.user_id,
                    type: badge.badge?.type || 'identity',
                    status: 'pending',
                    created_at: badge.created_at,
                });
            }
        } catch (err) {
            // No existing request, which is fine
            console.log('No existing verification request');
        }
    }, []);

    useEffect(() => {
        checkExistingRequest();
    }, [checkExistingRequest]);

    const requestVerification = async (
        type: 'identity' | 'store' | 'partner' = 'identity',
        documentFiles?: File[]
    ): Promise<boolean> => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return false;
            }

            // Upload documents if provided
            let documentUrls: string[] = [];
            if (documentFiles && documentFiles.length > 0) {
                // Validar arquivos
                for (const file of documentFiles) {
                    // Validar tamanho (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                        toast.error(`Arquivo ${file.name} é muito grande (máx 10MB)`);
                        return false;
                    }

                    // Validar tipo
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                    if (!validTypes.includes(file.type)) {
                        toast.error(`Tipo de arquivo inválido: ${file.name}`);
                        return false;
                    }
                }

                // Upload para bucket privado
                for (const file of documentFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${currentUser.id}/${Date.now()}_${file.name}`;

                    const { data, error: uploadError } = await supabase.storage
                        .from('verification-documents')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false,
                        });

                    if (uploadError) {
                        console.error('Upload error:', uploadError);
                        toast.error(`Erro ao enviar ${file.name}`);
                        return false;
                    }

                    // Obter URL pública (ainda protegida por RLS)
                    const { data: urlData } = supabase.storage
                        .from('verification-documents')
                        .getPublicUrl(fileName);

                    documentUrls.push(urlData.publicUrl);
                }
            }

            // Criar registro em verification_requests
            // @ts-ignore - Ignoring Omit strictness for now
            const { error: requestError } = await supabase
                .from('verification_requests')
                .insert({
                    user_id: currentUser.id,
                    type,
                    document_urls: documentUrls,
                    status: 'pending',
                    notes: null,
                    reviewed_by: null,
                    reviewed_at: null
                } as any);

            if (requestError) throw requestError;

            // Find the appropriate badge
            const badgeTypeMap: Record<string, string> = {
                identity: 'verified_seller',
                store: 'physical_store',
                partner: 'partner',
            };

            const { data: badge, error: badgeError } = await supabase
                .from('badges')
                .select('id')
                .eq('type', badgeTypeMap[type])
                .single();

            if (badgeError) {
                console.warn('Badge type not found, proceeding with verification_requests only');
            }

            if (badge) {
                const badgeData = badge as { id: string };
                // Check if already requested
                const { data: existing } = await supabase
                    .from('user_badges')
                    .select('id')
                    .eq('user_id', currentUser.id)
                    .eq('badge_id', badgeData.id)
                    .single();

                if (!existing) {
                    // Create badge request
                    await supabase
                        .from('user_badges')
                        .insert({
                            user_id: currentUser.id,
                            badge_id: badgeData.id,
                            verified: false,
                        } as any);
                }
            }

            // Create notification for admins
            await supabase.from('notifications')
                .insert({
                    user_id: currentUser.id,
                    type: 'system',
                    title: 'Solicitação de Verificação Enviada',
                    message: `Sua solicitação de verificação (${type}) foi enviada e será analisada em até 24 horas.`,
                    data: { verification_type: type },
                    is_read: false
                } as any);

            toast.success('Solicitação enviada! Você receberá uma resposta em até 24 horas.');
            checkExistingRequest();
            return true;
        } catch (err) {
            console.error('Verification request error:', err);
            toast.error('Erro ao enviar solicitação');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { requestVerification, currentRequest, loading };
}

// Hook for uploading verification documents
export function useVerificationDocuments() {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadDocument = async (file: File, type: string): Promise<string | null> => {
        try {
            setUploading(true);
            setUploadProgress(0);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                toast.warning('Você precisa estar logado');
                return null;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/${type}_${Date.now()}.${fileExt}`;

            setUploadProgress(30);

            const { data, error } = await supabase.storage
                .from('verification-documents')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            setUploadProgress(80);

            // Get the URL (private, so use signed URL)
            const { data: urlData } = await supabase.storage
                .from('verification-documents')
                .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7 days

            setUploadProgress(100);

            return urlData?.signedUrl || null;
        } catch (err) {
            console.error('Document upload error:', err);
            toast.error('Erro ao enviar documento');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const uploadMultipleDocuments = async (files: File[], type: string): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const url = await uploadDocument(file, type);
            if (url) urls.push(url);
        }
        return urls;
    };

    return { uploadDocument, uploadMultipleDocuments, uploading, uploadProgress };
}

// Hook for checking user's verification status
export function useUserVerificationStatus(userId?: string) {
    const [isVerified, setIsVerified] = useState(false);
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const checkStatus = useCallback(async () => {
        try {
            setLoading(true);

            let targetUserId = userId;
            if (!targetUserId) {
                const currentUser = await getCurrentUser();
                if (!currentUser) return;
                targetUserId = currentUser.id;
            }

            // Check profile verification status
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_verified')
                .eq('id', targetUserId)
                .single();

            const profileData = profile as { is_verified?: boolean } | null;
            setIsVerified(profileData?.is_verified || false);

            // Fetch user's verified badges
            const { data: userBadges } = await (supabase as any)
                .from('user_badges')
                .select(`
                    *,
                    badge:badges(*)
                `)
                .eq('user_id', targetUserId)
                .eq('verified', true);

            setBadges(userBadges || []);
        } catch (err) {
            console.error('Verification status check error:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return { isVerified, badges, loading, refetch: checkStatus };
}
