"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { loginSchema, type LoginFormData } from "@/lib/validations"
import { login, generateCaptcha, validateCaptcha, isAuthenticated, getCurrentUserRole } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    // Verificar si ya está autenticado y redirigir según rol
    if (isAuthenticated()) {
      const rol = getCurrentUserRole()
      if (rol === "ADMINISTRADOR") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
    // Generar CAPTCHA inicial
    refreshCaptcha()
  }, [router])

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha()
    setCaptcha(newCaptcha)
    setValue("captcha", "")
  }

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    setIsLoading(true)

    // Validar CAPTCHA
    if (!validateCaptcha(data.captcha, captcha.answer)) {
      setError("Respuesta del CAPTCHA incorrecta")
      refreshCaptcha()
      setIsLoading(false)
      return
    }

    // Intentar login
    const result = login(data.email, data.password)

    if (result.success && result.user) {
      // Redirigir según el rol del usuario
      if (result.user.rol === "ADMINISTRADOR") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } else {
      setError(result.error || "Error al iniciar sesion")
      refreshCaptcha()
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Image
              src="/images/logo-puce.png"
              alt="Logo PUCE"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">PUCE</CardTitle>
            <CardDescription className="text-slate-600">
              Plataforma Unificada de Convivencia Escolar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha">Verificación de Seguridad</Label>
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-3">
                <span className="flex-1 text-sm font-medium text-slate-700">{captcha.question}</span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-slate-500 hover:text-slate-700"
                  title="Generar nueva pregunta"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Tu respuesta"
                {...register("captcha")}
                className={errors.captcha ? "border-red-500" : ""}
              />
              {errors.captcha && <p className="text-sm text-red-500">{errors.captcha.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/recuperar-contrasena"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500 mb-2">
              Credenciales de prueba:
            </p>
            <p className="text-xs text-center text-slate-500">
              Admin: admin@puce.edu.co / admin123
            </p>
            <p className="text-xs text-center text-slate-500">
              Lider: lider@puce.edu.co / lider123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
