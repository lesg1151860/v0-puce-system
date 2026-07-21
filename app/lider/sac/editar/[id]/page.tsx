"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function EditarCasoSACPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const [instituciones, setInstituciones] = useState<any[]>([])
  const [estadosSAC, setEstadosSAC] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [rolesCiudadano, setRolesCiudadano] = useState<any[]>([])

  const {
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset,
    setError: setFieldError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    mode: "onChange", 
    defaultValues: {
      traslado_ie: false, 
      respondido: false, 
      prorroga: false, 
      contestacion_ie: false,
    },
  })

  const hoy = new Date();
  const todayStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const watchFechaRadicacion = watch("fecha_radicacion");
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
    const inicializarDatos = async () => {
      const token = getAuthToken()
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
      try {
        const [resIE, resEstados, resClasif, resRoles, resCaso] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/institucion_educativa/", { headers }),
          fetch("http://127.0.0.1:8000/api/estado_sac/", { headers }),
          fetch("http://127.0.0.1:8000/api/clasificacion_caso/", { headers }),
          fetch("http://127.0.0.1:8000/api/rol_ciudadano/", { headers }),
          fetch(`http://127.0.0.1:8000/api/casos-sac/${id}/`, { headers }),
        ])

        if (resIE.ok) setInstituciones(await resIE.json().then(d => d.results || (Array.isArray(d) ? d : [])))
        if (resEstados.ok) setEstadosSAC(await resEstados.json().then(d => d.results || (Array.isArray(d) ? d : [])))
        if (resClasif.ok) setClasificaciones(await resClasif.json().then(d => d.results || (Array.isArray(d) ? d : [])))
        if (resRoles.ok) setRolesCiudadano(await resRoles.json().then(d => d.results || (Array.isArray(d) ? d : [])))

        if (resCaso.ok) {
          const casoData = await resCaso.json()
          reset({
            num_radicado_sac: casoData.num_radicado_sac || "",
            ciudadano: casoData.ciudadano || "",
            fecha_radicacion: casoData.fecha_radicacion || "",
            rol_ciudadano: casoData.rol_ciudadano ? String(casoData.rol_ciudadano) : "",
            estudiante: casoData.estudiante || "",
            clasificacion: casoData.clasificacion ? String(casoData.clasificacion) : "",
            estado_sac: casoData.estado_sac ? String(casoData.estado_sac) : "",
            descripcion: casoData.descripcion || "",
            traslado_ie: casoData.traslado_ie || false,
            institucion_1: casoData.institucion_1 ? String(casoData.institucion_1) : "",
            institucion_2: casoData.institucion_2 ? String(casoData.institucion_2) : "",
            num_radicado_traslado: casoData.num_radicado_traslado || "",
            radicado_externa: casoData.radicado_externa || "",
            respondido: casoData.respondido || false,
            radicado_respuesta: casoData.radicado_respuesta || "",
            prorroga: casoData.prorroga || false,
            fecha_nueva_prorroga: casoData.fecha_nueva_prorroga || "",
            radicado_prorroga: casoData.radicado_prorroga || "",
            contestacion_ie: casoData.contestacion_ie || false,
            radicado_contestacion_ie: casoData.radicado_contestacion_ie || "",
          })
        } else if (resCaso.status === 404) {
          setNotFound(true)
        } else {
          setError("No se pudo cargar la información del caso solicitado.")
        }
      } catch (err) {
        console.error("Error cargando catálogos o caso:", err)
        setError("Error de red. Asegúrate de estar autenticado correctamente.")
      } finally {
        setLoadingData(false)
      }
    }
    
    if (id) inicializarDatos()
  }, [id, reset])

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
        institucion_1: limpiarNumero(data.institucion_1),
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

      const response = await fetch(`http://127.0.0.1:8000/api/casos-sac/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json()
        
        let errorEncontrado = false;
        camposRadicado.forEach(campo => {
          if (errorData[campo.id]) {
            setFieldError(campo.id, { type: "server", message: "Este número de radicado ya existe en la base de datos." })
            errorEncontrado = true;
          }
        });

        if (!errorEncontrado) {
          setError(errorData.detail || "Error en el servidor al actualizar el registro.")
        }
        setIsLoading(false)
        return
      }

      router.push("/lider/sac")
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Caso no encontrado</h2>
        <p className="text-slate-600 mb-4">El radicado {id} no existe en la base de datos.</p>
        <Button onClick={() => router.push("/lider/sac")} className="bg-blue-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al directorio
        </Button>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Cargando expediente del servidor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Caso SAC</h1>
          <p className="text-slate-600">Sistema de Atención al Ciudadano</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        
        {/* Bloque 1: Identificación del Caso */}
        <Card>
          <CardHeader>
            <CardTitle>Identificación del Caso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    },
                    onChange: () => { clearErrors("num_radicado_sac"); setError(""); }
                  })}
                  className={errors.num_radicado_sac ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading}
                />
                {errors.num_radicado_sac && (
                  <p className="text-sm text-red-500 mt-1">{errors.num_radicado_sac.message as string}</p>
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
                  max={todayStr}
                  {...register("fecha_radicacion", { 
                    required: "La fecha es requerida",
                    validate: (value) => {
                      if (!value) return true;
                      return value <= todayStr || "La fecha no puede ser mayor al día de hoy.";
                    }
                  })}
                  className={errors.fecha_radicacion ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.fecha_radicacion && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha_radicacion.message as string}</p>
                )}
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
            </div>
          </CardContent>
        </Card>

        {/* Bloque 2: Detalles Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>Institución de Origen / Principal <span className="text-red-500">*</span></Label>
                <InstitucionCombobox 
                  opciones={instituciones} 
                  value={watch("institucion_1") || ""} 
                  onChange={(val) => setValue("institucion_1", val, { shouldValidate: true })}
                  placeholder="Buscar I.E. de origen..."
                  disabled={isLoading} 
                />
                {errors.institucion_1 && <p className="text-sm text-red-500">{String(errors.institucion_1.message ?? "")}</p>}
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>Nombre del Estudiante (Opcional)</Label>
                <Input
                  placeholder="Nombre del alumno implicado"
                  {...register("estudiante")}
                  className="uppercase"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
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

        {/* Bloque 3: Traslado Institucional */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b mb-4">
            <CardTitle>Traslado a Institución Educativa</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="traslado_ie"
                checked={watchTraslado}
                onCheckedChange={(checked) => setValue("traslado_ie", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="traslado_ie">¿Aplica Traslado?</Label>
            </div>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchTraslado ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="space-y-2">
                <Label>Institución Secundaria (Destino)</Label>
                <InstitucionCombobox 
                  opciones={instituciones} 
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
                    required: watchTraslado ? "Requerido" : false,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    },
                    onChange: () => { clearErrors("num_radicado_traslado"); setError(""); }
                  })}
                  className={errors.num_radicado_traslado ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchTraslado}
                />
                {errors.num_radicado_traslado && (
                  <p className="text-sm text-red-500 mt-1">{errors.num_radicado_traslado.message as string}</p>
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
                    },
                    onChange: () => { clearErrors("radicado_externa"); setError(""); }
                  })}
                  className={errors.radicado_externa ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchTraslado}
                />
                {errors.radicado_externa && (
                  <p className="text-sm text-red-500 mt-1">{errors.radicado_externa.message as string}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 4: Información de Prórroga */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b mb-4">
            <CardTitle>Información de Prórroga</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="prorroga"
                checked={watchProrroga}
                onCheckedChange={(checked) => setValue("prorroga", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="prorroga">¿Requiere Prórroga?</Label>
            </div>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchProrroga ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Fecha de Nueva Prórroga <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  min={watchFechaRadicacion} 
                  {...register("fecha_nueva_prorroga", { 
                    required: watchProrroga ? "Requerido" : false,
                    validate: (value) => {
                      if (!watchProrroga || !value) return true;
                      if (watchFechaRadicacion && value < watchFechaRadicacion) {
                        return "La prórroga no puede ser anterior a la fecha de radicación.";
                      }
                      return true;
                    }
                  })}
                  className={errors.fecha_nueva_prorroga ? "border-red-500" : ""}
                  disabled={isLoading || !watchProrroga}
                />
                {errors.fecha_nueva_prorroga && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha_nueva_prorroga.message as string}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Radicado de Prórroga <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ej: CUC2026EO002434"
                  maxLength={15}
                  {...register("radicado_prorroga", {
                    required: watchProrroga ? "Requerido" : false,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    },
                    onChange: () => { clearErrors("radicado_prorroga"); setError(""); }
                  })}
                  className={errors.radicado_prorroga ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchProrroga}
                />
                {errors.radicado_prorroga && (
                  <p className="text-sm text-red-500 mt-1">{errors.radicado_prorroga.message as string}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 5: Contestación de la I.E */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b mb-4">
            <CardTitle>Contestación de la I.E</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="contestacion_ie"
                checked={watchContestacion}
                onCheckedChange={(checked) => setValue("contestacion_ie", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="contestacion_ie">¿Contestó la I.E?</Label>
            </div>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ${watchContestacion ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Radicado Contestación I.E <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ej: CUC2026ER002434"
                  maxLength={15}
                  {...register("radicado_contestacion_ie", { 
                    required: watchContestacion ? "Requerido" : false,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    },
                    onChange: () => { clearErrors("radicado_contestacion_ie"); setError(""); }
                  })}
                  className={errors.radicado_contestacion_ie ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || !watchContestacion}
                />
                {errors.radicado_contestacion_ie && (
                  <p className="text-sm text-red-500 mt-1">{errors.radicado_contestacion_ie.message as string}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloque 6: Clasificación y Cierre */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación y Cierre de Caso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
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

              <div className="space-y-2">
                <Label>N° Radicado de Respuesta SAC {watchRespondido && <span className="text-red-500">*</span>}</Label>
                <Input
                  placeholder="Ej: CUC2026RS004812"
                  maxLength={15}
                  {...register("radicado_respuesta", { 
                    required: watchRespondido ? "Obligatorio al responder" : false,
                    pattern: {
                      value: /^[a-zA-Z]{3}\d{4}[a-zA-Z]{2}\d{6}$/,
                      message: "Estructura inválida. Debe ser: 3 letras, 4 números, 2 letras y 6 números."
                    },
                    onChange: () => { clearErrors("radicado_respuesta"); setError(""); }
                  })}
                  className={errors.radicado_respuesta ? "border-red-500 uppercase" : "uppercase"}
                  disabled={isLoading || (!watchRespondido && watch("radicado_respuesta") === "")}
                />
                {errors.radicado_respuesta && (
                  <p className="text-sm text-red-500 mt-1">{errors.radicado_respuesta.message as string}</p>
                )}
              </div>

              <div className="space-y-2 lg:col-span-3">
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="respondido"
                    checked={watchRespondido}
                    onCheckedChange={(checked) => setValue("respondido", checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="respondido">¿El caso fue Respondido?</Label>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={isLoading || loadingData}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
          </Button>
        </div>
        
      </form>
    </div>
  )
}