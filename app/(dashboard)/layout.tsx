"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { isAuthenticated, isAdmin } from "@/lib/auth"
import { seedDemoData } from "@/lib/storage"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Si es administrador, redirigir al panel de admin
    if (isAdmin()) {
      router.push("/admin")
      return
    }

    // Sembrar datos de demostración
    seedDemoData()

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      {/* Main content */}
      <main className="lg:pl-64">
        {/* Mobile header spacing */}
        <div className="h-16 lg:hidden" />
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
