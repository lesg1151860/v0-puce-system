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
import { InstitucionCombobox } from "@/components/InstitucionCombobox"

// --- MAPEO DE LEY 1620 ---
const mapaAgresionDano: Record<string, string[]> = {
  "Económico": ["Hurto"],
  "Físico": ["Acoso escolar", "Violencia Intrafamiliar", "Agresión física grave", "Agresión física reiterada"],
  "Sexual": ["Acoso sexual", "Sexteo", "Violencia sexual"],
  "Psicológico": ["Agresión Verbal", "Agresión gestual", "Violencia Intrafamiliar", "Agresión electrónica"],
}

export default function EditarCasoSIUCEPage() {
  const router = useRouter()
  const params = useParams()
  const casoId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [showOtroEvento, setShowOtroEvento] = useState(false)
  
  // Catálogos Dinámicos
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

  // Estados Visuales 
  const [seguimientoIE, setSeguimientoIE] = useState(false)
  const [seguimientoPolicia, setSeguimientoPolicia] = useState(false)
  const [avanceIE, setAvanceIE] = useState(0)
  const [avanceSEM, setAvanceSEM] = useState(0)
  const [avanceGeneral, setAvanceGeneral] = useState(0)
  const [estadoCalculado, setEstadoCalculado] = useState<"PENDIENTE" | "EN SEGUIMIENTO" | "TERMINADO">("PENDIENTE")

  const getClasificacionStyle = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes("tipo 3")) return "bg-red-100 text-red-800 border-red-200";
  if (n.includes("tipo 2")) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const {
    register, handleSubmit, setValue, watch, reset, clearErrors, setError: setFieldError, formState: { errors },
  } = useForm<CasoSIUCEFormData>({
    resolver: zodResolver(casoSIUCESchema),
  })

  const tipoAgresion = watch("tipoAgresion")
  const danoPrincipal = watch("danoPrincipal")
  const repetitivo = watch("repetitivo")
  const eventoGenerador = watch("eventoGenerador")

  // 1. CARGA DE CATÁLOGOS Y DATOS DEL CASO
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          resIE, resIdentificacion, resGrados, resDano, resAgresion,
          resEventos, resRoles, resLugares, resAccionesIE, resAccionesSEM, resClasificaciones,
          resCasoData
        ] = await Promise.allSettled([
          api.obtenerInstituciones(), api.getTiposIdentificacion(), api.getGradosEscolaridad(),
          api.getTiposDano(), api.getTiposAgresion(), api.getEventosGeneradores(),
          api.getRolesAgresor(), api.getLugaresHechos(), api.getAccionesIE(), api.getAccionesSEM(),
          api.getClasificaciones(),
          api.getCasoSIUCEbyId(casoId) 
        ])

        const extractData = (result: any) => result.status === "fulfilled" ? (result.value.results || result.value) : [];
        
        const catAccionesIE = extractData(resAccionesIE);
        const catAccionesSEM = extractData(resAccionesSEM);
        
        setInstituciones(extractData(resIE)); setTiposIdentificacion(extractData(resIdentificacion));
        setGrados(extractData(resGrados)); setTiposDano(extractData(resDano));
        setTiposAgresion(extractData(resAgresion)); setEventosGeneradores(extractData(resEventos));
        setRolesAgresor(extractData(resRoles)); setLugares(extractData(resLugares));
        setAccionesIE(catAccionesIE); setAccionesSEM(catAccionesSEM);
        setClasificaciones(extractData(resClasificaciones));

        if (resCasoData.status === "fulfilled" && resCasoData.value) {
          const caso = resCasoData.value;
          
          // 💡 CORRECCIÓN 1: Calcular los porcentajes ANTES del reset para inyectarlos como números puros
          const accionIeEncontrada = catAccionesIE.find((a:any) => a.id?.toString() === caso.accion_ie?.toString());
          const accionSemEncontrada = catAccionesSEM.find((a:any) => a.id?.toString() === caso.accion_sem?.toString());
          const avanceIeInicial = accionIeEncontrada ? Number(accionIeEncontrada.porcentaje) : 0;
          const avanceSemInicial = accionSemEncontrada ? Number(accionSemEncontrada.porcentaje) : 0;

          reset({
            radicado: caso.num_radicado_siuce?.toString() || "",
            ie: caso.institucion_educativa?.toString() || "",
            fechaRegistro: caso.fecha_registro ? caso.fecha_registro.split('T')[0] : "",
            victima: caso.estudiante_victima || "",
            tipoIdentificacion: caso.tipo_identificacion?.toString() || "",
            numeroIdentificacion: caso.num_indentificacion?.toString() || "", 
            grado: caso.grado_escolaridad?.toString() || "",
            tipoAgresion: caso.tipo_agresion?.toString() || "",
            danoPrincipal: caso.dano_principal?.toString() || "",
            danoSecundario: caso.dano_secundario ? caso.dano_secundario.toString() : "none",
            danoTerciario: caso.dano_terciario ? caso.dano_terciario.toString() : "none",
            eventoGenerador: caso.evento_generador?.toString() || "",
            otroEventoGenerador: caso.otro_evento_generador || "",
            repetitivo: Boolean(caso.repetitivo),
            clasificacion: caso.clasificacion?.toString() || "",
            rolAgresor: caso.rol_agresor?.toString() || "",
            nombreAgresor: caso.nombre_agresor || "",
            lugar: caso.lugar_hechos?.toString() || "",
            fechaOcurrencia: caso.fecha_ocurrencia ? caso.fecha_ocurrencia.split('T')[0] : "",
            seguimientoIE: Boolean(caso.seguimiento_ie),
            numeroSeguimientoIE: Number(caso.num_seguimiento_ie) || 0,
            seguimientoPolicia: Boolean(caso.seguimiento_policia),
            numeroSeguimientoPolicia: Number(caso.num_seguimiento_policia) || 0,
            cec: Boolean(caso.cec),
            accionesIE: caso.accion_ie?.toString() || "",
            accionesSEM: caso.accion_sem?.toString() || "",
            descripcionAvance: caso.descripcion_avance || "",
            entidadesExternas: caso.rad_entidad_ext || "",
            fechaRadicadoExternas: caso.fecha_rad_entidad_ext ? caso.fecha_rad_entidad_ext.split('T')[0] : "",
            // Inyectamos los números puros para que Zod no moleste
            avanceIE: avanceIeInicial,
            avanceSEM: avanceSemInicial,
            avanceGeneral: avanceIeInicial + avanceSemInicial,
          });

          setSeguimientoIE(Boolean(caso.seguimiento_ie));
          setSeguimientoPolicia(Boolean(caso.seguimiento_policia));
          setAvanceIE(avanceIeInicial);
          setAvanceSEM(avanceSemInicial);
        } else {
          setError("No se pudo cargar la información del caso.");
        }
      } catch (err) {
        console.error(err);
        setError("Error crítico de conexión.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllData();
  }, [casoId, reset]);

  // 2. AUTOMATIZACIONES RE-UTILIZADAS
  useEffect(() => {
    if (tipoAgresion && tiposAgresion.length > 0 && tiposDano.length > 0) {
      const objAgresion = tiposAgresion.find(a => a.id?.toString() === tipoAgresion);
      if (objAgresion) {
        const nombreAgresion = objAgresion.tipo_agresion.toLowerCase().trim();
        let nombreCategoria = "";
        for (const [categoria, agresiones] of Object.entries(mapaAgresionDano)) {
          if (agresiones.some(a => a.toLowerCase().trim() === nombreAgresion)) {
            nombreCategoria = categoria.toLowerCase(); break;
          }
        }
        if (nombreCategoria) {
          const danoReal = tiposDano.find(d => d.tipo_dano.toLowerCase().includes(nombreCategoria));
          if (danoReal) setValue("danoPrincipal", danoReal.id.toString(), { shouldValidate: true });
        }
      }
    }
  }, [tipoAgresion, tiposAgresion, tiposDano, setValue]);

  useEffect(() => {
    if (danoPrincipal && tiposDano.length > 0 && clasificaciones.length > 0) {
      const objDano = tiposDano.find(d => d.id?.toString() === danoPrincipal);
      const nombreDano = objDano?.tipo_dano?.toLowerCase() || "";
      let tipoCalculado = "Tipo 1";
      if (nombreDano.includes("sexual")) tipoCalculado = "Tipo 3";
      else if (repetitivo || nombreDano.includes("físico") || nombreDano.includes("fisico")) tipoCalculado = "Tipo 2";
      
      const clasificacionReal = clasificaciones.find(c => (c.descripcion || c.nombre || "").toLowerCase().includes(tipoCalculado.toLowerCase()));
      if (clasificacionReal) setValue("clasificacion", clasificacionReal.id.toString(), { shouldValidate: true });
    }
  }, [danoPrincipal, repetitivo, tiposDano, clasificaciones, setValue]);

  useEffect(() => {
    const promedio = (avanceIE + avanceSEM) / 2;
    const promedioFinal = Math.round(promedio);
    setAvanceGeneral(promedioFinal);
    setValue("avanceGeneral", promedioFinal, { shouldValidate: true });

    let estadoActual: "PENDIENTE" | "EN SEGUIMIENTO" | "TERMINADO" = "EN SEGUIMIENTO";
    
    if (promedioFinal <= 0) {
      estadoActual = "PENDIENTE";
    } else if (promedioFinal >= 100) {
      estadoActual = "TERMINADO";
    }
    setEstadoCalculado(estadoActual);
    setValue("estado", estadoActual, { shouldValidate: true });
  }, [avanceIE, avanceSEM, setValue]);

  useEffect(() => {
    if (eventoGenerador) {
      const objEvento = eventosGeneradores.find(e => e.id?.toString() === eventoGenerador);
      setShowOtroEvento(objEvento?.evento_generador?.toLowerCase().includes("otro") || false);
    }
  }, [eventoGenerador, eventosGeneradores]);

  // 3. ACTUALIZACIÓN DEL CASO (PATCH)
  const onSubmit = async (data: CasoSIUCEFormData) => {
    setError("")
    setIsLoading(true)
    
    try {
      if (hasSpecialChars(data.victima) || hasSpecialChars(data.nombreAgresor)) {
        setError(SPECIAL_CHARS_ERROR); setIsLoading(false); return;
      }

      const payloadBackend = {
        num_radicado_siuce: data.radicado,
        fecha_registro: data.fechaRegistro,
        institucion_educativa: parseInt(data.ie),
        estudiante_victima: sanitizeText(data.victima),
        tipo_identificacion: parseInt(data.tipoIdentificacion),
        num_indentificacion: data.numeroIdentificacion,
        grado_escolaridad: parseInt(data.grado),
        
        tipo_agresion: parseInt(data.tipoAgresion),
        dano_principal: data.danoPrincipal ? parseInt(data.danoPrincipal) : null,
        dano_secundario: data.danoSecundario && data.danoSecundario !== "none" ? parseInt(data.danoSecundario) : null,
        dano_terciario: data.danoTerciario && data.danoTerciario !== "none" ? parseInt(data.danoTerciario) : null,
        repetitivo: data.repetitivo,
        
        evento_generador: parseInt(data.eventoGenerador),
        otro_evento_generador: data.otroEventoGenerador ? sanitizeText(data.otroEventoGenerador) : null,
        
        rol_agresor: parseInt(data.rolAgresor),
        nombre_agresor: sanitizeText(data.nombreAgresor),
        clasificacion: data.clasificacion ? parseInt(data.clasificacion) : null,
        lugar_hechos: parseInt(data.lugar),
        fecha_ocurrencia: data.fechaOcurrencia,
        
        seguimiento_ie: data.seguimientoIE,
        num_seguimiento_ie: data.numeroSeguimientoIE?.toString() || "",
        seguimiento_policia: data.seguimientoPolicia,
        num_seguimiento_policia: data.numeroSeguimientoPolicia?.toString() || "",
        cec: data.cec,
        
        accion_ie: data.accionesIE ? parseInt(data.accionesIE) : null,
        accion_sem: data.accionesSEM ? parseInt(data.accionesSEM) : null,
        descripcion_avance: data.descripcionAvance ? sanitizeText(data.descripcionAvance) : "",
        
        rad_entidad_ext: data.entidadesExternas || "",
        fecha_rad_entidad_ext: data.fechaRadicadoExternas || null,
      }

      await api.actualizarCasoSIUCE(casoId, payloadBackend);
      router.push("/lider/siuce")

    } catch (err: any) {
      try {
        const errorData = JSON.parse(err.message);
        let errorEncontrado = false

        if (errorData.num_radicado_siuce) {
          setFieldError("radicado", { type: "server", message: "Este radicado ya existe." })
          errorEncontrado = true
        }
        if (errorData.num_indentificacion) {
          setFieldError("numeroIdentificacion", { type: "server", message: "Esta identificación ya está registrada." })
          errorEncontrado = true
        }

        if (!errorEncontrado) setError("Django rechazó los datos: " + JSON.stringify(errorData))
      } catch (e) {
        setError("Error de comunicación con el servidor. Revisa la consola.");
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getDanoNombre = (id: string) => tiposDano.find(d => d.id?.toString() === id)?.tipo_dano || "Cargando...";
  const getClasificacionNombre = (id: string) => clasificaciones.find(c => c.id?.toString() === id)?.descripcion || "Calculando...";

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Cargando datos del caso SIUCE...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lider/siuce"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Caso SIUCE</h1>
          <p className="text-slate-600">Sistema de Información Unificado de Convivencia Escolar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (err) => console.log("ERRORES DE VALIDACIÓN ZOD:", err))} className="space-y-6">
        
        <input type="hidden" {...register("danoPrincipal")} />
        <input type="hidden" {...register("clasificacion")} />
        <input type="hidden" {...register("estado")} />
        <input type="hidden" {...register("avanceIE", { valueAsNumber: true })} />
        <input type="hidden" {...register("avanceSEM", { valueAsNumber: true })} />
        <input type="hidden" {...register("avanceGeneral", { valueAsNumber: true })} />

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* IDENTIFICACIÓN */}
        <Card>
          <CardHeader><CardTitle>Identificación del Caso</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="radicado">N° Radicado SIUCE<span className="text-red-500">*</span></Label>
                <Input id="radicado" maxLength={10} {...register("radicado")} className={errors.radicado ? "border-red-500" : ""} />
                {errors.radicado && <p className="text-sm text-red-500">{errors.radicado.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ie">Institución Educativa <span className="text-red-500">*</span></Label>
                <InstitucionCombobox 
                    opciones={instituciones} 
                    value={watch("ie") || ""} 
                    onChange={(val) => setValue("ie", val, { shouldValidate: true })}
                    placeholder="Buscar I.E...."
                />
                {errors.ie && <p className="text-sm text-red-500">{errors.ie.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRegistro">Fecha de Registro <span className="text-red-500">*</span></Label>
                <Input id="fechaRegistro" type="date"
                  {...register("fechaRegistro")} className={errors.fechaRegistro ? "border-red-500" : ""} 
                  disabled={isLoading}
                />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* VÍCTIMA */}
        <Card>
          <CardHeader><CardTitle>Información de la Víctima</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Nombre de la Víctima <span className="text-red-500">*</span></Label>
                <Input {...register("victima")} className="uppercase" />
                {errors.victima && <p className="text-sm text-red-500">{errors.victima.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo Identificación <span className="text-red-500">*</span></Label>
                <Select value={watch("tipoIdentificacion")} onValueChange={(value) => setValue("tipoIdentificacion", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposIdentificacion.map((tipo) => <SelectItem key={tipo.id?.toString()} value={tipo.id?.toString()}>{tipo.tipo_identificacion}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número Identificación <span className="text-red-500">*</span></Label>
                <Input maxLength={10} {...register("numeroIdentificacion")} />
              </div>
              <div className="space-y-2">
                <Label>Grado <span className="text-red-500">*</span></Label>
                <Select value={watch("grado")} onValueChange={(value) => setValue("grado", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{grados.map((g) => <SelectItem key={g.id?.toString()} value={g.id?.toString()}>{g.nom_grado}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AGRESIÓN Y DAÑO */}
        <Card>
          <CardHeader><CardTitle>Tipo de Agresión y Daño</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo Agresión <span className="text-red-500">*</span></Label>
                <Select value={watch("tipoAgresion")} onValueChange={(value) => setValue("tipoAgresion", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposAgresion.map((tipo) => <SelectItem key={tipo.id?.toString()} value={tipo.id?.toString()}>{tipo.tipo_agresion}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Daño Principal (Automático)</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50"><span className="font-medium">{getDanoNombre(watch("danoPrincipal"))}</span></div>
              </div>

              <div className="space-y-2">
                <Label>Daño Secundario</Label>
                <Select value={watch("danoSecundario") || "none"} onValueChange={(value) => setValue("danoSecundario", value === "none" ? undefined : value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => <SelectItem key={dano.id?.toString()} value={dano.id?.toString()}>{dano.tipo_dano}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Daño Terciario</Label>
                <Select value={watch("danoTerciario") || "none"} onValueChange={(value) => setValue("danoTerciario", value === "none" ? undefined : value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {tiposDano.map((dano) => <SelectItem key={dano.id?.toString()} value={dano.id?.toString()}>{dano.tipo_dano}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Evento Generador <span className="text-red-500">*</span></Label>
                <Select value={watch("eventoGenerador")} onValueChange={(value) => setValue("eventoGenerador", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventosGeneradores.map((evento) => <SelectItem key={evento.id?.toString()} value={evento.id?.toString()}>{evento.evento_generador}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {showOtroEvento && (
                <div className="space-y-2"><Label>Especifique Otro</Label><Input {...register("otroEventoGenerador")} /></div>
              )}

              <div className="flex items-center space-x-3 pt-6">
                <Switch id="repetitivo" checked={watch("repetitivo")} onCheckedChange={(checked) => setValue("repetitivo", checked, { shouldValidate: true })} />
                <Label>¿Es conducta repetitiva?</Label>
              </div>

              <div className="space-y-2">
                <Label>Clasificación (Automática)</Label>
                <div className="flex items-center h-10 px-3 border bg-slate-50 rounded-md">
                  {(() => {
                    const nombre = getClasificacionNombre(watch("clasificacion"));
            
                    return (
                      <Badge variant="outline" className={getClasificacionStyle(nombre)}> {nombre} </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AGRESOR Y LUGAR */}
        <Card>
          <CardHeader><CardTitle>Información del Agresor</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Rol del Agresor <span className="text-red-500">*</span></Label>
                <Select value={watch("rolAgresor")} onValueChange={(value) => setValue("rolAgresor", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{rolesAgresor.map((rol) => <SelectItem key={rol.id?.toString()} value={rol.id?.toString()}>{rol.nom_rol_agresor}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre Agresor <span className="text-red-500">*</span></Label>
                <Input {...register("nombreAgresor")} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Lugar <span className="text-red-500">*</span></Label>
                <Select value={watch("lugar")} onValueChange={(value) => setValue("lugar", value as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{lugares.map((l) => <SelectItem key={l.id?.toString()} value={l.id?.toString()}>{l.nom_lugar}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Ocurrencia <span className="text-red-500">*</span></Label>
                <Input type="date" {...register("fechaOcurrencia")} />
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
                <div className="flex items-center space-x-3"><Switch checked={seguimientoIE} onCheckedChange={(checked) => { setSeguimientoIE(checked); setValue("seguimientoIE", checked, { shouldValidate: true }); }} /><Label>Seguimiento I.E.</Label></div>
                {seguimientoIE && <Input type="number" {...register("numeroSeguimientoIE", { valueAsNumber: true })} />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3"><Switch checked={seguimientoPolicia} onCheckedChange={(checked) => { setSeguimientoPolicia(checked); setValue("seguimientoPolicia", checked, { shouldValidate: true }); }} /><Label>Seguimiento Policía</Label></div>
                {seguimientoPolicia && <Input type="number" {...register("numeroSeguimientoPolicia", { valueAsNumber: true })} />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3"><Switch checked={watch("cec")} onCheckedChange={(checked) => setValue("cec", checked, { shouldValidate: true })} /><Label>CEC (Comité Escolar)</Label></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACCIONES */}
        <Card>
          <CardHeader><CardTitle>Acciones y Avances</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Acciones de I.E.</Label>
                  <Select value={watch("accionesIE") || ""} onValueChange={(value) => {
                    const accion = accionesIE.find(a => a.id?.toString() === value);
                    if (accion) { 
                      setValue("accionesIE", value as any, { shouldValidate: true }); 
                      // 💡 CORRECCIÓN 3: Actualizar el formulario explícitamente con números al interactuar con el Select
                      const num = Number(accion.porcentaje);
                      setAvanceIE(num); 
                      setValue("avanceIE", num, { shouldValidate: true });
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>{accionesIE.map((accion) => <SelectItem key={accion.id?.toString()} value={accion.id?.toString()}>{accion.nom_accion_ie} ({Number(accion.porcentaje)}%)</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Avance I.E.</span><span className="font-medium">{avanceIE}%</span></div>
                  <Progress value={Math.max(avanceIE, 0)} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Acciones de S.E.M.</Label>
                  <Select value={watch("accionesSEM") || ""} onValueChange={(value) => {
                    const accion = accionesSEM.find(a => a.id?.toString() === value);
                    if (accion) { 
                      setValue("accionesSEM", value as any, { shouldValidate: true }); 
                      // 💡 Igual aquí, inyectamos números puros en la asignación dinámica
                      const num = Number(accion.porcentaje);
                      setAvanceSEM(num); 
                      setValue("avanceSEM", num, { shouldValidate: true });
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>{accionesSEM.map((accion) => <SelectItem key={accion.id?.toString()} value={accion.id?.toString()}>{accion.nom_accion_sem} ({Number(accion.porcentaje)}%)</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Avance S.E.M.</span><span className="font-medium">{avanceSEM}%</span></div>
                  <Progress value={Math.max(avanceSEM, 0)} className="h-2" />
                </div>
              </div>

              <div className="sm:col-span-2 p-4 rounded-lg bg-slate-50 border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Avance General</Label><span className="text-lg font-bold">{avanceGeneral}%</span></div>
                    <Progress value={avanceGeneral} className="h-3" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <div className="flex items-center h-10"><Badge variant="outline">{estadoCalculado}</Badge></div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Descripción del Caso</Label>
                <Textarea {...register("descripcionAvance")} rows={3} className="uppercase" />
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
                <Label>Radicados en Entidades Externas</Label>
                <Input {...register("entidadesExternas")} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Radicación</Label>
                <Input type="date" {...register("fechaRadicadoExternas")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/lider/siuce"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={isLoading || loadingData}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Actualizar Caso</>}
          </Button>
        </div>
      </form>
    </div>
  )
}