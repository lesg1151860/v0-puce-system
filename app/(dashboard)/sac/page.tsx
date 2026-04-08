"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Filter,
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

import { getCasesSAC, deleteCaseSAC } from "@/lib/storage"
import type { CasoSAC, EstadoSAC } from "@/lib/types"

const estadoBadgeStyles: Record<EstadoSAC, string> = {
  "EN SEGUIMIENTO": "bg-blue-100 text-blue-800 border-blue-200",
  "TERMINADO": "bg-green-100 text-green-800 border-green-200",
}

export default function SACListPage() {
  const [cases, setCases] = useState<CasoSAC[]>([])
  const [filteredCases, setFilteredCases] = useState<CasoSAC[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  useEffect(() => {
    loadCases()
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchTerm, estadoFilter])

  const loadCases = () => {
    const data = getCasesSAC()
    setCases(data)
  }

  const filterCases = () => {
    let filtered = [...cases]

    // Filtrar por búsqueda
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

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredCases(filtered)
  }

  const handleDelete = (id: string) => {
    deleteCaseSAC(id)
    loadCases()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Casos SAC</h1>
          <p className="text-slate-600">Sistema de Atención al Ciudadano</p>
        </div>
        <Link href="/sac/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por radicado, ciudadano o estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
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
            Gestiona los casos registrados en el Sistema de Atención al Ciudadano
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No hay casos</h3>
              <p className="text-slate-500 mt-1">
                {searchTerm || estadoFilter !== "todos"
                  ? "No se encontraron casos con los filtros aplicados"
                  : "Comienza registrando un nuevo caso"}
              </p>
              {!searchTerm && estadoFilter === "todos" && (
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
                    <TableHead>Fecha Radicación</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caso) => (
                    <TableRow key={caso.id}>
                      <TableCell className="font-medium">{caso.radicado}</TableCell>
                      <TableCell>{caso.ciudadano}</TableCell>
                      <TableCell>
                        {new Date(caso.fechaRadicacion).toLocaleDateString("es-CO")}
                      </TableCell>
                      <TableCell>{caso.rol}</TableCell>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este caso?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El caso {caso.radicado} será eliminado permanentemente.
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
