"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  FileText,
  Filter,
  Bell,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"
import { getCasesSAC, getInstitucionesEducativas } from "@/lib/storage"
import type { CasoSAC, EstadoSAC, SituacionSAC } from "@/lib/types"

const estadoBadgeStyles: Record<EstadoSAC, string> = {
  "EN SEGUIMIENTO": "bg-blue-100 text-blue-800 border-blue-200",
  "TERMINADO": "bg-green-100 text-green-800 border-green-200",
}

const situacionBadgeStyles: Record<string, string> = {
  "Tipo 1": "bg-slate-100 text-slate-800 border-slate-200",
  "Tipo 2": "bg-orange-100 text-orange-800 border-orange-200",
  "Tipo 3": "bg-red-100 text-red-800 border-red-200",
}

export default function SACListPage() {
  const [cases, setCases] = useState<CasoSAC[]>([])
  const [filteredCases, setFilteredCases] = useState<CasoSAC[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [institucionFilter, setInstitucionFilter] = useState<string>("todas")
  const [clasificacionFilter, setClasificacionFilter] = useState<string>("todas")
  const [respuestaFilter, setRespuestaFilter] = useState<string>("todas")

  useEffect(() => {
    loadCases()
    setInstituciones(getInstitucionesEducativas())
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchTerm, estadoFilter, institucionFilter, clasificacionFilter, respuestaFilter])

  const loadCases = () => {
    const data = getCasesSAC()
    setCases(data)
  }

  const filterCases = () => {
    let filtered = [...cases]

    // Filtrar por busqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.radicado.toLowerCase().includes(term) ||
          c.ciudadano.toLowerCase().includes(term) ||
          c.estudiante?.toLowerCase().includes(term)
      )
    }

    // Filtrar por estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter((c) => c.estado === estadoFilter)
    }

    // Filtrar por institucion educativa
    if (institucionFilter !== "todas") {
      filtered = filtered.filter((c) => c.institucionContraQuienSeDirige === institucionFilter)
    }

    // Filtrar por clasificacion
    if (clasificacionFilter !== "todas") {
      filtered = filtered.filter((c) => c.situacion === clasificacionFilter)
    }

    // Filtrar por respuesta al ciudadano
    if (respuestaFilter !== "todas") {
      if (respuestaFilter === "si") {
        filtered = filtered.filter((c) => c.respondido === true)
      } else if (respuestaFilter === "no") {
        filtered = filtered.filter((c) => !c.respondido)
      }
    }

    // Ordenar por fecha de creacion (mas recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredCases(filtered)
  }

  // Contar casos sin respuesta
  const casosSinRespuesta = cases.filter((c) => !c.respondido && c.estado === "EN SEGUIMIENTO").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Casos SAC</h1>
          <p className="text-slate-600">Sistema de Atencion al Ciudadano</p>
        </div>
        <div className="flex items-center gap-3">
          {casosSinRespuesta > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 py-1 px-3">
              <Bell className="h-3 w-3 mr-1" />
              {casosSinRespuesta} sin respuesta
            </Badge>
          )}
          <Link href="/sac/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Caso
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Barra de busqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por radicado, ciudadano o estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              
              {/* Filtro por Institucion */}
              <Select value={institucionFilter} onValueChange={setInstitucionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Institucion Educativa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las I.E.</SelectItem>
                  {instituciones.map((ie) => (
                    <SelectItem key={ie} value={ie}>{ie}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Clasificacion */}
              <Select value={clasificacionFilter} onValueChange={setClasificacionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Clasificacion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Tipo 1">Tipo 1</SelectItem>
                  <SelectItem value="Tipo 2">Tipo 2</SelectItem>
                  <SelectItem value="Tipo 3">Tipo 3</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Respuesta */}
              <Select value={respuestaFilter} onValueChange={setRespuestaFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Respuesta Ciudadano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="si">Con Respuesta</SelectItem>
                  <SelectItem value="no">Sin Respuesta</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Estado */}
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="EN SEGUIMIENTO">En Seguimiento</SelectItem>
                  <SelectItem value="TERMINADO">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            Listado de Casos ({filteredCases.length})
          </CardTitle>
          <CardDescription>
            Gestiona los casos registrados en el Sistema de Atencion al Ciudadano
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No hay casos</h3>
              <p className="text-slate-500 mt-1">
                {searchTerm || estadoFilter !== "todos" || institucionFilter !== "todas" || clasificacionFilter !== "todas" || respuestaFilter !== "todas"
                  ? "No se encontraron casos con los filtros aplicados"
                  : "Comienza registrando un nuevo caso"}
              </p>
              {!searchTerm && estadoFilter === "todos" && institucionFilter === "todas" && clasificacionFilter === "todas" && respuestaFilter === "todas" && (
                <Link href="/sac/nuevo" className="mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Caso
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Radicado</TableHead>
                    <TableHead>Ciudadano</TableHead>
                    <TableHead>I.E.</TableHead>
                    <TableHead>Fecha Radicacion</TableHead>
                    <TableHead>Clasificacion</TableHead>
                    <TableHead>Respuesta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caso) => (
                    <TableRow key={caso.id} className={!caso.respondido && caso.estado === "EN SEGUIMIENTO" ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{caso.radicado}</TableCell>
                      <TableCell>{caso.ciudadano}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={caso.institucionContraQuienSeDirige || "-"}>
                        {caso.institucionContraQuienSeDirige || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(caso.fechaRadicacion).toLocaleDateString("es-CO")}
                      </TableCell>
                      <TableCell>
                        {caso.situacion ? (
                          <Badge variant="outline" className={situacionBadgeStyles[caso.situacion]}>
                            {caso.situacion}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {caso.respondido ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            SI
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            NO
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={estadoBadgeStyles[caso.estado]}>
                          {caso.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/sac/${caso.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
