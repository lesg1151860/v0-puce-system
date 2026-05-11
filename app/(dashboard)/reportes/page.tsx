"use client"

import { useState } from "react"
import { FileSpreadsheet, Download, Calendar, FileText } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getCasesSACByDateRange, getCasesSIUCEByDateRange } from "@/lib/storage"

const meses = [
  { value: "0", label: "Enero" },
  { value: "1", label: "Febrero" },
  { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Mayo" },
  { value: "5", label: "Junio" },
  { value: "6", label: "Julio" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Septiembre" },
  { value: "9", label: "Octubre" },
  { value: "10", label: "Noviembre" },
  { value: "11", label: "Diciembre" },
]

// Generar años desde 2020 hasta el año actual + 1
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i)

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<"anual" | "mensual">("anual")
  const [year, setYear] = useState(currentYear.toString())
  const [month, setMonth] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState("")

  const generarReporte = () => {
    setIsGenerating(true)
    setMessage("")

    try {
      const selectedYear = parseInt(year)
      const selectedMonth = tipoReporte === "mensual" && month ? parseInt(month) : undefined

      // Obtener casos filtrados por fecha
      const casosSAC = getCasesSACByDateRange(selectedYear, selectedMonth)
      const casosSIUCE = getCasesSIUCEByDateRange(selectedYear, selectedMonth)

      if (casosSAC.length === 0 && casosSIUCE.length === 0) {
        setMessage("No se encontraron casos para el período seleccionado.")
        setIsGenerating(false)
        return
      }

      // Crear workbook
      const workbook = XLSX.utils.book_new()

      // Hoja SAC - Orden segun documentacion estructurada
      const sacData = casosSAC.map((caso) => ({
        "Radicado": caso.radicado,
        "Fecha de Radicacion": caso.fechaRadicacion,
        "Estado": caso.estado,
        "Respondido": caso.respondido ? "SI" : "NO",
        "Radicado Respuesta": caso.radicadoRespuesta || "",
        "Ciudadano": caso.ciudadano,
        "Rol": caso.rol,
        "Estudiante": caso.estudiante || "",
        "Institucion contra quien se dirige": caso.institucionContraQuienSeDirige || "",
        "Situacion": caso.situacion || "",
        "Descripción": caso.descripcion || "",
        "Prorroga": caso.prorroga ? "SI" : "NO",
        "Fecha Nueva Prorroga": caso.fechaNuevaProrroga || "",
        "Radicado Prorroga": caso.radicadoProrroga || "",
        "Contestacion I.E.": caso.contestacionIE ? "SI" : "NO",
        "Radicado Contestacion": caso.radicadoContestacion || "",
        "Traslado a I.E.": caso.trasladoIE ? "SI" : "NO",
        "Radicado Externa": caso.radicadoExterna || "",
        "SAC Respuesta": caso.sacRespuesta || "",
      }))

      if (sacData.length > 0) {
        const sacSheet = XLSX.utils.json_to_sheet(sacData)
        // Ajustar ancho de columnas - Orden segun documentacion
        sacSheet["!cols"] = [
          { wch: 18 }, // Radicado
          { wch: 25 }, // Ciudadano
          { wch: 18 }, // Fecha de Radicacion
          { wch: 18 }, // Radicado Respuesta
          { wch: 15 }, // Rol
          { wch: 14 }, // Traslado a I.E.
          { wch: 18 }, // Radicado Externa
          { wch: 12 }, // Respondido
          { wch: 10 }, // Prorroga
          { wch: 18 }, // Fecha Nueva Prorroga
          { wch: 18 }, // Radicado Prorroga
          { wch: 15 }, // Contestacion I.E.
          { wch: 20 }, // Radicado Contestacion
          { wch: 25 }, // Estudiante
          { wch: 30 }, // Institucion contra quien se dirige
          { wch: 12 }, // Situacion
          { wch: 14 }, // SAC Respuesta
          { wch: 15 }, // Estado
        ]
        XLSX.utils.book_append_sheet(workbook, sacSheet, "SAC")
      }

      // Hoja SIUCE - Orden segun documentacion estructurada
      const siuceData = casosSIUCE.map((caso) => ({
        "Radicado": caso.radicado,
        "Avance General (%)": caso.avanceGeneral,
        "Estado": caso.estado,
        "I.E.": caso.ie,
        "Victima": caso.victima,
        "Tipo de Identificacion": caso.tipoIdentificacion,
        "Numero (identificacion)": caso.numeroIdentificacion,
        "Grado": caso.grado,
        "Dano (Dano Principal)": caso.danoPrincipal,
        "Dano 2 (Dano Secundario)": caso.danoSecundario || "",
        "Dano 3 (Dano Terciario)": caso.danoTerciario || "",
        "Tipo de Agresion": caso.tipoAgresion || "",
        "Repetitivo": caso.repetitivo ? "SI" : "NO",
        "Evento Generador": caso.eventoGenerador,
        "Otro (evento generador)": caso.otroEventoGenerador || "",
        "Rol Agresor": caso.rolAgresor,
        "Nombre Agresor": caso.nombreAgresor,
        "Clasificacion": caso.clasificacion,
        "Lugar": caso.lugar,
        "Fecha Ocurrencia": caso.fechaOcurrencia,
        "Fecha Registro": caso.fechaRegistro,
        "Seguimiento I.E.": caso.seguimientoIE ? "SI" : "NO",
        "Numero (seguimiento I.E.)": caso.numeroSeguimientoIE || 0,
        "Seguimiento Policia": caso.seguimientoPolicia ? "SI" : "NO",
        "Numero (seguimiento Policia)": caso.numeroSeguimientoPolicia || 0,
        "CEC (Comite Escolar de Convivencia)": caso.cec ? "SI" : "NO",
        "Acciones de I.E.": caso.accionesIE || "",
        "Avance I.E. (%)": caso.avanceIE,
        "Acciones de S.E.M.": caso.accionesSEM || "",
        "Avance S.E.M. (%)": caso.avanceSEM,
        "Descripcion Avance": caso.descripcionAvance || "",
        "Entidades Externas (Radicado de Respuesta)": caso.entidadesExternas || "",
        "Fecha Radicado E. Externas": caso.fechaRadicadoExternas || "",
      }))

      if (siuceData.length > 0) {
        const siuceSheet = XLSX.utils.json_to_sheet(siuceData)
        // Ajustar ancho de columnas
        siuceSheet["!cols"] = Array(33).fill({ wch: 18 })
        XLSX.utils.book_append_sheet(workbook, siuceSheet, "SIUCE")
      }

      // Generar nombre del archivo
      const mesNombre = selectedMonth !== undefined ? meses[selectedMonth].label : ""
      const nombreArchivo = tipoReporte === "anual"
        ? `Reporte_Convivencia_${selectedYear}.xlsx`
        : `Reporte_Convivencia_${mesNombre}_${selectedYear}.xlsx`

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo)

      setMessage(`Reporte generado exitosamente. SAC: ${casosSAC.length} casos, SIUCE: ${casosSIUCE.length} casos.`)
    } catch (error) {
      console.error("Error generando reporte:", error)
      setMessage("Error al generar el reporte. Por favor intente nuevamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-slate-500">Genera reportes de casos en formato Excel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración del reporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración del Reporte
            </CardTitle>
            <CardDescription>
              Selecciona el período para generar el reporte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de reporte */}
            <div className="space-y-3">
              <Label>Tipo de Reporte</Label>
              <RadioGroup
                value={tipoReporte}
                onValueChange={(value) => {
                  setTipoReporte(value as "anual" | "mensual")
                  if (value === "anual") {
                    setMonth(undefined)
                  }
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anual" id="anual" />
                  <Label htmlFor="anual" className="font-normal cursor-pointer">
                    Anual
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mensual" id="mensual" />
                  <Label htmlFor="mensual" className="font-normal cursor-pointer">
                    Mensual
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Año */}
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Selecciona el año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mes (solo si es mensual) */}
            {tipoReporte === "mensual" && (
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Selecciona el mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Botón generar */}
            <Button
              onClick={generarReporte}
              disabled={isGenerating || (tipoReporte === "mensual" && !month)}
              className="w-full"
            >
              {isGenerating ? (
                <>Generando...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar y Descargar Excel
                </>
              )}
            </Button>

            {/* Mensaje */}
            {message && (
              <p className={`text-sm ${message.includes("Error") || message.includes("No se encontraron") ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Información del reporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Información del Reporte
            </CardTitle>
            <CardDescription>
              Detalles sobre el contenido del archivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Hoja 1: SAC</h4>
                  <p className="text-sm text-blue-700">
                    Contiene todos los casos del Sistema de Atención al Ciudadano registrados en el período seleccionado,
                    incluyendo información del ciudadano, fechas, estado y seguimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <FileText className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-900">Hoja 2: SIUCE</h4>
                  <p className="text-sm text-emerald-700">
                    Contiene todos los casos del Sistema de Información Unificado de Convivencia Escolar,
                    incluyendo información de víctimas, agresores, clasificación, avances y seguimiento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border">
              <h4 className="font-medium text-slate-900 mb-2">Notas:</h4>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>El reporte anual incluye todos los casos del año seleccionado</li>
                <li>El reporte mensual filtra por mes y año específicos</li>
                <li>Los casos SAC se filtran por fecha de radicación</li>
                <li>Los casos SIUCE se filtran por fecha de registro</li>
                <li>El archivo se descarga automáticamente al generar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
