"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

import { casoSACExtendidoSchema, type CasoSACExtendidoFormData } from "@/lib/validations"
import { sanitizeText, hasSpecialChars, SPECIAL_CHARS_ERROR } from "@/lib/text-utils"
import { getCaseSAC, updateCaseSAC, isRadicadoSACDuplicado } from "@/lib/storage"
import type { CasoSAC } from "@/lib/types"

const roles = [
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

const estados = ["EN SEGUIMIENTO", "TERMINADO"] as const
const situaciones = ["Tipo 1", "Tipo 2", "Tipo 3"] as const
const sacRespuestas = ["ENVIADA", "NO", "SÍ"] as const

const instituciones = [
  "I.E. Simón Bolívar",
  "I.E. Antonio Nariño",
  "I.E. Francisco de Paula Santander",
  "I.E. Policarpa Salavarrieta",
  "I.E. Rafael Uribe Uribe",
  "I.E. José María Córdoba",
  "I.E. María Auxiliadora",
  "Otra",
] as const

export default function EditarCasoSACPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [caso, setCaso] = useState<CasoSAC | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  
  // Estados para campos condicionales
  const [trasladoIE, setTrasladoIE] = useState(false)
  const [prorroga, setProrroga] = useState(false)
  const [contestacionIE, setContestacionIE] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [radicadoRespuesta, setRadicadoRespuesta] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CasoSACExtendidoFormData>({
    resolver: zodResolver(casoSACExtendidoSchema),
  })

  // Automatizar respuesta al ciudadano si hay prorroga o radicado respuesta
  useEffect(() => {
    if (prorroga || radicadoRespuesta) {
      setRespondido(true)
      setValue("respondido", true)
    }
  }, [prorroga, radicadoRespuesta, setValue])

  useEffect(() => {
    const data = getCaseSAC(id)
    if (data) {
      setCaso(data)
      // Set conditional states
      setTrasladoIE(data.trasladoIE || false)
      setProrroga(data.prorroga || false)
      setContestacionIE(data.contestacionIE || false)
      setRespondido(data.respondido || false)
      setRadicadoRespuesta(data.radicadoRespuesta || "")
      
      // Reset form with existing data
      reset({
        radicado: data.radicado,
        ciudadano: data.ciudadano,
        fechaRadicacion: data.fechaRadicacion,
        radicadoRespuesta: data.radicadoRespuesta || "",
        rol: data.rol,
        estado: data.estado,
        trasladoIE: data.trasladoIE || false,
        radicadoExterna: data.radicadoExterna || "",
        respondido: data.respondido || false,
        prorroga: data.prorroga || false,
        fechaNuevaProrroga: data.fechaNuevaProrroga || "",
        radicadoProrroga: data.radicadoProrroga || "",
        contestacionIE: data.contestacionIE || false,
        radicadoContestacion: data.radicadoContestacion || "",
        estudiante: data.estudiante || "",
        institucionContraQuienSeDirige: data.institucionContraQuienSeDirige || "",
        situacion: data.situacion,
        sacRespuesta: data.sacRespuesta,
        descripcion: data.descripcion || "",
      })
    } else {
      setNotFound(true)
    }
  }, [id, reset])

 const onSubmit = async (data: CasoSACExtendidoFormData) => {
  setError("")
  setIsLoading(true)
  
  try {
    // Validar caracteres especiales en campos de texto
    if (hasSpecialChars(data.ciudadano) || hasSpecialChars(data.estudiante || "")) {
      setError(SPECIAL_CHARS_ERROR)
      setIsLoading(false)
      return
    }

    // Validar que el radicado sea unico (excluyendo el caso actual)
    if (isRadicadoSACDuplicado(data.radicado, id)) {
      setError("El radicado ya existe en otro caso. Por favor ingrese un radicado unico.")
      setIsLoading(false)
      return
    }

    // Normalizar campos de texto a mayusculas sin tildes
    const normalizedData = {
      ...data,
      ciudadano: sanitizeText(data.ciudadano),
      estudiante: data.estudiante ? sanitizeText(data.estudiante) : undefined,
      descripcion: data.descripcion ? sanitizeText(data.descripcion) : undefined,
    }

    updateCaseSAC(id, normalizedData)
    router.push("/sac")
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
        <Link href="/sac">
          <Button className="bg-blue-600 hover:bg-blue-700">
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sac">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Caso SAC</h1>
          <p className="text-slate-600">Radicado: {caso.radicado}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del caso en el SAC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input
                  id="radicado"
                  placeholder="Ej: CUC2024ER002434"
                  {...register("radicado")}
                  className={errors.radicado ? "border-red-500" : ""}
                />
                {errors.radicado && (
                  <p className="text-sm text-red-500">{errors.radicado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudadano">Ciudadano *</Label>
                <Input
                  id="ciudadano"
                  placeholder="Nombre en mayúsculas"
                  {...register("ciudadano")}
                  className={errors.ciudadano ? "border-red-500" : ""}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.ciudadano && (
                  <p className="text-sm text-red-500">{errors.ciudadano.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRadicacion">Fecha de Radicación *</Label>
                <Input
                  id="fechaRadicacion"
                  type="date"
                  {...register("fechaRadicacion")}
                  className={errors.fechaRadicacion ? "border-red-500" : ""}
                />
                {errors.fechaRadicacion && (
                  <p className="text-sm text-red-500">{errors.fechaRadicacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="radicadoRespuesta">Radicado Respuesta</Label>
                <Input
                  id="radicadoRespuesta"
                  placeholder="Ej: CUC2024EE002434"
                  {...register("radicadoRespuesta")}
                  onChange={(e) => {
                    const value = e.target.value
                    setRadicadoRespuesta(value)
                    setValue("radicadoRespuesta", value)
                  }}
                />
                <p className="text-xs text-slate-500">Codigo del documento final de respuesta (marca automaticamente como respondido)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  defaultValue={caso.rol}
                  onValueChange={(value) => setValue("rol", value as CasoSACExtendidoFormData["rol"])}
                >
                  <SelectTrigger className={errors.rol ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rol && (
                  <p className="text-sm text-red-500">{errors.rol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estudiante">Estudiante</Label>
                <Input
                  id="estudiante"
                  placeholder="Nombre del estudiante involucrado"
                  {...register("estudiante")}
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traslado a I.E. */}
        <Card>
          <CardHeader>
            <CardTitle>Traslado a Institución Educativa</CardTitle>
            <CardDescription>Información del traslado del caso a una I.E.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-3">
                <Switch
                  id="trasladoIE"
                  checked={trasladoIE}
                  onCheckedChange={(checked) => {
                    setTrasladoIE(checked)
                    setValue("trasladoIE", checked)
                  }}
                />
                <Label htmlFor="trasladoIE">¿Se trasladó a una I.E.?</Label>
              </div>

              {trasladoIE && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="institucionContraQuienSeDirige">Institución Contra Quien se Dirige</Label>
                    <Select
                      defaultValue={caso.institucionContraQuienSeDirige || ""}
                      onValueChange={(value) => setValue("institucionContraQuienSeDirige", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la I.E." />
                      </SelectTrigger>
                      <SelectContent>
                        {instituciones.map((ie) => (
                          <SelectItem key={ie} value={ie}>
                            {ie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radicadoExterna">Radicado Externa</Label>
                    <Input
                      id="radicadoExterna"
                      placeholder="Ej: CUC2024EE002434"
                      {...register("radicadoExterna")}
                    />
                    <p className="text-xs text-slate-500">Código del oficio enviado a la I.E.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Respondido */}
        <Card>
          <CardHeader>
            <CardTitle>Respuesta al Ciudadano</CardTitle>
            <CardDescription>Estado de la respuesta formal al ciudadano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-3">
                <Switch
                  id="respondido"
                  checked={respondido}
                  onCheckedChange={(checked) => {
                    setRespondido(checked)
                    setValue("respondido", checked)
                  }}
                />
                <Label htmlFor="respondido">¿El ciudadano ya recibió respuesta?</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prórroga */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Prórroga</CardTitle>
            <CardDescription>Ampliación de términos legales de respuesta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-3">
                <Switch
                  id="prorroga"
                  checked={prorroga}
                  onCheckedChange={(checked) => {
                    setProrroga(checked)
                    setValue("prorroga", checked)
                  }}
                />
                <Label htmlFor="prorroga">¿Se requirió prórroga?</Label>
              </div>

              {prorroga && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNuevaProrroga">Fecha Nueva Prórroga</Label>
                    <Input
                      id="fechaNuevaProrroga"
                      type="date"
                      {...register("fechaNuevaProrroga")}
                    />
                    <p className="text-xs text-slate-500">Nueva fecha límite de vencimiento</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radicadoProrroga">Radicado Prórroga</Label>
                    <Input
                      id="radicadoProrroga"
                      placeholder="Ej: CUC2024EO002434"
                      {...register("radicadoProrroga")}
                    />
                    <p className="text-xs text-slate-500">Código donde se notifica la ampliación</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contestación I.E. */}
        <Card>
          <CardHeader>
            <CardTitle>Contestación de la I.E.</CardTitle>
            <CardDescription>Respuesta de la Institución Educativa al traslado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-3">
                <Switch
                  id="contestacionIE"
                  checked={contestacionIE}
                  onCheckedChange={(checked) => {
                    setContestacionIE(checked)
                    setValue("contestacionIE", checked)
                  }}
                />
                <Label htmlFor="contestacionIE">¿La I.E. envió su respuesta?</Label>
              </div>

              {contestacionIE && (
                <div className="space-y-2">
                  <Label htmlFor="radicadoContestacion">Radicado Contestación</Label>
                  <Input
                    id="radicadoContestacion"
                    placeholder="Ej: CUC2024ER002434"
                    {...register("radicadoContestacion")}
                  />
                  <p className="text-xs text-slate-500">Código del radicado de entrada de la I.E.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Descripción del Caso */}
        <Card>
          <CardHeader>
            <CardTitle>Descripcion del Caso</CardTitle>
            <CardDescription>Detalle y contexto del caso reportado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa el caso detalladamente..."
                {...register("descripcion")}
                rows={4}
              />
              <p className="text-xs text-slate-500">Informacion adicional sobre el caso (sin tildes ni caracteres especiales)</p>
            </div>
          </CardContent>
        </Card>

        {/* Situación y Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Situacion y Estado</CardTitle>
            <CardDescription>Clasificacion y estado administrativo del caso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="situacion">Situación</Label>
                <Select
                  defaultValue={caso.situacion || ""}
                  onValueChange={(value) => setValue("situacion", value as CasoSACExtendidoFormData["situacion"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la clasificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {situaciones.map((sit) => (
                      <SelectItem key={sit} value={sit}>
                        {sit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Categorización de la gravedad del caso</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sacRespuesta">SAC Respuesta (Comunicación Externa)</Label>
                <Select
                  defaultValue={caso.sacRespuesta || ""}
                  onValueChange={(value) => setValue("sacRespuesta", value as CasoSACExtendidoFormData["sacRespuesta"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {sacRespuestas.map((resp) => (
                      <SelectItem key={resp} value={resp}>
                        {resp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Estado de la gestión de respuesta dentro del SAC</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  defaultValue={caso.estado}
                  onValueChange={(value) => setValue("estado", value as CasoSACExtendidoFormData["estado"])}
                >
                  <SelectTrigger className={errors.estado ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Situación administrativa actual del proceso</p>
                {errors.estado && (
                  <p className="text-sm text-red-500">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/sac">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
