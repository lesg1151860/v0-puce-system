import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas - redirigir a login si no hay usuario
  const protectedPaths = ['/', '/sac', '/siuce', '/reportes', '/usuarios']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith('/sac/') ||
    request.nextUrl.pathname.startsWith('/siuce/') ||
    request.nextUrl.pathname.startsWith('/usuarios/')
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si el usuario esta autenticado y va a login, obtener su rol y redirigir
  if (request.nextUrl.pathname === '/login' && user) {
    const { data: systemUser } = await supabase
      .from("system_users")
      .select("rol")
      .eq("auth_user_id", user.id)
      .single()
    
    const url = request.nextUrl.clone()
    // Administrador va a /usuarios, Lider va a /
    url.pathname = systemUser?.rol === "ADMINISTRADOR" ? '/usuarios' : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
