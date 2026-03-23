import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/products", "/auth/login", "/auth/register", "/auth/callback"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth check failed — allow request to continue unauthenticated
  }

  const path = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (user && AUTH_ROUTES.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect authenticated routes
  const isProtected =
    !PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + "/")) &&
    !path.startsWith("/api/");

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => path.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
