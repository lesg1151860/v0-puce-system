"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { loginSchema, type LoginFormData } from "@/lib/validations"
import { generateCaptcha, validateCaptcha } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormData>({
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

  const onSubmit = async (form_data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form_data.username,
          password: form_data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        document.cookie = `access_token=${result.access}; path=/; max-age=86400; SameSite=Lax;`
        document.cookie = `refresh_token=${result.refresh}; path=/; max-age=604800; SameSite=Lax;`

        localStorage.setItem("access_token", result.access)
        if (result.refresh) {
          localStorage.setItem("refresh_token", result.refresh)
        }

        const userData = result.usuario || result.user || { 
          username: form_data.username,
          first_name: result.first_name || "",
          last_name: result.last_name || ""
        }
        localStorage.setItem("user", JSON.stringify(userData))

        const finalRole = (result.role || result.rol || (form_data.username.toLowerCase().includes("admin") ? "ADMINISTRADOR" : "LIDER")).toUpperCase()
        document.cookie = `user_role=${finalRole}; path=/; max-age=86400; SameSite=Lax;`
        localStorage.setItem("user_role", finalRole) 

        if (finalRole.includes("LIDER")) {
          window.location.href = "/lider"
        } else {
          window.location.href = "/administrador"
        }
      } else {
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Error de conexión con el backend.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Image src="/images/logo-puce.png" alt="Logo PUCE" width={80} height={80} priority className="rounded-full" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">PUCE</CardTitle>
            <CardDescription>Plataforma Unificada de Convivencia Escolar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" type="text" {...register("username")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="captcha">{captcha.question}</Label>
              <Input id="captcha" type="text" {...register("captcha")} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 animate-spin" /> Accediendo...</> : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}