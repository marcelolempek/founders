-- ============================================
-- CODE6MM - PROTECTED CONTACT RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.get_post_contact(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    phone TEXT,
    username TEXT
) AS $$
DECLARE
    v_author_id UUID;
BEGIN
    -- Obter o autor do post
    SELECT user_id INTO v_author_id FROM public.posts WHERE id = p_post_id;
    
    IF v_author_id IS NULL THEN
        RETURN;
    END IF;

    -- Registrar visualização (ON CONFLICT garante apenas uma por dia por usuário/post)
    INSERT INTO public.contact_views (user_id, post_id)
    VALUES (p_user_id, p_post_id)
    ON CONFLICT (user_id, post_id, (timezone('UTC', viewed_at)::date)) DO NOTHING;
    
    -- Retornar contato
    RETURN QUERY
    SELECT 
        pr.phone,
        pr.username
    FROM public.profiles pr
    WHERE pr.id = v_author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_post_contact(UUID, UUID) TO authenticated;
