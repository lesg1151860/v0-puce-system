"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Separator } from "@/components/ui/separator"

import { casoSACExtendidoSchema, type CasoSACExtendidoFormData } from "@/lib/validations"
import { getCaseSAC, updateCaseSAC } from "@/lib/storage"
import type { CasoSAC } from "@/lib/types"

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

const estados = ["Nuevo", "En Seguimiento", "Resuelto"] as const

export default function EditarCasoSACPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [caso, setCaso] = useState<CasoSAC | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CasoSACExtendidoFormData>({
    resolver: zodResolver(casoSACExtendidoSchema),
  })

  useEffect(() => {
    const data = getCaseSAC(id)
    if (data) {
      setCaso(data)
      // Reset form with existing data
      reset({
        radicado: data.radicado,
        ciudadano: data.ciudadano,
        fechaRadicacion: data.fechaRadicacion,
        rol: data.rol,
        estado: data.estado,
        trasladoIE: data.trasladoIE || "",
        radicadoExterna: data.radicadoExterna || "",
        respondido: data.respondido || "",
        prorroga: data.prorroga || "",
        fechaNuevaProrroga: data.fechaNuevaProrroga || "",
        radicadoProrroga: data.radicadoProrroga || "",
        contestacionIE: data.contestacionIE || "",
        radicadoContestacion: data.radicadoContestacion || "",
        estudiante: data.estudiante || "",
        institucionContraQuienSeDirige: data.institucionContraQuienSeDirige || "",
        situacion: data.situacion || "",
        sacRespuesta: data.sacRespuesta || "",
      })
    } else {
      setNotFound(true)
    }
  }, [id, reset])

  const onSubmit = async (data: CasoSACExtendidoFormData) => {
    setError("")
    setIsLoading(true)

    try {
      updateCaseSAC(id, data)
      router.push("/sac")
    } catch (err) {
      setError("Error al actualizar el caso. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Caso no encontrado</h2>
        <p className="text-slate-600 mb-4">El caso que buscas no existe o fue eliminado.</p>
        <Link href="/sac">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </Link>
      </div>
    )
  }

  if (!caso) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
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
          <h1 className="text-2xl font-bold text-slate-900">Editar Caso SAC</h1>
          <p className="text-slate-600">Radicado: {caso.radicado}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del caso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado *</Label>
                <Input
                  id="radicado"
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
                  {...register("ciudadano")}
                  className={errors.ciudadano ? "border-red-500" : ""}
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
                <Select
                  defaultValue={caso.rol}
                  onValueChange={(value) => setValue("rol", value as CasoSACExtendidoFormData["rol"])}
                >
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
                  defaultValue={caso.estado}
                  onValueChange={(value) => setValue("estado", value as CasoSACExtendidoFormData["estado"])}
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

              <div className="space-y-2">
                <Label htmlFor="estudiante">Estudiante</Label>
                <Input
                  id="estudiante"
                  placeholder="Nombre del estudiante involucrado"
                  {...register("estudiante")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traslado y Radicados */}
        <Card>
          <CardHeader>
            <CardTitle>Traslado y Radicados</CardTitle>
            <CardDescription>Información de traslado y documentos asociados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="trasladoIE">Traslado a I.E.</Label>
                <Input
                  id="trasladoIE"
                  placeholder="Institución educativa de traslado"
                  {...register("trasladoIE")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radicadoExterna">Radicado Externa</Label>
                <Input
                  id="radicadoExterna"
                  placeholder="Número de radicado externo"
                  {...register("radicadoExterna")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="respondido">Respondido</Label>
                <Input
                  id="respondido"
                  placeholder="Estado de respuesta"
                  {...register("respondido")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucionContraQuienSeDirige">Institución Contra Quien se Dirige</Label>
                <Input
                  id="institucionContraQuienSeDirige"
                  placeholder="Nombre de la institución"
                  {...register("institucionContraQuienSeDirige")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prórroga */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Prórroga</CardTitle>
            <CardDescription>Datos relacionados con prórrogas del caso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="prorroga">Prórroga</Label>
                <Input
                  id="prorroga"
                  placeholder="Descripción de prórroga"
                  {...register("prorroga")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNuevaProrroga">Fecha Nueva Prórroga</Label>
                <Input
                  id="fechaNuevaProrroga"
                  type="date"
                  {...register("fechaNuevaProrroga")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radicadoProrroga">Radicado Prórroga</Label>
                <Input
                  id="radicadoProrroga"
                  placeholder="Número de radicado de prórroga"
                  {...register("radicadoProrroga")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contestación */}
        <Card>
          <CardHeader>
            <CardTitle>Contestación I.E.</CardTitle>
            <CardDescription>Información de contestación de la institución educativa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contestacionIE">Contestación I.E.</Label>
                <Input
                  id="contestacionIE"
                  placeholder="Descripción de la contestación"
                  {...register("contestacionIE")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radicadoContestacion">Radicado Contestación</Label>
                <Input
                  id="radicadoContestacion"
                  placeholder="Número de radicado de contestación"
                  {...register("radicadoContestacion")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Situación y Respuesta */}
        <Card>
          <CardHeader>
            <CardTitle>Situación y Respuesta</CardTitle>
            <CardDescription>Descripción detallada del caso y respuesta del SAC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="situacion">Situación</Label>
                <Textarea
                  id="situacion"
                  placeholder="Descripción detallada de la situación..."
                  rows={4}
                  {...register("situacion")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sacRespuesta">SAC Respuesta</Label>
                <Textarea
                  id="sacRespuesta"
                  placeholder="Respuesta oficial del SAC..."
                  rows={4}
                  {...register("sacRespuesta")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
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
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
