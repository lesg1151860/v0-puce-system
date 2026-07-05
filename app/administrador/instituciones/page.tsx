"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Search, Building2, School, Lock, X, ArrowUpDown, ArrowDown, ArrowUp, Power, PowerOff, CheckCircle2, 
        XCircle, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import toast from "react-hot-toast"

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1]
  return cookieToken || localStorage.getItem("access_token")
}

export default function InstitucionesAdminPage() {
  const router = useRouter()
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroSector, setFiltroSector] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [ordenNombre, setOrdenNombre] = useState<'asc' | 'desc' | null>(null)
  const [codigoDANE, setCodigoDANE] = useState<'asc' | 'desc' | null>(null)
  const [estadoIE, setEstadoIE] = useState<'asc' | 'desc' | null>(null) 
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [instAEliminar, setInstAEliminar] = useState<any | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [instAEditarEstado, setInstAEditarEstado] = useState<any | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    cargarInstituciones()
  }, [])

  const cargarInstituciones = async () => {
    try {
      setIsLoading(true)
      const data = await api.obtenerInstituciones()
      setInstituciones(data)
    } catch (error) {
      console.error("Error al cargar instituciones:", error)
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClickCambiarEstado = (inst: any) => {
    setInstAEditarEstado(inst)
    setIsStatusModalOpen(true)
  }

  const confirmarCambioEstado = async () => {
    if (!instAEditarEstado) return
    setIsUpdatingStatus(true)
    const token = getAuthToken()

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/institucion_educativa/${instAEditarEstado.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          activo: !instAEditarEstado.activo
        })
      })

      if (response.ok) {
        toast.success("Estado actualizado.")
        cargarInstituciones()
      } else {
        toast.error("Error al actualizar.")
      }
    } catch (error) {
      toast.error("Error al actualizar.")
    } finally {
      setIsUpdatingStatus(false)
      setIsStatusModalOpen(false)
      setInstAEditarEstado(null)
    }
  }

  const institucionesFiltradas = instituciones.filter(inst => {
    const termLower = searchTerm.toLowerCase()
    const nombreLower = (inst.nombre || "").toLowerCase()
    const rectorLower = (inst.rector || "").toLowerCase()
    const daneLower = (inst.cod_dane || inst.codigo_dane || "").toString().toLowerCase()
    const coincideBusqueda = nombreLower.includes(termLower) || rectorLower.includes(termLower) || daneLower.includes(termLower)
    const coincideSector = filtroSector === "todos" ? true : inst.sector === filtroSector
    const coincideEstado = filtroEstado === "todos" ? true : 
                           filtroEstado === "activo" ? inst.activo !== false : 
                           inst.activo === false;
    
    return coincideBusqueda && coincideSector && coincideEstado
  })

  const institucionesOrdenadas = [...institucionesFiltradas].sort((a, b) => {
    if (ordenNombre) {
      const nombreA = (a.nombre || "").toLowerCase();
      const nombreB = (b.nombre || "").toLowerCase();
      if (nombreA < nombreB) return ordenNombre === 'asc' ? -1 : 1;
      if (nombreA > nombreB) return ordenNombre === 'asc' ? 1 : -1;
    }
    
    if (codigoDANE) {
      const daneA = (a.cod_dane || a.codigo_dane || "").toLowerCase();
      const daneB = (b.cod_dane || b.codigo_dane || "").toLowerCase();
      if (daneA < daneB) return codigoDANE === 'asc' ? -1 : 1;
      if (daneA > daneB) return codigoDANE === 'asc' ? 1 : -1;
    }

    return 0;
  });

  const totalPages = Math.ceil(institucionesOrdenadas.length / rowsPerPage) || 1;
  const paginatedInstituciones = institucionesOrdenadas.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const totalInst = instituciones.length
  const publicas = instituciones.filter((i: any) => i.sector === "PUBLICA").length
  const privadas = instituciones.filter((i: any) => i.sector === "PRIVADA").length
  const activas = instituciones.filter((i: any) => i.activo !== false).length
  const inactivas = instituciones.filter((i: any) => i.activo === false).length

  const confirmarEliminacion = async () => {
    if (!instAEliminar) return
    try {
      await api.eliminarInstitucion(instAEliminar.id)
      toast.success("Institución eliminada")
      cargarInstituciones()
    } catch (e) { toast.error("Error al eliminar") }
    finally { setIsDeleteModalOpen(false); setInstAEliminar(null) }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">Instituciones Educativas</h1>
          <p className="text-slate-500 truncate">Gestión de Instituciones registradas en el sistema.</p>
        </div>
        <Button onClick={() => router.push("/administrador/instituciones/nueva_institucion")} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Nueva Institución
        </Button>
      </div>

      {/* Fila Superior de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Total Registradas</p><h3 className="text-2xl sm:text-3xl font-bold truncate">{isLoading ? "-" : totalInst}</h3></div>
          <Building2 className="h-8 w-8 text-slate-400 shrink-0" />
        </CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Sector Público</p><h3 className="text-2xl sm:text-3xl font-bold text-blue-600 truncate">{isLoading ? "-" : publicas}</h3></div>
          <School className="h-8 w-8 text-blue-500 shrink-0" />
        </CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Sector Privado</p><h3 className="text-2xl sm:text-3xl font-bold text-orange-600 truncate">{isLoading ? "-" : privadas}</h3></div>
          <Lock className="h-8 w-8 text-orange-500 shrink-0" />
        </CardContent></Card>
      </div>

      {/* Fila Inferior de Tarjetas (Estados Activo / Inactivo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full -mt-2">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Instituciones Activas</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 truncate">{isLoading ? "-" : activas}</h3>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
        </CardContent></Card>
        
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Instituciones Inactivas</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-amber-600 truncate">{isLoading ? "-" : inactivas}</h3>
          </div>
          <XCircle className="h-8 w-8 text-red-500 shrink-0" />
        </CardContent></Card>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          
          {/* Barra de búsqueda y filtros */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nombre, rector o DANE..." 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }} 
                className="pl-10 w-full h-10" 
              />
            </div>
            
            <select 
              value={filtroSector} 
              onChange={(e) => {
                setFiltroSector(e.target.value)
                setCurrentPage(1)
              }} 
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="todos">Todos los Sectores</option>
              <option value="PUBLICA">Sector Público</option>
              <option value="PRIVADA">Sector Privado</option>
            </select>

            <select 
              value={filtroEstado} 
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setCurrentPage(1)
              }} 
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Solo Activas</option>
              <option value="inactivo">Solo Inactivas</option>
            </select>

            <Button variant="outline" onClick={() => { 
              setSearchTerm(""); 
              setFiltroSector("todos"); 
              setFiltroEstado("todos");
              setOrdenNombre(null); 
              setCodigoDANE(null); 
              setCurrentPage(1); 
            }} className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <X className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => {
                      setCodigoDANE(null)
                      if (ordenNombre === 'asc') setOrdenNombre('desc');
                      else if (ordenNombre === 'desc') setOrdenNombre(null);
                      else setOrdenNombre('asc');
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Nombre
                      {ordenNombre === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {ordenNombre === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {!ordenNombre && <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => {
                      setOrdenNombre(null) // Quita el orden de Nombre
                      if (codigoDANE === 'asc') setCodigoDANE('desc');
                      else if (codigoDANE === 'desc') setCodigoDANE(null);
                      else setCodigoDANE('asc');
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Código DANE
                      {codigoDANE === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {codigoDANE === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {!codigoDANE && <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Sector</th>
                  <th className="px-6 py-4 text-center">Rector</th>
                  <th className="px-6 py-4 text-center">Número de Contacto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-500">Cargando directorio...</td></tr>
                ) : paginatedInstituciones.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-500">No se encontraron instituciones con esos filtros.</td></tr>
                  
                ) : (
                  paginatedInstituciones.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors bg-white">
                      <td className="px-6 py-4 font-medium text-slate-900 text-center">{inst.nombre}</td>
                      <td className="px-6 py-4 text-center">{inst.cod_dane || inst.codigo_dane}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inst.sector === 'PUBLICA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {inst.sector === 'PUBLICA' ? 'Público' : inst.sector === 'PRIVADA' ? 'Privado' : inst.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">{inst.rector || "No asignado"}</td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {inst.num_contacto || "No definido"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inst.activo !== false ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>
                          {inst.activo !== false ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => router.push(`/administrador/instituciones/editar_institucion/${inst.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleClickCambiarEstado(inst)}>
                            {inst.activo !== false ? <PowerOff className="h-4 w-4 text-amber-600"/> : <Power className="h-4 w-4 text-green-600"/>}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => {setInstAEliminar(inst); setIsDeleteModalOpen(true)}}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-slate-50 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Mostrar:</span>
              <select 
                className="border border-slate-200 rounded p-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value)); 
                  setCurrentPage(1); 
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
              </select>
              <span className="text-sm text-slate-600">por página</span>
            </div>

            <span className="text-sm font-medium text-slate-600">
              Página {currentPage} de {totalPages}
            </span>

            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} title="Primera página">
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} title="Página anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} title="Página siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} title="Última página">
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* Modal para Confirmar Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4 text-red-600 flex items-center gap-2"><AlertTriangle/> Eliminar Institución</h3>
            <p className="mb-6 text-sm">¿Estás seguro de eliminar a <strong>{instAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion}>Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para Confirmar Cambio de Estado */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-slate-900">Confirmar cambio</h3>
            <p className="my-4 text-sm text-slate-600">
              ¿Cambiar estado de {instAEditarEstado?.nombre}?
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)} disabled={isUpdatingStatus}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmarCambioEstado} 
                disabled={isUpdatingStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingStatus ? "Guardando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}