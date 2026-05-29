"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { isAuthenticated, isAdmin, logout, getCurrentUser } from "@/lib/auth"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Gestionar Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    name: "Instituciones Educativas",
    href: "/admin/instituciones",
    icon: Building2,
  },
  {
    name: "Configuracion",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    // Verificar autenticación y rol de administrador
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    if (!isAdmin()) {
      router.push("/")
      return
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Cargando panel de administracion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Solo le enviamos la instrucción "admin" */}
      <Sidebar type="admin" />
      
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0">
        <div className="h-full p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}