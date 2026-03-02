-- ============================================
-- CODE6MM - 019: SEED FULL TEST DATA (USERS + POSTS)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 1. Ensure Users Exist (Idempotent)
DO $$
DECLARE
    v_user1_id UUID;
    v_user2_id UUID;
    v_user3_id UUID;
    v_user4_id UUID;
    v_user5_id UUID;
    v_post_id UUID;
BEGIN
    -- Function to create user if not exists
    -- We inline logic to avoid dependency on previous functions
    
    -- GHOST
    SELECT id INTO v_user1_id FROM auth.users WHERE email = 'ghost@code6mm.com';
    IF v_user1_id IS NULL THEN
        v_user1_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ghost@code6mm.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "ghost_operator", "full_name": "Ghost Simon"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified) VALUES (v_user1_id, 'ghost_operator', 'Ghost Simon', 'user', true) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- SOAP
    SELECT id INTO v_user2_id FROM auth.users WHERE email = 'soap@code6mm.com';
    IF v_user2_id IS NULL THEN
        v_user2_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'soap@code6mm.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "soap_mactavish", "full_name": "John Soap"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified) VALUES (v_user2_id, 'soap_mactavish', 'John Soap', 'user', true) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- PRICE
    SELECT id INTO v_user3_id FROM auth.users WHERE email = 'price@code6mm.com';
    IF v_user3_id IS NULL THEN
        v_user3_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'price@code6mm.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "price_captain", "full_name": "Captain Price"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified) VALUES (v_user3_id, 'price_captain', 'Captain Price', 'user', true) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- GAZ
    SELECT id INTO v_user4_id FROM auth.users WHERE email = 'gaz@code6mm.com';
    IF v_user4_id IS NULL THEN
        v_user4_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gaz@code6mm.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "gaz_kyle", "full_name": "Kyle Gaz"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified) VALUES (v_user4_id, 'gaz_kyle', 'Kyle Gaz', 'user', false) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- VALKYRIE
    SELECT id INTO v_user5_id FROM auth.users WHERE email = 'valkyrie@code6mm.com';
    IF v_user5_id IS NULL THEN
        v_user5_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'valkyrie@code6mm.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "valkyrie_aim", "full_name": "Valkyrie Shooter"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified) VALUES (v_user5_id, 'valkyrie_aim', 'Valkyrie Shooter', 'user', true) ON CONFLICT (id) DO NOTHING;
    END IF;


    -- 2. Insert Posts (Avoid Duplicates via Title Check)
    
    -- GHOST
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'HK416 VFC Gas Blowback') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user1_id, 'HK416 VFC Gas Blowback', 'VFC HK416 GBBR em perfeito estado. 3 mags inclusos. Recoil absurdo.', 4200.00, 'São Paulo', 'SP', 'rifles', 'like-new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Plate Carrier Crye JPC') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user1_id, 'Plate Carrier Crye JPC', 'JPC 1.0 Original Crye Precision. Tamanho M. Multicam.', 1500.00, 'São Paulo', 'SP', 'gear', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Mira Holografica 552 Clone') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user1_id, 'Mira Holografica 552 Clone', 'Copia 552, funcionando perfeitamente. Pilhas novas.', 250.00, 'São Paulo', 'SP', 'parts', 'fair', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    -- SOAP
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'M1911 Colt 100th Anniversary') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user2_id, 'M1911 Colt 100th Anniversary', 'M1911 KWC Co2. Edicao de aniversario. Full metal.', 950.00, 'Rio de Janeiro', 'RJ', 'pistols', 'like-new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Capacete OPS-Core Ballistic') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user2_id, 'Capacete OPS-Core Ballistic', 'Replica FMA do OPS Core. Com trilhos e mount NVG.', 300.00, 'Rio de Janeiro', 'RJ', 'gear', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;
    
    -- PRICE
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'DMR SR-25 G&G') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user3_id, 'DMR SR-25 G&G', 'SR-25 G&G Top tech. Upgrade 450fps. Luneta inclusa.', 3800.00, 'Curitiba', 'PR', 'rifles', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Bota Tatica Oakley') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user3_id, 'Bota Tatica Oakley', 'Bota Oakley Light Assault. Tam 42. Original.', 800.00, 'Curitiba', 'PR', 'gear', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Vector Optics Maverick') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user3_id, 'Vector Optics Maverick', 'Red dot Vector Optics Maverick Gen 3. Novo na caixa.', 600.00, 'Curitiba', 'PR', 'parts', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    -- GAZ
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'AK-47 cyma cm028') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user4_id, 'AK-47 cyma cm028', 'AK classica, coronha madeira (fake). Bateria inclusa.', 800.00, 'Belo Horizonte', 'MG', 'rifles', 'fair', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1580894908361-9671950337b5?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'G36C Umarex') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user4_id, 'G36C Umarex', 'G36C licenciada HK. Polimero alta resistencia. Eletrica.', 1100.00, 'Belo Horizonte', 'MG', 'rifles', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    -- VALKYRIE
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'MP5 SD6 Tokyo Marui') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user5_id, 'MP5 SD6 Tokyo Marui', 'Reliquia Tokyo Marui High Cycle. MP5 SD6.', 4000.00, 'Porto Alegre', 'RS', 'rifles', 'like-new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Chest Rig Spiritus Systems') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user5_id, 'Chest Rig Spiritus Systems', 'Clone de alta qualidade do Micro Fight. Cor Ranger Green.', 350.00, 'Porto Alegre', 'RS', 'gear', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Luvas Mechanix M-Pact') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user5_id, 'Luvas Mechanix M-Pact', 'Luva Mechanix original, tam L. Pouco uso.', 180.00, 'Porto Alegre', 'RS', 'gear', 'like-new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://plus.unsplash.com/premium_photo-1664298150499-52d6a5c1797d', true, 0);
    END IF;

    -- Mais Unidades (Mix)
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Fuzil M4A1 Block II') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user1_id, 'Fuzil M4A1 Block II', 'Setup SOPMOD Block II. Ris Daniel Defense. Sem acessorios.', 2800.00, 'São Paulo', 'SP', 'rifles', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Beretta M9A3') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user2_id, 'Beretta M9A3', 'Beretta M9A3 GBB Co2. Cor Desert. Avaries na pintura.', 800.00, 'Rio de Janeiro', 'RJ', 'pistols', 'fair', 'active', 'trade')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Scope 3-9x40 Bushnell') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user3_id, 'Scope 3-9x40 Bushnell', 'Luneta basica, reticulo iluminado. Mount 22mm.', 200.00, 'Curitiba', 'PR', 'parts', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Cinto Tatico Ronin') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user4_id, 'Cinto Tatico Ronin', 'Cinto rigido estilo Ronin. Com inner belt.', 250.00, 'Belo Horizonte', 'MG', 'gear', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Glock G19 Gen4') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user5_id, 'Glock G19 Gen4', 'Glock 19 Gen4 WE. Slide metal. Cano fixo.', 900.00, 'Porto Alegre', 'RS', 'pistols', 'good', 'active', 'auction')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

    -- SOLD ITEM
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'M249 Para') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_user1_id, 'M249 Para', 'M249 A&K. Gearbox tijolao. Vendida.', 2000.00, 'São Paulo', 'SP', 'rifles', 'fair', 'sold', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, 'https://images.unsplash.com/photo-1580894908361-9671950337b5?auto=format&fit=crop&q=80&w=1000', true, 0);
    END IF;

END $$;
