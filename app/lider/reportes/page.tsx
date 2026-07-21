"use client"

import { useState, useEffect } from "react"
import { FileSpreadsheet, Download, Calendar, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api } from "@/lib/api" 
import { InstitucionCombobox } from "@/components/InstitucionCombobox"

const meses = [
  { value: "0", label: "Enero" }, { value: "1", label: "Febrero" }, { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" }, { value: "4", label: "Mayo" }, { value: "5", label: "Junio" },
  { value: "6", label: "Julio" }, { value: "7", label: "Agosto" }, { value: "8", label: "Septiembre" },
  { value: "9", label: "Octubre" }, { value: "10", label: "Noviembre" }, { value: "11", label: "Diciembre" },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i)


const fetchAndExtract = async (apiCall: () => Promise<any>) => {
  try {
    const res = await apiCall();
    return res?.results || (Array.isArray(res) ? res : []);
  } catch (error) {
    return [];
  }
};

const getNombre = (val: any, catalogo: any[], llavesPosibles: string[]) => {
  if (val === undefined || val === null) return "";
  

  const id = typeof val === 'object' ? val.id : val;  
  const item = catalogo.find((c: any) => c.id?.toString() === id?.toString());
  
  if (!item) {
    
    if (typeof val === 'object') {
      for (const k of llavesPosibles) if (val[k]) return val[k];
      return val.nombre || "";
    }
    return id?.toString(); 
  }
  
  for (const k of llavesPosibles) {
    if (item[k]) return item[k];
  }
  return item.nombre || item.descripcion || id?.toString();
};

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<"anual" | "mensual">("anual")
  const [year, setYear] = useState(currentYear.toString())
  const [month, setMonth] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState("")
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [agresiones, setAgresiones] = useState<any[]>([])
  const [filtroIE, setFiltroIE] = useState<string>("todas")
  const [filtroIETexto, setFiltroIETexto] = useState<string>("")
  const [filtroAgresion, setFiltroAgresion] = useState<string>("todas")

  
  useEffect(() => {
    const initCatalogos = async () => {
      setInstituciones(await fetchAndExtract(api.obtenerInstituciones));
      setAgresiones(await fetchAndExtract(api.getTiposAgresion));
    }
    initCatalogos()
  }, [])

  const generarReporte = async () => {
    setIsGenerating(true)
    setMessage("Descargando catálogos y cruzando información...")

    try {
      const selectedYear = parseInt(year)
      const selectedMonth = tipoReporte === "mensual" && month ? parseInt(month) : undefined

      const [
        rawCasosSAC, rawCasosSIUCE, catEstadosSAC, catRolesCiudadano, 
        catEstadosSIUCE, catTiposIdentificacion, catGrados, catTiposDano, 
        catEventos, catRolesAgresor, catClasificacion, catLugares, 
        catAccionesIE, catAccionesSEM
      ] = await Promise.all([
        fetchAndExtract(api.getCasosSAC),
        fetchAndExtract(api.getCasosSIUCE),
        fetchAndExtract(api.getEstadosSAC),
        fetchAndExtract(api.getRolesCiudadano),
        fetchAndExtract(api.getEstadosSIUCE),
        fetchAndExtract(api.getTiposIdentificacion),
        fetchAndExtract(api.getGradosEscolaridad),
        fetchAndExtract(api.getTiposDano),
        fetchAndExtract(api.getEventosGeneradores),
        fetchAndExtract(api.getRolesAgresor),
        fetchAndExtract(api.getClasificaciones),
        fetchAndExtract(api.getLugaresHechos),
        fetchAndExtract(api.getAccionesIE),
        fetchAndExtract(api.getAccionesSEM),
      ]);

      let casosSAC = rawCasosSAC.filter((c: any) => {
        const fStr = c.fecha_radicacion || c.created_at; 
        if (!fStr) return false;
        const [y, m] = fStr.split('-');
        if (tipoReporte === "anual") return parseInt(y) === selectedYear;
        return parseInt(y) === selectedYear && parseInt(m) - 1 === selectedMonth;
      });

      let casosSIUCE = rawCasosSIUCE.filter((c: any) => {
        const fStr = c.fecha_registro || c.fecha_ocurrencia || c.created_at; 
        if (!fStr) return false;
        const [y, m] = fStr.split('-');
        if (tipoReporte === "anual") return parseInt(y) === selectedYear;
        return parseInt(y) === selectedYear && parseInt(m) - 1 === selectedMonth;
      });

      const getID = (val: any) => typeof val === 'object' && val !== null ? val.id?.toString() : val?.toString();

      if (filtroIE !== "todas") {
        casosSAC = casosSAC.filter((c: any) => getID(c.institucion_educativa || c.ie) === filtroIE);
        casosSIUCE = casosSIUCE.filter((c: any) => getID(c.institucion_educativa || c.ie) === filtroIE);
      }

      if (filtroAgresion !== "todas") {
        casosSAC = []; 
        casosSIUCE = casosSIUCE.filter((c: any) => getID(c.tipo_agresion) === filtroAgresion);
      }

      if (casosSAC.length === 0 && casosSIUCE.length === 0) {
        setMessage("No se encontraron casos para el período y filtros seleccionados.")
        setIsGenerating(false)
        return
      }
      
      const workbook = XLSX.utils.book_new()

      const sacData = casosSAC.map((caso: any) => ({
        "Radicado": caso.num_radicado_sac ||"N/A",
        "Fecha de Radicacion": caso.fecha_radicacion || "N/A",
        "Estado": getNombre(caso.estado_sac, catEstadosSAC, ['estado_sac', 'nom_estado_sac']),
        "Respondido": caso.respondido ? "SI" : "NO",
        "Radicado Respuesta": caso.radicado_respuesta || "N/A",
        "Ciudadano": caso.ciudadano || "N/A",
        "Rol": getNombre(caso.rol_ciudadano || caso.rol, catRolesCiudadano, ['nombre_rol']),
        "Estudiante": caso.estudiante || "N/A",
        "Institucion contra quien se dirige": getNombre(caso.nombre, instituciones, ['nombre_ie']),
        "Situacion": caso.situacion || "N/A",
        "Descripción": caso.descripcion || "N/A",
        "Prorroga": caso.prorroga ? "SI" : "NO",
        "Fecha Nueva Prorroga": caso.fecha_nueva_prorroga || "N/A",
        "Radicado Prorroga": caso.radicado_prorroga || "N/A",
        "Contestacion I.E.": caso.contestacion_ie ? "SI" : "NO",
        "Radicado Contestacion": caso.radicado_contestacion || "N/A",
        "Traslado a I.E.": caso.traslado_ie ? "SI" : "NO",
        "Radicado Externa": caso.radicado_externa || "N/A",
        "SAC Respuesta": caso.sac_respuesta || "N/A",
      }))

      if (sacData.length > 0) {
        const sacSheet = XLSX.utils.json_to_sheet(sacData)
        sacSheet["!cols"] = Array(19).fill({ wch: 20 })
        XLSX.utils.book_append_sheet(workbook, sacSheet, "SAC")
      }

      const siuceData = casosSIUCE.map((caso: any) => ({
        "Radicado": caso.num_radicado_siuce || caso.num_radicado || caso.radicado || "N/A",
        "Avance General (%)": caso.avance_general || 0,
        "Estado": getNombre(caso.estado_siuce || caso.estado, catEstadosSIUCE, ['estado_siuce']),
        "I.E.": getNombre(caso.nombre, instituciones, ['nombre_ie']),
        "Victima": caso.estudiante_victima || caso.victima || "N/A",
        "Tipo de Identificacion": getNombre(caso.tipo_identificacion, catTiposIdentificacion, ['tipo_identificacion']),
        "Numero (identificacion)": caso.num_identificacion || "N/A",
        "Grado": getNombre(caso.grado_escolaridad || caso.grado, catGrados, ['nom_grado']),
        "Dano Principal": getNombre(caso.dano_principal, catTiposDano, ['tipo_dano']),
        "Dano Secundario": getNombre(caso.dano_secundario, catTiposDano, ['tipo_dano']),
        "Dano Terciario": getNombre(caso.dano_terciario, catTiposDano, ['tipo_dano']),
        "Tipo de Agresion": getNombre(caso.tipo_agresion, agresiones, ['tipo_agresion']),
        "Repetitivo": caso.repetitivo ? "SI" : "NO",
        "Evento Generador": getNombre(caso.evento_generador, catEventos, ['evento_generador']),
        "Otro (evento generador)": caso.otro_evento_generador || "N/A",
        "Rol Agresor": getNombre(caso.rol_agresor, catRolesAgresor, ['nom_rol_agresor']),
        "Nombre Agresor": caso.nombre_agresor || "N/A",
        "Clasificacion": getNombre(caso.clasificacion, catClasificacion, ['descripcion', 'clasificacion']),
        "Lugar": getNombre(caso.lugar_hechos || caso.lugar, catLugares, ['nom_lugar']),
        "Fecha Ocurrencia": caso.fecha_ocurrencia || "N/A",
        "Fecha Registro": caso.fecha_registro || "N/A",
        "Seguimiento I.E.": caso.seguimiento_ie ? "SI" : "NO",
        "Numero (seguimiento I.E.)": caso.numero_seguimiento_ie || 0,
        "Seguimiento Policia": caso.seguimiento_policia ? "SI" : "NO",
        "Numero (seguimiento Policia)": caso.numero_seguimiento_policia || 0,
        "CEC": caso.cec ? "SI" : "NO",
        "Acciones de I.E.": getNombre(caso.acciones_ie, catAccionesIE, ['nom_accion_ie']),
        "Avance I.E. (%)": caso.avance_ie || 0,
        "Acciones de S.E.M.": getNombre(caso.acciones_sem, catAccionesSEM, ['nom_accion_sem']),
        "Avance S.E.M. (%)": caso.avance_sem || 0,
        "Descripcion Avance": caso.descripcion_avance || "N/A",
        "Entidades Externas (Radicado de Respuesta)": caso.entidades_externas || "N/A",
        "Fecha Radicado E. Externas": caso.fecha_radicado_externas || "N/A",
      }))

      if (siuceData.length > 0) {
        const siuceSheet = XLSX.utils.json_to_sheet(siuceData)
        siuceSheet["!cols"] = Array(33).fill({ wch: 18 })
        XLSX.utils.book_append_sheet(workbook, siuceSheet, "SIUCE")
      }

      const instObj = instituciones.find(i => i.id?.toString() === filtroIE)
      const ieName = instObj ? (instObj.nombre || instObj.nombre_ie) : ""
      const agreObj = agresiones.find(a => a.id?.toString() === filtroAgresion)
      const agresionName = agreObj ? (agreObj.nombre || agreObj.tipo || agreObj.tipo_agresion) : ""

      const mesNombre = selectedMonth !== undefined ? meses[selectedMonth].label : ""
      let nombreArchivo = "Reporte_Convivencia"
      
      if (filtroIE !== "todas" && ieName) nombreArchivo += `_${ieName.replace(/[^a-zA-Z0-9]/g, "_")}`
      if (filtroAgresion !== "todas" && agresionName) nombreArchivo += `_${agresionName.replace(/[^a-zA-Z0-9]/g, "_")}`
      
      nombreArchivo += tipoReporte === "anual" ? `_${selectedYear}.xlsx` : `_${mesNombre}_${selectedYear}.xlsx`

      XLSX.writeFile(workbook, nombreArchivo)
      setMessage(`¡Reporte generado exitosamente! SAC: ${casosSAC.length} casos | SIUCE: ${casosSIUCE.length} casos.`)
    } catch (error) {
      console.error("Error generando reporte:", error)
      setMessage("Ocurrió un error extrayendo la información del servidor.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-slate-500">Genera reportes de casos exportando datos en tiempo real</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración del Reporte
            </CardTitle>
            <CardDescription>
              Selecciona el período y filtros para consultar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Tipo de Reporte</Label>
              <RadioGroup
                value={tipoReporte}
                onValueChange={(value) => {
                  setTipoReporte(value as "anual" | "mensual")
                  if (value === "anual") setMonth(undefined)
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anual" id="anual" />
                  <Label htmlFor="anual" className="font-normal cursor-pointer">Anual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mensual" id="mensual" />
                  <Label htmlFor="mensual" className="font-normal cursor-pointer">Mensual</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year"><SelectValue placeholder="Selecciona el año" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipoReporte === "mensual" && (
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month"><SelectValue placeholder="Selecciona el mes" /></SelectTrigger>
                  <SelectContent>
                    {meses.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 relative">
              <Label htmlFor="ie_filter">Institución Educativa (I.E.)</Label>
              <InstitucionCombobox 
                opciones={instituciones} 
                value={(filtroIE === "todas" || filtroIE === "no_match") ? "" : filtroIE} 
                onChange={(val) => {
                  if (!val || val.trim() === "") {
                    setFiltroIE("todas");
                  } else {
                    setFiltroIE(val);
                  }
                }}
                placeholder="Seleccione una I.E..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_agresion">Tipo de Agresión</Label>
              <Select value={filtroAgresion} onValueChange={setFiltroAgresion}>
                <SelectTrigger id="tipo_agresion">
                  <SelectValue placeholder="Todos los tipos de agresión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los tipos de agresión</SelectItem>
                  {agresiones.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.nombre || a.tipo || a.tipo_agresion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generarReporte}
              disabled={isGenerating || (tipoReporte === "mensual" && !month)}
              className="w-full"
            >
              {isGenerating ? (
                <>Obteniendo datos...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar y Descargar Excel
                </>
              )}
            </Button>

            {message && (
              <p className={`text-sm font-medium ${message.includes("Error") || message.includes("No se encontraron") ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Información del Reporte
            </CardTitle>
            <CardDescription>
              Detalles sobre el contenido del archivo Excel exportado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Hoja 1: SAC</h4>
                  <p className="text-sm text-blue-700">
                    Contiene todos los casos del Sistema de Atención al Ciudadano con información detallada de cada registro</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <FileText className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-900">Hoja 2: SIUCE</h4>
                  <p className="text-sm text-emerald-700">
                    Contiene todos los casos del Sistena de Información Unificado de Convivencia Escolar con información detallada de cada registro</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border">
              <h4 className="font-medium text-slate-900 mb-2">Notas:</h4>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>El sistema descarga los catálogos en tiempo real para hacer el cruce de datos.</li>
                <li>Si un registro queda vacío, significa que el dato no fue suministrado en la creación del caso.</li>
                <li>El archivo se descarga automáticamente al generar.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}