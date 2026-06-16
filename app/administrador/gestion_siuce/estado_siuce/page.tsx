"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Power, PowerOff, X, Workflow, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function EstadoSIUCEPage() {
  const [estados, setEstados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  // Estado para el ordenamiento
  const [ordenDescripcion, setOrdenDescripcion] = useState<'asc' | 'desc' | null>(null)
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [itemEnProceso, setItemEnProceso] = useState<any | null>(null)
  const [textoConfirmacion, setTextoConfirmacion] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchEstados = async () => {
    setLoading(true);
    try {
      const data: any = await api.getEstadosSIUCE();
      const loadedItems = data?.results ? data.results : (Array.isArray(data) ? data : []);
      setEstados(loadedItems);
    } catch {
      toast.error("Error al cargar estados SIUCE.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEstados() }, [])

  // --- Filtrado ---
  const estadosFiltrados = estados.filter(e => {
    const coincideBusqueda = (e.estado_siuce || "").toLowerCase().includes(searchTerm.toLowerCase());
    let coincideEstado = true;
    if (filtroEstado === "activo") coincideEstado = e.activo === true;
    if (filtroEstado === "inactivo") coincideEstado = e.activo === false;
    return coincideBusqueda && coincideEstado;
  });

  // --- Ordenamiento ---
  const estadosOrdenados = [...estadosFiltrados].sort((a, b) => {
    if (!ordenDescripcion) return 0;
    
    const descA = (a.estado_siuce || "").toLowerCase();
    const descB = (b.estado_siuce || "").toLowerCase();
    
    if (descA < descB) return ordenDescripcion === 'asc' ? -1 : 1;
    if (descA > descB) return ordenDescripcion === 'asc' ? 1 : -1;
    return 0;
  });

  const confirmarCambioEstado = async () => {
    try {
      await api.toggleActivoEstadoSIUCE(itemEnProceso.id, !itemEnProceso.activo)
      toast.success("Estado actualizado.")
      fetchEstados()
    } catch { toast.error("Error al actualizar el estado SIUCE.") }
    finally { setIsStatusModalOpen(false) }
  }

  const ejecutarEliminacion = async () => {
    try {
      await api.eliminarEstadoSIUCE(itemEnProceso.id)
      toast.success("Eliminado correctamente.")
      fetchEstados()
    } catch { toast.error("Error al eliminar el estado SIUCE.") }
    finally { setIsDeleteModalOpen(false) }
  }

  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return toast.error("La descripción es obligatoria.");
    setIsSaving(true);
    try {
      if (itemEnProceso?.id) await api.editarEstadoSIUCE(itemEnProceso.id, { estado_siuce: descripcion });
      else await api.crearEstadoSIUCE({ estado_siuce: descripcion });
      toast.success("Estado SIUCE guardado correctamente.");
      fetchEstados();
      setIsFormModalOpen(false);
      setDescripcion("");
    } catch { toast.error("Error al guardar el estado SIUCE."); }
    finally { setIsSaving(false); }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") guardarItem(e as any); };

  const total = estados.length;
  const activos = estados.filter(e => e.activo).length;
  const inactivos = total - activos;

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Estados SIUCE</h1>
          <p className="text-slate-500 truncate">Gestión de Estados SIUCE registrados en el sistema.</p>
        </div>
        <Button onClick={() => { setItemEnProceso(null); setDescripcion(""); setIsFormModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Estado SIUCE
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Total</p><h3 className="text-2xl font-bold">{total}</h3></div><Workflow className="h-8 w-8 text-blue-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Activos</p><h3 className="text-2xl font-bold">{activos}</h3></div><CheckCircle2 className="h-8 w-8 text-green-500 opacity-80"/></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm text-slate-500">Inactivos</p><h3 className="text-2xl font-bold">{inactivos}</h3></div><XCircle className="h-8 w-8 text-red-500 opacity-80"/></CardContent></Card>
      </div>

      <Card className="w-full shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por estado..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFiltroEstado("todos"); setOrdenDescripcion(null); }} className="h-10 text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4 mr-2"/> Limpiar</Button>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => {
                      if (ordenDescripcion === 'asc') setOrdenDescripcion('desc');
                      else if (ordenDescripcion === 'desc') setOrdenDescripcion(null);
                      else setOrdenDescripcion('asc');
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Estado SIUCE
                      {ordenDescripcion === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {ordenDescripcion === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {!ordenDescripcion && <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estadosOrdenados.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-center font-medium">{e.estado_siuce}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(e); setDescripcion(e.estado_siuce); setIsFormModalOpen(true); }}><Edit2 className="h-4 w-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(e); setIsStatusModalOpen(true); }}>
                           {e.activo ? <PowerOff className="h-4 w-4 text-amber-600"/> : <Power className="h-4 w-4 text-green-600"/>}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemEnProceso(e); setTextoConfirmacion(""); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4 text-red-600"/></Button>
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
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={guardarItem} className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{itemEnProceso ? "Editar" : "Nuevo"} Estado</h3>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>Guardar</Button>
            </div>
          </form>
        </div>
      )}

      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold">Confirmar cambio</h3>
            <p className="my-4">¿Cambiar estado de "{itemEnProceso.estado_siuce}"?</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
              <Button onClick={confirmarCambioEstado}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold">Eliminar {itemEnProceso.estado_siuce}</h3>
            <p className="text-sm text-slate-500 mb-4">Escribe el nombre para confirmar:</p>
            <Input value={textoConfirmacion} onChange={(e) => setTextoConfirmacion(e.target.value)} />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" disabled={textoConfirmacion !== itemEnProceso.estado_siuce} onClick={ejecutarEliminacion}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}