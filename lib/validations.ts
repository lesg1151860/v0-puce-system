import { z } from "zod"

// Esquema de login
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  captcha: z.string().min(1, "Debes responder el CAPTCHA"),
})

// Esquema de recuperación de contraseña
export const resetPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
})

// Roles del ciudadano
const rolesOptions = [
  "Estudiante",
  "Grupo de Estudiantes",
  "Docente",
  "Administrativo",
  "Rector",
  "Padre de Familia",
  "Autoridad Admin-Jud",
  "Desconocido",
  "Familiar",
  "Vecino",
  "ONG",
] as const

// Estados de caso SAC
const estadosSACOptions = ["EN SEGUIMIENTO", "TERMINADO"] as const

// Situación SAC (clasificación)
const situacionSACOptions = ["Tipo 1", "Tipo 2", "Tipo 3"] as const

// SAC Respuesta
const sacRespuestaOptions = ["ENVIADA", "NO", "SÍ"] as const

// Esquema básico de caso SAC (registro inicial)
export const casoSACBasicoSchema = z.object({
  radicado: z.string().min(1, "El radicado es requerido"),
  ciudadano: z.string().min(1, "El ciudadano es requerido"),
  fechaRadicacion: z.string().min(1, "La fecha de radicación es requerida"),
  rol: z.enum(rolesOptions, { errorMap: () => ({ message: "Selecciona un rol" }) }),
  estado: z.enum(estadosSACOptions, { errorMap: () => ({ message: "Selecciona un estado" }) }),
})

// Esquema extendido de caso SAC (edición completa)
export const casoSACExtendidoSchema = casoSACBasicoSchema.extend({
  radicadoRespuesta: z.string().optional(),
  trasladoIE: z.boolean().optional(),
  radicadoExterna: z.string().optional(),
  respondido: z.boolean().optional(),
  prorroga: z.boolean().optional(),
  fechaNuevaProrroga: z.string().optional(),
  radicadoProrroga: z.string().optional(),
  contestacionIE: z.boolean().optional(),
  radicadoContestacion: z.string().optional(),
  estudiante: z.string().optional(),
  institucionContraQuienSeDirige: z.string().optional(),
  situacion: z.enum(situacionSACOptions).optional(),
  sacRespuesta: z.enum(sacRespuestaOptions).optional(),
  descripcion: z.string().optional(),
})

// Tipos de identificación
const tipoIdentificacionOptions = ["RC", "TI", "CC", "CE", "PPT", "NES"] as const

// Grados
const gradoOptions = [
  "Preescolar",
  "Primero",
  "Segundo",
  "Tercero",
  "Cuarto",
  "Quinto",
  "Sexto",
  "Séptimo",
  "Octavo",
  "Noveno",
  "Décimo",
  "Undécimo",
] as const

// Tipos de daño
const tipoDanoOptions = ["Físico", "Psicológico", "Sexual", "Económico", ""] as const

// Tipos de agresión (según reglas de negocio)
const tipoAgresionOptions = [
  "Hurto",
  "Acoso escolar", 
  "Violencia Intrafamiliar", 
  "Agresión física grave", 
  "Agresión física reiterada",
  "Acoso sexual", 
  "Sexteo", 
  "Violencia sexual",
  "Agresión Verbal",
  "Agresión gestual",
  "Agresión electrónica",
  "",
] as const

// Clasificación
const clasificacionOptions = ["Tipo 1", "Tipo 2", "Tipo 3"] as const

// Lugares
const lugarOptions = ["Calle", "Casa", "Colegio", "Redes Sociales"] as const

// Eventos generadores
const eventoGeneradorOptions = ["Consumo de SPA", "Discriminación", "Conflicto", "Otro"] as const

// Roles del agresor
const rolAgresorOptions = [
  "Estudiante",
  "Docente",
  "Familiar",
  "Administrativo",
  "Desconocido",
  "Vecino",
] as const

// Estados SIUCE
const estadosSIUCEOptions = ["EN PROGRESO", "PENDIENTE", "TERMINADO"] as const

// Esquema de caso SIUCE
export const casoSIUCESchema = z.object({
  // Identificación
  radicado: z.string().min(1, "El radicado es requerido"),
  avanceGeneral: z.number().min(0).max(100).default(0),
  estado: z.enum(estadosSIUCEOptions).default("EN PROGRESO"),
  ie: z.string().min(1, "La institución educativa es requerida"),
  // Víctima
  victima: z.string().min(1, "El nombre de la víctima es requerido"),
  tipoIdentificacion: z.enum(tipoIdentificacionOptions, {
    errorMap: () => ({ message: "Selecciona un tipo de identificación" }),
  }),
  numeroIdentificacion: z.string().min(1, "El número de identificación es requerido"),
  grado: z.enum(gradoOptions, { errorMap: () => ({ message: "Selecciona un grado" }) }),
  // Daños
  danoPrincipal: z.enum(tipoDanoOptions, {
    errorMap: () => ({ message: "Selecciona el daño principal" }),
  }),
  danoSecundario: z.enum(tipoDanoOptions).optional(),
  danoTerciario: z.enum(tipoDanoOptions).optional(),
  // Agresión
  tipoAgresion: z.enum(tipoAgresionOptions, {
    errorMap: () => ({ message: "Selecciona el tipo de agresión" }),
  }),
  repetitivo: z.boolean().default(false),
  eventoGenerador: z.enum(eventoGeneradorOptions, {
    errorMap: () => ({ message: "Selecciona el evento generador" }),
  }),
  otroEventoGenerador: z.string().optional(),
  // Agresor
  rolAgresor: z.enum(rolAgresorOptions, {
    errorMap: () => ({ message: "Selecciona el rol del agresor" }),
  }),
  nombreAgresor: z.string().min(1, "El nombre del agresor es requerido"),
  clasificacion: z.enum(clasificacionOptions).default("Tipo 1"),
  lugar: z.enum(lugarOptions, { errorMap: () => ({ message: "Selecciona el lugar" }) }),
  fechaOcurrencia: z.string().min(1, "La fecha de ocurrencia es requerida"),
  fechaRegistro: z.string().min(1, "La fecha de registro es requerida"),
  // Seguimientos
  seguimientoIE: z.boolean().default(false),
  numeroSeguimientoIE: z.number().min(0).default(0),
  seguimientoPolicia: z.boolean().default(false),
  numeroSeguimientoPolicia: z.number().min(0).default(0),
  cec: z.boolean().default(false),
  accionesIE: z.string().optional(),
  avanceIE: z.number().min(0).max(100).default(0),
  accionesSEM: z.string().optional(),
  avanceSEM: z.number().min(0).max(100).default(0),
  descripcionAvance: z.string().optional(),
  // Entidades externas
  entidadesExternas: z.string().optional(),
  fechaRadicadoExternas: z.string().optional(),
})

// Tipos inferidos
export type LoginFormData = z.infer<typeof loginSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type CasoSACBasicoFormData = z.infer<typeof casoSACBasicoSchema>
export type CasoSACExtendidoFormData = z.infer<typeof casoSACExtendidoSchema>
export type CasoSIUCEFormData = z.infer<typeof casoSIUCESchema>
