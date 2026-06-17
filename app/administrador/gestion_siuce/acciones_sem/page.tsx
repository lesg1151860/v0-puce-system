"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Power, PowerOff, X, FileCheck, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function AccionesSEMPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  
  // Estado para el ordenamiento multi-columna
  const [sortConfig, setSortConfig] = useState<{ key: 'nombre' | 'porcentaje', direction: 'asc' | 'desc' } | null>(null)
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [itemEnProceso, setItemEnProceso] = useState<any | null>(null)
  const [textoConfirmacion, setTextoConfirmacion] = useState("")
  const [nombreAccion, setNombreAccion] = useState("")
  const [porcentaje, setPorcentaje] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await api.getAccionesSEM();
      const loadedItems = data?.results ? data.results : (Array.isArray(data) ? data : []);
      setItems(loadedItems);
    } catch (error) {
      toast.error("Error al cargar acciones SEM.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems() }, [])

  // Manejador del ordenamiento interactivo
  const handleRequestSort = (key: 'nombre' | 'porcentaje') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  // --- Filtrado ---
  const itemsFiltrados = items.filter(i => {
    const coincideBusqueda = (i.nom_accion_sem || "").toLowerCase().includes(searchTerm.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || (filtroEstado === "activo" ? i.activo : !i.activo);
    return coincideBusqueda && coincideEstado;
  });

  // --- Ordenamiento ---
  const itemsOrdenados = [...itemsFiltrados].sort((a, b) => {
    if (!sortConfig) return 0;

    if (sortConfig.key === 'nombre') {
      const nameA = (a.nom_accion_sem || "").toLowerCase();
      const nameB = (b.nom_accion_sem || "").toLowerCase();
      if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
    }

    if (sortConfig.key === 'porcentaje') {
      const percentA = Number(a.porcentaje) || 0;
      const percentB = Number(b.porcentaje) || 0;
      if (percentA < percentB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (percentA > percentB) return sortConfig.direction === 'asc' ? 1 : -1;
    }

    return 0;
  });

  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPorcentaje = Number(porcentaje);
    
    if (!nombreAccion.trim()) return toast.error("El nombre es obligatorio.");
    if (isNaN(numPorcentaje) || numPorcentaje < 0 || numPorcentaje > 100) {
      return toast.error("El porcentaje debe ser un número entre 0 y 100.");
    }
    
    setIsSaving(true);
    try {
      const data = { nom_accion_sem: nombreAccion, porcentaje: numPorcentaje };
      if (itemEnProceso?.id) await api.editarAccionesSEM(itemEnProceso.id, data);
      else await api.crearAccionesSEM(data);
      
      toast.success("Guardado correctamente.");
      fetchItems();
      setIsFormModalOpen(false);
      setNombreAccion("");
      setPorcentaje("");
    } catch (error: any) { 
      toast.error(error.message || "Error al guardar."); 
    } finally { 
      setIsSaving(false); 
    }
  }

  const confirmarCambioEstado = async () => {
    try {
      const datosActualizados = {
        nom_accion_sem: itemEnProceso.nom_accion_sem,
        porcentaje: itemEnProceso.porcentaje,
        activo: !itemEnProceso.activo
      };
      await api.toggleActivoAccionesSEM(itemEnProceso.id, datosActualizados);
      toast.success("Estado actualizado.");
      fetchItems();
    } catch { toast.error("Error al actualizar."); }
    finally { setIsStatusModalOpen(false); }
  }

  const ejecutarEliminacion = async () => {
    try {
      await api.eliminarAccionesSEM(itemEnProceso.id);
      toast.success("Eliminado correctamente.");
      fetchItems();
    } catch { toast.error("Error al eliminar."); }
    finally { setIsDeleteModalOpen(false); }
  }

  const total = items.length;
  const activos = items.filter(i => i.activo).length;

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Acciones S.E.M.</h1>
          <p className="text-slate-500">Gestión de Acciones por parte de la Secretaría de Educación Municipal registradas en el sistema.</p>
        </div>
        <Button onClick={() => { setItemEnProceso(null); setNombreAccion(""); setPorcentaje(""); setIsFormModalOpen(true); }} className="bg-blue-600 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva Acción
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Total</p><h3 className="text-2xl font-bold">{total}</h3></div><FileCheck className="h-8 w-8 text-blue-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Activas</p><h3 className="text-2xl font-bold">{activos}</h3></div><CheckCircle2 className="h-8 w-8 text-green-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Inactivas</p><h3 className="text-2xl font-bold">{total - activos}</h3></div><XCircle className="h-8 w-8 text-red-500 opacity-80"/></CardContent></Card>
      </div>

      <Card className="w-full shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por acción..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFiltroEstado("todos"); setSortConfig(null); }} className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <X className="h-4 w-4 mr-2"/> Limpiar
            </Button>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => handleRequestSort('nombre')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Acción
                      {sortConfig?.key === 'nombre' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => handleRequestSort('porcentaje')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Porcentaje
                      {sortConfig?.key === 'porcentaje' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemsOrdenados.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-center font-medium">{i.nom_accion_sem}</td>
                    <td className="px-6 py-4 text-center">{i.porcentaje}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${i.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>
                        {i.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(i); setNombreAccion(i.nom_accion_sem); setPorcentaje(i.porcentaje); setIsFormModalOpen(true); }}><Edit2 className="h-4 w-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(i); setIsStatusModalOpen(true); }}>{i.activo ? <PowerOff className="h-4 w-4 text-amber-600"/> : <Power className="h-4 w-4 text-green-600"/>}</Button>
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
            <h3 className="text-lg font-bold mb-4">{itemEnProceso ? "Editar" : "Nueva"} Acción SEM</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nombre de la acción</label>
                <Input value={nombreAccion} onChange={(e) => setNombreAccion(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Porcentaje</label>
                <Input type="number" min="0" max="100" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>Guardar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Estado */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg text-slate-900">Confirmar cambio</h3>
            <p className="my-4 text-sm text-slate-500">¿Cambiar estado de "{itemEnProceso.nom_accion_sem}"?</p>
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
            <h3 className="text-lg font-bold text-slate-900">Eliminar "{itemEnProceso.nom_accion_sem}"</h3>
            <p className="text-sm text-slate-500 mb-4">Escribe el nombre para confirmar:</p>
            <Input value={textoConfirmacion} onChange={(e) => setTextoConfirmacion(e.target.value)} />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" disabled={textoConfirmacion !== itemEnProceso.nom_accion_sem} onClick={ejecutarEliminacion}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}