"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, isAdmin } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/sidebar"

const AdminSidebar = Sidebar as unknown as React.ComponentType<{
  type: "admin"
  isCollapsed: boolean
}>

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push("/login")
      return
    }
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    const date = new Date()
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    setCurrentDate(`${days[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar type="admin" isCollapsed={isCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              Plataforma Unificada de Convivencia Escolar
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            {currentDate}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}