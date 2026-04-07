// Tipos para el Sistema de Información de Convivencia Escolar (SICE)

// Estados de los casos
export type EstadoCaso = "Nuevo" | "En Seguimiento" | "Resuelto"
export type EstadoSIUCE = "EN PROGRESO" | "PENDIENTE" | "TERMINADO"

// Roles del ciudadano que reporta (SAC)
export type RolCiudadano =
  | "Estudiante"
  | "Grupo de Estudiantes"
  | "Docente"
  | "Administrativo"
  | "Rector"
  | "Padre de Familia"
  | "Autoridad Admin-Jud"
  | "Desconocido"
  | "Familiar"
  | "Vecino"
  | "ONG"

// Tipos de identificación (SIUCE)
export type TipoIdentificacion = "RC" | "TI" | "CC" | "CE" | "PPT" | "NES"

// Grados escolares
export type Grado =
  | "Preescolar"
  | "Primero"
  | "Segundo"
  | "Tercero"
  | "Cuarto"
  | "Quinto"
  | "Sexto"
  | "Séptimo"
  | "Octavo"
  | "Noveno"
  | "Décimo"
  | "Undécimo"

// Tipos de daño
export type TipoDano = "Físico" | "Psicológico" | "Sexual" | "Económico" | ""

// Tipos de agresión
export type TipoAgresion = "Verbal" | "Física" | "Gestual" | "Relacional" | ""

// Clasificación del caso según Ley 1620
export type ClasificacionCaso = "Tipo 1" | "Tipo 2" | "Tipo 3"

// Lugares donde ocurrió el evento
export type LugarEvento = "Calle" | "Casa" | "Colegio" | "Redes Sociales"

// Eventos generadores
export type EventoGenerador = "Consumo de SPA" | "Discriminación" | "Conflicto" | "Otro"

// Rol del agresor
export type RolAgresor =
  | "Estudiante"
  | "Docente"
  | "Familiar"
  | "Administrativo"
  | "Desconocido"
  | "Vecino"

// Interfaz para casos SAC
export interface CasoSAC {
  id: string
  // Campos básicos (registro inicial)
  radicado: string
  ciudadano: string
  fechaRadicacion: string
  rol: RolCiudadano
  estado: EstadoCaso
  // Campos extendidos (edición)
  trasladoIE?: string
  radicadoExterna?: string
  respondido?: string
  prorroga?: string
  fechaNuevaProrroga?: string
  radicadoProrroga?: string
  contestacionIE?: string
  radicadoContestacion?: string
  estudiante?: string
  institucionContraQuienSeDirige?: string
  situacion?: string
  sacRespuesta?: string
  // Metadatos
  createdAt: string
  updatedAt: string
}

// Interfaz para casos SIUCE
export interface CasoSIUCE {
  id: string
  // Identificación del caso
  radicado: string
  avanceGeneral: number // 0-100
  estado: EstadoSIUCE
  ie: string // Institución Educativa
  // Información de la víctima
  victima: string
  tipoIdentificacion: TipoIdentificacion
  numeroIdentificacion: string
  grado: Grado
  // Tipos de daño
  danoPrincipal: TipoDano
  danoSecundario?: TipoDano
  danoTerciario?: TipoDano
  // Agresión
  tipoAgresion: TipoAgresion
  repetitivo: boolean
  eventoGenerador: EventoGenerador
  otroEventoGenerador?: string
  // Información del agresor
  rolAgresor: RolAgresor
  nombreAgresor: string
  clasificacion: ClasificacionCaso
  lugar: LugarEvento
  fechaOcurrencia: string
  fechaRegistro: string
  // Seguimientos
  seguimientoIE: boolean
  numeroSeguimientoIE: number
  seguimientoPolicia: boolean
  numeroSeguimientoPolicia: number
  cec: boolean // Comité Escolar de Convivencia
  accionesIE?: string
  avanceIE: number // 0-100
  accionesSEM?: string
  avanceSEM: number // 0-100
  descripcionAvance?: string
  // Entidades externas
  entidadesExternas?: string // Radicado de respuesta
  fechaRadicadoExternas?: string
  // Metadatos
  createdAt: string
  updatedAt: string
}

// Interfaz de usuario
export interface Usuario {
  email: string
  name: string
}

// Estado de autenticación
export interface AuthState {
  isAuthenticated: boolean
  user: Usuario | null
}

// Esquema de almacenamiento
export interface StorageSchema {
  auth: AuthState
  cases_sac: CasoSAC[]
  cases_siuce: CasoSIUCE[]
}

// Estadísticas del dashboard
export interface DashboardStats {
  totalCasos: number
  casosNuevos: number
  casosEnSeguimiento: number
  casosResueltos: number
  casosSAC: number
  casosSIUCE: number
}
