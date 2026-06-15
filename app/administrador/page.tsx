"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, Building2, ShieldCheck, UserCheck, School, Lock, 
  ListChecks, MessageSquare, Tags, CheckCircle2, XCircle, 
  Tag, IdCard, GitBranch, Workflow, GraduationCap, 
  AlertTriangle, ShieldAlert, Zap, UserX, MapPin, ClipboardCheck, FileCheck, 
  Fingerprint
} from "lucide-react"
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
  const [tiposIdentificacion, setTiposIdentificacion] = useState<any[]>([])
  const [estadosSIUCE, setEstadosSIUCE] = useState<any[]>([])
  const [gradosEscolaridad, setGradosEscolaridad] = useState<any[]>([])
  const [tiposDano, setTiposDano] = useState<any[]>([])
  const [tiposAgresion, setTiposAgresion] = useState<any[]>([])
  const [eventosGenerador, setEventosGenerador] = useState<any[]>([])
  const [rolesAgresor, setRolesAgresor] = useState<any[]>([])
  const [lugaresHechos, setLugaresHechos] = useState<any[]>([])
  const [accionesIE, setAccionesIE] = useState<any[]>([])
  const [accionesSEM, setAccionesSEM] = useState<any[]>([])

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [
          dataUsuarios, dataInst, dataClasif, dataRoles, dataResp, dataEst, 
          dataTiposIdentificacion, dataTotalEstadosSIUCE, dataGradosEscolaridad,
          dataTiposDano, dataTiposAgresion, dataEventosGenerador, dataRolesAgresor,
          dataLugaresHechos, dataAccionesIE, dataAccionesSEM
        ] = await Promise.all([
          api.getUsuarios(),
          api.obtenerInstituciones(),
          api.getClasificaciones(),
          api.getRolesCiudadano(),
          api.getRespuestasSAC(), 
          api.getEstadosSAC(),
          api.getTiposIdentificacion(),
          api.getEstadosSIUCE(),
          api.getGradosEscolaridad(),
          api.getTiposDano(),           
          api.getTiposAgresion(),       
          api.getEventosGeneradores(),  
          api.getRolesAgresor(),        
          api.getLugaresHechos(),       
          api.getAccionesIE(),          
          api.getAccionesSEM()          
        ]);
        
        setUsuarios(dataUsuarios);
        setInstituciones(dataInst);
        setClasificaciones(dataClasif);
        setRoles(dataRoles);
        setRespuestas(dataResp);
        setEstados(dataEst);
        setTiposIdentificacion(dataTiposIdentificacion);
        setEstadosSIUCE(dataTotalEstadosSIUCE);
        setGradosEscolaridad(dataGradosEscolaridad);
        setTiposDano(dataTiposDano);
        setTiposAgresion(dataTiposAgresion);
        setEventosGenerador(dataEventosGenerador);
        setRolesAgresor(dataRolesAgresor);
        setLugaresHechos(dataLugaresHechos);
        setAccionesIE(dataAccionesIE);
        setAccionesSEM(dataAccionesSEM);
      } catch (error) {
        toast.error("Hubo un error al cargar el Dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [])

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Cargando panel...</div>

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

  const totalTiposIdentificacion = tiposIdentificacion.length
  const tiposIdentificacionActivos = tiposIdentificacion.filter((t: any) => t.activo).length
  const tiposIdentificacionInactivos = totalTiposIdentificacion - tiposIdentificacionActivos

  const totalEstadosSIUCE = estadosSIUCE.length
  const estSIUCEActivos = estadosSIUCE.filter((e: any) => e.activo).length
  const estSIUCEInactivos = totalEstadosSIUCE - estSIUCEActivos

  const totalGradosEscolaridad = gradosEscolaridad.length
  const gradosEscolaridadActivos = gradosEscolaridad.filter((g: any) => g.activo).length
  const gradosEscolaridadInactivos = totalGradosEscolaridad - gradosEscolaridadActivos

  const totalTiposDano = tiposDano.length
  const tiposDanoActivos = tiposDano.filter((t: any) => t.activo).length
  const tiposDanoInactivos = totalTiposDano - tiposDanoActivos

  const totalTiposAgresion = tiposAgresion.length
  const tiposAgresionActivos = tiposAgresion.filter((t: any) => t.activo).length
  const tiposAgresionInactivos = totalTiposAgresion - tiposAgresionActivos

  const totalEventosGenerador = eventosGenerador.length
  const eventosGeneradorActivos = eventosGenerador.filter((e: any) => e.activo).length
  const eventosGeneradorInactivos = totalEventosGenerador - eventosGeneradorActivos

  const totalRolesAgresor = rolesAgresor.length
  const rolesAgresorActivos = rolesAgresor.filter((r: any) => r.activo).length
  const rolesAgresorInactivos = totalRolesAgresor - rolesAgresorActivos

  const totalLugaresHechos = lugaresHechos.length
  const lugaresHechosActivos = lugaresHechos.filter((l: any) => l.activo).length
  const lugaresHechosInactivos = totalLugaresHechos - lugaresHechosActivos

  const totalAccionesIE = accionesIE.length
  const accionesIEActivas = accionesIE.filter((a: any) => a.activo).length
  const accionesIEInactivas = totalAccionesIE - accionesIEActivas

  const totalAccionesSEM = accionesSEM.length
  const accionesSEMActivas = accionesSEM.filter((a: any) => a.activo).length
  const accionesSEMInactivas = totalAccionesSEM - accionesSEMActivas

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control General</h1>
      </div>
      <div>
        <h2 className="text-lg text-slate-700">Gestión General del Sistema.</h2>
      </div>

      {/* --- PRIMERA FILA ---*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta Usuarios */}
        <Link href="/administrador/usuarios" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-blue-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Usuarios del Sistema</CardTitle><Users className="h-6 w-6 text-blue-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-4">{totalUsuarios}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" /> Administrador: {admins}</div>
                <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-green-600" /> Líder: {lideres}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Instituciones */}
        <Link href="/administrador/instituciones" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-orange-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Instituciones Educativas</CardTitle><Building2 className="h-6 w-6 text-orange-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-900 mb-4">{totalInst}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><School className="h-4 w-4 text-orange-600" /> Pública: {publicas}</div>
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-600" /> Privada: {privadas}</div>
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
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activas: {tipClasifActivas}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivas: {tipClasifInactivas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-lg text-slate-700">Gestión para el Sistema SAC.</h2>
      </div>

      {/* --- SEGUNDA FILA --- */}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Estados SAC</CardTitle><Workflow className="h-6 w-6 text-yellow-600" /></CardHeader>
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

      {/* --- TERCERA FILA --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Tarjeta Tipo de Identificación */}
        <Link href="/administrador/gestion_siuce/tipo_identificacion" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-green-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Tipos de Identificación</CardTitle><Fingerprint className="h-6 w-6 text-green-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-900 mb-4">{totalTiposIdentificacion}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {tiposIdentificacionActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {tiposIdentificacionInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Estados SIUCE */}
        <Link href="/administrador/gestion_siuce/estado_siuce" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-purple-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Estados SIUCE</CardTitle><Workflow className="h-6 w-6 text-purple-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-900 mb-4">{totalEstadosSIUCE}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activas: {estSIUCEActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivas: {estSIUCEInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Grado de Escolaridad */}
        <Link href="/administrador/gestion_siuce/grado_escolaridad" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-blue-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Grados de Escolaridad</CardTitle><GraduationCap className="h-6 w-6 text-blue-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-4">{totalGradosEscolaridad}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {gradosEscolaridadActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {gradosEscolaridadInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Tarjeta Tipo de Daño */}
        <Link href="/administrador/gestion_siuce/tipos_dano" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-red-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Tipos de Daño</CardTitle><AlertTriangle className="h-6 w-6 text-red-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-900 mb-4">{totalTiposDano}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {tiposDanoActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {tiposDanoInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Tipo de Agresión */}
        <Link href="/administrador/gestion_siuce/tipos_agresion" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-orange-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Tipos de Agresión</CardTitle><ShieldAlert className="h-6 w-6 text-orange-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-900 mb-4">{totalTiposAgresion}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {tiposAgresionActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {tiposAgresionInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Evento Generador */}
        <Link href="/administrador/gestion_siuce/evento_generador" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-yellow-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Eventos Generadores</CardTitle><Zap className="h-6 w-6 text-yellow-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-900 mb-4">{totalEventosGenerador}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {eventosGeneradorActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {eventosGeneradorInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Rol Agresor */}
        <Link href="/administrador/gestion_siuce/rol_agresor" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-slate-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Roles Agresor</CardTitle><UserX className="h-6 w-6 text-slate-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-4">{totalRolesAgresor}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {rolesAgresorActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {rolesAgresorInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Lugar de los Hechos */}
        <Link href="/administrador/gestion_siuce/lugar_hechos" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-indigo-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Lugar de los Hechos</CardTitle><MapPin className="h-6 w-6 text-indigo-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-900 mb-4">{totalLugaresHechos}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activos: {lugaresHechosActivos}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivos: {lugaresHechosInactivos}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Acciones de la I.E. */}
        <Link href="/administrador/gestion_siuce/acciones_ie" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-teal-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Acciones de la I.E.</CardTitle><ClipboardCheck className="h-6 w-6 text-teal-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-900 mb-4">{totalAccionesIE}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activas: {accionesIEActivas}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivas: {accionesIEInactivas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta Acciones de la S.E.M */}
        <Link href="/administrador/gestion_siuce/acciones_sem" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full border-cyan-100 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Acciones de la S.E.M.</CardTitle><FileCheck className="h-6 w-6 text-cyan-600" /></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-cyan-900 mb-4">{totalAccionesSEM}</div>
              <div className="flex gap-4 border-t pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Activas: {accionesSEMActivas}</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Inactivas: {accionesSEMInactivas}</div>
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>
    </div>
  )
}