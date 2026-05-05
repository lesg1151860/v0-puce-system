import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Este endpoint crea usuarios de autenticacion para las cuentas del sistema
// Solo debe ejecutarse una vez para configurar las cuentas iniciales

export async function POST(request: Request) {
  try {
    // Verificar clave secreta para proteger el endpoint
    const adminKey = request.headers.get("x-admin-key")
    
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "No autorizado. Clave incorrecta." }, { status: 401 })
    }

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Configuracion incompleta. Verifique las variables de entorno." 
      }, { status: 500 })
    }

    // Crear cliente admin de Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Definir usuarios a crear con sus contrasenas predeterminadas
    const usersToCreate = [
      {
        email: "ls.solutions14@gmail.com",
        password: "Admin2024*",
        nombres: "LUIS",
        apellidos: "SOLUTIONS",
      },
      {
        email: "luiseduardosg@ufps.edu.co", 
        password: "Lider2024*",
        nombres: "LUIS EDUARDO",
        apellidos: "SANCHEZ GONZALEZ",
      },
    ]

    const results: { email: string; success: boolean; message: string; password?: string }[] = []

    for (const user of usersToCreate) {
      try {
        // Verificar si el usuario ya existe en auth
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === user.email)

        if (existingUser) {
          // Actualizar contrasena del usuario existente
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: user.password }
          )

          if (updateError) {
            results.push({ 
              email: user.email, 
              success: false, 
              message: `Error al actualizar: ${updateError.message}` 
            })
          } else {
            // Vincular con system_users
            await supabaseAdmin
              .from("system_users")
              .update({ auth_user_id: existingUser.id })
              .eq("correo_electronico", user.email)

            results.push({ 
              email: user.email, 
              success: true, 
              message: "Contrasena actualizada correctamente",
              password: user.password
            })
          }
        } else {
          // Crear nuevo usuario en auth
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Confirmar email automaticamente
            user_metadata: {
              nombres: user.nombres,
              apellidos: user.apellidos,
            },
          })

          if (createError) {
            results.push({ 
              email: user.email, 
              success: false, 
              message: `Error al crear: ${createError.message}` 
            })
          } else if (newUser.user) {
            // Vincular con system_users
            await supabaseAdmin
              .from("system_users")
              .update({ auth_user_id: newUser.user.id })
              .eq("correo_electronico", user.email)

            results.push({ 
              email: user.email, 
              success: true, 
              message: "Usuario creado correctamente",
              password: user.password
            })
          }
        }
      } catch (userError) {
        results.push({ 
          email: user.email, 
          success: false, 
          message: `Error inesperado: ${userError instanceof Error ? userError.message : "Desconocido"}` 
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error creating auth users:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
