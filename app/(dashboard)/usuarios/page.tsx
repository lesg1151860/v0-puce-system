"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit2, Trash2, RotateCcw, Search, Users, Shield, UserCheck, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { getAllSystemUsers, createSystemUser, updateSystemUser, deactivateSystemUser, reactivateSystemUser } from "@/lib/user-actions"
import { getCurrentSystemUser } from "@/lib/auth-actions"

interface SystemUser {
  id: string
  nombres: string
  apellidos: string
  rol: "ADMINISTRADOR" | "LIDER"
  correo_electronico: string
  nombre_usuario: string
  activo: boolean
  created_at: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([])
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("todos")
  const [filterActivo, setFilterActivo] = useState("todos")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulario nuevo usuario
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    rol: "LIDER" as "ADMINISTRADOR" | "LIDER",
    correo_electronico: "",
    nombre_usuario: "",
    password: "",
    confirmPassword: "",
  })

  // Formulario edicion
  const [editFormData, setEditFormData] = useState({
    rol: "LIDER" as "ADMINISTRADOR" | "LIDER",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterRol, filterActivo])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersResult, currentUserResult] = await Promise.all([
        getAllSystemUsers(),
        getCurrentSystemUser()
      ])

      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data as SystemUser[])
      }

      if (currentUserResult) {
        setCurrentUser(currentUserResult as SystemUser)
        // Verificar que sea administrador
        if (currentUserResult.rol !== "ADMINISTRADOR") {
          router.push("/")
        }
      }
    } catch (err) {
      setError("Error al cargar los usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.nombres.toLowerCase().includes(term) ||
          u.apellidos.toLowerCase().includes(term) ||
          u.correo_electronico.toLowerCase().includes(term) ||
          u.nombre_usuario.toLowerCase().includes(term)
      )
    }

    if (filterRol !== "todos") {
      filtered = filtered.filter((u) => u.rol === filterRol)
    }

    if (filterActivo !== "todos") {
      filtered = filtered.filter((u) => u.activo === (filterActivo === "activo"))
    }

    setFilteredUsers(filtered)
  }

  // RF06: Crear usuario
  const handleCreateUser = async () => {
    setError("")
    setIsSubmitting(true)

    // Validaciones
    if (!formData.nombres || !formData.apellidos || !formData.correo_electronico || 
        !formData.nombre_usuario || !formData.password) {
      setError("Todos los campos son obligatorios")
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden")
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      setIsSubmitting(false)
      return
    }

    // RF09: Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.correo_electronico)) {
      setError("El formato del correo electronico no es valido")
      setIsSubmitting(false)
      return
    }

    const result = await createSystemUser({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      rol: formData.rol,
      correo_electronico: formData.correo_electronico,
      nombre_usuario: formData.nombre_usuario,
      password: formData.password,
    })

    if (result.success) {
      setSuccess("Usuario creado exitosamente")
      setShowCreateModal(false)
      resetForm()
      loadData()
    } else {
      setError(result.error || "Error al crear el usuario")
    }

    setIsSubmitting(false)
  }

  // RF07: Editar usuario (solo rol y contrasena)
  const handleEditUser = async () => {
    if (!selectedUser) return
    setError("")
    setIsSubmitting(true)

    // Validar contrasenas si se proporcionan
    if (editFormData.password) {
      if (editFormData.password !== editFormData.confirmPassword) {
        setError("Las contrasenas no coinciden")
        setIsSubmitting(false)
        return
      }
      if (editFormData.password.length < 6) {
        setError("La contrasena debe tener al menos 6 caracteres")
        setIsSubmitting(false)
        return
      }
    }

    const result = await updateSystemUser(selectedUser.id, {
      rol: editFormData.rol,
      password: editFormData.password || undefined,
    })

    if (result.success) {
      setSuccess("Usuario actualizado exitosamente")
      setShowEditModal(false)
      loadData()
    } else {
      setError(result.error || "Error al actualizar el usuario")
    }

    setIsSubmitting(false)
  }

  // RF08: Eliminacion logica
  const handleDeactivateUser = async () => {
    if (!selectedUser) return
    setError("")
    setIsSubmitting(true)

    const result = await deactivateSystemUser(selectedUser.id)

    if (result.success) {
      setSuccess("Usuario desactivado exitosamente")
      setShowDeleteModal(false)
      loadData()
    } else {
      setError(result.error || "Error al desactivar el usuario")
    }

    setIsSubmitting(false)
  }

  const handleReactivateUser = async (userId: string) => {
    setError("")
    const result = await reactivateSystemUser(userId)

    if (result.success) {
      setSuccess("Usuario reactivado exitosamente")
      loadData()
    } else {
      setError(result.error || "Error al reactivar el usuario")
    }
  }

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      rol: "LIDER",
      correo_electronico: "",
      nombre_usuario: "",
      password: "",
      confirmPassword: "",
    })
  }

  const openEditModal = (user: SystemUser) => {
    setSelectedUser(user)
    setEditFormData({
      rol: user.rol,
      password: "",
      confirmPassword: "",
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (user: SystemUser) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion de Usuarios</h1>
          <p className="text-slate-500">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.rol === "ADMINISTRADOR").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.activo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, correo o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="LIDER">Lider</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterActivo} onValueChange={setFilterActivo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>Lista de todos los usuarios registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={!user.activo ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{user.nombre_usuario}</TableCell>
                      <TableCell>{user.nombres} {user.apellidos}</TableCell>
                      <TableCell>{user.correo_electronico}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.rol === "ADMINISTRADOR"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }
                        >
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.activo
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {user.activo ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-700"
                              title="Desactivar"
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivateUser(user.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Reactivar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear Usuario - RF06 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete la informacion para registrar un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                  placeholder="JUAN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.toUpperCase() })}
                  placeholder="PEREZ"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData({ ...formData, rol: value as "ADMINISTRADOR" | "LIDER" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="LIDER">Lider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electronico</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value.toLowerCase() })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario">Nombre de Usuario</Label>
              <Input
                id="usuario"
                value={formData.nombre_usuario}
                onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value.toUpperCase() })}
                placeholder="JPEREZ"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="******"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="******"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuario - RF07 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Solo puede modificar el rol y la contrasena del usuario {selectedUser?.nombre_usuario}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input value={selectedUser?.nombre_usuario || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRol">Rol</Label>
              <Select
                value={editFormData.rol}
                onValueChange={(value) => setEditFormData({ ...editFormData, rol: value as "ADMINISTRADOR" | "LIDER" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="LIDER">Lider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editPassword">Nueva Contrasena</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Dejar vacio para no cambiar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editConfirmPassword">Confirmar</Label>
                <Input
                  id="editConfirmPassword"
                  type="password"
                  value={editFormData.confirmPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                  placeholder="******"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminacion - RF08 */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desactivacion</DialogTitle>
            <DialogDescription>
              Esta seguro de que desea desactivar al usuario <strong>{selectedUser?.nombre_usuario}</strong>?
              El usuario no podra acceder al sistema pero sus datos se conservaran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Desactivar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
