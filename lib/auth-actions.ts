"use server"

import { createClient } from "@/lib/supabase/server"

const MAX_LOGIN_ATTEMPTS = 3
const BLOCK_DURATION_MINUTES = 15

// RF03: Mensaje de error generico por seguridad
const GENERIC_LOGIN_ERROR = "Credenciales incorrectas. Por favor verifique sus datos."
const ACCOUNT_BLOCKED_ERROR = `Cuenta bloqueada temporalmente por seguridad. Intente nuevamente en ${BLOCK_DURATION_MINUTES} minutos.`
const ACCOUNT_INACTIVE_ERROR = "Su cuenta ha sido desactivada. Contacte al administrador."
const EMPTY_FIELDS_ERROR = "Todos los campos son obligatorios."

interface LoginResult {
  success: boolean
  error?: string
  remainingAttempts?: number
}

// RF01, RF02, RF03, RF05: Login con validacion y control de intentos
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = await createClient()

  // RF02: Validar campos no vacios
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return { success: false, error: EMPTY_FIELDS_ERROR }
  }

  // Verificar si la cuenta esta bloqueada
  const { data: attemptData } = await supabase
    .from("login_attempts")
    .select("*")
    .eq("correo_electronico", email.toLowerCase())
    .single()

  if (attemptData?.bloqueado_hasta) {
    const blockedUntil = new Date(attemptData.bloqueado_hasta)
    if (blockedUntil > new Date()) {
      return { success: false, error: ACCOUNT_BLOCKED_ERROR }
    } else {
      // Desbloquear si ya paso el tiempo
      await supabase
        .from("login_attempts")
        .update({ intentos: 0, bloqueado_hasta: null })
        .eq("correo_electronico", email.toLowerCase())
    }
  }

  // Intentar login con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  })

  if (error || !data.user) {
    // Registrar intento fallido
    await registerFailedAttempt(email.toLowerCase())
    
    // Obtener intentos actualizados
    const { data: updatedAttempts } = await supabase
      .from("login_attempts")
      .select("intentos")
      .eq("correo_electronico", email.toLowerCase())
      .single()

    const attempts = updatedAttempts?.intentos || 1
    const remaining = MAX_LOGIN_ATTEMPTS - attempts

    if (remaining <= 0) {
      return { success: false, error: ACCOUNT_BLOCKED_ERROR, remainingAttempts: 0 }
    }

    return { 
      success: false, 
      error: GENERIC_LOGIN_ERROR,
      remainingAttempts: remaining
    }
  }

  // Verificar que el usuario este activo en system_users
  const { data: systemUser } = await supabase
    .from("system_users")
    .select("activo, rol")
    .eq("auth_user_id", data.user.id)
    .single()

  if (systemUser && !systemUser.activo) {
    await supabase.auth.signOut()
    return { success: false, error: ACCOUNT_INACTIVE_ERROR }
  }

  // Login exitoso - limpiar intentos
  await supabase
    .from("login_attempts")
    .delete()
    .eq("correo_electronico", email.toLowerCase())

  return { success: true }
}

// Registrar intento fallido y bloquear si es necesario
async function registerFailedAttempt(email: string): Promise<void> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("login_attempts")
    .select("*")
    .eq("correo_electronico", email)
    .single()

  if (existing) {
    const newAttempts = existing.intentos + 1
    const updateData: Record<string, unknown> = {
      intentos: newAttempts,
      ultimo_intento: new Date().toISOString(),
    }

    // RF05: Bloquear despues de 3 intentos
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockUntil = new Date()
      blockUntil.setMinutes(blockUntil.getMinutes() + BLOCK_DURATION_MINUTES)
      updateData.bloqueado_hasta = blockUntil.toISOString()
    }

    await supabase
      .from("login_attempts")
      .update(updateData)
      .eq("correo_electronico", email)
  } else {
    await supabase.from("login_attempts").insert({
      correo_electronico: email,
      intentos: 1,
      ultimo_intento: new Date().toISOString(),
    })
  }
}

// RF04: Cerrar sesion de forma segura
export async function logoutSecurely(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

// Obtener usuario actual del sistema
export async function getCurrentSystemUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: systemUser } = await supabase
    .from("system_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single()

  return systemUser
}

// RF09: Validar email unico
export async function isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()
  
  let query = supabase
    .from("system_users")
    .select("id")
    .eq("correo_electronico", email.toLowerCase())

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data } = await query

  return !data || data.length === 0
}

// RF09: Validar nombre de usuario unico
export async function isUsernameUnique(username: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()
  
  let query = supabase
    .from("system_users")
    .select("id")
    .eq("nombre_usuario", username.toUpperCase())

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data } = await query

  return !data || data.length === 0
}

// Vincular cuenta de Google con usuario pre-registrado
export async function linkGoogleAccountToSystemUser(authUserId: string, email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Buscar usuario pre-registrado por correo
  const { data: systemUser, error: findError } = await supabase
    .from("system_users")
    .select("*")
    .eq("correo_electronico", email.toLowerCase())
    .single()

  if (findError || !systemUser) {
    return { 
      success: false, 
      error: "No tiene una cuenta autorizada en el sistema. Contacte al administrador." 
    }
  }

  // Verificar si la cuenta esta activa
  if (!systemUser.activo) {
    return { 
      success: false, 
      error: "Su cuenta ha sido desactivada. Contacte al administrador." 
    }
  }

  // Verificar si ya esta vinculada a otro auth_user_id
  if (systemUser.auth_user_id && systemUser.auth_user_id !== authUserId) {
    return { 
      success: false, 
      error: "Esta cuenta ya esta vinculada a otro usuario." 
    }
  }

  // Vincular auth_user_id si no esta vinculado
  if (!systemUser.auth_user_id) {
    const { error: updateError } = await supabase
      .from("system_users")
      .update({ auth_user_id: authUserId })
      .eq("id", systemUser.id)

    if (updateError) {
      return { 
        success: false, 
        error: "Error al vincular la cuenta. Intente nuevamente." 
      }
    }
  }

  return { success: true }
}

// Verificar si el usuario tiene acceso al sistema
export async function verifySystemAccess(email: string): Promise<{ hasAccess: boolean; isActive: boolean; rol?: string }> {
  const supabase = await createClient()
  
  const { data: systemUser } = await supabase
    .from("system_users")
    .select("activo, rol")
    .eq("correo_electronico", email.toLowerCase())
    .single()

  if (!systemUser) {
    return { hasAccess: false, isActive: false }
  }

  return { 
    hasAccess: true, 
    isActive: systemUser.activo,
    rol: systemUser.rol
  }
}

// Verificar intentos de login (para uso desde el cliente)
export async function checkLoginAttempts(email: string): Promise<{ canAttempt: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: attemptData } = await supabase
    .from("login_attempts")
    .select("*")
    .eq("correo_electronico", email.toLowerCase())
    .single()

  if (attemptData?.bloqueado_hasta) {
    const blockedUntil = new Date(attemptData.bloqueado_hasta)
    if (blockedUntil > new Date()) {
      return { 
        canAttempt: false, 
        error: `Cuenta bloqueada temporalmente por seguridad. Intente nuevamente en ${BLOCK_DURATION_MINUTES} minutos.`
      }
    } else {
      // Desbloquear si ya paso el tiempo
      await supabase
        .from("login_attempts")
        .update({ intentos: 0, bloqueado_hasta: null })
        .eq("correo_electronico", email.toLowerCase())
    }
  }

  return { canAttempt: true }
}

// Registrar intento fallido de login (para uso desde el cliente)
export async function registerFailedLoginAttempt(email: string): Promise<{ remainingAttempts?: number }> {
  const supabase = await createClient()
  const emailLower = email.toLowerCase()

  const { data: existing } = await supabase
    .from("login_attempts")
    .select("*")
    .eq("correo_electronico", emailLower)
    .single()

  if (existing) {
    const newAttempts = existing.intentos + 1
    const updateData: Record<string, unknown> = {
      intentos: newAttempts,
      ultimo_intento: new Date().toISOString(),
    }

    // RF05: Bloquear despues de 3 intentos
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockUntil = new Date()
      blockUntil.setMinutes(blockUntil.getMinutes() + BLOCK_DURATION_MINUTES)
      updateData.bloqueado_hasta = blockUntil.toISOString()
    }

    await supabase
      .from("login_attempts")
      .update(updateData)
      .eq("correo_electronico", emailLower)

    return { remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts) }
  } else {
    await supabase.from("login_attempts").insert({
      correo_electronico: emailLower,
      intentos: 1,
      ultimo_intento: new Date().toISOString(),
    })
    return { remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 }
  }
}

// Limpiar intentos de login despues de login exitoso
export async function clearLoginAttempts(email: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("login_attempts")
    .delete()
    .eq("correo_electronico", email.toLowerCase())
}
