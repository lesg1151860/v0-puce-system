"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Plus, Search, FileText, CheckCircle, Clock, Edit2, 
  Trash2, AlertTriangle, X, ArrowUpDown, ArrowDown, ArrowUp 
} from "lucide-react"
import toast from "react-hot-toast"

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1]
  return cookieToken || localStorage.getItem("access_token")
}

export default function CasosSACPage() {
  const [casos, setCasos] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [casoAEliminar, setCasoAEliminar] = useState<number | null>(null)

  const fetchData = async () => {
    const token = getAuthToken()
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }

    try {
      const [resCasos, resEstados] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/casos-sac/", { headers }),
        fetch("http://127.0.0.1:8000/api/estado_sac/", { headers })
      ])

      if (resCasos.ok) {
        const dataCasos = await resCasos.json()
        setCasos(dataCasos)
      } else {
        toast.error("Error al obtener los casos del servidor.")
      }

      if (resEstados.ok) {
        const dataEstados = await resEstados.json()
        setEstados(dataEstados)
      }

    } catch (error) {
      toast.error("Error de conexión con el backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleClickEliminar = (id: number) => {
    setCasoAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (casoAEliminar === null) return
    const token = getAuthToken()
    
    try {
      
      const response = await fetch(`http://127.0.0.1:8000/api/casos-sac/${casoAEliminar}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      })

      if (response.ok) {
        fetchData() 
        toast.success("Caso SAC eliminado exitosamente.")
      } else {
        toast.error("No se pudo eliminar el caso.")
      }
    } catch (error) {
      toast.error("Error al procesar la eliminación.")
    } finally {
      setIsDeleteModalOpen(false)
      setCasoAEliminar(null)
    }
  }

  const cancelarEliminacion = () => {
    setIsDeleteModalOpen(false)
    setCasoAEliminar(null)
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const totalCasos = casos.length
  const totalTerminados = casos.filter((c) => c.respondido || c.estado_sac_detalle?.nombre?.toUpperCase().includes("TERMINADO")).length
  const totalEnSeguimiento = totalCasos - totalTerminados
  
  const casosFiltrados = casos.filter((c) => {
    const coincideBusqueda = `${c.num_radicado_sac || ''} ${c.ciudadano || ''} ${c.estudiante || ''}`
        .toLowerCase().includes(searchTerm.toLowerCase())
      
    const coincideEstado = 
        filtroEstado === "todos" ? true : c.estado_sac?.toString() === filtroEstado

    return coincideBusqueda && coincideEstado
  })

  const casosOrdenados = [...casosFiltrados].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let valorA = '';
    let valorB = '';

    if (sortConfig.key === 'radicado') {
      valorA = (a.num_radicado_sac || '').toLowerCase();
      valorB = (b.num_radicado_sac || '').toLowerCase();
    } else if (sortConfig.key === 'ciudadano') {
      valorA = (a.ciudadano || '').toLowerCase();
      valorB = (b.ciudadano || '').toLowerCase();
    } else if (sortConfig.key === 'fecha') {
      valorA = a.fecha_radicacion || '';
      valorB = b.fecha_radicacion || '';
    }

    if (valorA < valorB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valorA > valorB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Casos SAC</h1>
          <p className="text-slate-500 truncate">Administra y realiza el seguimiento de las solicitudes del Sistema de Atención al Ciudadano</p>
        </div>
        <Link href="/lider/sac/nuevo" className="w-full sm:w-auto shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Caso SAC
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Total Casos SAC</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate">{totalCasos}</h3>
          </div>
          <FileText className="h-8 w-8 text-orange-500 shrink-0" />
        </CardContent></Card>
        
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Casos Terminados</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate text-emerald-600">{totalTerminados}</h3>
          </div>
          <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
        </CardContent></Card>
        
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">En Seguimiento</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate text-blue-600">{totalEnSeguimiento}</h3>
          </div>
          <Clock className="h-8 w-8 text-blue-500 shrink-0" />
        </CardContent></Card>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por radicado, ciudadano o estudiante..." 
                className="pl-10 w-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="todos">Todos los Estados</option>
              {estados.map((est) => {
                const nombre = est.nombre || est.estado_sac || est.nom_estado_sac;
                return (
                  <option key={est.id} value={est.id.toString()}>
                    {nombre}
                  </option>
                )
              })}
            </select>

            <Button 
              variant="outline" 
              onClick={() => { setSearchTerm(""); setFiltroEstado("todos"); setSortConfig(null); }}
              className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <X className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('radicado')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Número de Radicado SAC
                      {sortConfig?.key === 'radicado' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('ciudadano')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Ciudadano
                      {sortConfig?.key === 'ciudadano' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Estudiante</th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('fecha')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Fecha Radicación
                      {sortConfig?.key === 'fecha' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Cargando registros...</td></tr>
                ) : casosOrdenados.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">No se encontraron casos registrados en el sistema.</td></tr>
                ) : (
                  casosOrdenados.map((caso) => {
                    const textoEstado = caso.estado_sac_detalle?.nombre || "PROCESANDO";
                    const esTerminado = caso.respondido || textoEstado.toUpperCase().includes("TERMINADO");

                    return (
                      <tr key={caso.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-center">{caso.num_radicado_sac}</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-medium uppercase">{caso.ciudadano}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{caso.estudiante || "N/A"}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{caso.fecha_radicacion}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            esTerminado 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {textoEstado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/lider/sac/editar/${caso.id}`}>
                              <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(caso.id)} className="hover:bg-red-50">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 sm:mt-0">Confirmar Eliminación</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    ¿Estás seguro de que deseas eliminar este caso SAC? Esta operación removerá permanentemente la información del radicado en la base de datos.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={cancelarEliminacion} className="w-full sm:w-auto">Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion} className="w-full sm:w-auto">Sí, eliminar radicado</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}