"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api" 
import toast from "react-hot-toast"

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [rol, setRol] = useState<"ADMINISTRADOR" | "LIDER">("LIDER")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const data = await api.getUsuarioById(userId)
        setFirstName(data.first_name || "")
        setLastName(data.last_name || "")
        setEmail(data.email || "")
        setUsername(data.username || "")
        
        const rolInicial = data.is_staff ? "ADMINISTRADOR" : "LIDER"
        setRol(rolInicial) 
        
        setLoading(false)
      } catch (error) {
        toast.error("Error al cargar el usuario.")
        router.push("/administrador/usuarios")
      }
    }
    cargarUsuario()
  }, [userId, router])

  const handleSave = async () => {
    setErrors({})
    try {
      setSaving(true)
      
      const esAdministrador = rol === "ADMINISTRADOR"

      await api.editarUsuario(userId, { 
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        is_staff: esAdministrador 
      })
      
      router.push("/administrador/usuarios")
      toast.success("Usuario actualizado exitosamente.")
    } catch (error: any) {
      if (error?.response?.data) {
        setErrors(error.response.data)
        toast.error("Error al actualizar. Revisa los campos marcados en rojo.")
      } else {
        toast.error("Error al conectar con el servidor.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Cargando usuario...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>Modifica los datos del usuario en el sistema de información.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombres</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Nombre de Usuario (Username) <span className="text-red-500">*</span></Label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className={errors.username ? "border-red-500 ring-1 ring-red-500" : ""}
            />
            {errors.username && (
              <p className="text-xs font-bold text-red-600 flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Array.isArray(errors.username) ? errors.username[0] : errors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && (
              <p className="text-xs font-bold text-red-600">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rol del Sistema</Label>
            <Select 
              value={rol} 
              onValueChange={(v: "ADMINISTRADOR" | "LIDER") => setRol(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="LIDER">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}