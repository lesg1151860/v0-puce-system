"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, ShieldCheck, UserCheck, School, Lock } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function DashboardAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [dataUsuarios, dataInstituciones] = await Promise.all([
          api.getUsuarios(),
          api.obtenerInstituciones()
        ]);
        
        setUsuarios(dataUsuarios);
        setInstituciones(dataInstituciones);
      } catch (error) {
        toast.error("Error cargando dashboard:" + (error instanceof Error ? error.message : "Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [])

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Cargando panel de control...</div>

  // Cálculos de Usuarios
  const totalUsuarios = usuarios.length
  const admins = usuarios.filter((u: any) => u.is_staff).length 
  const lideres = totalUsuarios - admins

  // Cálculos de Instituciones
  const totalInst = instituciones.length
  const publicas = instituciones.filter((i: any) => i.sector === "PUBLICA").length
  const privadas = instituciones.filter((i: any) => i.sector === "PRIVADA").length

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500">
          Bienvenido al sistema de administración PUCE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta Usuarios */}
        <Link href="/administrador/usuarios" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-blue-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Gestión de Usuarios</CardTitle>
              <Users className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-4">{totalUsuarios}</div>
              <div className="flex gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Admin: {admins}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-slate-600">Líder: {lideres}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Instituciones */}
        <Link href="/administrador/instituciones" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-orange-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Instituciones Educativas</CardTitle>
              <Building2 className="h-6 w-6 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-900 mb-4">{totalInst}</div>
              <div className="flex gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-slate-600">Públicas: {publicas}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Privadas: {privadas}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}