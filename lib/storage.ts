import type { CasoSAC, CasoSIUCE, DashboardStats, AuthState } from "./types"

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
  const sacNuevos = casesSAC.filter((c) => c.estado === "Nuevo").length
  const sacEnSeguimiento = casesSAC.filter((c) => c.estado === "En Seguimiento").length
  const sacResueltos = casesSAC.filter((c) => c.estado === "Resuelto").length

  // Contar estados de SIUCE (mapear estados)
  const siuceNuevos = casesSIUCE.filter((c) => c.estado === "PENDIENTE").length
  const siuceEnSeguimiento = casesSIUCE.filter((c) => c.estado === "EN PROGRESO").length
  const siuceResueltos = casesSIUCE.filter((c) => c.estado === "TERMINADO").length

  return {
    totalCasos: casesSAC.length + casesSIUCE.length,
    casosNuevos: sacNuevos + siuceNuevos,
    casosEnSeguimiento: sacEnSeguimiento + siuceEnSeguimiento,
    casosResueltos: sacResueltos + siuceResueltos,
    casosSAC: casesSAC.length,
    casosSIUCE: casesSIUCE.length,
  }
}

// ============== DATOS DE DEMOSTRACIÓN ==============

export function seedDemoData(): void {
  if (typeof window === "undefined") return

  // Solo sembrar datos si no existen
  const existingSAC = getCasesSAC()
  const existingSIUCE = getCasesSIUCE()

  if (existingSAC.length === 0) {
    const demoSAC: Omit<CasoSAC, "id" | "createdAt" | "updatedAt">[] = [
      {
        radicado: "SAC-2024-001",
        ciudadano: "María García López",
        fechaRadicacion: "2024-01-15",
        rol: "Padre de Familia",
        estado: "Resuelto",
        estudiante: "Juan García",
        situacion: "Caso de acoso escolar reportado",
        sacRespuesta: "Se tomaron medidas correctivas",
      },
      {
        radicado: "SAC-2024-002",
        ciudadano: "Carlos Rodríguez",
        fechaRadicacion: "2024-02-20",
        rol: "Docente",
        estado: "En Seguimiento",
        situacion: "Conflicto entre estudiantes",
      },
      {
        radicado: "SAC-2024-003",
        ciudadano: "Ana Martínez",
        fechaRadicacion: "2024-03-10",
        rol: "Estudiante",
        estado: "Nuevo",
      },
    ]

    demoSAC.forEach((data) => createCaseSAC(data))
  }

  if (existingSIUCE.length === 0) {
    const demoSIUCE: Omit<CasoSIUCE, "id" | "createdAt" | "updatedAt">[] = [
      {
        radicado: "35024",
        avanceGeneral: 75,
        estado: "EN PROGRESO",
        ie: "I.E. Simón Bolívar",
        victima: "PEDRO SÁNCHEZ MORALES",
        tipoIdentificacion: "TI",
        numeroIdentificacion: "1092537583",
        grado: "Octavo",
        danoPrincipal: "Psicológico",
        tipoAgresion: "Verbal",
        repetitivo: true,
        eventoGenerador: "Discriminación",
        rolAgresor: "Estudiante",
        nombreAgresor: "CARLOS PÉREZ",
        clasificacion: "Tipo 2",
        lugar: "Colegio",
        fechaOcurrencia: "2024-01-10",
        fechaRegistro: "2024-01-12",
        seguimientoIE: true,
        numeroSeguimientoIE: 3,
        seguimientoPolicia: false,
        numeroSeguimientoPolicia: 0,
        cec: true,
        avanceIE: 60,
        avanceSEM: 40,
        descripcionAvance: "Se han realizado reuniones con padres de familia",
      },
      {
        radicado: "35025",
        avanceGeneral: 100,
        estado: "TERMINADO",
        ie: "I.E. Antonio Nariño",
        victima: "LAURA GÓMEZ RUIZ",
        tipoIdentificacion: "RC",
        numeroIdentificacion: "1234567890",
        grado: "Quinto",
        danoPrincipal: "Físico",
        tipoAgresion: "Física",
        repetitivo: false,
        eventoGenerador: "Conflicto",
        rolAgresor: "Estudiante",
        nombreAgresor: "MIGUEL TORRES",
        clasificacion: "Tipo 1",
        lugar: "Colegio",
        fechaOcurrencia: "2024-02-05",
        fechaRegistro: "2024-02-06",
        seguimientoIE: true,
        numeroSeguimientoIE: 2,
        seguimientoPolicia: false,
        numeroSeguimientoPolicia: 0,
        cec: false,
        avanceIE: 100,
        avanceSEM: 100,
        descripcionAvance: "Caso cerrado satisfactoriamente",
      },
      {
        radicado: "35026",
        avanceGeneral: 20,
        estado: "PENDIENTE",
        ie: "I.E. Francisco de Paula Santander",
        victima: "SOFÍA HERRERA CASTRO",
        tipoIdentificacion: "TI",
        numeroIdentificacion: "9876543210",
        grado: "Décimo",
        danoPrincipal: "Psicológico",
        danoSecundario: "Económico",
        tipoAgresion: "Relacional",
        repetitivo: true,
        eventoGenerador: "Discriminación",
        rolAgresor: "Estudiante",
        nombreAgresor: "GRUPO DE ESTUDIANTES",
        clasificacion: "Tipo 2",
        lugar: "Redes Sociales",
        fechaOcurrencia: "2024-03-01",
        fechaRegistro: "2024-03-05",
        seguimientoIE: false,
        numeroSeguimientoIE: 0,
        seguimientoPolicia: false,
        numeroSeguimientoPolicia: 0,
        cec: false,
        avanceIE: 10,
        avanceSEM: 5,
      },
    ]

    demoSIUCE.forEach((data) => createCaseSIUCE(data))
  }
}
