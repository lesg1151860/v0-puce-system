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
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-orange-600 to-orange-700 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-orange-500/30 mt-2">
            <Image
              src="/images/logo-puce.png"
              alt="Logo PUCE"
              width={56}
              height={56}
              className="rounded-full bg-white p-1"
            />
            <div>
              <span className="text-lg font-bold text-white">PUCE Admin</span>
              <p className="text-xs text-orange-200 leading-tight">Panel de Administracion</p>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? "bg-orange-500 text-white"
                            : "text-orange-100 hover:text-white hover:bg-orange-500/50",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Usuario y Logout */}
              <li className="mt-auto">
                <div className="flex flex-col gap-2 border-t border-orange-500/30 pt-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                      <p className="text-xs text-orange-200 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2 text-orange-100 hover:text-white hover:bg-orange-500/50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesion
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Header Mobile */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-orange-600 px-4 py-4 shadow-sm lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-orange-100"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <Image
            src="/images/logo-puce.png"
            alt="Logo PUCE"
            width={32}
            height={32}
            className="rounded-full bg-white p-0.5"
          />
          <span className="text-lg font-semibold text-white">PUCE Admin</span>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-gradient-to-b from-orange-600 to-orange-700 px-6 py-4">
            <div className="flex items-center justify-between border-b border-orange-500/30 pb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo-puce.png"
                  alt="Logo PUCE"
                  width={40}
                  height={40}
                  className="rounded-full bg-white p-0.5"
                />
                <span className="text-lg font-bold text-white">PUCE Admin</span>
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-orange-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        pathname === item.href
                          ? "bg-orange-500 text-white"
                          : "text-orange-100 hover:text-white hover:bg-orange-500/50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="absolute bottom-4 left-6 right-6">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-orange-100 hover:text-white hover:bg-orange-500/50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
