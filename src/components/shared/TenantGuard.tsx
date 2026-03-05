'use client';

import React from 'react';
import { useTenants } from '@/context/TenantContext';
import { useUser } from '@/context/UserContext';
import { usePathname } from 'next/navigation';
import SpacePortal from '@/components/onboarding/SpacePortal';

export default function TenantGuard({ children }: { children: React.ReactNode }) {
    const { user, loading: userLoading } = useUser();
    const { activeTenant, loading: tenantLoading } = useTenants();
    const pathname = usePathname();

    // Se estiver carregando dados do usuário ou do tenant, mostramos um loader simples
    if (userLoading || tenantLoading) {
        return (
            <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // LISTA DE ROTAS EXCEÇÕES (que não precisam de activeTenant para renderizar)
    // 1. / (home) - Se não tem tenant, cairia aqui, mas queremos que caia no SpacePortal se for LOGADO
    // 2. /auth/*
    // 3. /admin/*
    // 4. Qualquer path que não seja root e não comece com /auth ou /admin, 
    //    nós tratamos como uma possível rota de JOIN (ex: /[slug])

    const isAuthPath = pathname?.startsWith('/auth');
    const isAdminPath = pathname?.startsWith('/admin');
    const isRootPath = pathname === '/';

    // Se o usuário está logado mas NÃO tem um tenant ativo
    if (user && !activeTenant) {
        // Se ele está tentando acessar a HOME, mostra o Onboarding
        if (isRootPath) {
            return <SpacePortal />;
        }

        // Se ele está em auth ou admin, deixa passar
        if (isAuthPath || isAdminPath) {
            return <>{children}</>;
        }

        // Se ele está em QUALQUER OUTRA ROTA (ex: /[slug]), deixa ele ver a página
        // para que ele possa realizar o JOIN via SlugPage.
        return <>{children}</>;
    }

    // Caso contrário (não logado ou logado com tenant), segue o fluxo normal
    return <>{children}</>;
}
