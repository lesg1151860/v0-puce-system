"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { LogOut, Menu, X, LayoutDashboard, FileText, FileSpreadsheet, Users, Settings, Building, ChevronDown, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SubItem = {
  name: string
  href: string
}

type NavItem = {
  name: string
  href: string
  icon: any
  description?: string
  subItems?: SubItem[]
}

const liderLinks: NavItem[] = [
  { name: "Dashboard", href: "/lider", icon: LayoutDashboard },
  { name: "SAC", href: "/lider/sac", icon: FileText, description: "Sistema de Atención al Ciudadano" },
  { name: "SIUCE", href: "/lider/siuce", icon: FileText, description: "Sistema de Información Unificado de Convivencia Escolar" },
  { name: "Reportes", href: "/lider/reportes", icon: FileSpreadsheet, description: "Generación de Reportes Excel" },
]

const adminLinks: NavItem[] = [
  { name: "Dashboard", href: "/administrador", icon: LayoutDashboard },
  { name: "Usuarios", href: "/administrador/usuarios", icon: Users, description: "Gestión de usuarios y permisos" },
  { name: "Instituciones", href: "/administrador/instituciones", icon: Building, description: "Gestión de Instituciones Educativas" },
  { name: "Clasificación de Casos", href: "/administrador/clasificacion_caso", icon: Settings, description: "Configura la clasificación de casos"},
  { 
    name: "Gestión para SAC", 
    href: "/administrador/sac", 
    icon: FileText,
    description: "Configuración de parámetros para el SAC",
    subItems: [
      { name: "Gestión Rol del Ciudadano", href: "/administrador/gestion_sac/rol_ciudadano" },
      { name: "Gestión Estados del SAC", href: "/administrador/gestion_sac/estados_sac" },
      { name: "Gestión Respuestas SAC", href: "/administrador/gestion_sac/respuestas_sac" },
    ]
  },
  { 
    name: "Gestión para SIUCE", 
    href: "/administrador/siuce", 
    icon: FileText,
    description: "Configuración de parámetros para el SIUCE",
    subItems: [
      { name: "Tipo de Identificación", href: "/administrador/gestion_siuce/tipo_identificacion" },
      { name: "Estado del SIUCE", href: "/administrador/gestion_siuce/estado_siuce" },
      { name: "Grado de Escolaridad", href: "/administrador/gestion_siuce/grado_escolaridad" },
      { name: "Tipos de Daño", href: "/administrador/gestion_siuce/tipos_dano" },
      { name: "Tipos de Agresión", href: "/administrador/gestion_siuce/tipos_agresion" },
      { name: "Evento Generador", href: "/administrador/gestion_siuce/evento_generador" },
      { name: "Rol Agresor", href: "/administrador/gestion_siuce/rol_agresor" },
      { name: "Lugar de los Hechos", href: "/administrador/gestion_siuce/lugar_hechos" },
      { name: "Acciones de la I.E.", href: "/administrador/gestion_siuce/acciones_ie" },
      { name: "Acciones de la S.E.M.", href: "/administrador/gestion_siuce/acciones_sem" },
    ]
  },
]

interface SidebarProps {
  type: "lider" | "admin"
  isCollapsed?: boolean
}

export function Sidebar({ type, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null) 
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed)
  const links = type === "lider" ? liderLinks : adminLinks

  useEffect(() => {
    setLocalCollapsed(isCollapsed)
  }, [isCollapsed])

  useEffect(() => {
    const handleToggle = () => {
      setLocalCollapsed((prev) => {
        const isNowCollapsed = !prev;
        const mainContent = document.querySelector('main');
        if (mainContent) {
          if (isNowCollapsed) {
            mainContent.classList.remove('lg:pl-64');
            mainContent.classList.add('lg:pl-20');
          } else {
            mainContent.classList.remove('lg:pl-20');
            mainContent.classList.add('lg:pl-64');
          }
        }
        return isNowCollapsed;
      });
    }
    window.addEventListener("toggle-sidebar", handleToggle)
    return () => window.removeEventListener("toggle-sidebar", handleToggle)
  }, [])

  const handleLogout = () => {
    document.cookie = "access_token=; path=/; max-age=0"
    document.cookie = "refresh_token=; path=/; max-age=0"
    document.cookie = "user_role=; path=/; max-age=0"
    window.location.replace("/login")
  }

  const isItemActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href) || pathname.startsWith(item.href);
    }
    if (item.href === "/administrador" || item.href === "/lider") {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  }

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn(
        "flex h-16 shrink-0 items-center border-b border-slate-200 transition-all duration-300",
        localCollapsed ? "justify-center px-0" : "gap-3 px-4"
      )}>
        <Image
          src="/images/logo-puce.png"
          alt="Logo PUCE"
          width={localCollapsed ? 40 : 48}
          height={localCollapsed ? 40 : 48}
          className="rounded-full shrink-0 transition-all duration-300"
        />
        {!localCollapsed && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden animate-none">
            <span className="text-lg font-bold text-slate-900 leading-tight">PUCE</span>
            <span className="text-[10px] text-slate-500 leading-tight">Plataforma Unificada de</span>
            <span className="text-[10px] text-slate-500 leading-tight">Convivencia Escolar</span>
          </div>
        )}
      </div>

      <nav className={cn(
        "flex-1 space-y-1 px-3 py-4",
        localCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"
      )}>
        {links.map((item) => {
          const active = isItemActive(item)
          
          if (item.subItems) {
            const isOpen = openMenu === item.name
            
            return (
              <div key={item.name} className={cn("flex flex-col space-y-1", localCollapsed && "relative group")}>
                
                <button
                  type="button"
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "flex items-center justify-between rounded-lg py-2.5 text-sm font-medium transition-all duration-200 w-full",
                    localCollapsed ? "justify-center px-0" : "px-3",
                    active 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-700 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white"
                  )}
                >
                  <div className={cn("flex items-center gap-3", localCollapsed && "justify-center w-full")}>
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors", 
                      active ? "text-white" : "text-slate-500 group-hover:text-white"
                    )} />
                    {!localCollapsed && <span>{item.name}</span>}
                  </div>
                  {!localCollapsed && (
                    isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {!localCollapsed && isOpen && (
                  <div className="mt-1 flex flex-col bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                    {item.subItems.map((sub) => {
                      const subActive = pathname === sub.href
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors border-b border-slate-100 last:border-0",
                            subActive 
                              ? "text-blue-700 bg-blue-50 font-semibold" 
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                          )}
                        >
                          <Circle className={cn("h-2 w-2", subActive ? "fill-blue-600 text-blue-600" : "stroke-[3px]")} />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {localCollapsed && (
                  <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-[999]">
                    <div className="w-60 rounded-md bg-white shadow-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      </div>
                      <div className="py-2 flex flex-col">
                        {item.subItems.map((sub) => {
                          const subActive = pathname === sub.href
                          return (
                            <Link key={sub.name} href={sub.href} className={cn(
                                "flex items-center gap-3 px-4 py-2 text-[13px] transition-colors",
                                subActive ? "text-blue-700 bg-blue-50 font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}>
                              <Circle className={cn("h-2.5 w-2.5", subActive ? "fill-blue-600 text-blue-600" : "stroke-[2px]")} />
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
                setOpenMenu(null);
              }}
              className={cn(
                "group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                localCollapsed ? "justify-center px-0" : "gap-3 px-3",
                active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-600 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
              
              {!localCollapsed && (
                <div className="flex flex-col whitespace-nowrap overflow-hidden">
                  <span>{item.name}</span>
                  {item.description && (
                    <span className={cn("text-xs font-normal truncate", active ? "text-blue-100" : "text-slate-500 group-hover:text-blue-100")}>
                      {item.description}
                    </span>
                  )}
                </div>
              )}
              {localCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-[1000] pointer-events-none">
                  <div className="bg-slate-800 text-white text-[13px] px-3 py-1.5 rounded-md shadow-md flex flex-col whitespace-nowrap">
                    <span className="font-semibold">{item.name}</span>
                    {item.description && (
                      <span className="text-[10px] text-slate-300 font-normal mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 shrink-0 relative group">
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          className={cn(
            "w-full text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all", 
            localCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          <LogOut className={cn("h-5 w-5 shrink-0", !localCollapsed && "mr-3")} />
          {!localCollapsed && <span>Cerrar Sesión</span>}
        </Button>

        {localCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-0 hidden group-hover:block z-[1000] pointer-events-none">
            <div className="bg-slate-800 text-white text-[13px] font-semibold px-3 py-1.5 rounded-md shadow-md whitespace-nowrap">
              Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white px-4 lg:hidden">
        <button type="button" className="text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform lg:hidden", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>{sidebarContent}</aside>
      <aside className={cn("hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white transition-all duration-300 ease-in-out z-20", localCollapsed ? 'w-20' : 'w-64')}>{sidebarContent}</aside>
    </>
  )
}