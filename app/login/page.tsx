"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ShieldCheck, Eye, EyeOff, RefreshCw, Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { loginSchema, type LoginFormData } from "@/lib/validations"
import { generateCaptcha, validateCaptcha } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import { loginWithCredentials } from "@/lib/auth-actions"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 })
  const [error, setError] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Verificar errores de OAuth en la URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (errorParam && messageParam) {
      setError(decodeURIComponent(messageParam))
    }
  }, [searchParams])

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
            `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion con Google")
      setIsGoogleLoading(false)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    setRemainingAttempts(null)
    setIsLoading(true)

    // RF02: Validar campos no vacios (ya validado por el schema)
    if (!data.email?.trim() || !data.password?.trim()) {
      setError("Todos los campos son obligatorios.")
      setIsLoading(false)
      return
    }

    // Validar CAPTCHA
    if (!validateCaptcha(data.captcha, captcha.answer)) {
      setError("Respuesta del CAPTCHA incorrecta")
      refreshCaptcha()
      setIsLoading(false)
      return
    }

    try {
      // RF01, RF03, RF05: Login con control de intentos y mensajes seguros
      const result = await loginWithCredentials(data.email, data.password)

      if (!result.success) {
        setError(result.error || "Error al iniciar sesion")
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts)
        }
        refreshCaptcha()
        setIsLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      // RF03: Mensaje generico por seguridad
      setError("Credenciales incorrectas. Por favor verifique sus datos.")
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">SICE</CardTitle>
            <CardDescription className="text-slate-600">
              Sistema de Informacion de Convivencia Escolar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Boton de Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? "Conectando..." : "Continuar con Google"}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">O continua con correo</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {remainingAttempts !== null && remainingAttempts > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Intentos restantes: {remainingAttempts}. Despues de 3 intentos fallidos su cuenta sera bloqueada temporalmente.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electronico</Label>
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
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contrasena"
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
              <Label htmlFor="captcha">Verificacion de Seguridad</Label>
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
                  Iniciando sesion...
                </>
              ) : (
                "Iniciar Sesion"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/recuperar-contrasena"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Olvidaste tu contrasena?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
