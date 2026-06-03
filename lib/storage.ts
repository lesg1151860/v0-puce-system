import type { CasoSAC, CasoSIUCE, DashboardStats, AuthState, Usuario } from "./types"

// Claves de localStorage
const STORAGE_KEYS = {
  AUTH: "sice_auth",
  CASES_SAC: "sice_cases_sac",
  CASES_SIUCE: "sice_cases_siuce",
}

// Función auxiliar para generar IDs únicos
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Función auxiliar para obtener fecha actual formateada
export function getCurrentDate(): string {
  return new Date().toISOString()
}

// ============== AUTENTICACIÓN ==============
export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.AUTH)
  if (stored) {
    return JSON.parse(stored)
  }
  return { isAuthenticated: false, user: null }
}

export function setAuthState(state: AuthState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(state))
}

export function clearAuthState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.AUTH)
}

// ============== CASOS SAC ==============
export function getCasesSAC(): CasoSAC[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CASES_SAC)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export function getCaseSAC(id: string): CasoSAC | undefined {
  const cases = getCasesSAC()
  return cases.find((c) => c.id === id)
}

// Validar si un radicado SAC ya existe
export function isRadicadoSACDuplicado(radicado: string, excludeId?: string): boolean {
  const cases = getCasesSAC()
  return cases.some((c) => c.radicado === radicado && c.id !== excludeId)
}

// Validar si un radicado SIUCE ya existe
export function isRadicadoSIUCEDuplicado(radicado: string, excludeId?: string): boolean {
  const cases = getCasesSIUCE()
  return cases.some((c) => c.radicado === radicado && c.id !== excludeId)
}

// Validar si un número de identificación SIUCE ya existe
export function isIdentificacionSIUCEDuplicada(numeroIdentificacion: string, excludeId?: string): boolean {
  const cases = getCasesSIUCE()
  return cases.some((c) => c.numeroIdentificacion === numeroIdentificacion && c.id !== excludeId)
}

// Obtener casos SAC filtrados por fecha
export function getCasesSACByDateRange(year: number, month?: number): CasoSAC[] {
  const cases = getCasesSAC()
  return cases.filter((c) => {
    const fecha = new Date(c.fechaRadicacion)
    if (month !== undefined) {
      return fecha.getFullYear() === year && fecha.getMonth() === month
    }
    return fecha.getFullYear() === year
  })
}

// Obtener casos SIUCE filtrados por fecha
export function getCasesSIUCEByDateRange(year: number, month?: number): CasoSIUCE[] {
  const cases = getCasesSIUCE()
  return cases.filter((c) => {
    const fecha = new Date(c.fechaRegistro)
    if (month !== undefined) {
      return fecha.getFullYear() === year && fecha.getMonth() === month
    }
    return fecha.getFullYear() === year
  })
}

export function createCaseSAC(data: Omit<CasoSAC, "id" | "createdAt" | "updatedAt">): CasoSAC {
  const cases = getCasesSAC()
  const newCase: CasoSAC = {
    ...data,
    id: generateId(),
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  }
  cases.push(newCase)
  localStorage.setItem(STORAGE_KEYS.CASES_SAC, JSON.stringify(cases))
  return newCase
}

export function updateCaseSAC(id: string, data: Partial<CasoSAC>): CasoSAC | undefined {
  const cases = getCasesSAC()
  const index = cases.findIndex((c) => c.id === id)
  if (index === -1) return undefined

  cases[index] = {
    ...cases[index],
    ...data,
    updatedAt: getCurrentDate(),
  }
  localStorage.setItem(STORAGE_KEYS.CASES_SAC, JSON.stringify(cases))
  return cases[index]
}

export function deleteCaseSAC(id: string): boolean {
  const cases = getCasesSAC()
  const filtered = cases.filter((c) => c.id !== id)
  if (filtered.length === cases.length) return false
  localStorage.setItem(STORAGE_KEYS.CASES_SAC, JSON.stringify(filtered))
  return true
}

// ============== CASOS SIUCE ==============
export function getCasesSIUCE(): CasoSIUCE[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CASES_SIUCE)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export function getCaseSIUCE(id: string): CasoSIUCE | undefined {
  const cases = getCasesSIUCE()
  return cases.find((c) => c.id === id)
}

export function createCaseSIUCE(data: Omit<CasoSIUCE, "id" | "createdAt" | "updatedAt">): CasoSIUCE {
  const cases = getCasesSIUCE()
  const newCase: CasoSIUCE = {
    ...data,
    id: generateId(),
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  }
  cases.push(newCase)
  localStorage.setItem(STORAGE_KEYS.CASES_SIUCE, JSON.stringify(cases))
  return newCase
}

export function updateCaseSIUCE(id: string, data: Partial<CasoSIUCE>): CasoSIUCE | undefined {
  const cases = getCasesSIUCE()
  const index = cases.findIndex((c) => c.id === id)
  if (index === -1) return undefined

  cases[index] = {
    ...cases[index],
    ...data,
    updatedAt: getCurrentDate(),
  }
  localStorage.setItem(STORAGE_KEYS.CASES_SIUCE, JSON.stringify(cases))
  return cases[index]
}

export function deleteCaseSIUCE(id: string): boolean {
  const cases = getCasesSIUCE()
  const filtered = cases.filter((c) => c.id !== id)
  if (filtered.length === cases.length) return false
  localStorage.setItem(STORAGE_KEYS.CASES_SIUCE, JSON.stringify(filtered))
  return true
}

// ============== ESTADÍSTICAS ==============
export function getDashboardStats(): DashboardStats {
  const casesSAC = getCasesSAC()
  const casesSIUCE = getCasesSIUCE()

  // Contar estados de SAC
  const sacEnSeguimiento = casesSAC.filter((c) => c.estado === "En Seguimiento").length
  const sacResueltos = casesSAC.filter((c) => c.estado === "Terminado").length

  // Contar estados de SIUCE
  const siuceNuevos = casesSIUCE.filter((c) => c.estado === "Pendiente").length
  const siuceEnSeguimiento = casesSIUCE.filter((c) => c.estado === "En Progreso").length
  const siuceResueltos = casesSIUCE.filter((c) => c.estado === "Terminado").length

  return {
    totalCasos: casesSAC.length + casesSIUCE.length,
    casosNuevos: siuceNuevos,
    casosEnSeguimiento: sacEnSeguimiento + siuceEnSeguimiento,
    casosResueltos: sacResueltos + siuceResueltos,
    casosSAC: casesSAC.length,
    casosSIUCE: casesSIUCE.length,
  }
}

// Obtener estadísticas de acciones I.E.
export function getAccionesIEStats(): { accion: string; cantidad: number }[] {
  const casesSIUCE = getCasesSIUCE()
  const accionesCount: Record<string, number> = {}
  
  casesSIUCE.forEach((c) => {
    if (c.accionesIE) {
      accionesCount[c.accionesIE] = (accionesCount[c.accionesIE] || 0) + 1
    }
  })
  
  return Object.entries(accionesCount)
    .map(([accion, cantidad]) => ({ accion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

// Obtener estadísticas de acciones S.E.M.
export function getAccionesSEMStats(): { accion: string; cantidad: number }[] {
  const casesSIUCE = getCasesSIUCE()
  const accionesCount: Record<string, number> = {}
  
  casesSIUCE.forEach((c) => {
    if (c.accionesSEM) {
      accionesCount[c.accionesSEM] = (accionesCount[c.accionesSEM] || 0) + 1
    }
  })
  
  return Object.entries(accionesCount)
    .map(([accion, cantidad]) => ({ accion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

// Obtener casos SAC sin respuesta al ciudadano
export function getCasosSACSinRespuesta(): CasoSAC[] {
  const cases = getCasesSAC()
  return cases.filter((c) => !c.respondido && c.estado === "En Seguimiento")
}

// Obtener instituciones educativas únicas
export function getInstitucionesEducativas(): string[] {
  const casesSAC = getCasesSAC()
  const casesSIUCE = getCasesSIUCE()
  
  const instituciones = new Set<string>()
  
  casesSAC.forEach((c) => {
    if (c.institucionContraQuienSeDirige) {
      instituciones.add(c.institucionContraQuienSeDirige)
    }
  })
  
  casesSIUCE.forEach((c) => {
    if (c.ie) {
      instituciones.add(c.ie)
    }
  })
  
  return Array.from(instituciones).sort()
}

const STORAGE_KEY_USUARIOS = "puce_usuarios"
const STORAGE_KEY_INSTITUCIONES = "puce_instituciones_educativas"

// --- FUNCIONES PARA USUARIOS ---
export function getUsuarios(): Usuario[] {
  if (typeof window === "undefined") return []
  
  const data = localStorage.getItem(STORAGE_KEY_USUARIOS)
  return data ? JSON.parse(data) : []
}

export function saveUsuarios(usuarios: Usuario[]): void {
  if (typeof window === "undefined") return 
  localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios))
}

export function getInstituciones() {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY_INSTITUCIONES)
  return data ? JSON.parse(data) : []
}

export function saveInstituciones(instituciones: any[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY_INSTITUCIONES, JSON.stringify(instituciones))
}