'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';
import { Database } from '@/types/supabase';

export type Tenant = Database['public']['Tables']['tenants']['Row'];

interface TenantContextType {
    activeTenant: Tenant | null;
    myTenants: Tenant[];
    loading: boolean;
    switchTenant: (tenantId: string) => Promise<void>;
    joinTenant: (tenantId: string, accessCode?: string) => Promise<{ success: boolean; message: string }>;
    leaveTenant: (tenantId: string) => Promise<{ success: boolean; message: string }>;
    refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
    const [myTenants, setMyTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTenants = async () => {
        if (!user) {
            setMyTenants([]);
            setActiveTenant(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Buscar grupos que o usuário faz parte, incluindo a flag is_last_active
            const { data: memberships, error: memError } = await supabase
                .from('tenant_memberships')
                .select('tenant_id, is_last_active')
                .eq('user_id', user.id);

            if (memError) throw memError;

            if (memberships && memberships.length > 0) {
                const tenantIds = memberships.map(m => m.tenant_id);

                const { data: tenants, error: tError } = await supabase
                    .from('tenants')
                    .select('*')
                    .in('id', tenantIds);

                if (tError) throw tError;

                const typedTenants = tenants as Tenant[];
                setMyTenants(typedTenants || []);

                // 2. Determinar o tenant ativo
                // Ordem: JWT > is_last_active na tabela > localStorage > Primeiro da lista
                const jwtActiveId = user.user_metadata?.active_tenant_id;
                const dbLastActiveId = memberships.find(m => m.is_last_active)?.tenant_id;
                const savedActiveId = typeof window !== 'undefined' ? localStorage.getItem('last_active_tenant_id') : null;

                let currentActive: Tenant | null = null;

                if (jwtActiveId) {
                    currentActive = typedTenants?.find(t => t.id === jwtActiveId) || null;
                }

                if (!currentActive && dbLastActiveId) {
                    currentActive = typedTenants?.find(t => t.id === dbLastActiveId) || null;
                }

                if (!currentActive && savedActiveId) {
                    currentActive = typedTenants?.find(t => t.id === savedActiveId) || null;
                }

                if (!currentActive && typedTenants && typedTenants.length > 0) {
                    currentActive = typedTenants[0];
                }

                setActiveTenant(currentActive);

                if (currentActive && (!jwtActiveId || jwtActiveId !== currentActive.id)) {
                    // Sincronizar se necessário
                    await switchTenant(currentActive.id);
                }
            } else {
                setMyTenants([]);
                setActiveTenant(null);
            }
        } catch (error) {
            console.error('Error fetching tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchTenant = async (tenantId: string) => {
        try {
            // 1. Atualizar flag de 'último ativo' no banco via RPC
            await supabase.rpc('set_active_tenant', { p_tenant_id: tenantId });

            // 2. Atualizar metadados do JWT (Sessão)
            const { error } = await supabase.auth.updateUser({
                data: { active_tenant_id: tenantId }
            });

            if (error) throw error;

            if (typeof window !== 'undefined') {
                localStorage.setItem('last_active_tenant_id', tenantId);
                // Direciona direto pra home num "Hard Reload" para matar qualquer cache do Next.js
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error switching tenant:', error);
        }
    };

    const joinTenant = async (tenantId: string, accessCode?: string) => {
        const { data, error } = await supabase.rpc('join_tenant', {
            p_tenant_id: tenantId,
            p_access_code: accessCode
        });

        if (error) return { success: false, message: error.message };

        const result = data as { success: boolean; message: string };
        if (result.success) {
            await fetchTenants();
        }
        return result;
    };

    const leaveTenant = async (tenantId: string) => {
        const { data, error } = await supabase.rpc('leave_tenant', {
            p_tenant_id: tenantId
        });

        if (error) return { success: false, message: error.message };

        const result = data as { success: boolean; message: string };
        if (result.success) {
            await fetchTenants();
        }
        return result;
    };

    useEffect(() => {
        if (user) {
            fetchTenants();
        } else {
            setMyTenants([]);
            setActiveTenant(null);
            setLoading(false);
        }
    }, [user]);

    return (
        <TenantContext.Provider value={{
            activeTenant,
            myTenants,
            loading,
            switchTenant,
            joinTenant,
            leaveTenant,
            refreshTenants: fetchTenants
        }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenants() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenants must be used within a TenantProvider');
    }
    return context;
}
