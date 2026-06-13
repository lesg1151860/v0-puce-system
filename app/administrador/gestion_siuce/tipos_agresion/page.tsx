"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, AlertTriangle, ShieldAlert } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function TipoAgresionPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemAEliminar, setItemAEliminar] = useState<number | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [itemEnEdicion, setItemEnEdicion] = useState<any | null>(null)
  const [tipoAgresion, setTipoAgresion] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await api.getTiposAgresion();
      const loadedItems = data?.results ? data.results : (Array.isArray(data) ? data : []);
      setItems(loadedItems);
    } catch (error) {
      toast.error("Error al cargar los tipos de agresión.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchItems() 
  }, [])

  const handleClickEliminar = (id: number) => {
    setItemAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (itemAEliminar === null) return
    try {
      await api.eliminarTipoAgresion(itemAEliminar)
      toast.success("Eliminado correctamente.")
      fetchItems() 
    } catch (error) {
      toast.error("No se puede eliminar porque está asociado a un caso.")
    } finally {
      setIsDeleteModalOpen(false)
      setItemAEliminar(null)
    }
  }

  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoAgresion.trim()) return toast.error("El nombre del tipo de agresión es obligatorio.");

    setIsSaving(true);
    try {
      if (itemEnEdicion?.id) {
        await api.editarTipoAgresion(itemEnEdicion.id, { tipo_agresion: tipoAgresion });
      } else {
        await api.crearTipoAgresion({ tipo_agresion: tipoAgresion });
      }
      toast.success(itemEnEdicion ? "Actualizado correctamente." : "Creado correctamente.");
      fetchItems();
      setIsFormModalOpen(false);
      setTipoAgresion("");
    } catch (error) {
      toast.error("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const abrirModal = (item: any = null) => {
    setItemEnEdicion(item);
    setTipoAgresion(item ? (item.tipo_agresion || "") : "");
    setIsFormModalOpen(true);
  }

  const itemsFiltrados = (Array.isArray(items) ? items : []).filter((i) =>
    (i.tipo_agresion || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full text-slate-800">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Gestión de Tipos de Agresión</h1>
          <p className="text-slate-500 truncate">Administra los tipos de agresión registrados en los casos del SIUCE</p>
        </div>
        <Button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shrink-0 transition">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tipo de Agresión
        </Button>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm rounded-xl bg-white">
        <CardContent className="p-0">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm flex items-center">
              <Search className="h-4 w-4 text-slate-400 absolute left-3" />
              <Input 
                placeholder="Buscar tipo de agresión..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 w-full focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-center text-slate-500 text-sm font-medium gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Total Registros:</span> {itemsFiltrados.length}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left border-collapse">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  {/* Título Centralizado */}
                  <th className="px-6 py-4 text-center">Tipo de Agresión</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-8 text-slate-500">Cargando...</td></tr>
                ) : itemsFiltrados.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 text-slate-500">No hay registros.</td></tr>
                ) : (
                  itemsFiltrados.map((i) => (
                    <tr key={i.id} className="bg-white hover:bg-slate-50 transition-colors">
                      {/* Información Centralizada */}
                      <td className="px-6 py-4 text-center font-medium text-slate-900 text-base">{i.tipo_agresion}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirModal(i)} className="hover:bg-blue-50 transition">
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(i.id)} className="hover:bg-red-50 transition">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={guardarItem}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{itemEnEdicion ? "Editar" : "Nuevo"} Tipo de Agresión</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre del Tipo de Agresión</label>
                  <Input 
                    value={tipoAgresion} 
                    onChange={(e) => setTipoAgresion(e.target.value)} 
                    autoFocus 
                    placeholder="Ej. Verbal, Física, Digital..."
                    className="focus:ring-blue-500"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
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
              <Button variant="destructive" onClick={confirmarEliminacion} className="bg-red-600 hover:bg-red-700 transition">Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}