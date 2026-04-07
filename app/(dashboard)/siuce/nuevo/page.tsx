"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

import { casoSIUCESchema, type CasoSIUCEFormData } from "@/lib/validations"
import { createCaseSIUCE } from "@/lib/storage"

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

const tiposAgresion = ["Verbal", "Física", "Gestual", "Relacional"] as const

const eventosGeneradores = ["Consumo de SPA", "Discriminación", "Conflicto", "Otro"] as const

const rolesAgresor = ["Estudiante", "Docente", "Familiar", "Administrativo", "Desconocido", "Vecino"] as const

const lugares = ["Calle", "Casa", "Colegio", "Redes Sociales"] as const

// Función para calcular clasificación automáticamente
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
  // Si es repetitivo o hay múltiples daños graves, es Tipo 2
  if (repetitivo || (danoPrincipal === "Físico" && (danoSecundario || danoTerciario))) {
    return "Tipo 2"
  }
  // Caso básico
  return "Tipo 1"
}

export default function NuevoCasoSIUCEPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOtroEvento, setShowOtroEvento] = useState(false)
  const [avanceIE, setAvanceIE] = useState(0)
  const [avanceSEM, setAvanceSEM] = useState(0)

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
      estado: "EN PROGRESO",
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

  const danoPrincipal = watch("danoPrincipal")
  const danoSecundario = watch("danoSecundario")
  const danoTerciario = watch("danoTerciario")
  const repetitivo = watch("repetitivo")
  const eventoGenerador = watch("eventoGenerador")

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

  // Calcular avance general
  useEffect(() => {
    const avanceGeneral = Math.round((avanceIE + avanceSEM) / 2)
    setValue("avanceGeneral", avanceGeneral)
    
    // Actualizar estado automáticamente
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
      createCaseSIUCE(data)
      router.push("/siuce")
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
        <Link href="/siuce">
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
                  placeholder="Sin separadores"
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
                <Select onValueChange={(value) => setValue("danoPrincipal", value as CasoSIUCEFormData["danoPrincipal"])}>
                  <SelectTrigger className={errors.danoPrincipal ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el daño" />
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
                <Select onValueChange={(value) => setValue("danoSecundario", value as CasoSIUCEFormData["danoSecundario"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano} value={dano}>{dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoTerciario">Daño Terciario</Label>
                <Select onValueChange={(value) => setValue("danoTerciario", value as CasoSIUCEFormData["danoTerciario"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano} value={dano}>{dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoAgresion">Tipo de Agresión *</Label>
                <Select onValueChange={(value) => setValue("tipoAgresion", value as CasoSIUCEFormData["tipoAgresion"])}>
                  <SelectTrigger className={errors.tipoAgresion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona tipo" />
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

              <div className="space-y-2">
                <Label>Clasificación (Automática)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50">
                  <span className="font-medium">{watch("clasificacion") || "Tipo 1"}</span>
                </div>
                <p className="text-xs text-slate-500">Calculada según Ley 1620</p>
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
                  <Switch
                    id="seguimientoIE"
                    onCheckedChange={(checked) => setValue("seguimientoIE", checked)}
                  />
                  <Label htmlFor="seguimientoIE">Seguimiento I.E.</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroSeguimientoIE">Número de Seguimientos I.E.</Label>
                  <Input
                    id="numeroSeguimientoIE"
                    type="number"
                    min="0"
                    {...register("numeroSeguimientoIE", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="seguimientoPolicia"
                    onCheckedChange={(checked) => setValue("seguimientoPolicia", checked)}
                  />
                  <Label htmlFor="seguimientoPolicia">Seguimiento Policía</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroSeguimientoPolicia">Número de Seguimientos Policía</Label>
                  <Input
                    id="numeroSeguimientoPolicia"
                    type="number"
                    min="0"
                    {...register("numeroSeguimientoPolicia", { valueAsNumber: true })}
                  />
                </div>
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

        {/* Avances */}
        <Card>
          <CardHeader>
            <CardTitle>Avances</CardTitle>
            <CardDescription>Porcentaje de avance del caso</CardDescription>
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
                Guardar Caso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
