"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Search, Building2, School, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"

export default function InstitucionesAdminPage() {
  const router = useRouter()
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
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

  const institucionesFiltradas = instituciones.filter(inst => 
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cálculos dinámicos para las tarjetas superiores
  const totalInst = instituciones.length
  const publicas = instituciones.filter((i: any) => i.sector === "PUBLICA").length
  const privadas = instituciones.filter((i: any) => i.sector === "PRIVADA").length


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Instituciones Educativas</h1>
          <p className="text-slate-500">Gestión de Instituciones Educativas registradas en el sistema.</p>
        </div>
        <Button onClick={() => router.push("/administrador/instituciones/nueva_institucion")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Registradas</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : totalInst}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sector Público</CardTitle>
            <School className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? "-" : publicas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sector Privado</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{isLoading ? "-" : privadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Datos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10 text-slate-500 animate-pulse">Cargando directorio...</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Sector</th>
                    <th className="px-4 py-3">Rector</th>
                    <th className="px-4 py-3">Número de Contacto</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {institucionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No se encontraron instituciones registradas.
                      </td>
                    </tr>
                  ) : (
                    institucionesFiltradas.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            {inst.nombre}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${inst.sector === 'PUBLICA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                            {inst.sector}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{inst.rector || "No asignado"}</td>
                        <td className="px-4 py-3 text-slate-600">{inst.contacto || "No definido"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => router.push(`/administrador/instituciones/editar_institucion/${inst.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDelete(inst.id)}
                            >
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}