// Utilidades para normalización de texto

// Mapa de caracteres acentuados a sus equivalentes sin acento
const accentMap: Record<string, string> = {
  'á': 'A', 'à': 'A', 'ä': 'A', 'â': 'A', 'ã': 'A',
  'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'Ã': 'A',
  'é': 'E', 'è': 'E', 'ë': 'E', 'ê': 'E',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
  'í': 'I', 'ì': 'I', 'ï': 'I', 'î': 'I',
  'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
  'ó': 'O', 'ò': 'O', 'ö': 'O', 'ô': 'O', 'õ': 'O',
  'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Õ': 'O',
  'ú': 'U', 'ù': 'U', 'ü': 'U', 'û': 'U',
  'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
  'ñ': 'N', 'Ñ': 'N',
  'ç': 'C', 'Ç': 'C',
}

/**
 * Normaliza el texto: convierte a mayúsculas y remueve tildes
 */
export function normalizeText(text: string): string {
  if (!text) return ""
  
  let result = ""
  for (const char of text) {
    if (accentMap[char]) {
      result += accentMap[char]
    } else {
      result += char.toUpperCase()
    }
  }
  
  return result
}

/**
 * Remueve caracteres especiales, dejando solo letras, números, espacios y guiones
 */
export function removeSpecialChars(text: string): string {
  if (!text) return ""
  // Solo permite letras (sin tildes), números, espacios, guiones y guiones bajos
  return text.replace(/[^A-Za-z0-9\s\-_]/g, "")
}

/**
 * Normaliza y limpia el texto completamente (mayúsculas, sin tildes, sin especiales)
 */
export function sanitizeText(text: string): string {
  return removeSpecialChars(normalizeText(text))
}

/**
 * Valida si el texto contiene caracteres especiales o tildes
 */
export function hasSpecialChars(text: string): boolean {
  // Detecta tildes y caracteres especiales
  const specialCharsRegex = /[áàäâãéèëêíìïîóòöôõúùüûñç!@#$%^&*()+=\[\]{};:'",.<>?/\\|`~]/i
  return specialCharsRegex.test(text)
}

/**
 * Mensaje de error para caracteres especiales
 */
export const SPECIAL_CHARS_ERROR = "No se permiten tildes ni caracteres especiales. Solo letras, números, espacios y guiones."
