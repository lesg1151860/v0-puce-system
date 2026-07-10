import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  captcha: z.string().min(1, "Debes responder el CAPTCHA"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
})

export const casoSACBasicoSchema = z.object({
  radicado: z.string().min(1, "El radicado es requerido"),
  ciudadano: z.string().min(1, "El ciudadano es requerido"),
  fechaRadicacion: z.string().min(1, "La fecha de radicación es requerida"),
  rol: z.string().min(1, "Selecciona un rol"),
  estado: z.string().min(1, "Selecciona un estado"),
})

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
  situacion: z.string().optional(),
  sacRespuesta: z.string().optional(),
  descripcion: z.string().optional(),
})

export const casoSIUCESchema = z.object({
  radicado: z.string().min(1, "El radicado es requerido"),
  avanceGeneral: z.number().min(0).max(100).default(0),
  estado: z.string().default("PENDIENTE"),
  ie: z.string().min(1, "La institución es requerida"),
  victima: z.string().min(1, "Nombre de la víctima requerido"),
  tipoIdentificacion: z.string().min(1, "Selecciona tipo de identificación"),
  numeroIdentificacion: z.string().min(1, "Número de identificación requerido"),
  grado: z.string().min(1, "Selecciona un grado"),
  danoPrincipal: z.string().min(1, "Selecciona el daño principal"),
  danoSecundario: z.string().optional(),
  danoTerciario: z.string().optional(),
  tipoAgresion: z.string().min(1, "Selecciona el tipo de agresión"),
  repetitivo: z.boolean().default(false),
  eventoGenerador: z.string().min(1, "Selecciona el evento generador"),
  otroEventoGenerador: z.string().optional(),
  rolAgresor: z.string().min(1, "Selecciona el rol del agresor"),
  nombreAgresor: z.string().min(1, "El nombre del agresor es requerido"),
  clasificacion: z.string().default("Tipo 1"),
  lugar: z.string().min(1, "Selecciona el lugar"),
  fechaOcurrencia: z.string().min(1, "Fecha de ocurrencia requerida"),
  fechaRegistro: z.string().min(1, "Fecha de registro requerida"),
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
  entidadesExternas: z.string().optional(),
  fechaRadicadoExternas: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type CasoSACBasicoFormData = z.infer<typeof casoSACBasicoSchema>
export type CasoSACExtendidoFormData = z.infer<typeof casoSACExtendidoSchema>
export type CasoSIUCEFormData = z.infer<typeof casoSIUCESchema>