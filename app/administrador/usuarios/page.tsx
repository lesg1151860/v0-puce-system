"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Shield, UserCheck, Users, Edit2, Trash2, AlertTriangle, X, Key,
        ArrowUpDown, ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function UsuariosPage() {
  
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroRol, setFiltroRol] = useState<string>("todos")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<number | null>(null)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false)
  const [usuarioAClave, setUsuarioAClave] = useState<any>(null)
  const [passData, setPassData] = useState({ actual: "", nueva: "", confirm: "" })  
  const [showPassActual, setShowPassActual] = useState(false)
  const [showPassNueva, setShowPassNueva] = useState(false)
  const [showPassConfirm, setShowPassConfirm] = useState(false)

  const fetchUsuarios = async () => {
    try {
      const data = await api.getUsuarios()
      setUsuarios(data)
    } catch (error) {
      toast.error("Error al cargar usuarios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleClickEliminar = (id: number) => {
    setUsuarioAEliminar(id)
    setIsDeleteModalOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (usuarioAEliminar === null) return
    try {
      await api.eliminarUsuario(usuarioAEliminar)
      fetchUsuarios() 
      toast.success("Usuario eliminado exitosamente.")
    } catch (error) {
      toast.error("Error al eliminar el usuario")
    } finally {
      setIsDeleteModalOpen(false)
      setUsuarioAEliminar(null)
    }
  }

  const cancelarEliminacion = () => {
    setIsDeleteModalOpen(false)
    setUsuarioAEliminar(null)
  }
  const getPasswordErrors = () => {
    const { nueva } = passData
    return {
      length: nueva.length >= 8 && nueva.length <= 16,
      upper: /[A-Z]/.test(nueva),
      number: /\d/.test(nueva),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(nueva),
      noSequences: nueva.length > 0 && !/(.)\1{2,}|012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi/i.test(nueva)
    }
  }

  const passErrors = getPasswordErrors()
  
  const isPassValid = 
    Object.values(passErrors).every(v => v === true) && 
    passData.nueva !== "" && 
    passData.nueva === passData.confirm

  const handleCambiarClave = async () => {
    if (!isPassValid) return
    try {
    toast.success("Contraseña actualizada correctamente")
      
      setIsPassModalOpen(false)
      setPassData({ actual: "", nueva: "", confirm: "" })
      setUsuarioAClave(null)
      setShowPassActual(false)
      setShowPassNueva(false)
      setShowPassConfirm(false)
    } catch (e: any) { 
      toast.error(e.message || "Error al cambiar la contraseña") 
    }
  }

  const cancelarCambioClave = () => {
    setIsPassModalOpen(false)
    setPassData({ actual: "", nueva: "", confirm: "" })
    setUsuarioAClave(null)
    setShowPassActual(false)
    setShowPassNueva(false)
    setShowPassConfirm(false)
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

  const totalUsuarios = usuarios.length
  const totalAdmin = usuarios.filter((u) => u.is_staff).length
  const totalLider = totalUsuarios - totalAdmin
  
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda = `${u.first_name} ${u.last_name} ${u.username} ${u.email}`
        .toLowerCase().includes(searchTerm.toLowerCase())
      
    const coincideRol = 
        filtroRol === "todos" ? true :
        filtroRol === "admin" ? u.is_staff : !u.is_staff

    return coincideBusqueda && coincideRol
  })

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let valorA = '';
    let valorB = '';

    if (sortConfig.key === 'nombre') {
      valorA = `${a.first_name} ${a.last_name}`.toLowerCase();
      valorB = `${b.first_name} ${b.last_name}`.toLowerCase();
    } else if (sortConfig.key === 'usuario') {
      valorA = (a.username || '').toLowerCase();
      valorB = (b.username || '').toLowerCase();
    }

    if (valorA < valorB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valorA > valorB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 truncate">Gestión de Usuarios</h1>
          <p className="text-slate-500 truncate">Administra los usuarios y sus accesos al sistema</p>
        </div>
        <Link href="/administrador/usuarios/nuevo_usuario" className="w-full sm:w-auto shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Total Usuarios</p><h3 className="text-2xl sm:text-3xl font-bold truncate">{totalUsuarios}</h3></div>
          <Users className="h-8 w-8 text-orange-500 shrink-0" />
        </CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Usuarios Admin</p><h3 className="text-2xl sm:text-3xl font-bold truncate">{totalAdmin}</h3></div>
          <Shield className="h-8 w-8 text-blue-500 shrink-0" />
        </CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div className="min-w-0"><p className="text-sm font-medium text-slate-500 truncate">Usuarios Líder</p><h3 className="text-2xl sm:text-3xl font-bold truncate">{totalLider}</h3></div>
          <UserCheck className="h-8 w-8 text-green-500 shrink-0" />
        </CardContent></Card>
      </div>

      <Card className="w-full overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre o email..." 
                  className="pl-10 w-full h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="todos">Todos los Roles</option>
                <option value="admin">Administrador</option>
                <option value="lider">Líder</option>
              </select>
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setFiltroRol("todos"); setSortConfig(null); }}
                className="h-10 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                <X className="h-4 w-4 mr-2" /> Limpiar
              </Button>
            </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b">
                <tr>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('nombre')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Nombres Completos
                      {sortConfig?.key === 'nombre' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={() => requestSort('usuario')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Usuario
                      {sortConfig?.key === 'usuario' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />
                      ) : <ArrowUpDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Email</th>
                  <th className="px-6 py-4 text-center">Rol</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
                ) : usuariosOrdenados.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No se encontraron usuarios.</td></tr>
                ) : (
                  usuariosOrdenados.map((usuario) => (
                    <tr key={usuario.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 text-center">{usuario.first_name} {usuario.last_name}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{usuario.username}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{usuario.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.is_staff ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {usuario.is_staff ? "Administrador" : "Líder"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/administrador/usuarios/editar_usuario/${usuario.id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-amber-50"
                            onClick={() => { setUsuarioAClave(usuario); setIsPassModalOpen(true); }}
                          >
                            <Key className="h-4 w-4 text-amber-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleClickEliminar(usuario.id)} className="hover:bg-red-50">
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

      {/* Modal Cambio Contraseña */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                Cambiar Contraseña
                <span className="block text-sm font-normal text-slate-500 mt-1">
                  Usuario: {usuarioAClave?.username}
                </span>
              </h3>
              
              <div className="space-y-3">
                {/* Input con opción de Ver/Ocultar */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Contraseña Actual</label>
                  <div className="relative">
                    <Input 
                      type={showPassActual ? "text" : "password"} 
                      placeholder="Ingresa la contraseña actual" 
                      value={passData.actual}
                      onChange={(e) => setPassData({...passData, actual: e.target.value})} 
                      className="pr-10"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassActual(!showPassActual)}
                    >
                      {showPassActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Input con opción de Ver/Ocultar */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Nueva Contraseña</label>
                  <div className="relative">
                    <Input 
                      type={showPassNueva ? "text" : "password"} 
                      placeholder="Ingresa la nueva contraseña" 
                      value={passData.nueva}
                      onChange={(e) => setPassData({...passData, nueva: e.target.value})} 
                      className="pr-10"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassNueva(!showPassNueva)}
                    >
                      {showPassNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Indicadores de validación visuales */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Requisitos de seguridad:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className={`flex items-center gap-1 ${passErrors.length ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {passErrors.length ? "✓" : "○"} 8-16 caracteres
                    </p>
                    <p className={`flex items-center gap-1 ${passErrors.upper ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {passErrors.upper ? "✓" : "○"} 1 Mayúscula
                    </p>
                    <p className={`flex items-center gap-1 ${passErrors.number ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {passErrors.number ? "✓" : "○"} 1 Número
                    </p>
                    <p className={`flex items-center gap-1 ${passErrors.special ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {passErrors.special ? "✓" : "○"} 1 Carácter especial
                    </p>
                    <p className={`col-span-2 flex items-center gap-1 ${passErrors.noSequences ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {passErrors.noSequences ? "✓" : "○"} Sin números/letras consecutivas
                    </p>
                  </div>
                </div>

                {/* Input con opción de Ver/Ocultar */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Input 
                      type={showPassConfirm ? "text" : "password"} 
                      placeholder="Repite la nueva contraseña" 
                      value={passData.confirm}
                      onChange={(e) => setPassData({...passData, confirm: e.target.value})} 
                      className={`pr-10 ${
                        passData.confirm !== "" && passData.nueva !== passData.confirm 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : (passData.confirm !== "" && passData.nueva === passData.confirm) ? "border-emerald-500 focus-visible:ring-emerald-500" : ""
                      }`}
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassConfirm(!showPassConfirm)}
                    >
                      {showPassConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passData.confirm !== "" && passData.nueva !== passData.confirm && (
                    <p className="text-xs text-red-500 font-medium mt-1">Las contraseñas no coinciden</p>
                  )}
                  {passData.confirm !== "" && passData.nueva === passData.confirm && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">Las contraseñas coinciden</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={cancelarCambioClave} className="w-full sm:w-auto">Cancelar</Button>
              <Button 
                onClick={handleCambiarClave} 
                disabled={!isPassValid} 
                className={`w-full sm:w-auto ${isPassValid ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300"}`}
              >
                Guardar Contraseña
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 sm:mt-0">Confirmar Eliminación</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    ¿Estás seguro de que deseas eliminar este usuario? Esta acción es permanente.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={cancelarEliminacion} className="w-full sm:w-auto">Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacion} className="w-full sm:w-auto">Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}