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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { casoSIUCESchema, type CasoSIUCEFormData } from "@/lib/validations"
import { sanitizeText, hasSpecialChars, SPECIAL_CHARS_ERROR } from "@/lib/text-utils"
import { api } from "@/lib/api"
// 💡 IMPORTACIÓN DEL NUEVO COMBOBOX
import { InstitucionCombobox } from "@/components/InstitucionCombobox"


const tiposAgresionConDano: Record<string, { agresiones: string[], dano: string }> = {
  "Económico": { agresiones: ["Hurto"], dano: "Económico" },
  "Físico": { agresiones: ["Acoso escolar", "Violencia Intrafamiliar", "Agresión física ocasional leve", "Agresión Física", "Agresión física reiterada"], dano: "Físico" },
  "Sexual": { agresiones: ["Acoso sexual", "Sexteo", "Violencia sexual"], dano: "Sexual" },
  "Psicológico": { agresiones: ["Agresión Verbal", "Agresión Verbal Reiterada", "Agresión gestual",  "Agresión Relacional"], dano: "Psicológico" },
}

export default function NuevoCasoSIUCEPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [showOtroEvento, setShowOtroEvento] = useState(false)
  
  // 1. Estados de Catálogos Administrables
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [tiposIdentificacion, setTiposIdentificacion] = useState<any[]>([])
  const [grados, setGrados] = useState<any[]>([])
  const [tiposDano, setTiposDano] = useState<any[]>([])
  const [tiposAgresion, setTiposAgresion] = useState<any[]>([])
  const [eventosGeneradores, setEventosGeneradores] = useState<any[]>([])
  const [rolesAgresor, setRolesAgresor] = useState<any[]>([])
  const [lugares, setLugares] = useState<any[]>([])
  const [accionesIE, setAccionesIE] = useState<any[]>([])
  const [accionesSEM, setAccionesSEM] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [seguimientoIE, setSeguimientoIE] = useState(false)
  const [seguimientoPolicia, setSeguimientoPolicia] = useState(false)
  const [avanceIE, setAvanceIE] = useState(0)
  const [avanceSEM, setAvanceSEM] = useState(0)
  const [avanceGeneral, setAvanceGeneral] = useState(0)
  const [estadoCalculado, setEstadoCalculado] = useState<"PENDIENTE" | "EN SEGUIMIENTO" | "TERMINADO">("PENDIENTE")
  const {
    register, handleSubmit, setValue, watch, clearErrors, setError: setFieldError, formState: { errors },
  } = useForm<CasoSIUCEFormData>({
    resolver: zodResolver(casoSIUCESchema),
    defaultValues: { avanceGeneral: 0, estado: "PENDIENTE", repetitivo: false, seguimientoIE: false, numeroSeguimientoIE: 0, seguimientoPolicia: false, numeroSeguimientoPolicia: 0, cec: false, avanceIE: 0, avanceSEM: 0, clasificacion: "Tipo 1" },
  })
  const tipoAgresion = watch("tipoAgresion")
  const danoPrincipal = watch("danoPrincipal")
  const repetitivo = watch("repetitivo")
  const eventoGenerador = watch("eventoGenerador")

  useEffect(() => {
    const inicializarCatalogos = async () => {
      try {
        const [
          resIE, resIdentificacion, resGrados, resDano, resAgresion,
          resEventos, resRoles, resLugares, resAccionesIE, resAccionesSEM, resClasificaciones
        ] = await Promise.allSettled([
          api.obtenerInstituciones(),
          api.getTiposIdentificacion(),
          api.getGradosEscolaridad(),
          api.getTiposDano(),
          api.getTiposAgresion(),
          api.getEventosGeneradores(),
          api.getRolesAgresor(),
          api.getLugaresHechos(),
          api.getAccionesIE(),
          api.getAccionesSEM(),
          api.getClasificaciones()
        ])

        const extractData = (result: any) => {
          if (result.status === "fulfilled") {
            const data = result.value.results || result.value;
            return Array.isArray(data) ? data.filter((item: any) => item.activo !== false) : [];
          }
          return [];
        };

        setInstituciones(extractData(resIE))
        setTiposIdentificacion(extractData(resIdentificacion))
        setGrados(extractData(resGrados))
        setTiposDano(extractData(resDano))
        setTiposAgresion(extractData(resAgresion))
        setEventosGeneradores(extractData(resEventos))
        setRolesAgresor(extractData(resRoles))
        setLugares(extractData(resLugares))
        setAccionesIE(extractData(resAccionesIE))
        setAccionesSEM(extractData(resAccionesSEM))
        setClasificaciones(extractData(resClasificaciones))
        
      } catch (error) {
        console.error("Error crítico al cargar catálogos.", error)
      } finally {
        setLoadingData(false)
      }
    }
    inicializarCatalogos()
  }, [])

  useEffect(() => {
    if (tipoAgresion && tiposAgresion.length > 0 && tiposDano.length > 0) {
      const objAgresion = tiposAgresion.find(a => a.id?.toString() === tipoAgresion);
      
      if (objAgresion) {
        const nombreAgresion = objAgresion.tipo_agresion.toLowerCase().trim();
        let nombreCategoria = "";

        for (const [categoria, config] of Object.entries(tiposAgresionConDano)) {
          if (config.agresiones.some(a => a.toLowerCase().trim() === nombreAgresion)) {
            nombreCategoria = categoria.toLowerCase();
            break;
          }
        }

        if (nombreCategoria) {
          const danoReal = tiposDano.find(d => d.tipo_dano.toLowerCase().includes(nombreCategoria));
          if (danoReal) {
            setValue("danoPrincipal", danoReal.id.toString(), { shouldValidate: true });
            return;
          }
        }
      }
      setValue("danoPrincipal", "", { shouldValidate: true });
    }
  }, [tipoAgresion, tiposAgresion, tiposDano, setValue]);

  useEffect(() => {
    if (danoPrincipal && tiposDano.length > 0 && clasificaciones.length > 0) {
      const objDano = tiposDano.find(d => d.id?.toString() === danoPrincipal);
      const nombreDano = objDano?.tipo_dano?.toLowerCase() || "";

      let tipoCalculado = "Tipo 1";
      if (nombreDano.includes("sexual")) {
        tipoCalculado = "Tipo 3";
      } else if (repetitivo || nombreDano.includes("físico") || nombreDano.includes("fisico")) {
        tipoCalculado = "Tipo 2";
      }

      const clasificacionReal = clasificaciones.find(c => c.descripcion?.toLowerCase().includes(tipoCalculado.toLowerCase()));
      if (clasificacionReal) {
        setValue("clasificacion", clasificacionReal.id.toString(), { shouldValidate: true });
      }
    }
  }, [danoPrincipal, repetitivo, tiposDano, clasificaciones, setValue]);

  useEffect(() => {
    const avancegeneral = (avanceIE + avanceSEM)/2;
    setAvanceGeneral(avancegeneral);
    setValue("avanceGeneral", avancegeneral, { shouldValidate: true });
    
    let estadoActual: "PENDIENTE" | "EN SEGUIMIENTO" | "TERMINADO" = "EN SEGUIMIENTO";
    if (avancegeneral <= 0) estadoActual = "PENDIENTE";
    else if (avancegeneral >= 100) estadoActual = "TERMINADO";

    setEstadoCalculado(estadoActual);
    setValue("estado", estadoActual, { shouldValidate: true });
  }, [avanceIE, avanceSEM, setValue]);

  useEffect(() => {
    if (eventoGenerador) {
      const objEvento = eventosGeneradores.find(e => e.id?.toString() === eventoGenerador);
      setShowOtroEvento(objEvento?.evento_generador?.toLowerCase().includes("otro") || false);
    }
  }, [eventoGenerador, eventosGeneradores]);

  const onSubmit = async (data: CasoSIUCEFormData) => {
    setError("")
    setIsLoading(true)
    
    try {
      if (hasSpecialChars(data.victima) || hasSpecialChars(data.nombreAgresor)) {
        setError(SPECIAL_CHARS_ERROR); setIsLoading(false); return;
      }

      const payloadBackend = {
        num_radicado_siuce: data.radicado,
        institucion_educativa: parseInt(data.ie),
        fecha_registro: data.fechaRegistro,
        estudiante_victima: sanitizeText(data.victima),
        tipo_identificacion: parseInt(data.tipoIdentificacion),
        num_indentificacion: data.numeroIdentificacion,
        grado_escolaridad: parseInt(data.grado),
        tipo_agresion: parseInt(data.tipoAgresion),
        dano_principal: data.danoPrincipal ? parseInt(data.danoPrincipal) : null,
        dano_secundario: data.danoSecundario && data.danoSecundario !== "none" ? parseInt(data.danoSecundario)|| "N/A" : null,
        dano_terciario: data.danoTerciario && data.danoTerciario !== "none" ? parseInt(data.danoTerciario) || "N/A" : null,
        repetitivo: data.repetitivo,
        evento_generador: parseInt(data.eventoGenerador),
        otro_evento_generador: data.otroEventoGenerador ? sanitizeText(data.otroEventoGenerador) || "N/A" : null,
        rol_agresor: parseInt(data.rolAgresor),
        nombre_agresor: sanitizeText(data.nombreAgresor),
        clasificacion: data.clasificacion ? parseInt(data.clasificacion) : null,
        lugar_hechos: parseInt(data.lugar),
        fecha_ocurrencia: data.fechaOcurrencia,
        seguimiento_ie: data.seguimientoIE,
        num_seguimiento_ie: data.numeroSeguimientoIE?.toString() || "N/A",
        seguimiento_policia: data.seguimientoPolicia,
        num_seguimiento_policia: data.numeroSeguimientoPolicia?.toString() || "N/A",
        cec: data.cec,
        accion_ie: data.accionesIE ? parseInt(data.accionesIE) : null,
        accion_sem: data.accionesSEM ? parseInt(data.accionesSEM) : null,
        descripcion_avance: data.descripcionAvance ? sanitizeText(data.descripcionAvance) : "Sin descripción",
        rad_entidad_ext: data.entidadesExternas || "",
        fecha_rad_entidad_ext: data.fechaRadicadoExternas || null,
      }

      await api.crearCasoSIUCE(payloadBackend)
      router.push("/lider/siuce")

    } catch (err: any) {
      try {
        const errorData = JSON.parse(err.message);
        let errorEncontrado = false

        if (errorData.num_radicado_siuce) {
          setFieldError("radicado", { type: "server", message: "Este radicado ya existe en la base de datos." })
          errorEncontrado = true
        }
        if (errorData.num_indentificacion) {
          setFieldError("numeroIdentificacion", { type: "server", message: "Este número de identificación ya está registrado." })
          errorEncontrado = true
        }

        if (!errorEncontrado) setError("Django rechazó los datos: " + JSON.stringify(errorData))
      } catch (e) {
        setError("Error de comunicación con el servidor. Revisa la consola para más detalles.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getDanoNombre = (id: string) => tiposDano.find(d => d.id?.toString() === id)?.tipo_dano || "Se asigna al seleccionar agresión";
  const getClasificacionNombre = (id: string) => clasificaciones.find(c => c.id?.toString() === id)?.descripcion || "Tipo 1";

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Sincronizando catálogos de SIUCE...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lider/siuce">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Caso SIUCE</h1>
          <p className="text-slate-600">Sistema de Información Unificado de Convivencia Escolar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (err) => console.log("Errores RHF:", err))} className="space-y-6">
        <input type="hidden" {...register("danoPrincipal")} />
        <input type="hidden" {...register("clasificacion")} />
        <input type="hidden" {...register("avanceGeneral")} />
        <input type="hidden" {...register("estado")} />
        <input type="hidden" {...register("avanceIE")} />
        <input type="hidden" {...register("avanceSEM")} />

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* IDENTIFICACIÓN DEL CASO */}
        <Card>
          <CardHeader><CardTitle>Identificación del Caso</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input 
                  id="radicado" 
                  placeholder="Ej: 1234567890" 
                  maxLength={10}
                  {...register("radicado", { 
                    onChange: (e) => { 
                      e.target.value = e.target.value.replace(/\D/g, '');
                      clearErrors("radicado"); 
                      setError(""); 
                    } 
                  })} 
                  className={errors.radicado ? "border-red-500" : ""} 
                />
                {errors.radicado && <p className="text-sm text-red-500">{errors.radicado.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ie">Institución Educativa *</Label>
                <InstitucionCombobox 
                  opciones={instituciones} 
                  value={watch("ie") || ""} 
                  onChange={(val) => setValue("ie", val, { shouldValidate: true })}
                  placeholder="Buscar I.E...."
                />
                {errors.ie && <p className="text-sm text-red-500">{errors.ie.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRegistro">Fecha de Registro *</Label>
                <Input id="fechaRegistro" type="date" {...register("fechaRegistro")} className={errors.fechaRegistro ? "border-red-500" : ""} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INFORMACIÓN DE LA VÍCTIMA */}
        <Card>
          <CardHeader><CardTitle>Información de la Víctima</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="victima">Nombre de la Víctima *</Label>
                <Input id="victima" placeholder="Nombre completo" {...register("victima")} className={errors.victima ? "border-red-500 uppercase" : "uppercase"} />
                {errors.victima && <p className="text-sm text-red-500">{errors.victima.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoIdentificacion">Tipo de Identificación *</Label>
                <Select onValueChange={(value) => { setValue("tipoIdentificacion", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.tipoIdentificacion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposIdentificacion.map((tipo) => (
                      <SelectItem key={tipo.id?.toString()} value={tipo.id?.toString()}>{tipo.tipo_identificacion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoIdentificacion && <p className="text-sm text-red-500">{errors.tipoIdentificacion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroIdentificacion">Número de Identificación *</Label>
                <Input 
                  id="numeroIdentificacion" 
                  placeholder="Ej: 1090123456" 
                  maxLength={10}
                  {...register("numeroIdentificacion", { 
                    onChange: (e) => { 
                      e.target.value = e.target.value.replace(/\D/g, ''); 
                      clearErrors("numeroIdentificacion"); 
                      setError(""); 
                    } 
                  })} 
                  className={errors.numeroIdentificacion ? "border-red-500" : ""} 
                />
                <p className="text-xs text-slate-500">
                  {(watch("numeroIdentificacion")?.length ?? 0)}/10 dígitos
                </p>
                {errors.numeroIdentificacion && <p className="text-sm text-red-500">{errors.numeroIdentificacion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grado">Grado *</Label>
                <Select onValueChange={(value) => { setValue("grado", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.grado ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {grados.map((g) => (
                      <SelectItem key={g.id?.toString()} value={g.id?.toString()}>{g.nom_grado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grado && <p className="text-sm text-red-500">{errors.grado.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TIPO DE AGRESIÓN Y DAÑO */}
        <Card>
          <CardHeader><CardTitle>Tipo de Agresión y Daño</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tipoAgresion">Tipo de Agresión *</Label>
                <Select onValueChange={(value) => { setValue("tipoAgresion", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.tipoAgresion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAgresion.map((tipo) => (
                      <SelectItem key={tipo.id?.toString()} value={tipo.id?.toString()}>{tipo.tipo_agresion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoAgresion && <p className="text-sm text-red-500">{errors.tipoAgresion.message}</p>}
              </div>

              {/* DAÑO PRINCIPAL AUTOMÁTICO */}
              <div className="space-y-2">
                <Label htmlFor="danoPrincipal">Daño Principal (Automático)</Label>
                <div className={`flex items-center h-10 px-3 rounded-md border ${errors.danoPrincipal ? 'border-red-500 bg-red-50 text-red-500' : 'bg-slate-50'}`}>
                  <span className="font-medium">
                    {getDanoNombre(watch("danoPrincipal"))}
                  </span>
                </div>
                {errors.danoPrincipal && (
                  <p className="text-sm text-red-500">Agresión no tipificada en Ley 1620 del 2013.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoSecundario">Daño Secundario</Label>
                <Select onValueChange={(value) => setValue("danoSecundario", value === "none" ? undefined : value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano.id?.toString()} value={dano.id?.toString()}>{dano.tipo_dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="danoTerciario">Daño Terciario</Label>
                <Select onValueChange={(value) => setValue("danoTerciario", value === "none" ? undefined : value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => (
                      <SelectItem key={dano.id?.toString()} value={dano.id?.toString()}>{dano.tipo_dano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventoGenerador">Evento Generador *</Label>
                <Select onValueChange={(value) => { setValue("eventoGenerador", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.eventoGenerador ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventosGeneradores.map((evento) => (
                      <SelectItem key={evento.id?.toString()} value={evento.id?.toString()}>{evento.evento_generador}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventoGenerador && <p className="text-sm text-red-500">{errors.eventoGenerador.message}</p>}
              </div>

              {showOtroEvento && (
                <div className="space-y-2">
                  <Label htmlFor="otroEventoGenerador">Especifique Otro Evento</Label>
                  <Input id="otroEventoGenerador" placeholder="Describa el evento" {...register("otroEventoGenerador")} />
                </div>
              )}

              <div className="flex items-center space-x-3 pt-6">
                <Switch id="repetitivo" onCheckedChange={(checked) => setValue("repetitivo", checked, { shouldValidate: true })} />
                <Label htmlFor="repetitivo">¿Es conducta repetitiva?</Label>
              </div>

              {/* CLASIFICACIÓN AUTOMÁTICA */}
              <div className="space-y-2">
                <Label>Clasificación (Automática)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50">
                  <Badge variant="outline" className={watch("clasificacion") === "Tipo 3" ? "bg-red-100 text-red-800 border-red-200" : watch("clasificacion") === "Tipo 2" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                    {getClasificacionNombre(watch("clasificacion"))}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INFORMACIÓN DEL AGRESOR */}
        <Card>
          <CardHeader><CardTitle>Información del Agresor</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rolAgresor">Rol del Agresor *</Label>
                <Select onValueChange={(value) => { setValue("rolAgresor", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.rolAgresor ? "border-red-500" : ""}><SelectValue placeholder="Selecciona el rol" /></SelectTrigger>
                  <SelectContent>{rolesAgresor.map((rol) => (<SelectItem key={rol.id?.toString()} value={rol.id?.toString()}>{rol.nom_rol_agresor}</SelectItem>))}</SelectContent>
                </Select>
                {errors.rolAgresor && <p className="text-sm text-red-500">{errors.rolAgresor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreAgresor">Nombre del Agresor *</Label>
                <Input id="nombreAgresor" placeholder="Nombre completo" {...register("nombreAgresor")} className={errors.nombreAgresor ? "border-red-500 uppercase" : "uppercase"} />
                {errors.nombreAgresor && <p className="text-sm text-red-500">{errors.nombreAgresor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar *</Label>
                <Select onValueChange={(value) => { setValue("lugar", value as any, { shouldValidate: true }); }}>
                  <SelectTrigger className={errors.lugar ? "border-red-500" : ""}><SelectValue placeholder="Selecciona el lugar" /></SelectTrigger>
                  <SelectContent>{lugares.map((l) => (<SelectItem key={l.id?.toString()} value={l.id?.toString()}>{l.nom_lugar}</SelectItem>))}</SelectContent>
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

        {/* SEGUIMIENTOS */}
        <Card>
          <CardHeader><CardTitle>Seguimientos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch id="seguimientoIE" checked={seguimientoIE} onCheckedChange={(checked) => { setSeguimientoIE(checked); setValue("seguimientoIE", checked, { shouldValidate: true }); if (!checked) setValue("numeroSeguimientoIE", 0); }} />
                  <Label htmlFor="seguimientoIE">Seguimiento I.E.</Label>
                </div>
                {seguimientoIE && <div className="space-y-2 animate-in fade-in"><Label htmlFor="numeroSeguimientoIE">Número de Seguimientos I.E.</Label><Input id="numeroSeguimientoIE" type="number" min="0" {...register("numeroSeguimientoIE", { valueAsNumber: true })} /></div>}
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch id="seguimientoPolicia" checked={seguimientoPolicia} onCheckedChange={(checked) => { setSeguimientoPolicia(checked); setValue("seguimientoPolicia", checked, { shouldValidate: true }); if (!checked) setValue("numeroSeguimientoPolicia", 0); }} />
                  <Label htmlFor="seguimientoPolicia">Seguimiento Policía</Label>
                </div>
                {seguimientoPolicia && <div className="space-y-2 animate-in fade-in"><Label htmlFor="numeroSeguimientoPolicia">Número de Seguimientos Policía</Label><Input id="numeroSeguimientoPolicia" type="number" min="0" {...register("numeroSeguimientoPolicia", { valueAsNumber: true })} /></div>}
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3"><Switch id="cec" onCheckedChange={(checked) => setValue("cec", checked, { shouldValidate: true })} /><Label htmlFor="cec">CEC (Comité Escolar de Convivencia)</Label></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACCIONES Y AVANCES VISUALES */}
        <Card>
          <CardHeader><CardTitle>Acciones y Avances</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accionesIE">Acciones de I.E.</Label>
                  <Select onValueChange={(value) => {
                    const accion = accionesIE.find(a => a.id?.toString() === value)
                    if (accion) {
                      setValue("accionesIE", value as any, { shouldValidate: true })
                      const avance = Number(accion.porcentaje || 0)
                      setAvanceIE(avance); setValue("avanceIE", avance, { shouldValidate: true })
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona la acción" /></SelectTrigger>
                    <SelectContent>
                      {accionesIE.map((accion) => {
                        const avance = Number(accion.porcentaje || 0)
                        return <SelectItem key={accion.id?.toString()} value={accion.id?.toString()}>{accion.nom_accion_ie} ({avance}%)</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>Avance I.E.</span><span className="font-medium">{avanceIE}%</span></div>
                  <Progress value={Math.max(avanceIE, 0)} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accionesSEM">Acciones de S.E.M.</Label>
                  <Select onValueChange={(value) => {
                    const accion = accionesSEM.find(a => a.id?.toString() === value)
                    if (accion) {
                      setValue("accionesSEM", value as any, { shouldValidate: true })
                      const avance = Number(accion.porcentaje || 0)
                      setAvanceSEM(avance); setValue("avanceSEM", avance, { shouldValidate: true })
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona la acción" /></SelectTrigger>
                    <SelectContent>
                      {accionesSEM.map((accion) => {
                        const avance = Number(accion.porcentaje || 0)
                        return <SelectItem key={accion.id?.toString()} value={accion.id?.toString()}>{accion.nom_accion_sem} ({avance}%)</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>Avance S.E.M.</span><span className="font-medium">{avanceSEM}%</span></div>
                  <Progress value={Math.max(avanceSEM, 0)} className="h-2" />
                </div>
              </div>

              {/* AVANCE GENERAL AUTOMÁTICO */}
              <div className="sm:col-span-2 p-4 rounded-lg bg-slate-50 border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><Label>Avance General</Label><span className="text-lg font-bold">{avanceGeneral}%</span></div>
                    <Progress value={avanceGeneral} className="h-3" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (Automático)</Label>
                    <div className="flex items-center h-10">
                      <Badge variant="outline" className={estadoCalculado === "TERMINADO" ? "bg-green-100 text-green-800 border-green-200" : estadoCalculado === "EN SEGUIMIENTO" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                        {estadoCalculado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="descripcionAvance">Descripción del Caso</Label>
                <Textarea id="descripcionAvance" placeholder="Describe los hechos..." rows={3} {...register("descripcionAvance")} className="uppercase" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ENTIDADES EXTERNAS */}
        <Card>
          <CardHeader><CardTitle>Entidades Externas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entidadesExternas">Radicados en Entidades Externas</Label>
                <Input id="entidadesExternas" placeholder="Ej: CUC2024EE002434" {...register("entidadesExternas")} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaRadicadoExternas">Fecha de Radicación en Entidades Externas</Label>
                <Input id="fechaRadicadoExternas" type="date" {...register("fechaRadicadoExternas")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/lider/siuce"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={isLoading || loadingData}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Caso</>}
          </Button>
        </div>
      </form>
    </div>
  )
}