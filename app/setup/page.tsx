"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react"

export default function SetupPage() {
  const [adminKey, setAdminKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{ email: string; success: boolean; message: string; password?: string }[]>([])
  const [error, setError] = useState("")

  const handleCreateUsers = async () => {
    if (!adminKey) {
      setError("Por favor ingrese la clave de administrador")
      return
    }

    setError("")
    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/admin/create-auth-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear usuarios")
        return
      }

      setResults(data.results || [])
    } catch (err) {
      setError("Error de conexion. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <ShieldCheck className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Configuracion Inicial del Sistema</h1>
          <p className="text-slate-600 mt-2">Configure las cuentas de autenticacion para los usuarios del sistema</p>
        </div>

        {/* Paso 1: Crear usuarios de autenticacion */}
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Crear Cuentas de Autenticacion</CardTitle>
            <CardDescription>
              Este proceso creara las cuentas de autenticacion en Supabase para los usuarios pre-registrados en el sistema.
              Cada usuario recibira una contrasena temporal que debera cambiar en su primer inicio de sesion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Clave de Administrador (ADMIN_SECRET_KEY)</Label>
              <Input
                id="adminKey"
                type="password"
                placeholder="Ingrese la clave de administrador"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Esta es la clave configurada en las variables de entorno del proyecto.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleCreateUsers} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando usuarios...
                </>
              ) : (
                "Crear Cuentas de Autenticacion"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3 mt-4">
                <h3 className="font-semibold text-slate-900">Resultados:</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{result.email}</p>
                        <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                          {result.message}
                        </p>
                        {result.success && result.password && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs text-slate-500 mb-1">Contrasena temporal:</p>
                            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                              {result.password}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paso 2: Configurar Google OAuth */}
        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Configurar Google OAuth (Opcional)</CardTitle>
            <CardDescription>
              Para habilitar el inicio de sesion con Google, siga estos pasos en la consola de Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-semibold mb-2">1. Crear credenciales en Google Cloud Console</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Vaya a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Cloud Console - Credentials</a></li>
                  <li>Cree un nuevo proyecto o seleccione uno existente</li>
                  <li>Haga clic en &quot;Create Credentials&quot; y seleccione &quot;OAuth client ID&quot;</li>
                  <li>Seleccione &quot;Web application&quot; como tipo de aplicacion</li>
                  <li>Agregue los origenes autorizados de JavaScript y URIs de redireccion</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-semibold mb-2">2. Configurar en Supabase</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Vaya al Dashboard de Supabase de su proyecto</li>
                  <li>Navegue a Authentication &gt; Providers</li>
                  <li>Habilite el proveedor de Google</li>
                  <li>Ingrese el Client ID y Client Secret de Google</li>
                  <li>Copie la URL de callback y agreguela en Google Cloud Console</li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold mb-2 text-amber-800">Importante</h4>
                <p className="text-amber-700">
                  Solo los usuarios pre-registrados en la tabla system_users podran iniciar sesion con Google.
                  Si un correo no esta registrado, se mostrara un mensaje de error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credenciales de prueba */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciales del Sistema</CardTitle>
            <CardDescription>
              Una vez creadas las cuentas, los usuarios pueden iniciar sesion con estas credenciales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">Rol</th>
                    <th className="text-left py-2 px-4 font-semibold">Correo</th>
                    <th className="text-left py-2 px-4 font-semibold">Contrasena Temporal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                        ADMINISTRADOR
                      </span>
                    </td>
                    <td className="py-2 px-4">ls.solutions14@gmail.com</td>
                    <td className="py-2 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">Admin2024*</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        LIDER
                      </span>
                    </td>
                    <td className="py-2 px-4">luiseduardosg@ufps.edu.co</td>
                    <td className="py-2 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">Lider2024*</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * Las contrasenas seran generadas al ejecutar el Paso 1. Las mostradas aqui son las predeterminadas.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <a 
            href="/login" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Ir a la pagina de inicio de sesion →
          </a>
        </div>
      </div>
    </div>
  )
}
