import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if needed
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Protected Routes (Require Login)
    const protectedRoutes = [
        "/admin",
        "/profile",
        "/messages",
        "/post/create",
        "/post/saved-posts",
        "/verification"
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
        path.startsWith(route)
    );

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL("/auth/login", request.url);
        // Optional: Add ?next=path to redirect back after login
        // redirectUrl.searchParams.set("next", path);
        return NextResponse.redirect(redirectUrl);
    }

    // 2. Admin Protection (CRITICAL)
    // If accessing /admin, verify role in profiles table
    if (path.startsWith('/admin') && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
            const redirectUrl = new URL("/", request.url);
            redirectUrl.searchParams.set("error", "unauthorized");
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 2. Auth Routes (Redirect to Feed if Logged In)
    // Exception: allow /auth/complete-profile and /auth/callback for OAuth flow
    const authRoutes = ["/auth/login", "/auth/register", "/auth/signup"];
    const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
