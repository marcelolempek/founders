-- ============================================
-- CODE6MM - 018: SEED REALISTIC POSTS (CTE VERSION)
-- ============================================

-- USER 1 (Ghost)
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'HK416 VFC Gas Blowback', 'VFC HK416 GBBR em perfeito estado. 3 mags inclusos. Recoil absurdo.', 4200.00, 'São Paulo', 'SP', 'rifles', 'like-new', 'active', 'sale'
    FROM auth.users WHERE email = 'ghost@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Plate Carrier Crye JPC', 'JPC 1.0 Original Crye Precision. Tamanho M. Multicam.', 1500.00, 'São Paulo', 'SP', 'gear', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'ghost@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Mira Holografica 552 Clone', 'Copia 552, funcionando perfeitamente. Pilhas novas.', 250.00, 'São Paulo', 'SP', 'parts', 'fair', 'active', 'sale'
    FROM auth.users WHERE email = 'ghost@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

-- USER 2 (Soap)
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'M1911 Colt 100th Anniversary', 'M1911 KWC Co2. Edicao de aniversario. Full metal.', 950.00, 'Rio de Janeiro', 'RJ', 'pistols', 'like-new', 'active', 'sale'
    FROM auth.users WHERE email = 'soap@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Capacete OPS-Core Ballistic', 'Replica FMA do OPS Core. Com trilhos e mount NVG.', 300.00, 'Rio de Janeiro', 'RJ', 'gear', 'new', 'active', 'sale'
    FROM auth.users WHERE email = 'soap@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

-- USER 3 (Price)
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'DMR SR-25 G&G', 'SR-25 G&G Top tech. Upgrade 450fps. Luneta inclusa.', 3800.00, 'Curitiba', 'PR', 'rifles', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'price@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Bota Tatica Oakley', 'Bota Oakley Light Assault. Tam 42. Original.', 800.00, 'Curitiba', 'PR', 'gear', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'price@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Vector Optics Maverick', 'Red dot Vector Optics Maverick Gen 3. Novo na caixa.', 600.00, 'Curitiba', 'PR', 'parts', 'new', 'active', 'sale'
    FROM auth.users WHERE email = 'price@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

-- USER 4 (Gaz)
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'AK-47 cyma cm028', 'AK classica, coronha madeira (fake). Bateria inclusa.', 800.00, 'Belo Horizonte', 'MG', 'rifles', 'fair', 'active', 'sale'
    FROM auth.users WHERE email = 'gaz@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1580894908361-9671950337b5?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'G36C Umarex', 'G36C licenciada HK. Polimero alta resistencia. Eletrica.', 1100.00, 'Belo Horizonte', 'MG', 'rifles', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'gaz@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

-- USER 5 (Valkyrie)
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'MP5 SD6 Tokyo Marui', 'Reliquia Tokyo Marui High Cycle. MP5 SD6.', 4000.00, 'Porto Alegre', 'RS', 'rifles', 'like-new', 'active', 'sale'
    FROM auth.users WHERE email = 'valkyrie@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Chest Rig Spiritus Systems', 'Clone de alta qualidade do Micro Fight. Cor Ranger Green.', 350.00, 'Porto Alegre', 'RS', 'gear', 'new', 'active', 'sale'
    FROM auth.users WHERE email = 'valkyrie@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Luvas Mechanix M-Pact', 'Luva Mechanix original, tam L. Pouco uso.', 180.00, 'Porto Alegre', 'RS', 'gear', 'like-new', 'active', 'sale'
    FROM auth.users WHERE email = 'valkyrie@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://plus.unsplash.com/premium_photo-1664298150499-52d6a5c1797d', true, 0 FROM p;

-- MISC
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Fuzil M4A1 Block II', 'Setup SOPMOD Block II. Ris Daniel Defense. Sem acessorios.', 2800.00, 'São Paulo', 'SP', 'rifles', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'ghost@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Beretta M9A3', 'Beretta M9A3 GBB Co2. Cor Desert. Avaries na pintura.', 800.00, 'Rio de Janeiro', 'RJ', 'pistols', 'fair', 'active', 'trade'
    FROM auth.users WHERE email = 'soap@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Scope 3-9x40 Bushnell', 'Luneta basica, reticulo iluminado. Mount 22mm.', 200.00, 'Curitiba', 'PR', 'parts', 'good', 'active', 'sale'
    FROM auth.users WHERE email = 'price@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1615615228002-890bb61c1e0e?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Cinto Tatico Ronin', 'Cinto rigido estilo Ronin. Com inner belt.', 250.00, 'Belo Horizonte', 'MG', 'gear', 'new', 'active', 'sale'
    FROM auth.users WHERE email = 'gaz@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1599423300746-b62507ac97f5?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'Glock G19 Gen4', 'Glock 19 Gen4 WE. Slide metal. Cano fixo.', 900.00, 'Porto Alegre', 'RS', 'pistols', 'good', 'active', 'auction'
    FROM auth.users WHERE email = 'valkyrie@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1585581720583-25d67da39855?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;

-- SOLD
WITH p AS (
    INSERT INTO public.posts (user_id, title, description, price, location_city, location_state, category, condition, status, type)
    SELECT id, 'M249 Para', 'M249 A&K. Gearbox tijolao. Vendida.', 2000.00, 'São Paulo', 'SP', 'rifles', 'fair', 'sold', 'sale'
    FROM auth.users WHERE email = 'ghost@code6mm.com'
    RETURNING id
)
INSERT INTO public.post_images (post_id, url, is_cover, display_order)
SELECT id, 'https://images.unsplash.com/photo-1580894908361-9671950337b5?auto=format&fit=crop&q=80&w=1000', true, 0 FROM p;
