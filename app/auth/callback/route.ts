import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const email = data.user.email
      
      if (email) {
        // Verificar si el usuario tiene una cuenta pre-registrada
        const { data: systemUser } = await supabase
          .from("system_users")
          .select("id, activo, auth_user_id")
          .eq("correo_electronico", email.toLowerCase())
          .single()

        if (!systemUser) {
          // No tiene cuenta autorizada - cerrar sesion y redirigir con error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/login?error=NO_ACCOUNT&message=${encodeURIComponent("No tiene una cuenta autorizada en el sistema. Contacte al administrador.")}`
          )
        }

        if (!systemUser.activo) {
          // Cuenta desactivada - cerrar sesion y redirigir con error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/login?error=INACTIVE&message=${encodeURIComponent("Su cuenta ha sido desactivada. Contacte al administrador.")}`
          )
        }

        // Vincular auth_user_id si no esta vinculado
        if (!systemUser.auth_user_id) {
          await supabase
            .from("system_users")
            .update({ auth_user_id: data.user.id })
            .eq("id", systemUser.id)
        }

        // Obtener el rol para redireccionar correctamente
        const { data: userWithRole } = await supabase
          .from("system_users")
          .select("rol")
          .eq("correo_electronico", email.toLowerCase())
          .single()

        // Redirigir segun el rol: ADMINISTRADOR -> /usuarios, LIDER -> /
        const redirectPath = userWithRole?.rol === "ADMINISTRADOR" ? "/usuarios" : "/"
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
