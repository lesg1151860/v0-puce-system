"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react"
import { api } from "@/lib/api" 
import toast from "react-hot-toast"

export default function EditarInstitucionPage() {
  const router = useRouter()
  const params = useParams()
  const institucionId = params.id as string

  // Estados del modelo Institución
  const [nombre, setNombre] = useState("")
  const [rector, setRector] = useState("")
  const [numContacto, setNumContacto] = useState("")
  const [sector, setSector] = useState<"PUBLICA" | "PRIVADA">("PUBLICA")
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cargarInstitucion = async () => {
      try {
        const data = await api.obtenerInstitucionById(institucionId)
        
        setNombre(data.nombre || "")
        setRector(data.rector || "")
        setNumContacto(data.num_contacto || "")
        setSector(data.sector || "PUBLICA")
        
        setLoading(false)
      } catch (error) {
        toast.error("Error al cargar la institución.")
        router.push("/administrador/instituciones")
      }
    }
    cargarInstitucion()
  }, [institucionId, router])

  const handleSave = async () => {
    // Validaciones de campos obligatorios
    if (!nombre || !rector) {
      toast.error("El Nombre y Rector son obligatorios.")
      return
    }

    if (numContacto && numContacto.length !== 10) {
      toast.error("El número de contacto debe tener exactamente 10 dígitos.")
      return
    }

    try {
      setSaving(true)
      
      await api.editarInstitucion(institucionId, { 
        nombre: nombre,
        sector: sector,
        rector: rector,
        num_contacto: numContacto
      })
      
      toast.success("Institución actualizada exitosamente.")
      router.push("/administrador/instituciones")
    } catch (error) {
      toast.error("Error al actualizar la institución.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Cargando institución...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al directorio
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <CardTitle>Editar Institución</CardTitle>
          </div>
          <CardDescription>Modifica los datos de lla Institución Educativa en el directorio del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             
            <div className="space-y-2">
              <Label>Sector <span className="text-red-500">*</span></Label>
              <Select value={sector} onValueChange={(v: "PUBLICA" | "PRIVADA") => setSector(v)} disabled={saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLICA">Pública</SelectItem>
                  <SelectItem value="PRIVADA">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          

          <div className="space-y-2">
            <Label>Nombre de la Institución <span className="text-red-500">*</span></Label>
            <Input 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Rector <span className="text-red-500">*</span></Label>
              <Input 
                value={rector} 
                onChange={(e) => setRector(e.target.value)} 
                disabled={saving} 
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
                disabled={saving} 
              />
              <p className="text-xs text-slate-500">
                {numContacto.length}/10 dígitos
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-6" 
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}