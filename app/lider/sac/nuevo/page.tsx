"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Save, FileText, School, BarChart3, Calendar, MessageSquare, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { sanitizeText, hasSpecialChars, SPECIAL_CHARS_ERROR } from "@/lib/text-utils"

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1]
  return cookieToken || localStorage.getItem("access_token")
}

export default function NuevoCasoSACPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [estadosSAC, setEstadosSAC] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [rolesCiudadano, setRolesCiudadano] = useState<any[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<any>({
    mode: "onChange", defaultValues: {
      traslado_ie: false, respondido: false, prorroga: false, contestacion_ie: false,
    },
  })

  const watchTraslado = watch("traslado_ie", false)
  const watchRespondido = watch("respondido", false)
  const watchProrroga = watch("prorroga", false)
  const watchContestacion = watch("contestacion_ie", false)

  useEffect(() => {
    const cargarCatalogosSistemas = async () => {
      const token = getAuthToken()
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      try {
        const [resIE, resEstados, resClasif, resRoles] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/institucion_educativa/", { headers }),
          fetch("http://127.0.0.1:8000/api/estado_sac/", { headers }),
          fetch("http://127.0.0.1:8000/api/clasificacion_caso/", { headers }),
          fetch("http://127.0.0.1:8000/api/rol_ciudadano/", { headers }),
        ])

        if (resIE.ok) {
          const data = await resIE.json()
          setInstituciones(data.results || (Array.isArray(data) ? data : []))
        }
        
        if (resEstados.ok) {
          const data = await resEstados.json()
          setEstadosSAC(data.results || (Array.isArray(data) ? data : []))
        }
        
        if (resClasif.ok) {
          const data = await resClasif.json()
          setClasificaciones(data.results || (Array.isArray(data) ? data : []))
        }
        
        if (resRoles.ok) {
          const data = await resRoles.json()
          setRolesCiudadano(data.results || (Array.isArray(data) ? data : []))
        }

      } catch (err) {
        console.error("Error cargando catálogos dinámicos:", err)
        setError("No se pudieron cargar las listas desplegables del servidor.")
      } finally {
        setLoadingCatalogs(false)
      }
    }
    cargarCatalogosSistemas()
  }, [])

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)

    if (hasSpecialChars(data.ciudadano)) {
      setError(SPECIAL_CHARS_ERROR)
      setIsLoading(false)
      return
    }

    try {
      const token = getAuthToken()
      
      const payload = {
        num_radicado_sac: data.num_radicado_sac.trim().toUpperCase(),
        ciudadano: sanitizeText(data.ciudadano).toUpperCase(),
        fecha_radicacion: data.fecha_radicacion,
        rol_ciudadano: data.rol_ciudadano ? Number(data.rol_ciudadano) : null,
        estudiante: data.estudiante.toUpperCase() || "N/A",
        clasificacion: data.clasificacion ? Number(data.clasificacion) : null,
        estado_sac: data.estado_sac ? Number(data.estado_sac) : null,
        traslado_ie: watchTraslado,
        institucion_1: watchTraslado && data.institucion_1 ? Number(data.institucion_1) : null,
        institucion_2: watchTraslado && data.institucion_2 ? Number(data.institucion_2) : null,
        num_radicado_traslado: watchTraslado ? data.num_radicado_traslado.toUpperCase() : null,
        radicado_externa: watchTraslado ? data.radicado_externa.toUpperCase() : null,
        respondido: watchRespondido,
        radicado_respuesta: watchRespondido ? data.radicado_respuesta.toUpperCase() : null,
        prorroga: watchProrroga,
        fecha_nueva_prorroga: watchProrroga ? data.fecha_nueva_prorroga : null,
        radicado_prorroga: watchProrroga ? data.radicado_prorroga.toUpperCase() : null,
        contestacion_ie: watchContestacion,
        radicado_contestacion_ie: watchContestacion ? data.radicado_contestacion_ie.toUpperCase() : null,
      }

      const response = await fetch("http://127.0.0.1:8000/api/casos_sac/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error en el servidor al crear el registro.")
      }

      router.push("/lider/sac")
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Button variant="ghost" className="mb-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al directorio
      </Button>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Bloque 1: Información Básica */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Registrar Nuevo Caso SAC</CardTitle>
            </div>
            <CardDescription>Completa la información básica correspondiente al radicado del ciudadano.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* INPUT MODIFICADO CON VALIDACIÓN EN TIEMPO REAL */}
              <div className="space-y-2">
                <Label>N° Radicado SAC <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ej: CUC2026ER002434"
                  maxLength={15}
                  {...register("num_radicado_sac", { 
                    required: "El número de radicado es obligatorio.",
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    }
                  })}
                  className={errors.num_radicado_sac ? "border-red-500 focus-visible:ring-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.num_radicado_sac && (
                  <p className="text-xs font-medium text-red-500 mt-1 animate-fade-in">
                    {errors.num_radicado_sac.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nombre del Ciudadano <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="NOMBRE COMPLETO"
                  {...register("ciudadano", { required: true })}
                  className={errors.ciudadano ? "uppercase border-red-500" : "uppercase"}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Radicación <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  {...register("fecha_radicacion", { required: true })}
                  className={errors.fecha_radicacion ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol del Ciudadano <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue("rol_ciudadano", val)} disabled={isLoading}>
                  <SelectTrigger className={errors.rol_ciudadano ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesCiudadano.map((rol) => (
                      <SelectItem key={rol.id} value={rol.id.toString()}>
                        {rol.nombre || rol.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Nombre del Estudiante</Label>
                <Input
                  placeholder="Nombre del alumno implicado"
                  {...register("estudiante")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 2: Traslado Institucional */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="h-6 w-6 text-blue-600" />
                <CardTitle>Traslado a Institución Educativa</CardTitle>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border shadow-sm">
                <Switch
                  checked={watchTraslado}
                  onCheckedChange={(checked) => setValue("traslado_ie", checked)}
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-slate-600">¿Aplica Traslado?</span>
              </div>
            </div>
            <CardDescription>Habilita esta sección si el caso requiere asignarse a colegios oficiales.</CardDescription>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchTraslado ? "opacity-100" : "opacity-40 pointer-events-none bg-slate-50/30"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institución de Origen / Principal <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue("institucion_1", val)} disabled={isLoading || !watchTraslado}>
                  <SelectTrigger className={errors.institucion_1 ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione la institución..." />
                  </SelectTrigger>
                  <SelectContent>
                    {instituciones.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.nombre || inst.nombre_ie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Institución Secundaria <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue("institucion_2", val)} disabled={isLoading || !watchTraslado}>
                  <SelectTrigger className={errors.institucion_2 ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione de traslado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {instituciones.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.nombre || inst.nombre_ie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Número de Radicado Traslado <span className="text-red-500">*</span></Label>
                <Input                                   
                  placeholder="Código de traslado oficial"
                  maxLength={15}
                  {...register("num_radicado_traslado", { 
                    required: watchTraslado,
                    pattern: {
                        value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                        message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                      } })}
                  className={errors.num_radicado_traslado ? "border-red-500" : ""}
                  disabled={isLoading || !watchTraslado}
                />
              </div>

              <div className="space-y-2">
                <Label>Radicado de Entidad Externa</Label>
                <Input
                  placeholder="Código de entidad externa"
                  maxLength={15}
                  {...register("radicado_externa", {
                    required: watchTraslado,
                    pattern: {
                        value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                        message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                      }
                  })}
                  disabled={isLoading || !watchTraslado}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 3: Respuesta al Ciudadano */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <CardTitle>Respuesta al Ciudadano</CardTitle>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border shadow-sm">
                <Switch
                  checked={watchRespondido}
                  onCheckedChange={(checked) => setValue("respondido", checked)}
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-slate-600">¿Fue Respondido?</span>
              </div>
            </div>
            <CardDescription>Habilita e ingresa el código oficial si ya se le notificó al ciudadano.</CardDescription>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchRespondido ? "opacity-100" : "opacity-40 pointer-events-none bg-slate-50/30"}`}>
            <div className="space-y-2">
              <Label>Radicado de Respuesta <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ej: CUC2026RS004812"
                {...register("radicado_respuesta", { required: watchRespondido })}
                className={errors.radicado_respuesta ? "border-red-500" : ""}
                disabled={isLoading || !watchRespondido}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloque 4: Información de Prórroga */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <CardTitle>Información de Prórroga</CardTitle>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border shadow-sm">
                <Switch
                  checked={watchProrroga}
                  onCheckedChange={(checked) => setValue("prorroga", checked)}
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-slate-600">¿Requiere Prórroga?</span>
              </div>
            </div>
            <CardDescription>Habilita si la solicitud requiere extensión legal de términos de respuesta.</CardDescription>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchProrroga ? "opacity-100" : "opacity-40 pointer-events-none bg-slate-50/30"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Nueva Prórroga <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  {...register("fecha_nueva_prorroga", { required: watchProrroga })}
                  className={errors.fecha_nueva_prorroga ? "border-red-500" : ""}
                  disabled={isLoading || !watchProrroga}
                />
              </div>
              <div className="space-y-2">
                <Label>Radicado de Prórroga <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Código de radicado de prórroga"
                  {...register("radicado_prorroga", {
                    required: watchProrroga,
                    pattern: {
                        value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                        message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                      }
                  })}
                  className={errors.radicado_prorroga ? "border-red-500" : ""}
                  disabled={isLoading || !watchProrroga}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 5: Contestación de la I.E */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
                <CardTitle>Contestación de la I.E</CardTitle>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border shadow-sm">
                <Switch
                  checked={watchContestacion}
                  onCheckedChange={(checked) => setValue("contestacion_ie", checked)}
                  disabled={isLoading}
                />
                <span className="text-xs font-medium text-slate-600">¿Contestó la I.E?</span>
              </div>
            </div>
            <CardDescription>Registra el radicado emitido por la Institución Educativa vinculada.</CardDescription>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchContestacion ? "opacity-100" : "opacity-40 pointer-events-none bg-slate-50/30"}`}>
            <div className="space-y-2">
              <Label>Radicado Contestación I.E <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Código de radicado de contestación"
                {...register("radicado_contestacion_ie", { 
                  required: watchContestacion,
                  pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    } })}
                className={errors.radicado_contestacion_ie ? "border-red-500" : ""}
                disabled={isLoading || !watchContestacion}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloque 6: Clasificación y Cierre */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <CardTitle>Clasificación y Cierre de Caso</CardTitle>
            </div>
            <CardDescription>Define los parámetros analíticos y el estado actual de control del caso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clasificación del Caso <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue("clasificacion", val)} disabled={isLoading}>
                  <SelectTrigger className={errors.clasificacion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar Clasificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {clasificaciones.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id.toString()}>
                        {cl.nombre || cl.nombre_clasificacion || cl.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado Actual de SAC <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue("estado_sac", val)} disabled={isLoading}>
                  <SelectTrigger className={errors.estado_sac ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosSAC.map((est) => {
                      const displayText = est.nombre || est.estado_sac || est.nom_estado_sac
                      return (
                        <SelectItem key={est.id} value={est.id.toString()}>
                          {displayText}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 mt-4">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6 shadow-sm" disabled={isLoading || loadingCatalogs}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isLoading ? "Registrando..." : "Guardar Caso SAC"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}