"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, isAdmin, logout } from "@/lib/auth"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Building2,
} from "lucide-react"

// Rutas actualizadas para coincidir con tu carpeta "administrador"
const navigation = [
  { name: "Dashboard", href: "/administrador", icon: LayoutDashboard },
  { name: "Gestionar Usuarios", href: "/administrador/usuarios", icon: Users },
  { name: "Instituciones", href: "/administrador/instituciones", icon: Building2 },
  { name: "Configuración", href: "/administrador/configuracion", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Verificación de autenticación al cargar el layout
    const checkAccess = () => {
      // Si no está autenticado o no es admin, enviamos al login
      if (!isAuthenticated() || !isAdmin()) {
        console.log("-> Layout: Acceso denegado, redirigiendo a login")
        router.push("/login")
        return
      }
      // Si todo está bien, permitimos que cargue
      setIsLoading(false)
    }

    checkAccess()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

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
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r fixed inset-y-0 left-0 hidden lg:block">
        <div className="p-6 font-bold text-xl text-blue-900">PUCE Admin</div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </a>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-10"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      
      {/* Contenido Principal */}
      <main className="flex-1 lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}