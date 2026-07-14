"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, CheckCircle, Clock, Edit2, 
  Trash2, AlertTriangle, X, ArrowUpDown, ArrowDown, ArrowUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from "lucide-react"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export default function CasosSACPage() {
  const [casos, setCasos] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroUsuario, setFiltroUsuario] = useState<string>("todos") 
  const [filtroIE, setFiltroIE] = useState<string>("todas") 
  const [filtroRespondido, setFiltroRespondido] = useState<string>("todos")
  const [filtroInstitucion, setFiltroInstitucion] = useState<string>("todas")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [casoAEliminar, setCasoAEliminar] = useState<number | null>(null)
  const [casoAEliminarRadicado, setCasoAEliminarRadicado] = useState<string>("")
  const [radicadoConfirmacion, setRadicadoConfirmacion] = useState<string>("")

  const fetchData = async () => {
    const token = getAuthToken()
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }

    try {
      const [resCasos, resEstados, resIE, resClasif] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/casos-sac/", { headers }),
        fetch("http://127.0.0.1:8000/api/estado_sac/", { headers }),
        fetch("http://127.0.0.1:8000/api/institucion_educativa/", { headers }),
        fetch("http://127.0.0.1:8000/api/clasificacion_caso/", { headers }).catch(() => null)
      ])

      if (resCasos?.ok) {
        const dataCasos = await resCasos.json()
        setCasos(dataCasos.results || (Array.isArray(dataCasos) ? dataCasos : []))
      } else {
        toast.error("Error al obtener los casos del servidor.")
      }

      if (resEstados?.ok) {
        const dataEstados = await resEstados.json()
        setEstados(dataEstados.results || (Array.isArray(dataEstados) ? dataEstados : []))
      }

      if (resIE?.ok) {
        const dataIE = await resIE.json()
        setInstituciones(dataIE.results || (Array.isArray(dataIE) ? dataIE : []))
      }

      if (resClasif?.ok) {
        const dataClasif = await resClasif.json()
        setClasificaciones(dataClasif.results || (Array.isArray(dataClasif) ? dataClasif : []))
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

  const handleClickEliminar = (id: number, radicado: string) => {
    setCasoAEliminar(id)
    setCasoAEliminarRadicado(radicado)
    setRadicadoConfirmacion("")
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
    setCasoAEliminarRadicado("")
    setRadicadoConfirmacion("")
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

  const obtenerNombreEstado = (estadoId: any) => {
    if (!estadoId) return "SIN ESTADO";
    const estadoObj = estados.find(e => e.id?.toString() === estadoId.toString());
    return estadoObj ? (estadoObj.nombre || estadoObj.estado_sac || estadoObj.nom_estado_sac) : "DESCONOCIDO";
  }

  const obtenerNombreClasificacion = (clasifId: any) => {
    if (!clasifId) return "Sin clasificar";
    const clasifObj = clasificaciones.find(c => c.id?.toString() === clasifId.toString());
    return clasifObj ? (clasifObj.descripcion || "Sin clasificar") : `Tipo ${clasifId}`;
  }

  const getEstiloClasificacion = (texto: string) => {
    const txt = texto.toUpperCase();
    if (txt.includes("TIPO 1")) return "bg-green-50 text-green-700 border-green-200";
    if (txt.includes("TIPO 2")) return "bg-orange-50 text-orange-600 border-orange-200";
    if (txt.includes("TIPO 3")) return "bg-red-50 text-red-600 border-red-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  const usuariosRegistradores = Array.from(
    new Set(
      casos.map(c => c.nombre_lider).filter(Boolean)
    )
  )

  const totalCasos = casos.length
  
  const totalTerminados = casos.filter((c) => {
    const textoEst = obtenerNombreEstado(c.estado_sac).toUpperCase();
    return c.respondido || textoEst.includes("TERMINADO") || textoEst.includes("CERRADO");
  }).length
  
  const totalEnSeguimiento = casos.filter((c) => {
    const textoEst = obtenerNombreEstado(c.estado_sac).toUpperCase();
    const esTerminado = c.respondido || textoEst.includes("TERMINADO") || textoEst.includes("CERRADO");
    return !esTerminado; 
  }).length
  
  const casosFiltrados = casos.filter((c) => {
    const termLower = searchTerm.toLowerCase()
    const ciudadanoLower = (c.ciudadano || "").toLowerCase()
    const estudianteLower = (c.estudiante || "").toLowerCase()
    const radicadoLower = (c.num_radicado_sac || "").toLowerCase()
    const coincideBusqueda = radicadoLower.includes(termLower) || ciudadanoLower.includes(termLower) || estudianteLower.includes(termLower)
    const coincideEstado = filtroEstado === "todos" ? true : c.estado_sac?.toString() === filtroEstado
    const nombreRegistrador = c.nombre_lider || "Desconocido"
    const coincideUsuario = filtroUsuario === "todos" ? true : nombreRegistrador === filtroUsuario
    const coincideIE = filtroIE === "todas" ? true : c.institucion_educativa?.toString() === filtroIE
    const coincideRespondido = filtroRespondido === "todos" ? true : (filtroRespondido === "si" ? c.respondido === true : c.respondido === false)

    return coincideBusqueda && coincideEstado && coincideUsuario && coincideIE && coincideRespondido
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

  const totalPages = Math.ceil(casosOrdenados.length / rowsPerPage) || 1;
  const paginatedCasos = useMemo(() => {
    return casosOrdenados.slice(
      (currentPage - 1) * rowsPerPage, 
      currentPage * rowsPerPage
    );
  }, [casosOrdenados, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

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

      <Card className="w-full border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-3">
          
          {/* Fila 1: Búsqueda principal */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por radicado, ciudadano o estudiante..." 
              className="pl-10 w-full h-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Fila 2: Filtros */}
          <div className="flex flex-col md:flex-row gap-3 w-full">
            
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
              value={filtroUsuario}
              onChange={(e) => {
                setFiltroUsuario(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 md:w-1/4"
            >
              <option value="todos">Todos los usuarios</option>
              {usuariosRegistradores.map((usr: any, index) => (
                <option key={index} value={usr}>
                  {formatearTexto(usr)}
                </option>
              ))}
            </select>
            
            <select 
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 md:w-1/4"
            >
              <option value="todos">Todos los estados</option>
              {estados.map((est) => {
                const nombre = est.nombre || est.estado_sac || est.nom_estado_sac;
                return (
                  <option key={est.id} value={est.id.toString()}>
                    {formatearTexto(nombre)}
                  </option>
                )
              })}
            </select>

            <select 
              value={filtroRespondido}
              onChange={(e) => {
                setFiltroRespondido(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 md:w-1/4"
            >
              <option value="todos">Respuesta: Todos</option>
              <option value="si">Respondidos (Sí)</option>
              <option value="no">Sin Respuesta (No)</option>
            </select>

            <Button 
              variant="outline" 
              onClick={() => { 
                setSearchTerm(""); 
                setFiltroEstado("todos"); 
                setFiltroUsuario("todos"); 
                setFiltroIE("todas");
                setFiltroRespondido("todos");
                setSortConfig(null); 
                setCurrentPage(1); 
              }}
              className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors md:w-auto whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN DEL LISTADO DE CASOS */}
      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Listado de Casos ({casosOrdenados.length})</h2>
        </div>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('radicado')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Número de Radicado
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
                  <th className="px-6 py-4 text-center">Clasificación</th>
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
                  <th className="px-6 py-4 text-center">Respondido</th>
                  <th className="px-6 py-4 text-center">Registrado por</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-500">Cargando registros...</td></tr>
                ) : paginatedCasos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-700">No hay casos</p>
                        <p className="text-sm">Comienza registrando un nuevo caso o intenta con otros filtros.</p>
                        <Link href="/lider/sac/nuevo" className="mt-4">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Registrar Caso
                          </Button>
                        </Link> 
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCasos.map((caso) => {
                    const textoEstado = obtenerNombreEstado(caso.estado_sac);
                    const esTerminado = caso.respondido || textoEstado.toUpperCase().includes("TERMINADO") || textoEstado.toUpperCase().includes("CERRADO");
                    const nombreRegistrador = caso.nombre_lider || caso.usuario_registro_username || "N/A";
                    const nombreClasificacion = obtenerNombreClasificacion(caso.clasificacion);
                    const estiloBadgeClasificacion = getEstiloClasificacion(nombreClasificacion);

                    return (
                      <tr key={caso.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-center">{caso.num_radicado_sac}</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-medium">{caso.ciudadano}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{caso.estudiante || "N/A"}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className={`${estiloBadgeClasificacion} font-medium`}>
                            {formatearTexto(nombreClasificacion)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">{caso.fecha_radicacion}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            esTerminado 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {formatearTexto(textoEstado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant="outline" 
                            className={caso.respondido 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium" 
                              : "bg-red-50 text-red-700 border-red-200 font-medium"}
                          >
                            {caso.respondido ? "Sí" : "No"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">{nombreRegistrador}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/lider/sac/editar/${caso.id}`}>
                              <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(caso.id, caso.num_radicado_sac)} className="hover:bg-red-50">
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

      {/* Modal de Eliminación*/}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="w-full">
                  <h3 className="text-lg font-bold text-slate-900 mt-2 sm:mt-0">Confirmar Eliminación</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Esta acción es irreversible. Para confirmar que deseas eliminar este caso, escribe el número de radicado:
                  </p>
                  <div className="mt-3 mb-4 p-3 bg-slate-50 rounded-md border border-slate-200 text-center">
                    <span className="font-mono font-bold text-slate-700 select-all">
                      {casoAEliminarRadicado}
                    </span>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="radicado_confirm">Número de Radicado</Label>
                    <Input
                      id="radicado_confirm"
                      placeholder="Escribe el radicado aquí..."
                      value={radicadoConfirmacion}
                      onChange={(e) => setRadicadoConfirmacion(e.target.value.toUpperCase())}
                      className="uppercase text-center font-mono"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={cancelarEliminacion} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmarEliminacion} className="w-full sm:w-auto" disabled={radicadoConfirmacion !== casoAEliminarRadicado}>
                Sí, eliminar caso
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}