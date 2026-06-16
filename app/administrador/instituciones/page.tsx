"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Search, Building2, School, Lock, X, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import toast from "react-hot-toast"

export default function InstitucionesAdminPage() {
  const router = useRouter()
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroSector, setFiltroSector] = useState<string>("todos")
  const [ordenNombre, setOrdenNombre] = useState<'asc' | 'desc' | null>(null)
  
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

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta institución?")) return
    try {
      await api.eliminarInstitucion(id)
      toast.success("Institución eliminada exitosamente")
      cargarInstituciones()
    } catch (error) {
      toast.error("Error al eliminar la institución")
    }
  }

  const institucionesFiltradas = instituciones.filter(inst => {
    const termLower = searchTerm.toLowerCase()
    const nombreLower = (inst.nombre || "").toLowerCase()
    const rectorLower = (inst.rector || "").toLowerCase()
    
    // Coincide si el término está en el nombre de la IE O en el nombre del rector
    const coincideBusqueda = nombreLower.includes(termLower) || rectorLower.includes(termLower)
    const coincideSector = filtroSector === "todos" ? true : inst.sector === filtroSector
    
    return coincideBusqueda && coincideSector
  })

  const institucionesOrdenadas = [...institucionesFiltradas].sort((a, b) => {
    if (!ordenNombre) return 0;
    
    const nombreA = (a.nombre || "").toLowerCase();
    const nombreB = (b.nombre || "").toLowerCase();
    
    if (nombreA < nombreB) return ordenNombre === 'asc' ? -1 : 1;
    if (nombreA > nombreB) return ordenNombre === 'asc' ? 1 : -1;
    return 0;
  });

  const totalInst = instituciones.length
  const publicas = instituciones.filter((i: any) => i.sector === "PUBLICA").length
  const privadas = instituciones.filter((i: any) => i.sector === "PRIVADA").length

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

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {/* Barra de herramientas */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nombre o rector..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full h-10" />
            </div>
            
            <select value={filtroSector} onChange={(e) => setFiltroSector(e.target.value)} className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
              <option value="todos">Todos los Sectores</option>
              <option value="PUBLICA">Sector Público</option>
              <option value="PRIVADA">Sector Privado</option>
            </select>

            <Button variant="outline" onClick={() => { setSearchTerm(""); setFiltroSector("todos"); setOrdenNombre(null); }} className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
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
                  <th className="px-6 py-4 text-center">Sector</th>
                  <th className="px-6 py-4 text-center">Rector</th>
                  <th className="px-6 py-4 text-center">Número de Contacto</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500">Cargando directorio...</td></tr>
                ) : institucionesOrdenadas.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500">No se encontraron instituciones.</td></tr>
                ) : (
                  institucionesOrdenadas.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors bg-white">
                      <td className="px-6 py-4 font-medium text-slate-900 text-center">{inst.nombre}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inst.sector === 'PUBLICA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {inst.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">{inst.rector || "No asignado"}</td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {inst.num_contacto || "No definido"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => router.push(`/administrador/instituciones/editar_institucion/${inst.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(inst.id)}>
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
        </CardContent>
      </Card>
    </div>
  )
}