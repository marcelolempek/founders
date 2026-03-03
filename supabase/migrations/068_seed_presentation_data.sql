-- ============================================
-- 068: SEED 10 USERS AND POSTS FOR PRESENTATION
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
    v_u1 UUID; v_u2 UUID; v_u3 UUID; v_u4 UUID; v_u5 UUID;
    v_u6 UUID; v_u7 UUID; v_u8 UUID; v_u9 UUID; v_u10 UUID;
    v_post_id UUID;
    img_servico1 TEXT := 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000';
    img_servico2 TEXT := 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000';
    img_servico3 TEXT := 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000';
BEGIN
    -- USER 1: Lucas (Designer)
    SELECT id INTO v_u1 FROM auth.users WHERE email = 'lucas.designer@teste.com';
    IF v_u1 IS NULL THEN
        v_u1 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucas.designer@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "lucas_designer", "full_name": "Lucas Ferreira"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u1, 'lucas_designer', 'Lucas Ferreira', 'user', true, 'Designer Gráfico', 'Especialista em identidades visuais e marcas com propósito.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 2: Maria (Advogada)
    SELECT id INTO v_u2 FROM auth.users WHERE email = 'maria.adv@teste.com';
    IF v_u2 IS NULL THEN
        v_u2 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maria.adv@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "maria_advogada", "full_name": "Maria Souza"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u2, 'maria_advogada', 'Maria Souza', 'user', true, 'Advogada', 'Consultoria jurídica focada em empreendedores.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 3: João (Dev Web)
    SELECT id INTO v_u3 FROM auth.users WHERE email = 'joao.dev@teste.com';
    IF v_u3 IS NULL THEN
        v_u3 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'joao.dev@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "joao_dev", "full_name": "João Silva"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u3, 'joao_dev', 'João Silva', 'user', true, 'Desenvolvedor Web', 'Criação de sites e sistemas sob medida.', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 4: Roberto (Eletricista)
    SELECT id INTO v_u4 FROM auth.users WHERE email = 'roberto.eletricista@teste.com';
    IF v_u4 IS NULL THEN
        v_u4 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'roberto.eletricista@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "roberto_eletricista", "full_name": "Roberto Santos"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u4, 'roberto_eletricista', 'Roberto Santos', 'user', false, 'Eletricista', 'Manutenção residencial e comercial.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 5: Ana (Contadora)
    SELECT id INTO v_u5 FROM auth.users WHERE email = 'ana.contadora@teste.com';
    IF v_u5 IS NULL THEN
        v_u5 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.contadora@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "ana_contabilidade", "full_name": "Ana Oliveira"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u5, 'ana_contabilidade', 'Ana Oliveira', 'user', true, 'Contadora', 'Soluções contábeis e abertura de empresas.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 6: Pedro (Consultor)
    SELECT id INTO v_u6 FROM auth.users WHERE email = 'pedro.consultor@teste.com';
    IF v_u6 IS NULL THEN
        v_u6 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pedro.consultor@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "pedro_financas", "full_name": "Pedro Almeida"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u6, 'pedro_financas', 'Pedro Almeida', 'user', true, 'Consultor Financeiro', 'Dobre os lucros da sua empresa.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 7: Beatriz (Social Media)
    SELECT id INTO v_u7 FROM auth.users WHERE email = 'bia.social@teste.com';
    IF v_u7 IS NULL THEN
        v_u7 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bia.social@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "bia_mkt", "full_name": "Beatriz Costa"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u7, 'bia_mkt', 'Beatriz Costa', 'user', false, 'Gestora de Redes Sociais', 'Faço seu negócio aparecer na internet.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 8: Marcos (Arquiteto)
    SELECT id INTO v_u8 FROM auth.users WHERE email = 'marcos.arq@teste.com';
    IF v_u8 IS NULL THEN
        v_u8 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcos.arq@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "marcos_arquiteto", "full_name": "Marcos Rocha"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u8, 'marcos_arquiteto', 'Marcos Rocha', 'user', true, 'Arquiteto', 'Projetos residenciais e corporativos modernos.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 9: Carolina (Confeiteira)
    SELECT id INTO v_u9 FROM auth.users WHERE email = 'carol.doces@teste.com';
    IF v_u9 IS NULL THEN
        v_u9 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carol.doces@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "carol_doces", "full_name": "Carolina Lima"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u9, 'carol_doces', 'Carolina Lima', 'user', false, 'Confeiteira', 'Doces finos e bolos decorados para eventos.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
    END IF;

    -- USER 10: Tiago (Mecânico)
    SELECT id INTO v_u10 FROM auth.users WHERE email = 'tiago.mecanico@teste.com';
    IF v_u10 IS NULL THEN
        v_u10 := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
        VALUES (v_u10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tiago.mecanico@teste.com', crypt('123456', gen_salt('bf')), NOW(), '{"username": "tiago_mecanico", "full_name": "Tiago Mendes"}', NOW(), NOW());
        INSERT INTO public.profiles (id, username, full_name, role, is_verified, profession, bio, avatar_url) VALUES (v_u10, 'tiago_mecanico', 'Tiago Mendes', 'user', true, 'Mecânico Automotivo', 'Revisão geral e manutenção preventiva.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200') ON CONFLICT (id) DO UPDATE SET avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200';
    END IF;


    -- ===================================
    -- INSERT POSTS
    -- ===================================

    -- POST 1
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Criação de Logotipos e Identidade Visual') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u1, 'Criação de Logotipos e Identidade Visual', 'Invista na marca da sua empresa. Entrego manual da marca e artes para redes sociais.', 500.00, 'São Paulo', 'SP', 'Design', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico1, true, 0);
    END IF;

    -- POST 2
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Consultoria Jurídica Empresarial') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u2, 'Consultoria Jurídica Empresarial', 'Atendimento para pequenos negócios, análise de contratos e direitos trabalhistas.', 350.00, 'Rio de Janeiro', 'RJ', 'Consultoria', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico2, true, 0);
    END IF;

    -- POST 3
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Desenvolvimento de Sites e E-commerce') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u3, 'Desenvolvimento de Sites e E-commerce', 'Sites rápidos, modernos e otimizados para vendas online.', 1500.00, 'Belo Horizonte', 'MG', 'Tecnologia', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico3, true, 0);
    END IF;

    -- POST 4
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Instalação e Manutenção Elétrica') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u4, 'Instalação e Manutenção Elétrica', 'Reparos elétricos gerais, troca de fiação e instalação de quadros de energia com laudo.', 150.00, 'Curitiba', 'PR', 'Serviços Gerais', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico1, true, 0);
    END IF;

    -- POST 5
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Assessoria Contábil para MEI e ME') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u5, 'Assessoria Contábil para MEI e ME', 'Abertura de empresas, declarações mensais e anuais, e folha de pagamento.', 200.00, 'Porto Alegre', 'RS', 'Consultoria', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico2, true, 0);
    END IF;

    -- POST 6
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Mentoria em Finanças para Negócios') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u6, 'Mentoria em Finanças para Negócios', 'Aprenda a organizar o fluxo de caixa do seu negócio e maximizar seus lucros em 4 sessões.', 400.00, 'Goiânia', 'GO', 'Consultoria', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico3, true, 0);
    END IF;

    -- POST 7
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Gestão de Redes Sociais Completa') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u7, 'Gestão de Redes Sociais Completa', 'Pacote mensal de 15 artes + agendamento + copy para Instagram e Facebook.', 800.00, 'Recife', 'PE', 'Marketing', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico1, true, 0);
    END IF;

    -- POST 8
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Projeto Arquitetônico de Interiores') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u8, 'Projeto Arquitetônico de Interiores', 'Transforme seu ambiente de trabalho ou residência com um projeto sob medida (Preço por m2).', 120.00, 'Brasília', 'DF', 'Projetos', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico2, true, 0);
    END IF;

    -- POST 9
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Bolos de Casamento Decorados') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u9, 'Bolos de Casamento Decorados', 'Bolos incríveis com até 3 andares e flores de açúcar.', 350.00, 'Campinas', 'SP', 'Alimentação', 'new', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico3, true, 0);
    END IF;

    -- POST 10
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Revisão Automotiva Completa') THEN
        INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
        VALUES (v_u10, 'Revisão Automotiva Completa', 'Troca de óleo, filtros, alinhamento, balanceamento e check-up de 30 itens.', 450.00, 'Salvador', 'BA', 'Mecânica', 'good', 'active', 'sale')
        RETURNING id INTO v_post_id;
        INSERT INTO public.post_images (post_id, url, is_cover, display_order) VALUES (v_post_id, img_servico1, true, 0);
    END IF;

END $$;
