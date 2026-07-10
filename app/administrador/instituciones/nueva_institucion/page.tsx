"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function NuevaInstitucionPage() {
  const router = useRouter()
  const [cod_dane, setCodDane] = useState("")
  const [nombre, setNombre] = useState("")
  const [rector, setRector] = useState("")
  const [numContacto, setNumContacto] = useState("")
  const [sector, setSector] = useState<"PUBLICA" | "PRIVADA">("PUBLICA")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {

    if (!cod_dane || cod_dane.length !== 12) {
      setError("El Código DANE es obligatorio y debe tener exactamente 12 dígitos numéricos.")
      return
    }

    if (!nombre || !rector) {
      setError("El Nombre y Rector son campos obligatorios.")
      return
    }

    if (numContacto && numContacto.length !== 10) {
      setError("El número de contacto debe tener exactamente 10 dígitos.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await api.crearInstitucion({
        cod_dane: cod_dane,
        nombre: nombre,
        sector: sector,
        rector: rector,
        num_contacto: numContacto
      })

      toast.success("Institución registrada exitosamente")
      router.push("/administrador/instituciones")
    } catch (err: any) {
      const errorMsg = err.response?.data?.cod_dane 
        ? "Este Código DANE ya se encuentra registrado en otra institución." 
        : "Error al registrar la institución. Verifica los datos."
        
      setError(errorMsg)
      toast.error("Error en el registro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al directorio
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <CardTitle>Registrar Nueva Institución</CardTitle>
          </div>
          <CardDescription>Añade una nueva Institución Educativa al sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector <span className="text-red-500">*</span></Label>
              <Select value={sector} onValueChange={(v: "PUBLICA" | "PRIVADA") => setSector(v)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLICA">Pública</SelectItem>
                  <SelectItem value="PRIVADA">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Código DANE <span className="text-red-500">*</span></Label>
              <Input 
                type="text"
                maxLength={12}
                value={cod_dane} 
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, "")
                  setCodDane(soloNumeros)
                }} 
                placeholder="Ej: 154001000001" 
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                {cod_dane.length}/12 dígitos
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre de la Institución <span className="text-red-500">*</span></Label>
            <Input 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej: Institución Educativa Colegio Nacional" 
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Rector <span className="text-red-500">*</span></Label>
              <Input 
                value={rector} 
                onChange={(e) => setRector(e.target.value)} 
                placeholder="Ej: Carlos Ramírez" 
                disabled={loading} 
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Contacto</Label>
              <Input 
                type="tel"
                maxLength={10}
                value={numContacto} 
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, "")
                  setNumContacto(soloNumeros)
                }} 
                placeholder="Ej: 3201234567" 
                disabled={loading} 
              />
              <p className="text-xs text-slate-500">
                {numContacto.length}/10 dígitos
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSave} 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-6" 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? "Guardando..." : "Guardar Institución"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}