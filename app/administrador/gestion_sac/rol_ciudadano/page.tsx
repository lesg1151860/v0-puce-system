"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, AlertTriangle, Users } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function RolesCiudadanoPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [rolAEliminar, setRolAEliminar] = useState<number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [rolEnEdicion, setRolEnEdicion] = useState<any | null>(null)
  const [descripcion, setDescripcion] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchRoles = async () => {
    try {
      const data: any = await api.getRolesCiudadano();
      
      const items = data.results ? data.results : (Array.isArray(data) ? data : []);
      
      setRoles(items);
    } catch (error) {
      toast.error("Error al cargar los roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleClickEliminar = (id: number) => {
    setRolAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (rolAEliminar === null) return
    try {
      await api.eliminarRolCiudadano(rolAEliminar)
      fetchRoles() 
      toast.success("Rol eliminado exitosamente.")
    } catch (error) {
      toast.error("Error al eliminar el rol.")
    } finally {
      setIsDeleteModalOpen(false)
      setRolAEliminar(null)
    }
  }

  const abrirModalFormulario = (rol: any = null) => {
    setRolEnEdicion(rol);
    setDescripcion(rol ? (rol.nombre_rol || "") : ""); 
    setIsFormModalOpen(true);
  }

  const guardarRol = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const payload = { nombre_rol: descripcion }; 
  
  try {
    if (rolEnEdicion) {
      await api.editarRolCiudadano(rolEnEdicion.id, payload);
    } else {
      await api.crearRolCiudadano(payload);
    }
    // ... resto de la lógica ...
  } catch (error) {
    console.error("Error:", error);
  }
  };

  const rolesFiltrados = (Array.isArray(roles) ? roles : []).filter((r) =>
    (r.nombre_rol || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Gestión Rol del Ciudadano</h1>
          <p className="text-slate-500 truncate">Administra los roles disponibles para el módulo SAC</p>
        </div>
        <Button onClick={() => abrirModalFormulario()} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
        </Button>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por descripción..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium w-full sm:w-auto shrink-0">
              <Users className="h-5 w-5 text-blue-500" />
              Total Registros: {roles.length}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-center">Descripción del Rol</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-8">Cargando roles...</td></tr>
                ) : rolesFiltrados.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 text-slate-500">No hay registros.</td></tr>
                ) : (
                  rolesFiltrados.map((rol) => (
                    <tr key={rol.id} className="bg-white hover:bg-slate-50 transition-colors">
                      {/* Aquí aplicamos el "blindaje" con el operador || */}
                      <td className="px-6 py-4 text-center font-medium text-slate-900 text-base">
                        {rol.descripcion || rol.nombre_rol || "Sin nombre"}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirModalFormulario(rol)} className="hover:bg-blue-50">
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(rol.id)} className="hover:bg-red-50">
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

      {/* Modal Formulario */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <form onSubmit={guardarRol}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{rolEnEdicion ? "Editar Rol" : "Nuevo Rol Ciudadano"}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descripción del Rol</label>
                  <Input 
                    type="text"
                    placeholder="Ej. Estudiante, Padre de Familia..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                  {isSaving ? "Guardando..." : "Guardar Rol"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 sm:mt-0">Confirmar Eliminación</h3>
                  <p className="text-sm text-slate-500 mt-2">¿Estás seguro de que deseas eliminar este rol?</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion} className="w-full sm:w-auto">Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}