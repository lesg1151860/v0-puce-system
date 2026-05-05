"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  adminOnly?: boolean
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "SAC",
    href: "/sac",
    icon: FileText,
    description: "Sistema de Atencion al Ciudadano",
  },
  {
    name: "SIUCE",
    href: "/siuce",
    icon: FileText,
    description: "Sistema de Informacion Unificado de Convivencia Escolar",
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: FileSpreadsheet,
    description: "Generacion de Reportes Excel",
  },
  {
    name: "Usuarios",
    href: "/usuarios",
    icon: Users,
    description: "Gestion de Usuarios del Sistema",
    adminOnly: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserEmail(user.email || null)
        
        // Verificar si es admin en system_users
        const { data: systemUser } = await supabase
          .from("system_users")
          .select("rol")
          .eq("auth_user_id", user.id)
          .single()
        
        if (systemUser?.rol === "ADMINISTRADOR") {
          setIsAdmin(true)
        }
      }
    }
    
    checkUserRole()
  }, [])

  // RF04: Cierre de sesion seguro
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // Filtrar items de navegacion segun rol
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false
    }
    return true
  })

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold text-slate-900">PUCE</span>
          <p className="text-xs text-slate-500 leading-tight">Plataforma Unificada de Seguimiento Educativo.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                )}
              />
              <div className="flex flex-col">
                <span>{item.name}</span>
                {item.description && (
                  <span className="text-xs font-normal text-slate-500">{item.description}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout Button */}
      <div className="border-t border-slate-200 p-3 space-y-2">
        {userEmail && (
          <div className="px-3 py-2 text-xs text-slate-500 truncate">
            {userEmail}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-slate-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesion
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          className="text-slate-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="ml-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">SICE</span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <SidebarContent />
      </aside>
    </>
  )
}
