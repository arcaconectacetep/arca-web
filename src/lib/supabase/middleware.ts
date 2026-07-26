import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(
          items: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const privateRoute =
    /^\/(inicio|espaco|mural|tendencias|suporte|notificacoes|perfil|configuracoes|onboarding|admin)/.test(
      path,
    );
  if (privateRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (user && ["/login", "/cadastro"].includes(path))
    return NextResponse.redirect(new URL("/inicio", request.url));
  if (user && privateRoute) {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed,suspended_at")
      .eq("id", user.id)
      .single();
    if (data?.suspended_at)
      return NextResponse.redirect(new URL("/acesso-negado", request.url));
    if (path !== "/onboarding" && !data?.onboarding_completed)
      return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return response;
}
