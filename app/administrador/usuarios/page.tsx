"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Shield, UserCheck, Users, Edit2, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsuarios = async () => {
    try {
      const data = await api.getUsuarios()
      setUsuarios(data)
    } catch (error) {
      toast.error("Error al cargar usuarios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.eliminarUsuario(id)
        fetchUsuarios() 
        toast.success("Usuario eliminado exitosamente.")
      } catch (error) {
        toast.error("Error al eliminar el usuario")
      }
    }
  }

  const totalUsuarios = usuarios.length
  const totalAdmin = usuarios.filter((u) => u.is_staff).length
  const totalLider = totalUsuarios - totalAdmin

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administra los accesos al sistema</p>
        </div>
        <Link href="/administrador/usuarios/nuevo_usuario">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Total Usuarios</p><h3 className="text-3xl font-bold">{totalUsuarios}</h3></div>
          <Users className="h-8 w-8 text-orange-500" />
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Usuarios Admin</p><h3 className="text-3xl font-bold">{totalAdmin}</h3></div>
          <Shield className="h-8 w-8 text-blue-500" />
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Usuarios Líder</p><h3 className="text-3xl font-bold">{totalLider}</h3></div>
          <UserCheck className="h-8 w-8 text-green-500" />
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nombre, usuario o email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">Nombre Completo</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No hay usuarios.</td></tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{usuario.first_name} {usuario.last_name}</td>
                      <td className="px-6 py-4">{usuario.username}</td>
                      <td className="px-6 py-4">{usuario.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.is_staff ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {usuario.is_staff ? "Administrador" : "Líder"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/administrador/usuarios/editar_usuario/${usuario.id}`}>
                            <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4 text-blue-600" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(usuario.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}