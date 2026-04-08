"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
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
import { getCaseSIUCE, updateCaseSIUCE } from "@/lib/storage"
import type { CasoSIUCE } from "@/lib/types"

// Opciones de selección
const instituciones = [
  "I.E. Simón Bolívar",
  "I.E. Antonio Nariño",
  "I.E. Francisco de Paula Santander",
  "I.E. Policarpa Salavarrieta",
  "I.E. Rafael Uribe Uribe",
  "Otra",
] as const

const tiposIdentificacion = ["RC", "TI", "CC", "CE", "PPT", "NES"] as const

const grados = [
  "Preescolar", "Primero", "Segundo", "Tercero", "Cuarto", "Quinto",
  "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo", "Undécimo",
] as const

const tiposDano = ["Físico", "Psicológico", "Sexual", "Económico"] as const

// Tipos de agresión según reglas de negocio
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

const estadosSIUCE = ["EN PROGRESO", "PENDIENTE", "TERMINADO"] as const

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

// Función para obtener el daño automático basado en el tipo de agresión
function getDanoAutomatico(tipoAgresion: string): string | undefined {
  for (const [, config] of Object.entries(tiposAgresionConDano)) {
    if (config.agresiones.includes(tipoAgresion)) {
      return config.dano
    }
  }
  return undefined
}

// Función para calcular clasificación según Ley 1620
function calcularClasificacion(
  danoPrincipal: string,
  danoSecundario?: string,
  danoTerciario?: string,
  repetitivo?: boolean
): "Tipo 1" | "Tipo 2" | "Tipo 3" {
  if (danoPrincipal === "Sexual" || danoSecundario === "Sexual" || danoTerciario === "Sexual") {
    return "Tipo 3"
  }
  if (repetitivo || (danoPrincipal === "Físico" && (danoSecundario || danoTerciario))) {
    return "Tipo 2"
  }
  if (danoPrincipal === "Físico") {
    return "Tipo 2"
  }
  return "Tipo 1"
}

// Función para calcular el estado basado en el avance general
function calcularEstado(avanceGeneral: number): "PENDIENTE" | "EN PROGRESO" | "TERMINADO" {
  if (avanceGeneral === 0) return "PENDIENTE"
  if (avanceGeneral >= 100) return "TERMINADO"
  return "EN PROGRESO"
}

export default function EditarCasoSIUCEPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [caso, setCaso] = useState<CasoSIUCE | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [showOtroEvento, setShowOtroEvento] = useState(false)
  const [avanceIE, setAvanceIE] = useState(0)
  const [avanceSEM, setAvanceSEM] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CasoSIUCEFormData>({
    resolver: zodResolver(casoSIUCESchema),
  })

  const danoPrincipal = watch("danoPrincipal")
  const danoSecundario = watch("danoSecundario")
  const danoTerciario = watch("danoTerciario")
  const repetitivo = watch("repetitivo")
  const eventoGenerador = watch("eventoGenerador")

  useEffect(() => {
    const data = getCaseSIUCE(id)
    if (data) {
      setCaso(data)
      setAvanceIE(data.avanceIE)
      setAvanceSEM(data.avanceSEM)
      setShowOtroEvento(data.eventoGenerador === "Otro")
      
      reset({
        radicado: data.radicado,
        avanceGeneral: data.avanceGeneral,
        estado: data.estado,
        ie: data.ie,
        victima: data.victima,
        tipoIdentificacion: data.tipoIdentificacion,
        numeroIdentificacion: data.numeroIdentificacion,
        grado: data.grado,
        danoPrincipal: data.danoPrincipal,
        danoSecundario: data.danoSecundario || undefined,
        danoTerciario: data.danoTerciario || undefined,
        tipoAgresion: data.tipoAgresion,
        repetitivo: data.repetitivo,
        eventoGenerador: data.eventoGenerador,
        otroEventoGenerador: data.otroEventoGenerador || "",
        rolAgresor: data.rolAgresor,
        nombreAgresor: data.nombreAgresor,
        clasificacion: data.clasificacion,
        lugar: data.lugar,
        fechaOcurrencia: data.fechaOcurrencia,
        fechaRegistro: data.fechaRegistro,
        seguimientoIE: data.seguimientoIE,
        numeroSeguimientoIE: data.numeroSeguimientoIE,
        seguimientoPolicia: data.seguimientoPolicia,
        numeroSeguimientoPolicia: data.numeroSeguimientoPolicia,
        cec: data.cec,
        accionesIE: data.accionesIE || "",
        avanceIE: data.avanceIE,
        accionesSEM: data.accionesSEM || "",
        avanceSEM: data.avanceSEM,
        descripcionAvance: data.descripcionAvance || "",
        entidadesExternas: data.entidadesExternas || "",
        fechaRadicadoExternas: data.fechaRadicadoExternas || "",
      })
    } else {
      setNotFound(true)
    }
  }, [id, reset])

  // Actualizar clasificación
  useEffect(() => {
    if (danoPrincipal) {
      const clasificacion = calcularClasificacion(danoPrincipal, danoSecundario, danoTerciario, repetitivo)
      setValue("clasificacion", clasificacion)
    }
  }, [danoPrincipal, danoSecundario, danoTerciario, repetitivo, setValue])

  useEffect(() => {
    setShowOtroEvento(eventoGenerador === "Otro")
  }, [eventoGenerador])

  // Calcular avance general
  useEffect(() => {
    const avanceGeneral = Math.round((avanceIE + avanceSEM) / 2)
    setValue("avanceGeneral", avanceGeneral)
    
    if (avanceGeneral === 100) {
      setValue("estado", "TERMINADO")
    } else if (avanceGeneral > 0) {
      setValue("estado", "EN PROGRESO")
    } else {
      setValue("estado", "PENDIENTE")
    }
  }, [avanceIE, avanceSEM, setValue])

  const onSubmit = async (data: CasoSIUCEFormData) => {
    setError("")
    setIsLoading(true)

    try {
      updateCaseSIUCE(id, data)
      router.push("/siuce")
    } catch (err) {
      setError("Error al actualizar el caso. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Caso no encontrado</h2>
        <p className="text-slate-600 mb-4">El caso que buscas no existe o fue eliminado.</p>
        <Link href="/siuce">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </Link>
      </div>
    )
  }

  if (!caso) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/siuce">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Editar Caso SIUCE</h1>
            <Badge variant="outline" className="bg-slate-100">
              {caso.clasificacion}
            </Badge>
          </div>
          <p className="text-slate-600">Radicado: {caso.radicado} | Víctima: {caso.victima}</p>
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
            <CardDescription>Datos básicos de identificación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input id="radicado" {...register("radicado")} className={errors.radicado ? "border-red-500" : ""} />
                {errors.radicado && <p className="text-sm text-red-500">{errors.radicado.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ie">Institución Educativa *</Label>
                <Select defaultValue={caso.ie} onValueChange={(value) => setValue("ie", value)}>
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
                <Input id="fechaRegistro" type="date" {...register("fechaRegistro")} className={errors.fechaRegistro ? "border-red-500" : ""} />
                {errors.fechaRegistro && <p className="text-sm text-red-500">{errors.fechaRegistro.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select defaultValue={caso.estado} onValueChange={(value) => setValue("estado", value as CasoSIUCEFormData["estado"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosSIUCE.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="victima">Nombre de la Víctima *</Label>
                <Input id="victima" {...register("victima")} className={errors.victima ? "border-red-500" : ""} style={{ textTransform: "uppercase" }} />
                {errors.victima && <p className="text-sm text-red-500">{errors.victima.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoIdentificacion">Tipo de Identificación *</Label>
                <Select defaultValue={caso.tipoIdentificacion} onValueChange={(value) => setValue("tipoIdentificacion", value as CasoSIUCEFormData["tipoIdentificacion"])}>
                  <SelectTrigger className={errors.tipoIdentificacion ? "border-red-500" : ""}>
                    <SelectValue />
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
                <Input id="numeroIdentificacion" {...register("numeroIdentificacion")} className={errors.numeroIdentificacion ? "border-red-500" : ""} />
                {errors.numeroIdentificacion && <p className="text-sm text-red-500">{errors.numeroIdentificacion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grado">Grado *</Label>
                <Select defaultValue={caso.grado} onValueChange={(value) => setValue("grado", value as CasoSIUCEFormData["grado"])}>
                  <SelectTrigger className={errors.grado ? "border-red-500" : ""}>
                    <SelectValue />
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

        {/* Tipos de Daño y Agresión */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Daño y Agresión</CardTitle>
            <CardDescription>Clasificación según la Ley 1620 de 2013</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="danoPrincipal">Daño Principal *</Label>
                <Select defaultValue={caso.danoPrincipal} onValueChange={(value) => setValue("danoPrincipal", value as CasoSIUCEFormData["danoPrincipal"])}>
                  <SelectTrigger className={errors.danoPrincipal ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano} value={dano}>{dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.danoPrincipal && <p className="text-sm text-red-500">{errors.danoPrincipal.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoSecundario">Daño Secundario</Label>
                <Select defaultValue={caso.danoSecundario || "none"} onValueChange={(value) => setValue("danoSecundario", value === "none" ? undefined : value as CasoSIUCEFormData["danoSecundario"])}>
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
                <Select defaultValue={caso.danoTerciario || "none"} onValueChange={(value) => setValue("danoTerciario", value === "none" ? undefined : value as CasoSIUCEFormData["danoTerciario"])}>
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
                <Label htmlFor="tipoAgresion">Tipo de Agresión *</Label>
                <Select defaultValue={caso.tipoAgresion} onValueChange={(value) => setValue("tipoAgresion", value as CasoSIUCEFormData["tipoAgresion"])}>
                  <SelectTrigger className={errors.tipoAgresion ? "border-red-500" : ""}>
                    <SelectValue />
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
                <Label htmlFor="eventoGenerador">Evento Generador *</Label>
                <Select defaultValue={caso.eventoGenerador} onValueChange={(value) => setValue("eventoGenerador", value as CasoSIUCEFormData["eventoGenerador"])}>
                  <SelectTrigger className={errors.eventoGenerador ? "border-red-500" : ""}>
                    <SelectValue />
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
                  <Input id="otroEventoGenerador" {...register("otroEventoGenerador")} />
                </div>
              )}

              <div className="flex items-center space-x-3 pt-6">
                <Switch id="repetitivo" defaultChecked={caso.repetitivo} onCheckedChange={(checked) => setValue("repetitivo", checked)} />
                <Label htmlFor="repetitivo">¿Es conducta repetitiva?</Label>
              </div>

              <div className="space-y-2">
                <Label>Clasificación (Automática)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50">
                  <span className="font-medium">{watch("clasificacion") || caso.clasificacion}</span>
                </div>
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="rolAgresor">Rol del Agresor *</Label>
                <Select defaultValue={caso.rolAgresor} onValueChange={(value) => setValue("rolAgresor", value as CasoSIUCEFormData["rolAgresor"])}>
                  <SelectTrigger className={errors.rolAgresor ? "border-red-500" : ""}>
                    <SelectValue />
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
                <Input id="nombreAgresor" {...register("nombreAgresor")} className={errors.nombreAgresor ? "border-red-500" : ""} style={{ textTransform: "uppercase" }} />
                {errors.nombreAgresor && <p className="text-sm text-red-500">{errors.nombreAgresor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar *</Label>
                <Select defaultValue={caso.lugar} onValueChange={(value) => setValue("lugar", value as CasoSIUCEFormData["lugar"])}>
                  <SelectTrigger className={errors.lugar ? "border-red-500" : ""}>
                    <SelectValue />
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
                <Input id="fechaOcurrencia" type="date" {...register("fechaOcurrencia")} className={errors.fechaOcurrencia ? "border-red-500" : ""} />
                {errors.fechaOcurrencia && <p className="text-sm text-red-500">{errors.fechaOcurrencia.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Seguimientos</CardTitle>
            <CardDescription>Acciones de seguimiento del caso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch id="seguimientoIE" defaultChecked={caso.seguimientoIE} onCheckedChange={(checked) => setValue("seguimientoIE", checked)} />
                  <Label htmlFor="seguimientoIE">Seguimiento I.E.</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroSeguimientoIE">Número de Seguimientos I.E.</Label>
                  <Input id="numeroSeguimientoIE" type="number" min="0" {...register("numeroSeguimientoIE", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accionesIE">Acciones de I.E.</Label>
                  <Textarea id="accionesIE" placeholder="Describe las acciones..." rows={2} {...register("accionesIE")} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch id="seguimientoPolicia" defaultChecked={caso.seguimientoPolicia} onCheckedChange={(checked) => setValue("seguimientoPolicia", checked)} />
                  <Label htmlFor="seguimientoPolicia">Seguimiento Policía</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroSeguimientoPolicia">Número de Seguimientos Policía</Label>
                  <Input id="numeroSeguimientoPolicia" type="number" min="0" {...register("numeroSeguimientoPolicia", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accionesSEM">Acciones de S.E.M.</Label>
                  <Textarea id="accionesSEM" placeholder="Describe las acciones..." rows={2} {...register("accionesSEM")} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch id="cec" defaultChecked={caso.cec} onCheckedChange={(checked) => setValue("cec", checked)} />
                  <Label htmlFor="cec">CEC (Comité Escolar de Convivencia)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avances */}
        <Card>
          <CardHeader>
            <CardTitle>Avances</CardTitle>
            <CardDescription>Porcentaje de avance del caso (Avance General: {watch("avanceGeneral") || 0}%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avanceIE">Avance I.E.</Label>
                  <span className="text-sm font-medium">{avanceIE}%</span>
                </div>
                <Slider
                  id="avanceIE"
                  min={0}
                  max={100}
                  step={5}
                  value={[avanceIE]}
                  onValueChange={(value) => {
                    setAvanceIE(value[0])
                    setValue("avanceIE", value[0])
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avanceSEM">Avance S.E.M.</Label>
                  <span className="text-sm font-medium">{avanceSEM}%</span>
                </div>
                <Slider
                  id="avanceSEM"
                  min={0}
                  max={100}
                  step={5}
                  value={[avanceSEM]}
                  onValueChange={(value) => {
                    setAvanceSEM(value[0])
                    setValue("avanceSEM", value[0])
                  }}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="descripcionAvance">Descripción del Avance</Label>
                <Textarea id="descripcionAvance" placeholder="Describe las acciones realizadas..." rows={3} {...register("descripcionAvance")} />
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
                <Label htmlFor="entidadesExternas">Radicado de Respuesta</Label>
                <Input id="entidadesExternas" placeholder="Ej: CUC2024EE002434" {...register("entidadesExternas")} />
                <p className="text-xs text-slate-500">Formato: CUCYYYY####### (Ej: CUC2024EE002434)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRadicadoExternas">Fecha de Radicado</Label>
                <Input id="fechaRadicadoExternas" type="date" {...register("fechaRadicadoExternas")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/siuce">
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
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
