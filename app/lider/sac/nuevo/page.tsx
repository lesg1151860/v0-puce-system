"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Save, FileText, School, BarChart3, Calendar, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { sanitizeText, hasSpecialChars, SPECIAL_CHARS_ERROR } from "@/lib/text-utils"
import { InstitucionCombobox } from "@/components/InstitucionCombobox"

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
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    setError: setFieldError,
    formState: { errors },
  } = useForm<any>({
    mode: "onChange", defaultValues: {
      traslado_ie: false, respondido: false, prorroga: false, contestacion_ie: false,
    },
  })

  const watchTraslado = watch("traslado_ie", false)
  const watchRespondido = watch("respondido", false)
  const watchProrroga = watch("prorroga", false)
  const watchContestacion = watch("contestacion_ie", false)
  const watchRadicadoRespuesta = watch("radicado_respuesta")
  const watchEstadoSac = watch("estado_sac")

  useEffect(() => {
    if (watchRadicadoRespuesta && watchRadicadoRespuesta.trim() !== "") {
      if (!watchRespondido) {
        setValue("respondido", true, { shouldValidate: true })
      }
      const estadoCierre = estadosSAC.find(est => {
        const nombre = (est.nombre || est.estado_sac || est.nom_estado_sac || "").toUpperCase()
        return nombre.includes("TERMINADO") || nombre.includes("CERRADO")
      })
      if (estadoCierre && watchEstadoSac !== estadoCierre.id.toString()) {
        setValue("estado_sac", estadoCierre.id.toString(), { shouldValidate: true })
      }
    }
  }, [watchRadicadoRespuesta, estadosSAC])

  useEffect(() => {
    if (watchEstadoSac && estadosSAC.length > 0) {
      const estadoSeleccionado = estadosSAC.find(est => est.id.toString() === watchEstadoSac)
      
      if (estadoSeleccionado) {
        const nombre = (estadoSeleccionado.nombre || estadoSeleccionado.estado_sac || estadoSeleccionado.nom_estado_sac || "").toUpperCase()
        
        if (nombre.includes("TERMINADO") || nombre.includes("CERRADO")) {
          if (!watchRespondido) {
            setValue("respondido", true, { shouldValidate: true })
          }
        } else {
          if (watchRespondido) {
            setValue("respondido", false, { shouldValidate: true })
          }
          if (watchRadicadoRespuesta) {
            setValue("radicado_respuesta", "", { shouldValidate: true })
          }
        }
      }
    }
  }, [watchEstadoSac, estadosSAC]) 

  useEffect(() => {
    if (!watchRespondido && watchRadicadoRespuesta) {
      setValue("radicado_respuesta", "", { shouldValidate: true })
    }
  }, [watchRespondido])

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
        console.error("Error al cargar los catálogos dinámicos:", err)
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

    const limpiarTexto = (val: any) => (val === "" || val === undefined || val === null) ? null : String(val).trim().toUpperCase()
    const limpiarNumero = (val: any) => (val === "" || val === undefined || val === null) ? null : Number(val)

    const radicadosIngresados: { [key: string]: string } = {}
    const camposRadicado = [
      { id: "num_radicado_sac", label: "N° Radicado SAC", valor: data.num_radicado_sac },
      { id: "num_radicado_traslado", label: "Número de Radicado Traslado", valor: watchTraslado ? data.num_radicado_traslado : null },
      { id: "radicado_externa", label: "Radicado de Entidad Externa", valor: watchTraslado ? data.radicado_externa : null },
      { id: "radicado_prorroga", label: "Radicado de Prórroga", valor: watchProrroga ? data.radicado_prorroga : null },
      { id: "radicado_contestacion_ie", label: "Radicado Contestación I.E", valor: watchContestacion ? data.radicado_contestacion_ie : null },
      { id: "radicado_respuesta", label: "N° Radicado de Respuesta SAC", valor: watchRespondido ? data.radicado_respuesta : null },
    ]

    let tieneDuplicadosInternos = false

    camposRadicado.forEach((campo) => {
      if (campo.valor && campo.valor.trim() !== "") {
        const valorLimpio = campo.valor.trim().toUpperCase()
        if (radicadosIngresados[valorLimpio]) {
          setFieldError(campo.id, {
            type: "manual",
            message: `❌ Este número ya fue asignado al campo "${radicadosIngresados[valorLimpio]}" de este caso.`
          })
          tieneDuplicadosInternos = true
        } else {
          radicadosIngresados[valorLimpio] = campo.label
        }
      }
    })

    if (tieneDuplicadosInternos) {
      setError("Error: No puedes repetir el mismo número de radicado en campos diferentes del mismo caso.")
      setIsLoading(false)
      return
    }

    try {
      const token = getAuthToken()
      
      const payload = {
        num_radicado_sac: data.num_radicado_sac.trim().toUpperCase(),
        ciudadano: sanitizeText(data.ciudadano).toUpperCase(),
        fecha_radicacion: data.fecha_radicacion,
        rol_ciudadano: limpiarNumero(data.rol_ciudadano),
        estudiante: data.estudiante ? data.estudiante.trim().toUpperCase() : "N/A",
        clasificacion: limpiarNumero(data.clasificacion),
        estado_sac: limpiarNumero(data.estado_sac),
        descripcion: limpiarTexto(data.descripcion),
        traslado_ie: watchTraslado,
        institucion_1: watchTraslado ? limpiarNumero(data.institucion_1) : null,
        institucion_2: watchTraslado ? limpiarNumero(data.institucion_2) : null,
        num_radicado_traslado: watchTraslado ? limpiarTexto(data.num_radicado_traslado) : null,
        radicado_externa: watchTraslado ? limpiarTexto(data.radicado_externa) : null,
        respondido: watchRespondido,
        radicado_respuesta: watchRespondido ? limpiarTexto(data.radicado_respuesta) : null,
        prorroga: watchProrroga,
        fecha_nueva_prorroga: watchProrroga ? (data.fecha_nueva_prorroga || null) : null,
        radicado_prorroga: watchProrroga ? limpiarTexto(data.radicado_prorroga) : null,
        contestacion_ie: watchContestacion,
        radicado_contestacion_ie: watchContestacion ? limpiarTexto(data.radicado_contestacion_ie) : null,
      }

      const response = await fetch("http://127.0.0.1:8000/api/casos-sac/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          let errorAsignado = false;
          
          Object.keys(result).forEach((key) => {
             const mensajeError = Array.isArray(result[key]) ? result[key][0] : result[key];
             setFieldError(key, { type: "manual", message: mensajeError });
             errorAsignado = true;
          });

          if (!errorAsignado) {
             setError(result.detail || "Error en los datos enviados.");
          }
        } else {
          setError(result.detail || "Error al procesar la solicitud.");
        }
        setIsLoading(false);
        return;
      }

      router.push("/lider/sac")
      
    } catch (err: any) {
      console.error(err);
      setError("Error de conexión con el servidor.")
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
        
        {/* Bloque 1: Información Básica + Descripción */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Registrar Nuevo Caso SAC</CardTitle>
            </div>
            <CardDescription>Completa la información básica y el contexto del radicado del ciudadano.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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
                  className={errors.num_radicado_sac ? "border-red-500 focus-visible:ring-red-500 uppercase" : "uppercase"}
                  disabled={isLoading}
                />
                
                {errors.num_radicado_sac && (
                  <p className="text-xs font-bold text-red-500 mt-1 animate-fade-in">
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
                <Select value={watch("rol_ciudadano") || ""} onValueChange={(val) => setValue("rol_ciudadano", val, { shouldValidate: true })} disabled={isLoading}>
                  <SelectTrigger className={errors.rol_ciudadano ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesCiudadano.map((rol) => {
                      const nombreMostrar = rol.nombre_rol || (rol.id ? `Rol #${rol.id}` : JSON.stringify(rol));
                      const idValor = rol.id?.toString() || rol.id_rol?.toString() || "";
                      return (
                        <SelectItem key={idValor} value={idValor}>
                          {nombreMostrar}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Nombre del Estudiante</Label>
                <Input
                  placeholder="Nombre del alumno implicado"
                  {...register("estudiante")}
                  className="uppercase"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 md:col-span-2 border-t pt-4 mt-2">
                <Label>Descripción / Observaciones</Label>
                <Textarea
                  placeholder="Describa el caso detalladamente..."
                  {...register("descripcion")}
                  rows={4}
                  className="uppercase resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Información adicional sobre la queja, reclamo o solicitud. Se guardará automáticamente en mayúsculas.
                </p>
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
                <InstitucionCombobox 
                  opciones={instituciones.filter(inst => inst.id.toString() !== watch("institucion_2"))} 
                  value={watch("institucion_1") || ""} 
                  onChange={(val) => setValue("institucion_1", val, { shouldValidate: true })}
                  placeholder="Buscar I.E. de origen..."
                  disabled={isLoading || !watchTraslado}
                />
                {errors.institucion_1 && <p className="text-sm text-red-500">{String(errors.institucion_1.message ?? "")}</p>}
              </div>

              <div className="space-y-2">
                <Label>Institución Secundaria <span className="text-red-500">*</span></Label>
                <InstitucionCombobox 
                  opciones={instituciones.filter(inst => inst.id.toString() !== watch("institucion_1"))} 
                  value={watch("institucion_2") || ""} 
                  onChange={(val) => setValue("institucion_2", val, { shouldValidate: true })}
                  placeholder="Buscar I.E. de destino..."
                  disabled={isLoading || !watchTraslado}
                />
                {errors.institucion_2 && <p className="text-sm text-red-500">{String(errors.institucion_2.message ?? "")}</p>}
              </div>

              <div className="space-y-2">
                <Label>Número de Radicado Traslado <span className="text-red-500">*</span></Label>
                <Input                      
                  placeholder="Ej: CUC2026ER002434"
                  maxLength={15}
                  {...register("num_radicado_traslado", { 
                    required: watchTraslado,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    } 
                  })}
                  className={errors.num_radicado_traslado ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchTraslado}
                />
                {errors.num_radicado_traslado && (
                  <p className="text-xs font-bold text-red-500 mt-1 animate-fade-in">
                    {errors.num_radicado_traslado.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Radicado de Entidad Externa</Label>
                <Input
                  placeholder="Ej: CUC2026ER002434"
                  maxLength={15}
                  {...register("radicado_externa", {
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    }
                  })}
                  className={errors.radicado_externa ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchTraslado}
                />
                {errors.radicado_externa && (
                  <p className="text-xs font-bold text-red-500 mt-1 animate-fade-in">
                    {errors.radicado_externa.message as string}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 3: Información de Prórroga */}
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
                  placeholder="Ej: CUC2026EO002434"
                  maxLength={15}
                  {...register("radicado_prorroga", {
                    required: watchProrroga,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    }
                  })}
                  className={errors.radicado_prorroga ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchProrroga}
                />
                {errors.radicado_prorroga && (
                  <p className="text-xs font-bold text-red-500 mt-1 animate-fade-in">
                    {errors.radicado_prorroga.message as string}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 4: Contestación de la I.E */}
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
                placeholder="Ej: CUC2026ER002434"
                maxLength={15}
                {...register("radicado_contestacion_ie", { 
                  required: watchContestacion,
                  pattern: {
                    value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                    message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                  } 
                })}
                className={errors.radicado_contestacion_ie ? "border-red-500 uppercase" : "uppercase"}
                disabled={isLoading || !watchContestacion}
              />
              {errors.radicado_contestacion_ie && (
                <p className="text-xs font-bold text-red-500 mt-1 animate-fade-in">
                  {errors.radicado_contestacion_ie.message as string}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bloque 5: Clasificación y Cierre */}
        <Card className={watchRespondido ? "border-emerald-200 transition-colors" : "transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <CardTitle>Clasificación y Cierre de Caso</CardTitle>
            </div>
            <CardDescription>Define la clasificación, estado de control y el radicado final de cierre con el ciudadano.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clasificación del Caso <span className="text-red-500">*</span></Label>
                <Select value={watch("clasificacion") || ""} onValueChange={(val) => setValue("clasificacion", val, { shouldValidate: true })} disabled={isLoading}>
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
                <Select value={watchEstadoSac || ""} onValueChange={(val) => setValue("estado_sac", val, { shouldValidate: true })} disabled={isLoading}>
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

            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              
              <div className="space-y-2 md:col-span-1">
                <Label>N° Radicado de Respuesta SAC (Cierre) {watchRespondido && <span className="text-red-500">*</span>}</Label>
                <Input
                  placeholder="Ej: CUC2026RS004812"
                  maxLength={15}
                  {...register("radicado_respuesta", { 
                    required: watchRespondido ? "Debe ingresar el radicado al estar el caso respondido." : false,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    } 
                  })}
                  className={errors.radicado_respuesta ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || (!watchRespondido && watch("radicado_respuesta") === "")}
                />
                {errors.radicado_respuesta && (
                  <p className="text-xs font-medium text-red-500 mt-1 animate-fade-in">
                    {errors.radicado_respuesta.message as string}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">Al escribir el radicado el estado cambiará automáticamente a TERMINADO.</p>
              </div>

              <div className="md:col-span-1 flex flex-col justify-start pt-6">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border shadow-sm w-fit">
                  <Switch
                    checked={watchRespondido}
                    onCheckedChange={(checked) => setValue("respondido", checked)}
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-600">¿El caso fue Respondido?</span>
                </div>
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