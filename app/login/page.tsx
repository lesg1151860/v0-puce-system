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
import { generateCaptcha, validateCaptcha } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter() // Hook declarado correctamente dentro del componente

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
    refreshCaptcha()
  }, [])

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha()
    setCaptcha(newCaptcha)
    setValue("captcha", "")
  }

  const onSubmit = async (data: LoginFormData) => {
    console.log("-> Iniciando proceso de login...")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      })

      const result = await response.json()
      console.log("-> Respuesta del servidor:", result)

      if (response.ok) {
        // Guardar tokens y rol en cookies
        document.cookie = `access_token=${result.access}; path=/; max-age=86400; SameSite=Lax;`
        document.cookie = `refresh_token=${result.refresh}; path=/; max-age=604800; SameSite=Lax;`

        const rawRole = result.role || result.rol || result.user?.role || result.user?.rol || ""
        const finalRole = (rawRole || (data.username.toLowerCase().includes("admin") ? "ADMINISTRADOR" : "LIDER")).toUpperCase()

        console.log("-> Rol final detectado:", finalRole)
        document.cookie = `user_role=${finalRole}; path=/; max-age=86400; SameSite=Lax;`

        // Redirección usando router.push de next/navigation
        console.log("-> Intentando navegar a:", finalRole);

        if (finalRole.includes("LIDER")) {
          window.location.href = "/lider"; // Fuerza navegación clásica
        } else if (finalRole.includes("ADMINISTRADOR")) {
          window.location.href = "/administrador"; // Fuerza navegación clásica
        } else {
          setError(`Error: Rol "${finalRole}" no configurado.`)
          setIsLoading(false)
        }
      } else {
        setError("Usuario o contraseña incorrectos")
        refreshCaptcha()
        setIsLoading(false)
      }
    } catch (err) {
      console.error("-> Error de conexión:", err)
      setError("Error de conexión con el backend.")
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
            <CardDescription>Plataforma Unificada de Convivencia Escolar</CardDescription>
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
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" type="text" placeholder="Tu usuario" {...register("username")} />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha">{captcha.question}</Label>
              <Input id="captcha" type="text" placeholder="Respuesta" {...register("captcha")} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Accediendo...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}