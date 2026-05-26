"use client"

import { useState, useEffect } from "react"
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
import { generateCaptcha, validateCaptcha } from "@/lib/auth"

export default function LoginPage() {
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

  // Generamos el CAPTCHA al cargar, sin verificaciones de sesión aquí para evitar bucles
  useEffect(() => {
    refreshCaptcha()
  }, [])

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha()
    setCaptcha(newCaptcha)
    setValue("captcha", "")
  }

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    setIsLoading(true)

    if (!validateCaptcha(data.captcha, captcha.answer)) {
      setError("Respuesta del CAPTCHA incorrecta")
      refreshCaptcha()
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.email, 
          password: data.password,
        }),
      })

      const result = await response.json()
      console.log("JSON completo recibido de Django:", result) // Diagnóstico para ver F12

      if (response.ok) {
        // 1. Guardar los tokens en cookies con rutas explícitas
        document.cookie = `access_token=${result.access}; path=/; max-age=86400; SameSite=Lax;`
        document.cookie = `refresh_token=${result.refresh}; path=/; max-age=604800; SameSite=Lax;`
        
        // 2. Extracción ultra-segura del rol (por si viene de Django o usamos el fallback del email)
        const rawRole = result.role || result.rol || result.user?.role || result.user?.rol || (data.email.includes("admin") ? "ADMINISTRADOR" : "LIDER")
        
        // Normalizar: quitar tildes, pasar a mayúsculas y remover espacios
        const userRole = String(rawRole)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
          .trim()

        // Guardamos el rol limpio en la cookie
        document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax;`
        
        // 3. Redirección limpia (Hard Navigation) condicionada por el rol
        if (userRole === "LIDER") {
          window.location.replace("/lider")
        } else if (userRole === "ADMINISTRADOR") {
          window.location.replace("/admin")
        } else {
          setError(`El servidor devolvió un rol no configurado: "${rawRole}"`)
          setIsLoading(false)
          return
        }
      } else {
        setError("Usuario o contraseña incorrectos")
        refreshCaptcha()
      }
    } catch (err) {
      console.error("Error conectando con el servidor:", err)
      setError("Error de conexión con el servidor backend")
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
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
              priority
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
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                type="text"
                placeholder="Tu nombre de usuario"
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
              Credenciales requeridas:
            </p>
            <p className="text-xs text-center text-slate-500">
              Usa un usuario registrado en tu base de datos de Django
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}