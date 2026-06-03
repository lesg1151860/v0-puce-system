"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function NuevoUsuarioPage() {
  const router = useRouter()
  // Nuevos estados separados
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rol, setRol] = useState<"ADMINISTRADOR" | "LIDER" | "USUARIO">("LIDER")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isPasswordSecure = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  }

  const handleSave = async () => {
    if (!username || !firstName || !lastName || !email || !password) {
      setError("Todos los campos son obligatorios.")
      return
    }
    if (!isPasswordSecure(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.")
      return
    }

    try {
      setLoading(true)
      setError(null)
            
      const esAdministrador = rol === "ADMINISTRADOR" ? true : false

      await api.crearUsuario({
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
        is_staff: esAdministrador
      })

      toast.success("Usuario creado exitosamente.")
      router.push("/administrador/usuarios")
      
    } catch (err) {
      setError("Error al registrar. Es posible que el Nombre de Usuario ya exista.")
      toast.error("Error al registrar el usuario.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Usuario</CardTitle>
          <CardDescription>Crea un usuario con acceso al sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de Usuario <span className="text-red-500">*</span></Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: jperez26" disabled={loading}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombres <span className="text-red-500">*</span></Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ej: Juan" disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label>Apellidos <span className="text-red-500">*</span></Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ej: Pérez" disabled={loading}/>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Correo Electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@ejemplo.com" disabled={loading}/>
          </div>

          <div className="space-y-2">
            <Label>Contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" disabled={loading} />
              <button type="button" className="absolute right-3 top-2.5 text-slate-500" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol del Sistema <span className="text-red-500">*</span></Label>
            <Select value={rol} onValueChange={(v: any) => setRol(v)} disabled={loading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="LIDER">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}