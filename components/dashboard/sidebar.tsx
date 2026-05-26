"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { 
  LogOut, Menu, X, LayoutDashboard, FileText, 
  FileSpreadsheet, ShieldCheck, Users, Settings 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Definimos los menús de forma segura en el Cliente
const liderLinks = [
  { name: "Dashboard", href: "/lider", icon: LayoutDashboard },
  { name: "SAC", href: "/lider/sac", icon: FileText, description: "Sistema de Atención al Ciudadano" },
  { name: "SIUCE", href: "/lider/siuce", icon: ShieldCheck, description: "Información de Convivencia" },
  { name: "Reportes", href: "/lider/reportes", icon: FileSpreadsheet, description: "Generación de Reportes Excel" },
]

const adminLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, description: "Gestión de cuentas y roles" },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings, description: "Ajustes globales del sistema" },
]

// El Sidebar ahora solo recibe una palabra: "lider" o "admin"
interface SidebarProps {
  type: "lider" | "admin"
}

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Seleccionamos el menú correcto basado en la propiedad
  const links = type === "lider" ? liderLinks : adminLinks

  const handleLogout = () => {
    document.cookie = "access_token=; path=/; max-age=0"
    document.cookie = "refresh_token=; path=/; max-age=0"
    document.cookie = "user_role=; path=/; max-age=0"
    window.location.replace("/login")
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <Image
          src="/images/logo-puce.png"
          alt="Logo PUCE"
          width={56}
          height={56}
          className="rounded-full"
        />
        <div>
          <span className="text-lg font-bold text-slate-900">PUCE</span>
          <p className="text-xs text-slate-500 leading-tight">Plataforma Unificada de Convivencia Escolar</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((item) => {
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

      <div className="border-t border-slate-200 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-slate-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Vista Móvil Superior */}
      <div className="fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          className="text-slate-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="ml-4 flex items-center gap-2">
          <Image src="/images/logo-puce.png"
          alt="Logo PUCE"
          width={32}
          height={32}
          priority
          className="rounded-full" />
          <span className="font-bold text-slate-900">PUCE</span>
        </div>
      </div>

      {/* Fondo oscuro móvil */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Menú Lateral Móvil */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Menú Lateral Escritorio */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <SidebarContent />
      </aside>
    </>
  )
}