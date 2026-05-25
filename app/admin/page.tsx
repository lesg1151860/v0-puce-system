"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  Pencil,
  Trash2,
  Search,
} from "lucide-react"

// Tipo para usuarios del sistema
interface UsuarioSistema {
  id: string
  nombre: string
  email: string
  rol: "ADMINISTRADOR" | "LIDER"
  estado: "ACTIVO" | "INACTIVO"
  fechaCreacion: string
}

// Datos de ejemplo
const usuariosIniciales: UsuarioSistema[] = [
  {
    id: "1",
    nombre: "Administrador PUCE",
    email: "admin@puce.edu.co",
    rol: "ADMINISTRADOR",
    estado: "ACTIVO",
    fechaCreacion: "2024-01-01",
  },
  {
    id: "2",
    nombre: "Lider Convivencia",
    email: "lider@puce.edu.co",
    rol: "LIDER",
    estado: "ACTIVO",
    fechaCreacion: "2024-01-15",
  },
]

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(usuariosIniciales)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioSistema | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "LIDER" as "ADMINISTRADOR" | "LIDER",
    password: "",
  })

  // Estadísticas
  const stats = {
    totalUsuarios: usuarios.length,
    administradores: usuarios.filter((u) => u.rol === "ADMINISTRADOR").length,
    lideres: usuarios.filter((u) => u.rol === "LIDER").length,
    activos: usuarios.filter((u) => u.estado === "ACTIVO").length,
  }

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Crear usuario
  const handleCreate = () => {
    const newUser: UsuarioSistema = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      estado: "ACTIVO",
      fechaCreacion: new Date().toISOString().split("T")[0],
    }
    setUsuarios([...usuarios, newUser])
    setIsCreateDialogOpen(false)
    setFormData({ nombre: "", email: "", rol: "LIDER", password: "" })
  }

  // Editar usuario
  const handleEdit = () => {
    if (!selectedUser) return
    setUsuarios(
      usuarios.map((u) =>
        u.id === selectedUser.id
          ? { ...u, nombre: formData.nombre, email: formData.email, rol: formData.rol }
          : u
      )
    )
    setIsEditDialogOpen(false)
    setSelectedUser(null)
  }

  // Eliminar usuario
  const handleDelete = () => {
    if (!selectedUser) return
    setUsuarios(usuarios.filter((u) => u.id !== selectedUser.id))
    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  // Toggle estado
  const toggleEstado = (id: string) => {
    setUsuarios(
      usuarios.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO" }
          : u
      )
    )
  }

  // Abrir diálogo de edición
  const openEditDialog = (user: UsuarioSistema) => {
    setSelectedUser(user)
    setFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administracion</h1>
        <p className="text-slate-600">Gestiona usuarios y configuracion del sistema PUCE</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
            <p className="text-xs text-slate-500">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.administradores}</div>
            <p className="text-xs text-slate-500">Con acceso total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lideres</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.lideres}</div>
            <p className="text-xs text-slate-500">Gestion de casos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            <p className="text-xs text-slate-500">Usuarios habilitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestion de Usuarios</CardTitle>
              <CardDescription>Administra las cuentas de acceso al sistema</CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Buscador */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creacion</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.rol === "ADMINISTRADOR" ? "default" : "secondary"}
                        className={
                          user.rol === "ADMINISTRADOR"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.estado === "ACTIVO" ? "default" : "secondary"}
                        className={
                          user.estado === "ACTIVO"
                            ? "bg-green-100 text-green-700 cursor-pointer"
                            : "bg-red-100 text-red-700 cursor-pointer"
                        }
                        onClick={() => toggleEstado(user.id)}
                      >
                        {user.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.fechaCreacion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Crear Usuario */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Perez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electronico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@puce.edu.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: "ADMINISTRADOR" | "LIDER") =>
                  setFormData({ ...formData, rol: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIDER">Lider</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!formData.nombre || !formData.email || !formData.password}
            >
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electronico</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: "ADMINISTRADOR" | "LIDER") =>
                  setFormData({ ...formData, rol: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIDER">Lider</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-orange-600 hover:bg-orange-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminacion</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de que deseas eliminar al usuario{" "}
              <strong>{selectedUser?.nombre}</strong>? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
