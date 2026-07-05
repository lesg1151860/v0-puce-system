"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { casoSIUCESchema, type CasoSIUCEFormData } from "@/lib/validations"
import { createCaseSIUCE, isRadicadoSIUCEDuplicado, isIdentificacionSIUCEDuplicada } from "@/lib/storage"
import { sanitizeText, hasSpecialChars, SPECIAL_CHARS_ERROR } from "@/lib/text-utils"

// Opciones de selección
const instituciones = [
  "I.E. Simón Bolívar",
  "I.E. Antonio Nariño",
  "I.E. Francisco de Paula Santander",
  "I.E. Policarpa Salavarrieta",
  "I.E. Rafael Uribe Uribe",
  "I.E. José María Córdoba",
  "Otra",
] as const

const tiposIdentificacion = ["RC", "TI", "CC", "CE", "PPT", "NES"] as const

const grados = [
  "Preescolar", "Primero", "Segundo", "Tercero", "Cuarto", "Quinto",
  "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo", "Undécimo",
] as const

const tiposDano = ["Físico", "Psicológico", "Sexual", "Económico"] as const

// Tipos de agresión con su daño asociado según reglas de negocio
const tiposAgresionConDano: Record<string, { agresiones: string[], dano: string }> = {
  "Económico": { 
    agresiones: ["Hurto"], 
    dano: "Económico" 
  },
  "Físico": { 
    agresiones: ["Acoso escolar", "Violencia Intrafamiliar", "Agresión física grave", "Agresión física reiterada"], 
    dano: "Físico" 
  },
  "Sexual": { 
    agresiones: ["Acoso sexual", "Sexteo", "Violencia sexual"], 
    dano: "Sexual" 
  },
  "Psicológico": { 
    agresiones: ["Agresión Verbal", "Agresión gestual", "Violencia Intrafamiliar", "Agresión electrónica"], 
    dano: "Psicológico" 
  },
}

// Lista plana de todas las agresiones
const tiposAgresion = [
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
] as const

const eventosGeneradores = ["Consumo de SPA", "Discriminación", "Conflicto", "Otro"] as const
const rolesAgresor = ["Estudiante", "Docente", "Familiar", "Administrativo", "Desconocido", "Vecino"] as const
const lugares = ["Calle", "Casa", "Colegio", "Redes Sociales"] as const

// Acciones I.E. con sus porcentajes
const accionesIE = [
  { label: "Sin acciones", value: 0 },
  { label: "Entrevista estudiantes", value: 12.5 },
  { label: "Citación de los padres", value: 25 },
  { label: "Atención orientación escolar", value: 37.5 },
  { label: "Activación de ruta de CE", value: 50 },
  { label: "Llamado de atención y reporte", value: 62.5 },
  { label: "Seguimiento a la ruta", value: 75 },
  { label: "Taller pedagógico", value: 87.5 },
  { label: "Solución del caso", value: 100 },
  { label: "Suspensión pedagógica", value: -25 },
  { label: "Reubicación de docente", value: -50 },
  { label: "Traslado de estudiante", value: -75 },
  { label: "Cancelación de matrícula", value: -100 },
] as const

// Acciones S.E.M. con sus porcentajes
const accionesSEM = [
  { label: "No se radicó", value: 0 },
  { label: "Radicación", value: 14.3 },
  { label: "Requerimiento activación de ruta", value: 28.6 },
  { label: "Citación de las partes", value: 42.9 },
  { label: "Acompañamiento Comité Escolar", value: 57.1 },
  { label: "Charla/intervención en la IE", value: 71.4 },
  { label: "Charla pedagógica", value: 71.4 },
  { label: "Traslado del docente", value: 85.7 },
  { label: "Archivo de la diligencia", value: 100 },
] as const

// Función para obtener el daño automático basado en el tipo de agresión
function getDanoAutomatico(tipoAgresion: string): string | undefined {
  for (const [, config] of Object.entries(tiposAgresionConDano)) {
    if (config.agresiones.includes(tipoAgresion)) {
      return config.dano
    }
  }
  return undefined
}

// Función para calcular clasificación automáticamente según Ley 1620
function calcularClasificacion(
  danoPrincipal: string,
  danoSecundario?: string,
  danoTerciario?: string,
  repetitivo?: boolean
): "Tipo 1" | "Tipo 2" | "Tipo 3" {
  // Si hay daño sexual, siempre es Tipo 3
  if (danoPrincipal === "Sexual" || danoSecundario === "Sexual" || danoTerciario === "Sexual") {
    return "Tipo 3"
  }
  // Si es repetitivo o hay daño físico con otros daños, es Tipo 2
  if (repetitivo || (danoPrincipal === "Físico" && (danoSecundario || danoTerciario))) {
    return "Tipo 2"
  }
  // Si hay daño físico grave solo, puede ser Tipo 2
  if (danoPrincipal === "Físico") {
    return "Tipo 2"
  }
  // Caso básico - psicológico o económico sin agravantes
  return "Tipo 1"
}

// Función para calcular el estado basado en el avance general
function calcularEstado(avanceGeneral: number): "PENDIENTE" | "EN PROGRESO" | "TERMINADO" {
  if (avanceGeneral === 0) return "PENDIENTE"
  if (avanceGeneral >= 100) return "TERMINADO"
  return "EN PROGRESO"
}

export default function NuevoCasoSIUCEPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOtroEvento, setShowOtroEvento] = useState(false)
  
  // Estados para seguimientos condicionales
  const [seguimientoIE, setSeguimientoIE] = useState(false)
  const [seguimientoPolicia, setSeguimientoPolicia] = useState(false)
  
  // Estados para avances
  const [avanceIE, setAvanceIE] = useState(0)
  const [avanceSEM, setAvanceSEM] = useState(0)
  const [avanceGeneral, setAvanceGeneral] = useState(0)
  const [estadoCalculado, setEstadoCalculado] = useState<"PENDIENTE" | "EN PROGRESO" | "TERMINADO">("PENDIENTE")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CasoSIUCEFormData>({
    resolver: zodResolver(casoSIUCESchema),
    defaultValues: {
      avanceGeneral: 0,
      estado: "PENDIENTE",
      repetitivo: false,
      seguimientoIE: false,
      numeroSeguimientoIE: 0,
      seguimientoPolicia: false,
      numeroSeguimientoPolicia: 0,
      cec: false,
      avanceIE: 0,
      avanceSEM: 0,
      clasificacion: "Tipo 1",
    },
  })

  const tipoAgresion = watch("tipoAgresion")
  const danoPrincipal = watch("danoPrincipal")
  const danoSecundario = watch("danoSecundario")
  const danoTerciario = watch("danoTerciario")
  const repetitivo = watch("repetitivo")
  const eventoGenerador = watch("eventoGenerador")

  // Actualizar daño automáticamente cuando cambia el tipo de agresión
  useEffect(() => {
    if (tipoAgresion) {
      const danoAutomatico = getDanoAutomatico(tipoAgresion)
      if (danoAutomatico) {
        setValue("danoPrincipal", danoAutomatico as CasoSIUCEFormData["danoPrincipal"])
      }
    }
  }, [tipoAgresion, setValue])

  // Actualizar clasificación automáticamente
  useEffect(() => {
    if (danoPrincipal) {
      const clasificacion = calcularClasificacion(danoPrincipal, danoSecundario, danoTerciario, repetitivo)
      setValue("clasificacion", clasificacion)
    }
  }, [danoPrincipal, danoSecundario, danoTerciario, repetitivo, setValue])

  // Mostrar campo "otro" si se selecciona
  useEffect(() => {
    setShowOtroEvento(eventoGenerador === "Otro")
  }, [eventoGenerador])

  // Calcular avance general (promedio de avances I.E. y S.E.M.)
  useEffect(() => {
    const promedio = Math.round((avanceIE + avanceSEM) / 2)
    setAvanceGeneral(promedio)
    setValue("avanceGeneral", promedio)
    
    // Calcular estado automáticamente
    const estado = calcularEstado(promedio)
    setEstadoCalculado(estado)
    setValue("estado", estado)
  }, [avanceIE, avanceSEM, setValue])

 const onSubmit = async (data: CasoSIUCEFormData) => {
  setError("")
  setIsLoading(true)
  
  try {
    // Validar caracteres especiales en campos de texto
    if (hasSpecialChars(data.victima) || hasSpecialChars(data.nombreAgresor)) {
      setError(SPECIAL_CHARS_ERROR)
      setIsLoading(false)
      return
    }

    // Validar que el radicado sea unico
    if (isRadicadoSIUCEDuplicado(data.radicado)) {
      setError("El radicado ya existe en el sistema. Por favor ingrese un radicado unico.")
      setIsLoading(false)
      return
    }

    // Validar que el numero de identificacion sea unico
    if (isIdentificacionSIUCEDuplicada(data.numeroIdentificacion)) {
      setError("El numero de identificacion ya existe en el sistema. Por favor verifique los datos.")
      setIsLoading(false)
      return
    }

    // Normalizar campos de texto a mayusculas sin tildes
    const normalizedData: CasoSIUCEFormData = {
      ...data,
      victima: sanitizeText(data.victima),
      nombreAgresor: sanitizeText(data.nombreAgresor),
      descripcionAvance: data.descripcionAvance ? sanitizeText(data.descripcionAvance) : data.descripcionAvance,
      otroEventoGenerador: data.otroEventoGenerador ? sanitizeText(data.otroEventoGenerador) : data.otroEventoGenerador,
    }

    createCaseSIUCE(normalizedData as any) // Guardar el caso en el almacenamiento local
    router.push("/lider/siuce")
  } catch (err) {
    setError("Error al guardar el caso. Intente nuevamente.")
  } finally {
    setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lider/siuce">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Caso SIUCE</h1>
          <p className="text-slate-600">Sistema de Información Unificado de Convivencia Escolar</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Identificación del Caso */}
        <Card>
          <CardHeader>
            <CardTitle>Identificación del Caso</CardTitle>
            <CardDescription>Datos básicos de identificación del caso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input
                  id="radicado"
                  placeholder="Ej: 35024"
                  {...register("radicado")}
                  className={errors.radicado ? "border-red-500" : ""}
                />
                {errors.radicado && <p className="text-sm text-red-500">{errors.radicado.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ie">Institución Educativa *</Label>
                <Select onValueChange={(value) => setValue("ie", value)}>
                  <SelectTrigger className={errors.ie ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona la I.E." />
                  </SelectTrigger>
                  <SelectContent>
                    {instituciones.map((ie) => (
                      <SelectItem key={ie} value={ie}>{ie}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ie && <p className="text-sm text-red-500">{errors.ie.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRegistro">Fecha de Registro *</Label>
                <Input
                  id="fechaRegistro"
                  type="date"
                  {...register("fechaRegistro")}
                  className={errors.fechaRegistro ? "border-red-500" : ""}
                />
                {errors.fechaRegistro && <p className="text-sm text-red-500">{errors.fechaRegistro.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Víctima */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Víctima</CardTitle>
            <CardDescription>Datos del estudiante afectado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="victima">Nombre de la Víctima *</Label>
                <Input
                  id="victima"
                  placeholder="Nombre en mayúsculas"
                  {...register("victima")}
                  className={errors.victima ? "border-red-500" : ""}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.victima && <p className="text-sm text-red-500">{errors.victima.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoIdentificacion">Tipo de Identificación *</Label>
                <Select onValueChange={(value) => setValue("tipoIdentificacion", value as CasoSIUCEFormData["tipoIdentificacion"])}>
                  <SelectTrigger className={errors.tipoIdentificacion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposIdentificacion.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoIdentificacion && <p className="text-sm text-red-500">{errors.tipoIdentificacion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroIdentificacion">Número de Identificación *</Label>
                <Input
                  id="numeroIdentificacion"
                  placeholder="Sin separadores (Ej: 1092537583)"
                  {...register("numeroIdentificacion")}
                  className={errors.numeroIdentificacion ? "border-red-500" : ""}
                />
                {errors.numeroIdentificacion && <p className="text-sm text-red-500">{errors.numeroIdentificacion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grado">Grado *</Label>
                <Select onValueChange={(value) => setValue("grado", value as CasoSIUCEFormData["grado"])}>
                  <SelectTrigger className={errors.grado ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {grados.map((grado) => (
                      <SelectItem key={grado} value={grado}>{grado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grado && <p className="text-sm text-red-500">{errors.grado.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Agresión y Daño */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Agresión y Daño</CardTitle>
            <CardDescription>
              El tipo de daño se selecciona automáticamente según el tipo de agresión (Ley 1620 de 2013)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tipoAgresion">Tipo de Agresión *</Label>
                <Select onValueChange={(value) => setValue("tipoAgresion", value as CasoSIUCEFormData["tipoAgresion"])}>
                  <SelectTrigger className={errors.tipoAgresion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAgresion.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoAgresion && <p className="text-sm text-red-500">{errors.tipoAgresion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoPrincipal">Daño Principal (Automático)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50">
                  <span className="font-medium">{danoPrincipal || "Se asigna al seleccionar agresión"}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Calculado según tipo de agresión
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoSecundario">Daño Secundario</Label>
                <Select onValueChange={(value) => setValue("danoSecundario", value === "none" ? undefined : value as CasoSIUCEFormData["danoSecundario"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano} value={dano}>{dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoTerciario">Daño Terciario</Label>
                <Select onValueChange={(value) => setValue("danoTerciario", value === "none" ? undefined : value as CasoSIUCEFormData["danoTerciario"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano} value={dano}>{dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventoGenerador">Evento Generador *</Label>
                <Select onValueChange={(value) => setValue("eventoGenerador", value as CasoSIUCEFormData["eventoGenerador"])}>
                  <SelectTrigger className={errors.eventoGenerador ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventosGeneradores.map((evento) => (
                      <SelectItem key={evento} value={evento}>{evento}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventoGenerador && <p className="text-sm text-red-500">{errors.eventoGenerador.message}</p>}
              </div>

              {showOtroEvento && (
                <div className="space-y-2">
                  <Label htmlFor="otroEventoGenerador">Especifique Otro Evento</Label>
                  <Input
                    id="otroEventoGenerador"
                    placeholder="Describa el evento"
                    {...register("otroEventoGenerador")}
                  />
                </div>
              )}

              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  id="repetitivo"
                  onCheckedChange={(checked) => setValue("repetitivo", checked)}
                />
                <Label htmlFor="repetitivo">¿Es conducta repetitiva?</Label>
              </div>

              <div className="space-y-2">
                <Label>Clasificación (Automática)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50">
                  <Badge variant="outline" className={
                    watch("clasificacion") === "Tipo 3" ? "bg-red-100 text-red-800 border-red-200" :
                    watch("clasificacion") === "Tipo 2" ? "bg-orange-100 text-orange-800 border-orange-200" :
                    "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }>
                    {watch("clasificacion") || "Tipo 1"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">Calculada según Ley 1620 de 2013</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Agresor */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Agresor</CardTitle>
            <CardDescription>Datos de la persona agresora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rolAgresor">Rol del Agresor *</Label>
                <Select onValueChange={(value) => setValue("rolAgresor", value as CasoSIUCEFormData["rolAgresor"])}>
                  <SelectTrigger className={errors.rolAgresor ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesAgresor.map((rol) => (
                      <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rolAgresor && <p className="text-sm text-red-500">{errors.rolAgresor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreAgresor">Nombre del Agresor *</Label>
                <Input
                  id="nombreAgresor"
                  placeholder="Nombre en mayúsculas"
                  {...register("nombreAgresor")}
                  className={errors.nombreAgresor ? "border-red-500" : ""}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.nombreAgresor && <p className="text-sm text-red-500">{errors.nombreAgresor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar *</Label>
                <Select onValueChange={(value) => setValue("lugar", value as CasoSIUCEFormData["lugar"])}>
                  <SelectTrigger className={errors.lugar ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el lugar" />
                  </SelectTrigger>
                  <SelectContent>
                    {lugares.map((lugar) => (
                      <SelectItem key={lugar} value={lugar}>{lugar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lugar && <p className="text-sm text-red-500">{errors.lugar.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaOcurrencia">Fecha de Ocurrencia *</Label>
                <Input
                  id="fechaOcurrencia"
                  type="date"
                  {...register("fechaOcurrencia")}
                  className={errors.fechaOcurrencia ? "border-red-500" : ""}
                />
                {errors.fechaOcurrencia && <p className="text-sm text-red-500">{errors.fechaOcurrencia.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Seguimientos</CardTitle>
            <CardDescription>Acciones de seguimiento del caso por parte de I.E. y Policía</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="seguimientoIE"
                    checked={seguimientoIE}
                    onCheckedChange={(checked) => {
                      setSeguimientoIE(checked)
                      setValue("seguimientoIE", checked)
                      if (!checked) {
                        setValue("numeroSeguimientoIE", 0)
                      }
                    }}
                  />
                  <Label htmlFor="seguimientoIE">Seguimiento I.E.</Label>
                </div>
                {seguimientoIE && (
                  <div className="space-y-2">
                    <Label htmlFor="numeroSeguimientoIE">Número de Seguimientos I.E.</Label>
                    <Input
                      id="numeroSeguimientoIE"
                      type="number"
                      min="0"
                      {...register("numeroSeguimientoIE", { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="seguimientoPolicia"
                    checked={seguimientoPolicia}
                    onCheckedChange={(checked) => {
                      setSeguimientoPolicia(checked)
                      setValue("seguimientoPolicia", checked)
                      if (!checked) {
                        setValue("numeroSeguimientoPolicia", 0)
                      }
                    }}
                  />
                  <Label htmlFor="seguimientoPolicia">Seguimiento Policía</Label>
                </div>
                {seguimientoPolicia && (
                  <div className="space-y-2">
                    <Label htmlFor="numeroSeguimientoPolicia">Número de Seguimientos Policía</Label>
                    <Input
                      id="numeroSeguimientoPolicia"
                      type="number"
                      min="0"
                      {...register("numeroSeguimientoPolicia", { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="cec"
                    onCheckedChange={(checked) => setValue("cec", checked)}
                  />
                  <Label htmlFor="cec">CEC (Comité Escolar de Convivencia)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones y Avances */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones y Avances</CardTitle>
            <CardDescription>
              Los porcentajes de avance se calculan automáticamente según las acciones seleccionadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Acciones I.E. */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accionesIE">Acciones de I.E.</Label>
                  <Select onValueChange={(value) => {
                    const accion = accionesIE.find(a => a.label === value)
                    if (accion) {
                      setValue("accionesIE", value)
                      setAvanceIE(accion.value)
                      setValue("avanceIE", accion.value)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la acción" />
                    </SelectTrigger>
                    <SelectContent>
                      {accionesIE.map((accion) => (
                        <SelectItem key={accion.label} value={accion.label}>
                          {accion.label} ({accion.value}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Avance I.E.</span>
                    <span className="font-medium">{avanceIE}%</span>
                  </div>
                  <Progress value={Math.max(avanceIE, 0)} className="h-2" />
                </div>
              </div>

              {/* Acciones S.E.M. */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accionesSEM">Acciones de S.E.M.</Label>
                  <Select onValueChange={(value) => {
                    const accion = accionesSEM.find(a => a.label === value)
                    if (accion) {
                      setValue("accionesSEM", value)
                      setAvanceSEM(accion.value)
                      setValue("avanceSEM", accion.value)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la acción" />
                    </SelectTrigger>
                    <SelectContent>
                      {accionesSEM.map((accion) => (
                        <SelectItem key={accion.label} value={accion.label}>
                          {accion.label} ({accion.value}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Avance S.E.M.</span>
                    <span className="font-medium">{avanceSEM}%</span>
                  </div>
                  <Progress value={avanceSEM} className="h-2" />
                </div>
              </div>

              {/* Avance General y Estado */}
              <div className="sm:col-span-2 p-4 rounded-lg bg-slate-50 border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Avance General (Automático)</Label>
                      <span className="text-lg font-bold">{avanceGeneral}%</span>
                    </div>
                    <Progress value={avanceGeneral} className="h-3" />
                    <p className="text-xs text-slate-500">Promedio de Avance I.E. y Avance S.E.M.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (Automático)</Label>
                    <div className="flex items-center h-10">
                      <Badge variant="outline" className={
                        estadoCalculado === "TERMINADO" ? "bg-green-100 text-green-800 border-green-200" :
                        estadoCalculado === "EN PROGRESO" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }>
                        {estadoCalculado}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      0% = PENDIENTE | 1-99% = EN PROGRESO | 100% = TERMINADO
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="descripcionAvance">Descripción del Avance</Label>
                <Textarea
                  id="descripcionAvance"
                  placeholder="Describe las acciones realizadas..."
                  rows={3}
                  {...register("descripcionAvance")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entidades Externas */}
        <Card>
          <CardHeader>
            <CardTitle>Entidades Externas</CardTitle>
            <CardDescription>Respuesta de la SEM a la I.E.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entidadesExternas">Radicado Entidades Externas</Label>
                <Input
                  id="entidadesExternas"
                  placeholder="Ej: CUC2024EE002434"
                  {...register("entidadesExternas")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaRadicadoExternas">Fecha de Respuesta</Label>
                <Input
                  id="fechaRadicadoExternas"
                  type="date"
                  {...register("fechaRadicadoExternas")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/lider/siuce">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Caso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
