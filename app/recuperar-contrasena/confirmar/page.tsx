"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi } from "@/lib/api"

const confirmPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>

function ConfirmarContrasenaForm() {
  const searchParams = useSearchParams()
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ConfirmPasswordFormData>({
    resolver: zodResolver(confirmPasswordSchema),
  })

  const onSubmit = async (data: ConfirmPasswordFormData) => {
    setIsLoading(true)
    setError("")

    if (!uid || !token) {
      setError("El enlace de recuperación es inválido o está incompleto.")
      setIsLoading(false)
      return
    }

    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        new_password: data.password,
      })
      
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error de conexión con el servidor. Intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enlace de recuperación inválido. Faltan parámetros de seguridad.
          </AlertDescription>
        </Alert>
        <Link href="/recuperar-contrasena">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Solicitar nuevo enlace
          </Button>
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">¡Contraseña Actualizada!</h3>
          <p className="text-slate-600">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes acceder a la plataforma.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Ir a Iniciar Sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Campo: Nueva Contraseña */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
      </div>

      {/* Campo: Confirmar Contraseña */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
        ) : (
          "Guardar Nueva Contraseña"
        )}
      </Button>
    </form>
  )
}

export default function ConfirmarContrasenaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Image
              src="/images/logo-puce.png"
              alt="Logo PUCE"
              width={80}
              height={80}
              priority
              className="rounded-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Crear Nueva Contraseña</CardTitle>
            <CardDescription className="text-slate-600">
              Ingresa tu nueva contraseña para acceder a la Plataforma Unificada de Convivencia Escolar
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Suspense fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }>
            <ConfirmarContrasenaForm />
          </Suspense>
        </CardContent>
        
      </Card>
    </div>
  )
}