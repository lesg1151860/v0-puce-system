"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, isAdmin } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/sidebar" // 1. Importamos el componente unificado

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificación de autenticación al cargar el layout
    const checkAccess = () => {
      // Si no está autenticado o no es admin, enviamos al login
      if (!isAuthenticated() || !isAdmin()) {
        console.log("-> Layout: Acceso denegado, redirigiendo a login")
        router.push("/login")
        return
      }
      setIsLoading(false)
    }

    checkAccess()
  }, [router])

  // Pantalla de carga para evitar parpadeos
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Validando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 2. AQUÍ USAMOS EL COMPONENTE REUTILIZABLE */}
      {/* Al pasarle type="admin", el componente cargará automáticamente los enlaces de administración */}
      <Sidebar type="admin" />
      
      {/* Contenido Principal */}
      <main className="flex-1 lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}