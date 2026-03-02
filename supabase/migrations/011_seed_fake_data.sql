-- ============================================
-- CODE6MM - 011: SEED DATA (DADOS FAKES)
-- ============================================

-- Habilitar pgcrypto para gerar senhas hash
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Funcao auxiliar para criar usuario (evita duplicacao)
CREATE OR REPLACE FUNCTION public.create_fake_user(
    p_email TEXT,
    p_password TEXT,
    p_username TEXT,
    p_full_name TEXT,
    p_role public.user_role DEFAULT 'user'
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Verificar se ja existe
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        
        -- Inserir em auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('username', p_username, 'full_name', p_full_name),
            NOW(),
            NOW()
        );
        
        -- A trigger handle_new_user vai criar o profile, mas precisamos atualizar o role depois
        -- Aguardar trigger? Nao, SQL roda em transacao.
        -- O trigger deve rodar... mas se falhar por permissao, inserimos manual.
    END IF;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Executar seed em bloco DO
DO $$
DECLARE
    v_admin_id UUID;
    v_user1_id UUID;
    v_user2_id UUID;
    v_user3_id UUID;
    v_user4_id UUID;
    v_user5_id UUID;
    v_post_id UUID;
BEGIN
    -- 1. Criar Admin
    v_admin_id := public.create_fake_user('admin@code6mm.com', '123456', 'admin_master', 'Admin Geral', 'admin');
    
    -- Atualizar role do admin (trigger cria como user padrao)
    UPDATE public.profiles SET role = 'admin', is_verified = TRUE WHERE id = v_admin_id;

    -- 2. Criar Usuarios Fakes
    v_user1_id := public.create_fake_user('ghost@code6mm.com', '123456', 'ghost_operator', 'Ghost Simon', 'user');
    v_user2_id := public.create_fake_user('soap@code6mm.com', '123456', 'soap_mactavish', 'John Soap', 'user');
    v_user3_id := public.create_fake_user('price@code6mm.com', '123456', 'price_captain', 'Captain Price', 'user');
    v_user4_id := public.create_fake_user('gaz@code6mm.com', '123456', 'gaz_kyle', 'Kyle Gaz', 'user');
    v_user5_id := public.create_fake_user('valkyrie@code6mm.com', '123456', 'valkyrie_aim', 'Valkyrie Shooter', 'user');

    -- Atualizar/Garantir profiles (caso trigger falhe em seed manual)
    -- Profiles ja devem estar la.

    -- 3. Criar Posts Fakes
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'M4A1 Full Metal Custom') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES 
            (v_user1_id, 'M4A1 Full Metal Custom', 'M4A1 customizada com internos shs, cano de precisao. Acompanha red dot e grip.', 2500.00, 'São Paulo', 'SP', 'rifles', 'good', 'active', 'sale'),
            (v_user2_id, 'Glock G17 We GBB', 'Glock g17 da WE, 3 magazines, sem vazamentos. Blowback forte.', 1200.00, 'Rio de Janeiro', 'RJ', 'pistols', 'like-new', 'active', 'sale'),
            (v_user3_id, 'Colete Plate Carrier Modular', 'Colete tatico modular cor tan, com bolsos para mag m4 e radio.', 450.00, 'Curitiba', 'PR', 'gear', 'new', 'active', 'sale'),
            (v_user4_id, 'Sniper L96 Upgrade', 'Sniper L96 com kit upgrade 500fps. Gatilho zero, pistao metal.', 1800.00, 'Belo Horizonte', 'MG', 'snipers', 'good', 'active', 'sale'),
            (v_user5_id, 'M4 Krytac Trident MK2', 'Krytac original, estado de zero. Apenas 2 jogos. Nota fiscal.', 3500.00, 'Porto Alegre', 'RS', 'rifles', 'like-new', 'active', 'sale'),
            -- Mais posts
            (v_user1_id, 'Bateria Lipo 11.1v', 'Bateria nova, nunca usada. Conector deans.', 120.00, 'São Paulo', 'SP', 'parts', 'new', 'active', 'sale'),
            (v_user2_id, 'Capacete Fast Emerson', 'Capacete tipo fast, cor multicam. Com trilhos.', 200.00, 'Rio de Janeiro', 'RJ', 'gear', 'fair', 'active', 'sale'),
            (v_user3_id, 'Radio Baofeng UV-5R', 'Radio comunicador padrao, com fone ptt.', 150.00, 'Curitiba', 'PR', 'gear', 'good', 'active', 'sale');
    END IF;

    -- 4. Criar Imagens Fakes
    -- (Opcional, apenas placeholders)
    
END $$;
