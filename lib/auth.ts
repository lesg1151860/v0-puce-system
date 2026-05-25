import { getAuthState, setAuthState, clearAuthState } from "./storage"
import type { Usuario, RolUsuario } from "./types"

// Usuarios predefinidos del sistema
const USERS = [
  {
    email: "admin@puce.edu.co",
    password: "admin123",
    name: "Administrador PUCE",
    rol: "ADMINISTRADOR" as RolUsuario,
  },
  {
    email: "lider@puce.edu.co",
    password: "lider123",
    name: "Lider Convivencia",
    rol: "LIDER" as RolUsuario,
  },
]

// Función para generar CAPTCHA matemático
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
      // Asegurar que el resultado sea positivo
      const a = Math.max(num1, num2)
      const b = Math.min(num1, num2)
      answer = a - b
      question = `¿Cuánto es ${a} - ${b}?`
      break
    case "*":
      // Usar números más pequeños para multiplicación
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

// Función para validar el CAPTCHA
export function validateCaptcha(userAnswer: string, correctAnswer: number): boolean {
  const parsed = parseInt(userAnswer, 10)
  return !isNaN(parsed) && parsed === correctAnswer
}

// Función de login
export function login(
  email: string,
  password: string
): { success: boolean; user?: Usuario; error?: string } {
  // Buscar usuario que coincida con las credenciales
  const foundUser = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (foundUser) {
    const user: Usuario = {
      email: foundUser.email,
      name: foundUser.name,
      rol: foundUser.rol,
    }
    setAuthState({ isAuthenticated: true, user })
    return { success: true, user }
  }

  return { success: false, error: "Credenciales invalidas" }
}

// Función de logout
export function logout(): void {
  clearAuthState()
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const state = getAuthState()
  return state.isAuthenticated
}

// Obtener usuario actual
export function getCurrentUser(): Usuario | null {
  const state = getAuthState()
  return state.user
}

// Simular envío de email para recuperación de contraseña
export function requestPasswordReset(email: string): { success: boolean; message: string } {
  // Verificar si el email corresponde a algun usuario
  const userExists = USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())
  
  if (userExists) {
    return {
      success: true,
      message:
        "Si el correo esta registrado, recibiras instrucciones para restablecer tu contrasena.",
    }
  }

  return {
    success: true,
    message:
      "Si el correo esta registrado, recibiras instrucciones para restablecer tu contrasena.",
  }
}

// Verificar si el usuario es administrador
export function isAdmin(): boolean {
  const state = getAuthState()
  return state.user?.rol === "ADMINISTRADOR"
}

// Verificar si el usuario es líder
export function isLider(): boolean {
  const state = getAuthState()
  return state.user?.rol === "LIDER"
}

// Obtener el rol del usuario actual
export function getCurrentUserRole(): RolUsuario | null {
  const state = getAuthState()
  return state.user?.rol || null
}
