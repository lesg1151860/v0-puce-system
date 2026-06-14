"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, ShieldCheck, UserCheck, School, Lock, ListChecks, MessageSquare, Tags, CheckCircle2, XCircle, Tag } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function DashboardAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [clasificaciones, setClasificaciones] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [dataUsuarios, dataInst, dataClasif, dataRoles, dataResp, dataEst] = await Promise.all([
          api.getUsuarios(),
          api.obtenerInstituciones(),
          api.getClasificaciones(),
          api.getRolesCiudadano(),
          api.getRespuestasSAC(), 
          api.getEstadosSAC()    
        ]);
        
        setUsuarios(dataUsuarios);
        setInstituciones(dataInst);
        setClasificaciones(dataClasif);
        setRoles(dataRoles);
        setRespuestas(dataResp);
        setEstados(dataEst);
      } catch (error) {
        toast.error("Error cargando dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [])

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Cargando panel...</div>

  // Métricas
  const totalUsuarios = usuarios.length
  const admins = usuarios.filter((u: any) => u.is_staff).length 
  const lideres = totalUsuarios - admins

  const totalInst = instituciones.length
  const publicas = instituciones.filter((i: any) => i.sector === "PUBLICA").length
  const privadas = instituciones.filter((i: any) => i.sector === "PRIVADA").length

  const totalTipo_Clasificacion = clasificaciones.length
  const tipClasifActivas = clasificaciones.filter((c: any) => c.activo).length
  const tipClasifInactivas = totalTipo_Clasificacion - tipClasifActivas

  const totalRoles = roles.length
  const rolesActivos = roles.filter((r: any) => r.activo).length
  const rolesInactivos = totalRoles - rolesActivos

  const totalResp = respuestas.length
  const respActivas = respuestas.filter((r: any) => r.activo).length
  const respInactivas = totalResp - respActivas

  const totalEst = estados.length
  const estActivos = estados.filter((e: any) => e.activo).length
  const estInactivos = totalEst - estActivos

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control General</h1>
      </div>
      <div>
        <h2 className="text-lg text-slate-700">Gestión General del Sistema.</h2>
      </div>

      {/* --- PRIMERA FILA: 3 TARJETAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta Usuarios */}
        <Link href="/administrador/usuarios" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-blue-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Usuarios</CardTitle><Users className="h-6 w-6 text-blue-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-4">{totalUsuarios}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" /> Admin: {admins}</div>
                <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-green-600" /> Líder: {lideres}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Instituciones */}
        <Link href="/administrador/instituciones" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-orange-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Instituciones</CardTitle><Building2 className="h-6 w-6 text-orange-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-900 mb-4">{totalInst}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><School className="h-4 w-4 text-orange-600" /> Púb: {publicas}</div>
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-600" /> Priv: {privadas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Tipos de Clasificación */}
        <Link href="/administrador/clasificacion_caso" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-orange-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Tipos de Clasificación</CardTitle><Tag className="h-6 w-6 text-orange-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-900 mb-4">{totalTipo_Clasificacion}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><School className="h-4 w-4 text-orange-600" /> Activas: {tipClasifActivas}</div>
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-600" /> Inactivas: {tipClasifInactivas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-lg text-slate-700">Gestión para el Sistema SAC.</h2>
      </div>

      {/* --- SEGUNDA FILA: 3 TARJETAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta Roles */}
        <Link href="/administrador/gestion_sac/rol_ciudadano" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-green-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Roles Ciudadano</CardTitle><ListChecks className="h-6 w-6 text-green-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-900 mb-4">{totalRoles}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {rolesActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {rolesInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Respuestas SAC */}
        <Link href="/administrador/gestion_sac/respuestas_sac" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-purple-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Respuestas SAC</CardTitle><MessageSquare className="h-6 w-6 text-purple-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-4">{totalResp}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activas: {respActivas}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivas: {respInactivas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Estados SAC */}
        <Link href="/administrador/gestion_sac/estados_sac" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-yellow-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Estados SAC</CardTitle><Tags className="h-6 w-6 text-yellow-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-900 mb-4">{totalEst}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {estActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {estInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-lg text-slate-700">Gestión para el Sistema SIUCE.</h2>
      </div>
    </div>
  )
}