"use server"

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Este endpoint crea usuarios de autenticacion para las cuentas del sistema
// Solo debe ejecutarse una vez para configurar las cuentas iniciales

export async function POST(request: Request) {
  try {
    // Verificar clave secreta para proteger el endpoint
    const { secretKey } = await request.json()
    
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear cliente admin de Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Definir usuarios a crear con sus contraseñas
    const usersToCreate = [
      {
        email: "ls.solutions14@gmail.com",
        password: "Admin2024*SICE",
        nombres: "LUIS",
        apellidos: "SOLUTIONS",
      },
      {
        email: "luiseduardosg@ufps.edu.co", 
        password: "Lider2024*SICE",
        nombres: "LUIS EDUARDO",
        apellidos: "SANCHEZ GONZALEZ",
      },
    ]

    const results = []

    for (const user of usersToCreate) {
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
          results.push({ email: user.email, status: "error", message: updateError.message })
        } else {
          // Vincular con system_users
          await supabaseAdmin
            .from("system_users")
            .update({ auth_user_id: existingUser.id })
            .eq("correo_electronico", user.email)

          results.push({ email: user.email, status: "updated" })
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
          results.push({ email: user.email, status: "error", message: createError.message })
        } else if (newUser.user) {
          // Vincular con system_users
          await supabaseAdmin
            .from("system_users")
            .update({ auth_user_id: newUser.user.id })
            .eq("correo_electronico", user.email)

          results.push({ email: user.email, status: "created", id: newUser.user.id })
        }
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
