"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Filter,
  X,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { getCasesSIUCE, deleteCaseSIUCE, getInstitucionesEducativas } from "@/lib/storage"
import type { CasoSIUCE, EstadoSIUCE } from "@/lib/types"

const estadoBadgeStyles: Record<EstadoSIUCE, string> = {
  "PENDIENTE": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "EN PROGRESO": "bg-blue-100 text-blue-800 border-blue-200",
  "TERMINADO": "bg-green-100 text-green-800 border-green-200",
}

const clasificacionBadgeStyles: Record<string, string> = {
  "Tipo 1": "bg-slate-100 text-slate-800 border-slate-200",
  "Tipo 2": "bg-orange-100 text-orange-800 border-orange-200",
  "Tipo 3": "bg-red-100 text-red-800 border-red-200",
}

export default function SIUCEListPage() {
  const [cases, setCases] = useState<CasoSIUCE[]>([])
  const [filteredCases, setFilteredCases] = useState<CasoSIUCE[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [institucionFilter, setInstitucionFilter] = useState<string>("todas")
  const [clasificacionFilter, setClasificacionFilter] = useState<string>("todas")

  useEffect(() => {
    loadCases()
    setInstituciones(getInstitucionesEducativas())
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchTerm, estadoFilter, institucionFilter, clasificacionFilter])

  const loadCases = () => {
    const data = getCasesSIUCE()
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
          c.victima.toLowerCase().includes(term) ||
          c.ie.toLowerCase().includes(term) ||
          c.nombreAgresor.toLowerCase().includes(term)
      )
    }

    // Filtrar por estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter((c) => c.estado === estadoFilter)
    }

    // Filtrar por institucion educativa
    if (institucionFilter !== "todas") {
      filtered = filtered.filter((c) => c.ie === institucionFilter)
    }

    // Filtrar por clasificacion
    if (clasificacionFilter !== "todas") {
      filtered = filtered.filter((c) => c.clasificacion === clasificacionFilter)
    }

    // Ordenar por fecha de creacion (mas recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredCases(filtered)
  }

  const handleDelete = (id: string) => {
    deleteCaseSIUCE(id)
    loadCases()
  }

  // Verificar si hay filtros activos
  const hayFiltrosActivos = searchTerm !== "" || estadoFilter !== "todos" || institucionFilter !== "todas" || clasificacionFilter !== "todas"

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm("")
    setEstadoFilter("todos")
    setInstitucionFilter("todas")
    setClasificacionFilter("todas")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Casos SIUCE</h1>
          <p className="text-slate-600">Sistema de Informacion Unificado de Convivencia Escolar</p>
        </div>
        <Link href="/siuce/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Barra de busqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por radicado, victima, I.E. o agresor..."
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

              {/* Filtro por Estado */}
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN PROGRESO">En Progreso</SelectItem>
                  <SelectItem value="TERMINADO">Terminado</SelectItem>
                </SelectContent>
              </Select>

              {/* Boton Limpiar Filtros */}
              {hayFiltrosActivos && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-slate-500" />
            Listado de Casos ({filteredCases.length})
          </CardTitle>
          <CardDescription>
            Gestiona los casos registrados en el Sistema de Informacion Unificado de Convivencia Escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No hay casos</h3>
              <p className="text-slate-500 mt-1">
                {searchTerm || estadoFilter !== "todos" || institucionFilter !== "todas" || clasificacionFilter !== "todas"
                  ? "No se encontraron casos con los filtros aplicados"
                  : "Comienza registrando un nuevo caso"}
              </p>
              {!searchTerm && estadoFilter === "todos" && institucionFilter === "todas" && clasificacionFilter === "todas" && (
                <Link href="/siuce/nuevo" className="mt-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">
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
                    <TableHead>Victima</TableHead>
                    <TableHead>I.E.</TableHead>
                    <TableHead>Clasificacion</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caso) => (
                    <TableRow key={caso.id}>
                      <TableCell className="font-medium">{caso.radicado}</TableCell>
                      <TableCell>{caso.victima}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={caso.ie}>
                        {caso.ie}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={clasificacionBadgeStyles[caso.clasificacion]}>
                          {caso.clasificacion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={caso.avanceGeneral} className="h-2 flex-1" />
                          <span className="text-xs text-slate-500 w-8">{caso.avanceGeneral}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={estadoBadgeStyles[caso.estado]}>
                          {caso.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/siuce/${caso.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar este caso?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accion no se puede deshacer. El caso {caso.radicado} sera eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(caso.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
