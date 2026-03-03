-- ============================================
-- 069: UPDATE PRESENTATION AVATARS
-- ============================================

DO $$
BEGIN
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' WHERE username = 'lucas_designer';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' WHERE username = 'maria_advogada';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200' WHERE username = 'joao_dev';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' WHERE username = 'roberto_eletricista';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' WHERE username = 'ana_contabilidade';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' WHERE username = 'pedro_financas';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' WHERE username = 'bia_mkt';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' WHERE username = 'marcos_arquiteto';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' WHERE username = 'carol_doces';
    UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' WHERE username = 'tiago_mecanico';
END $$;
