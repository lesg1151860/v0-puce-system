"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, Search, FileText, CheckCircle, Clock, Edit2, 
  Trash2, AlertTriangle, X, ArrowUpDown, ArrowDown, ArrowUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "lucide-react"
import toast from "react-hot-toast"
import { InstitucionCombobox } from "@/components/InstitucionCombobox"

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1]
  return cookieToken || localStorage.getItem("access_token")
}
const formatearTexto = (texto: string) => {
  if (!texto) return "N/A";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
const clasificacionBadgeStyles: Record<string, string> = {
  "Tipo 1": "bg-slate-100 text-slate-800 border-slate-200",
  "Tipo 2": "bg-orange-100 text-orange-800 border-orange-200",
  "Tipo 3": "bg-red-100 text-red-800 border-red-200",
}

export default function SIUCEListPage() {
  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estados, setEstados] = useState<any[]>([]) 
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroInstitucion, setFiltroInstitucion] = useState<string>("todas")
  const [filtroClasificacion, setFiltroClasificacion] = useState<string>("todas")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [casoAEliminar, setCasoAEliminar] = useState<number | null>(null)

  const fetchData = async () => {
    const token = getAuthToken()
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }

    try {
      const [resCasos, resEstados, resInst, resClasif] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/caso-siuce/", { headers }),
        fetch("http://127.0.0.1:8000/api/estado_siuce/", { headers }),
        fetch("http://127.0.0.1:8000/api/institucion_educativa/", { headers }),
        fetch("http://127.0.0.1:8000/api/clasificacion_caso/", { headers })
      ])

      if (resCasos.ok) {
        const dataCasos = await resCasos.json()
        setCasos(dataCasos.results || (Array.isArray(dataCasos) ? dataCasos : []))
      } else {
        toast.error("Error al obtener los casos del servidor.")
      }

      if (resEstados.ok) setEstados(await resEstados.json().then(d => d.results || (Array.isArray(d) ? d : [])))
      if (resInst.ok) setInstituciones(await resInst.json().then(d => d.results || (Array.isArray(d) ? d : [])))
      if (resClasif.ok) setClasificaciones(await resClasif.json().then(d => d.results || (Array.isArray(d) ? d : [])))

    } catch (error) {
      toast.error("Error de conexión con el backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const obtenerNombreEstado = (id: any) => {
    if (!id) return "Desconocido";
    const obj = estados.find(e => e.id?.toString() === id.toString());
    return obj ? (obj.estado_siuce || obj.nombre_estado || "Desconocido") : "Desconocido";
  }

  const obtenerNombreIE = (id: any) => {
    if (!id) return "N/A";
    const obj = instituciones.find(e => e.id?.toString() === id.toString());
    return obj ? (obj.nombre || obj.nombre_ie || "N/A") : "N/A";
  }

  const obtenerNombreClasificacion = (id: any) => {
    if (!id) return "Sin Clasificar";
    const obj = clasificaciones.find(e => e.id?.toString() === id.toString());
    return obj ? (obj.descripcion || obj.clasificacion || "Sin Clasificar") : "Sin Clasificar";
  }

  const handleClickEliminar = (id: number) => {
    setCasoAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (casoAEliminar === null) return
    const token = getAuthToken()
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/caso-siuce/${casoAEliminar}/`, {
        method: "DELETE",
        headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
      })

      if (response.ok) {
        fetchData() 
        toast.success("Caso SIUCE eliminado exitosamente.")
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
  
  const totalTerminados = casos.filter((c) => {
    const estado = obtenerNombreEstado(c.estado_siuce).toUpperCase();
    return estado.includes("TERMINADO") || estado.includes("CERRADO");
  }).length

  const totalPendientes = casos.filter((c) => {
    const estado = obtenerNombreEstado(c.estado_siuce).toUpperCase();
    return estado.includes("PENDIENTE") || estado.includes("NUEVO");
  }).length

  const totalEnProgreso = casos.filter((c) => {
    const estado = obtenerNombreEstado(c.estado_siuce).toUpperCase();
    return !estado.includes("TERMINADO") && !estado.includes("CERRADO") && !estado.includes("PENDIENTE") && !estado.includes("NUEVO");
  }).length

  const casosFiltrados = casos.filter((c) => {
  const termLower = searchTerm.toLowerCase()
  const radicadoLower = (c.num_radicado_siuce || "").toLowerCase()
  const victimaLower = (c.estudiante_victima || "").toLowerCase()
  const nombreIeLower = obtenerNombreIE(c.institucion_educativa).toLowerCase()
  const coincideBusqueda = radicadoLower.includes(termLower) || victimaLower.includes(termLower) || nombreIeLower.includes(termLower)
  const coincideEstado = filtroEstado === "todos" ? true : c.estado_siuce?.toString() === filtroEstado
  const coincideIE = filtroInstitucion === "todas" ? true : c.institucion_educativa?.toString() === filtroInstitucion
  const coincideClasificacion = filtroClasificacion === "todas" ? true : c.clasificacion?.toString() === filtroClasificacion

    return coincideBusqueda && coincideEstado && coincideIE && coincideClasificacion
  })

  const casosOrdenados = [...casosFiltrados].sort((a, b) => {
    if (!sortConfig) return 0;
    let valorA = '';
    let valorB = '';

    if (sortConfig.key === 'radicado') {
      valorA = (a.num_radicado_siuce || '').toLowerCase();
      valorB = (b.num_radicado_siuce || '').toLowerCase();
    } else if (sortConfig.key === 'fecha') {
      valorA = a.fecha_registro || a.fecha_ocurrencia || '';
      valorB = b.fecha_registro || b.fecha_ocurrencia || '';
    } else if (sortConfig.key === 'registrador') {
      valorA = (a.nombre_lider || a.usuario_registro_username || '').toLowerCase();
      valorB = (b.nombre_lider || b.usuario_registro_username || '').toLowerCase();
    }

    if (valorA < valorB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valorA > valorB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(casosOrdenados.length / rowsPerPage) || 1;
  const paginatedCasos = useMemo(() => {
    return casosOrdenados.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [casosOrdenados, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Casos SIUCE</h1>
          <p className="text-slate-500 truncate">Sistema de Información Unificado de Convivencia Escolar</p>
        </div>
        <Link href="/lider/siuce/nuevo" className="w-full sm:w-auto shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Caso SIUCE
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Total Casos SIUCE</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate">{totalCasos}</h3>
          </div>
          <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
        </CardContent></Card>

        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">En Progreso</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate text-blue-600">{totalEnProgreso}</h3>
          </div>
          <Clock className="h-8 w-8 text-blue-500 shrink-0" />
        </CardContent></Card>
        
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Casos Terminados</p>
            <h3 className="text-2xl sm:text-3xl font-bold truncate text-emerald-600">{totalTerminados}</h3>
          </div>
          <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
        </CardContent></Card>
      </div>

      <Card className="w-full border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por radicado, víctima o I.E..." 
              className="pl-10 w-full h-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="w-full sm:w-[300px]"> 
            <InstitucionCombobox 
              opciones={[{ id: "todas", nombre: "Todas las I.E." }, ...instituciones]} 
              value={filtroInstitucion} 
              onChange={(val) => { 
                setFiltroInstitucion(val); 
                setCurrentPage(1); 
              }}
              placeholder="Buscar Institución Educativa..."
            />
          </div>
          <select 
            value={filtroClasificacion}
            onChange={(e) => { setFiltroClasificacion(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="todas">Todas las Clasificaciones</option>
            {clasificaciones.map((clas) => (
              <option key={clas.id} value={clas.id.toString()}>{clas.descripcion}</option>
            ))}
          </select>
          <select 
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="todos">Todos los estados</option>
            {estados.map((est) => (
              <option key={est.id} value={est.id.toString()}>{formatearTexto(est.estado_siuce || est.nombre_estado)}</option>
            ))}
          </select>
          <Button 
            variant="outline" 
            onClick={() => { setSearchTerm(""); setFiltroEstado("todos"); setFiltroInstitucion("todas"); setFiltroClasificacion("todas"); setSortConfig(null); setCurrentPage(1); }}
            className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <X className="h-4 w-4 mr-2" /> Limpiar
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Listado de Casos ({casosOrdenados.length})</h2>
        </div>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('radicado')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Número Radicado SIUCE
                      {sortConfig?.key === 'radicado' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Institución Educativa</th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('fecha')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Fecha Registro
                      {sortConfig?.key === 'fecha' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Avance General</th>
                  <th className="px-6 py-4 text-center">Clasificación</th>
                  <th className="px-6 py-4 text-center">Registrado por</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">Cargando registros...</td></tr>
                ) : paginatedCasos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-700">No hay casos</p>
                        <p className="text-sm">Comienza registrando un nuevo caso o intenta con otros filtros.</p>
                        <Link href="/lider/siuce/nuevo" className="mt-4">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Registrar Caso
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCasos.map((caso) => {
                    const clasificacion = obtenerNombreClasificacion(caso.clasificacion);
                    let badgeColor = clasificacionBadgeStyles[clasificacion] || "bg-slate-100 text-slate-800 border-slate-200";
                    const nombreRegistrador = caso.username || "N/A";
                    const fechaMostrar = caso.fecha_registro ? caso.fecha_registro.split('T')[0] : "N/A";

                    return (
                      <tr key={caso.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-center">{caso.num_radicado_siuce}</td>
                        <td className="px-6 py-4 text-center text-slate-700 max-w-[200px] truncate" title={obtenerNombreIE(caso.institucion_educativa)}>
                          {obtenerNombreIE(caso.institucion_educativa)}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">{fechaMostrar}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center gap-2 justify-center min-w-[120px]">
                            <Progress value={caso.avance_general || 0} className="h-2 flex-1" />
                            <span className="text-xs text-slate-600 font-medium w-9">{caso.avance_general || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className={badgeColor}>
                            {clasificacion}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">{caso.usuario_registro_siuce}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/lider/siuce/editar/${caso.id}`}>
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

          {/* CONTROLES DE PAGINACIÓN */}
          {paginatedCasos.length > 0 && (
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
          )}
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
                    ¿Estás seguro de que deseas eliminar este caso SIUCE? Esta operación removerá permanentemente la información en la base de datos.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={cancelarEliminacion} className="w-full sm:w-auto">Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion} className="w-full sm:w-auto">Sí, eliminar caso</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}