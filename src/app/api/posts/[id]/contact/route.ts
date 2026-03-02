import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting simples (20 por hora)
    const { count } = await supabase
        .from('contact_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('viewed_at', new Date(Date.now() - 3600000).toISOString());

    if (count !== null && count >= 20) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Obter contato via RPC
    const { data, error } = await (supabase as any).rpc('get_post_contact', {
        p_post_id: id,
        p_user_id: user.id
    });

    if (error) {
        console.error('Contact RPC error:', error);
        return NextResponse.json({ error: 'Database error fetching contact' }, { status: 500 });
    }

    if (!data || (data as any[]).length === 0) {
        console.warn('Contact returned empty for post:', id, 'User:', user.id);

        // Fallback or detailed verify: does post exist?
        const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('id', id);
        if (count === 0) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Contact info unavailable' }, { status: 404 });
    }

    return NextResponse.json((data as any[])[0]);
}
