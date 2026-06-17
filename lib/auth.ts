import { getAuthState, setAuthState, clearAuthState } from "./storage"
import type { Usuario, RolUsuario } from "./types"

// --- Función para obtener el valor de una cookie ---
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

// --- Función para generar un captcha ---
export function generateCaptcha(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const operators = ["+", "-", "*"] as const
  const operator = operators[Math.floor(Math.random() * operators.length)]

  let answer: number
  let question: string

  switch (operator) {
    case "+":
      answer = num1 + num2
      question = `¿Cuánto es ${num1} + ${num2}?`
      break
    case "-":
      const a = Math.max(num1, num2)
      const b = Math.min(num1, num2)
      answer = a - b
      question = `¿Cuánto es ${a} - ${b}?`
      break
    case "*":
      const m1 = Math.floor(Math.random() * 5) + 1
      const m2 = Math.floor(Math.random() * 5) + 1
      answer = m1 * m2
      question = `¿Cuánto es ${m1} × ${m2}?`
      break
    default:
      answer = num1 + num2
      question = `¿Cuánto es ${num1} + ${num2}?`
  }
  return { question, answer }
}

export function validateCaptcha(userAnswer: string, correctAnswer: number): boolean {
  const parsed = parseInt(userAnswer, 10)
  return !isNaN(parsed) && parsed === correctAnswer
}

// --- Funciones de autenticación ---
export function isAuthenticated(): boolean {
  // Primero revisamos la cookie. Si existe, estamos autenticados.
  const token = getCookie("access_token")
  if (token) return true
  return getAuthState().isAuthenticated
}

// --- Función para cerrar sesión ---
export function logout(): void {
  // Borrar cookies
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  
  clearAuthState()
}

// --- Funciones para verificar rol de Administrador ---
export function isAdmin(): boolean {
  const role = getCookie("user_role")
  if (role) return role === "ADMINISTRADOR"
  return getAuthState().user?.rol === "ADMINISTRADOR"
}

// --- Funciones para verificar rol de Lider ---
export function isLider(): boolean {
  const role = getCookie("user_role")
  if (role) return role === "LIDER"
  return getAuthState().user?.rol === "LIDER"
}

export function getCurrentUser(): Usuario | null {
  const state = getAuthState()

  if (state.user) return state.user
  
  const name = getCookie("user_name")
  const role = getCookie("user_role") as RolUsuario
  
  if (name && role) {
    return {
      id: 0,
      nombre: name,
      email: "",
      rol: role,
    }
  }
  
  return null
}

export function getCurrentUserRole(): RolUsuario | null {
  const role = getCookie("user_role") as RolUsuario
  if (role) return role
  
  return getAuthState().user?.rol || null
}

export function requestPasswordReset(email: string): { success: boolean; message: string } {
  return { success: true, message: "Si el correo esta registrado, recibiras instrucciones." }
}