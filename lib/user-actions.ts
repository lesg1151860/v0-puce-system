"use server"

import { createClient } from "@/lib/supabase/server"
import { isEmailUnique, isUsernameUnique } from "./auth-actions"

interface CreateUserData {
  nombres: string
  apellidos: string
  rol: "ADMINISTRADOR" | "LIDER"
  correo_electronico: string
  nombre_usuario: string
  password: string
}

interface UpdateUserData {
  rol?: "ADMINISTRADOR" | "LIDER"
  password?: string
}

interface UserResult {
  success: boolean
  error?: string
  data?: unknown
}

// RF06: Registrar nuevos usuarios
export async function createSystemUser(userData: CreateUserData): Promise<UserResult> {
  const supabase = await createClient()

  // Validar campos requeridos
  if (!userData.nombres || !userData.apellidos || !userData.correo_electronico || 
      !userData.nombre_usuario || !userData.password || !userData.rol) {
    return { success: false, error: "Todos los campos son obligatorios." }
  }

  // RF09: Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userData.correo_electronico)) {
    return { success: false, error: "El formato del correo electronico no es valido." }
  }

  // RF09: Validar email unico
  const emailUnique = await isEmailUnique(userData.correo_electronico)
  if (!emailUnique) {
    return { success: false, error: "El correo electronico ya esta registrado en el sistema." }
  }

  // RF09: Validar nombre de usuario unico
  const usernameUnique = await isUsernameUnique(userData.nombre_usuario)
  if (!usernameUnique) {
    return { success: false, error: "El nombre de usuario ya existe en el sistema." }
  }

  // Validar longitud de contrasena
  if (userData.password.length < 6) {
    return { success: false, error: "La contrasena debe tener al menos 6 caracteres." }
  }

  try {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.correo_electronico.toLowerCase(),
      password: userData.password,
      email_confirm: true,
    })

    if (authError) {
      // Si falla con admin, intentar con signUp normal
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.correo_electronico.toLowerCase(),
        password: userData.password,
      })

      if (signUpError) {
        return { success: false, error: "Error al crear el usuario: " + signUpError.message }
      }

      if (!signUpData.user) {
        return { success: false, error: "No se pudo crear el usuario de autenticacion." }
      }

      // Crear registro en system_users
      const { error: insertError } = await supabase.from("system_users").insert({
        auth_user_id: signUpData.user.id,
        nombres: userData.nombres.toUpperCase(),
        apellidos: userData.apellidos.toUpperCase(),
        rol: userData.rol,
        correo_electronico: userData.correo_electronico.toLowerCase(),
        nombre_usuario: userData.nombre_usuario.toUpperCase(),
        activo: true,
      })

      if (insertError) {
        return { success: false, error: "Error al registrar datos del usuario: " + insertError.message }
      }

      return { success: true }
    }

    if (!authData.user) {
      return { success: false, error: "No se pudo crear el usuario de autenticacion." }
    }

    // Crear registro en system_users
    const { error: insertError } = await supabase.from("system_users").insert({
      auth_user_id: authData.user.id,
      nombres: userData.nombres.toUpperCase(),
      apellidos: userData.apellidos.toUpperCase(),
      rol: userData.rol,
      correo_electronico: userData.correo_electronico.toLowerCase(),
      nombre_usuario: userData.nombre_usuario.toUpperCase(),
      activo: true,
    })

    if (insertError) {
      return { success: false, error: "Error al registrar datos del usuario: " + insertError.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Error inesperado al crear el usuario." }
  }
}

// RF07: Modificar rol y contrasena de usuarios
export async function updateSystemUser(userId: string, updateData: UpdateUserData): Promise<UserResult> {
  const supabase = await createClient()

  try {
    // Obtener el usuario del sistema
    const { data: systemUser, error: fetchError } = await supabase
      .from("system_users")
      .select("auth_user_id")
      .eq("id", userId)
      .single()

    if (fetchError || !systemUser) {
      return { success: false, error: "Usuario no encontrado." }
    }

    // Actualizar rol si se proporciona
    if (updateData.rol) {
      const { error: updateRolError } = await supabase
        .from("system_users")
        .update({ rol: updateData.rol })
        .eq("id", userId)

      if (updateRolError) {
        return { success: false, error: "Error al actualizar el rol: " + updateRolError.message }
      }
    }

    // Actualizar contrasena si se proporciona
    if (updateData.password) {
      if (updateData.password.length < 6) {
        return { success: false, error: "La contrasena debe tener al menos 6 caracteres." }
      }

      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        systemUser.auth_user_id,
        { password: updateData.password }
      )

      if (passwordError) {
        return { success: false, error: "Error al actualizar la contrasena: " + passwordError.message }
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Error inesperado al actualizar el usuario." }
  }
}

// RF08: Eliminacion logica de usuarios con confirmacion
export async function deactivateSystemUser(userId: string): Promise<UserResult> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("system_users")
      .update({ activo: false })
      .eq("id", userId)

    if (error) {
      return { success: false, error: "Error al desactivar el usuario: " + error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Error inesperado al desactivar el usuario." }
  }
}

// Reactivar usuario
export async function reactivateSystemUser(userId: string): Promise<UserResult> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("system_users")
      .update({ activo: true })
      .eq("id", userId)

    if (error) {
      return { success: false, error: "Error al reactivar el usuario: " + error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Error inesperado al reactivar el usuario." }
  }
}

// Obtener todos los usuarios del sistema
export async function getAllSystemUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("system_users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}

// Obtener usuario por ID
export async function getSystemUserById(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("system_users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}
