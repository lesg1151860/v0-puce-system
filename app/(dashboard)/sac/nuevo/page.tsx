"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { casoSACBasicoSchema, type CasoSACBasicoFormData } from "@/lib/validations"
import { createCaseSAC } from "@/lib/storage"

const roles = [
  "Estudiante",
  "Grupo de Estudiantes",
  "Docente",
  "Administrativo",
  "Rector",
  "Padre de Familia",
  "Autoridad Admin-Jud",
  "Desconocido",
  "Familiar",
  "Vecino",
  "ONG",
] as const

const estados = ["EN SEGUIMIENTO", "TERMINADO"] as const

export default function NuevoCasoSACPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CasoSACBasicoFormData>({
    resolver: zodResolver(casoSACBasicoSchema),
    defaultValues: {
      estado: "EN SEGUIMIENTO",
    },
  })

  const onSubmit = async (data: CasoSACBasicoFormData) => {
    setError("")
    setIsLoading(true)

    try {
      createCaseSAC(data)
      router.push("/sac")
    } catch (err) {
      setError("Error al guardar el caso. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sac">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Caso SAC</h1>
          <p className="text-slate-600">Registra un nuevo caso del Sistema de Atención al Ciudadano</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica del Caso</CardTitle>
          <CardDescription>
            Completa los campos requeridos para registrar el caso. Podrás agregar más detalles después editando el caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input
                  id="radicado"
                  placeholder="Ej: CUC2024ER002434"
                  {...register("radicado")}
                  className={errors.radicado ? "border-red-500" : ""}
                />
                {errors.radicado && (
                  <p className="text-sm text-red-500">{errors.radicado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudadano">Ciudadano *</Label>
                <Input
                  id="ciudadano"
                  placeholder="Nombre en mayúsculas"
                  {...register("ciudadano")}
                  className={errors.ciudadano ? "border-red-500" : ""}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.ciudadano && (
                  <p className="text-sm text-red-500">{errors.ciudadano.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaRadicacion">Fecha de Radicación *</Label>
                <Input
                  id="fechaRadicacion"
                  type="date"
                  {...register("fechaRadicacion")}
                  className={errors.fechaRadicacion ? "border-red-500" : ""}
                />
                {errors.fechaRadicacion && (
                  <p className="text-sm text-red-500">{errors.fechaRadicacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select onValueChange={(value) => setValue("rol", value as CasoSACBasicoFormData["rol"])}>
                  <SelectTrigger className={errors.rol ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rol && (
                  <p className="text-sm text-red-500">{errors.rol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  defaultValue="EN SEGUIMIENTO"
                  onValueChange={(value) => setValue("estado", value as CasoSACBasicoFormData["estado"])}
                >
                  <SelectTrigger className={errors.estado ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-sm text-red-500">{errors.estado.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/sac">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Caso
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
