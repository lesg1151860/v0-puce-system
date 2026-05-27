"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react"

// Tipo para Institucion Educativa
interface InstitucionEducativa {
  id: number
  nombre: string
  sector: "PUBLICA" | "PRIVADA"
}

// Clave para localStorage
const STORAGE_KEY = "puce_instituciones_educativas"

// Funciones de almacenamiento local
function getInstituciones(): InstitucionEducativa[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function saveInstituciones(instituciones: InstitucionEducativa[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instituciones))
}

function getNextId(): number {
  const instituciones = getInstituciones()
  if (instituciones.length === 0) return 1
  return Math.max(...instituciones.map((i) => i.id)) + 1
}

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<InstitucionEducativa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Estados para modal de crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInstitucion, setEditingInstitucion] = useState<InstitucionEducativa | null>(null)
  const [formNombre, setFormNombre] = useState("")
  const [formSector, setFormSector] = useState<"PUBLICA" | "PRIVADA">("PUBLICA")
  const [formError, setFormError] = useState("")

  // Estado para confirmacion de eliminacion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [institucionToDelete, setInstitucionToDelete] = useState<InstitucionEducativa | null>(null)

  // Cargar instituciones al montar
  useEffect(() => {
    const data = getInstituciones()
    setInstituciones(data)
    setIsLoading(false)
  }, [])

  // Filtrar instituciones
  const filteredInstituciones = instituciones.filter((inst) =>
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingInstitucion(null)
    setFormNombre("")
    setFormSector("PUBLICA")
    setFormError("")
    setIsDialogOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (institucion: InstitucionEducativa) => {
    setEditingInstitucion(institucion)
    setFormNombre(institucion.nombre)
    setFormSector(institucion.sector)
    setFormError("")
    setIsDialogOpen(true)
  }

  // Guardar institucion (crear o editar)
  const handleSave = () => {
    // Validar nombre
    if (!formNombre.trim()) {
      setFormError("El nombre oficial es obligatorio")
      return
    }

    // Verificar nombre duplicado
    const nombreExiste = instituciones.some(
      (inst) =>
        inst.nombre.toLowerCase() === formNombre.trim().toLowerCase() &&
        inst.id !== editingInstitucion?.id
    )
    if (nombreExiste) {
      setFormError("Ya existe una institucion con este nombre")
      return
    }

    if (editingInstitucion) {
      // Editar existente
      const updated = instituciones.map((inst) =>
        inst.id === editingInstitucion.id
          ? { ...inst, nombre: formNombre.trim().toUpperCase(), sector: formSector }
          : inst
      )
      setInstituciones(updated)
      saveInstituciones(updated)
    } else {
      // Crear nueva
      const newInstitucion: InstitucionEducativa = {
        id: getNextId(),
        nombre: formNombre.trim().toUpperCase(),
        sector: formSector,
      }
      const updated = [...instituciones, newInstitucion]
      setInstituciones(updated)
      saveInstituciones(updated)
    }

    setIsDialogOpen(false)
    setFormNombre("")
    setFormSector("PUBLICA")
    setFormError("")
    setEditingInstitucion(null)
  }

  // Confirmar eliminacion
  const handleDeleteConfirm = (institucion: InstitucionEducativa) => {
    setInstitucionToDelete(institucion)
    setDeleteConfirmOpen(true)
  }

  // Eliminar institucion
  const handleDelete = () => {
    if (!institucionToDelete) return

    const updated = instituciones.filter((inst) => inst.id !== institucionToDelete.id)
    setInstituciones(updated)
    saveInstituciones(updated)

    setDeleteConfirmOpen(false)
    setInstitucionToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instituciones Educativas</h1>
          <p className="text-slate-600">
            Gestiona las instituciones educativas registradas en el sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Institucion
        </Button>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instituciones</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instituciones.length}</div>
            <p className="text-xs text-slate-500">Registradas en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sector Publico</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {instituciones.filter((i) => i.sector === "PUBLICA").length}
            </div>
            <p className="text-xs text-slate-500">Instituciones publicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sector Privado</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {instituciones.filter((i) => i.sector === "PRIVADA").length}
            </div>
            <p className="text-xs text-slate-500">Instituciones privadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de instituciones */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Instituciones</CardTitle>
          <CardDescription>
            Instituciones educativas disponibles para asignar en casos SAC y SIUCE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Buscador */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar institucion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredInstituciones.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchTerm
                  ? "No se encontraron instituciones con ese nombre"
                  : "No hay instituciones registradas"}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera institucion
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Nombre Oficial</TableHead>
                    <TableHead className="w-32">Sector</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstituciones.map((institucion) => (
                    <TableRow key={institucion.id}>
                      <TableCell className="font-mono text-slate-500">
                        {institucion.id}
                      </TableCell>
                      <TableCell className="font-medium">{institucion.nombre}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            institucion.sector === "PUBLICA"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {institucion.sector}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(institucion)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteConfirm(institucion)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
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

      {/* Modal Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInstitucion ? "Editar Institucion" : "Nueva Institucion Educativa"}
            </DialogTitle>
            <DialogDescription>
              {editingInstitucion
                ? "Modifica los datos de la institucion educativa"
                : "Ingresa los datos de la nueva institucion educativa"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Oficial *</Label>
              <Input
                id="nombre"
                placeholder="Ej: I.E. SIMON BOLIVAR"
                value={formNombre}
                onChange={(e) => {
                  setFormNombre(e.target.value)
                  setFormError("")
                }}
                className={formError ? "border-red-500" : ""}
              />
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <p className="text-xs text-slate-500">
                Nombre oficial de la institucion educativa
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
              {editingInstitucion ? "Guardar Cambios" : "Crear Institucion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmacion de eliminacion */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de eliminar la institucion{" "}
              <strong>{institucionToDelete?.nombre}</strong>? Esta accion no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
