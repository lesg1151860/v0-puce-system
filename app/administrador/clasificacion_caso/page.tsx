"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, Tag, CheckCircle2, XCircle, Power, PowerOff, X } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function ClasificacionPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  // Estado para el filtro
  const [filtroEstado, setFiltroEstado] = useState("todos") 
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  
  const [itemEnProceso, setItemEnProceso] = useState<any | null>(null)
  const [textoConfirmacion, setTextoConfirmacion] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await api.getClasificaciones();
      const loadedItems = data?.results ? data.results : (Array.isArray(data) ? data : []);
      setItems(loadedItems);
    } catch {
      toast.error("Error al cargar clasificaciones.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems() }, [])

  // --- Lógica de filtrado combinada ---
  const itemsFiltrados = items.filter(i => {
    const coincideBusqueda = (i.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    let coincideEstado = true;
    if (filtroEstado === "activo") coincideEstado = i.activo === true;
    if (filtroEstado === "inactivo") coincideEstado = i.activo === false;
    
    return coincideBusqueda && coincideEstado;
  });

  // --- Acciones ---
  const confirmarCambioEstado = async () => {
    try {
      await api.toggleActivoClasificacion(itemEnProceso.id, !itemEnProceso.activo)
      toast.success("Estado actualizado.")
      fetchItems()
    } catch { toast.error("Error al actualizar.") }
    finally { setIsStatusModalOpen(false) }
  }

  const ejecutarEliminacion = async () => {
    try {
      await api.eliminarClasificacion(itemEnProceso.id)
      toast.success("Eliminado correctamente.")
      fetchItems()
    } catch { toast.error("Error al eliminar.") }
    finally { setIsDeleteModalOpen(false) }
  }

  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return toast.error("La descripción es obligatoria.");
    setIsSaving(true);
    try {
      await api.guardarClasificacion(itemEnProceso?.id || null, { descripcion });
      toast.success("Guardado correctamente.");
      fetchItems();
      setIsFormModalOpen(false);
      setDescripcion("");
    } catch (error: any) { toast.error(error.message || "Error al guardar."); }
    finally { setIsSaving(false); }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") guardarItem(e as any); };

  const total = items.length;
  const activos = items.filter(i => i.activo).length;
  const inactivos = total - activos;

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Clasificación</h1>
          <p className="text-slate-500 truncate">Gestión de Clasificaciones registradas en el sistema.</p>
        </div>
        <Button onClick={() => { setItemEnProceso(null); setDescripcion(""); setIsFormModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva Clasificación
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Total</p><h3 className="text-2xl font-bold">{total}</h3></div><Tag className="h-8 w-8 text-blue-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Activas</p><h3 className="text-2xl font-bold">{activos}</h3></div><CheckCircle2 className="h-8 w-8 text-green-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Inactivas</p><h3 className="text-2xl font-bold">{inactivos}</h3></div><XCircle className="h-8 w-8 text-red-500 opacity-80"/></CardContent></Card>
      </div>

      <Card className="w-full shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por descripción..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <select 
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo Activas</option>
              <option value="inactivo">Solo Inactivas</option>
            </select>

            <Button variant="outline" onClick={() => { setSearchTerm(""); setFiltroEstado("todos"); }} className="h-10 text-slate-600 hover:bg-slate-100">
              <X className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-center">Descripción</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemsFiltrados.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-center font-medium">{i.descripcion}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${i.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>
                        {i.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(i); setDescripcion(i.descripcion); setIsFormModalOpen(true); }}><Edit2 className="h-4 w-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(i); setIsStatusModalOpen(true); }}>
                           {i.activo ? <PowerOff className="h-4 w-4 text-amber-600"/> : <Power className="h-4 w-4 text-green-600"/>}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(i); setTextoConfirmacion(""); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4 text-red-600"/></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- MODALES --- */}
      {/* Formulario */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={guardarItem} className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{itemEnProceso ? "Editar" : "Nueva"} Clasificación</h3>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Estado */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold">Confirmar cambio</h3>
            <p className="my-4">¿Cambiar estado de {itemEnProceso.descripcion}?</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
              <Button onClick={confirmarCambioEstado}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Eliminar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold">Eliminar {itemEnProceso.descripcion}</h3>
            <p className="text-sm text-slate-500 mb-4">Escribe la descripción para confirmar:</p>
            <Input value={textoConfirmacion} onChange={(e) => setTextoConfirmacion(e.target.value)} />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" disabled={textoConfirmacion !== itemEnProceso.descripcion} onClick={ejecutarEliminacion}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}