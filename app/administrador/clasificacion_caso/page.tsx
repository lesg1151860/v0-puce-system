"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, AlertTriangle, Tag } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function ClasificacionPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estado para el Modal de Eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemAEliminar, setItemAEliminar] = useState<number | null>(null)

  // Estado para el Formulario (Crear/Editar)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [itemEnEdicion, setItemEnEdicion] = useState<any | null>(null)
  const [descripcion, setDescripcion] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await api.getClasificaciones();
      const loadedItems = data?.results ? data.results : (Array.isArray(data) ? data : []);
      setItems(loadedItems);
    } catch (error) {
      toast.error("Error al cargar las clasificaciones.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchItems() 
  }, [])

  // --- Lógica de Eliminación ---
  const handleClickEliminar = (id: number) => {
    setItemAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (itemAEliminar === null) return
    try {
      await api.eliminarClasificacion(itemAEliminar)
      toast.success("Eliminado correctamente.")
      fetchItems() // Refresca la tabla
    } catch (error) {
      toast.error("Error al eliminar.")
    } finally {
      setIsDeleteModalOpen(false)
      setItemAEliminar(null)
    }
  }

  // --- Lógica de Guardar ---
  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return toast.error("La descripción es obligatoria.");

    setIsSaving(true);
    try {
      await api.guardarClasificacion(itemEnEdicion?.id || null, { descripcion });
      toast.success(itemEnEdicion ? "Actualizado correctamente." : "Creado correctamente.");
      fetchItems();
      setIsFormModalOpen(false);
      setDescripcion("");
    } catch (error) {
      toast.error("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const abrirModal = (item: any = null) => {
    setItemEnEdicion(item);
    setDescripcion(item ? (item.descripcion || "") : "");
    setIsFormModalOpen(true);
  }

  // Filtrado
  const itemsFiltrados = (Array.isArray(items) ? items : []).filter((i) =>
    (i.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Gestión de Clasificación</h1>
          <p className="text-slate-500 truncate">Administra las clasificaciones de los casos dentro del sistema</p>
        </div>
        <Button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Nueva Clasificación
        </Button>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4">
            <Search className="h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por descripción..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="max-w-sm" 
            />
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-center">Descripción</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-8">Cargando...</td></tr>
                ) : itemsFiltrados.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 text-slate-500">No hay registros.</td></tr>
                ) : (
                  itemsFiltrados.map((i) => (
                    <tr key={i.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center font-medium text-slate-900 text-base">{i.descripcion}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirModal(i)} className="hover:bg-blue-50">
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(i.id)} className="hover:bg-red-50">
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
            <form onSubmit={guardarItem}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{itemEnEdicion ? "Editar" : "Nueva"} Clasificación</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descripción</label>
                  <Input 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    autoFocus 
                    placeholder="Escribe la descripción"
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar Eliminación</h3>
                <p className="text-sm text-slate-500">¿Estás seguro de que deseas eliminar este registro?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion}>Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}