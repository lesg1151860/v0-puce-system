"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Activity, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

const COLORS = {
  sac: "#6366f1",
  siuce: "#f97316",
}

const ACCION_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f59e0b", "#6366f1", "#ef4444", "#84cc16"
]

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  const cookieToken = document.cookie.split("; ").find((row) => row.startsWith("access_token="))?.split("=")[1]
  return cookieToken || localStorage.getItem("access_token")
}

const calcularDiasHabilesTranscurridos = (fechaStr: string) => {
  if (!fechaStr) return 0
  const fechaInicio = new Date(fechaStr)
  const fechaFin = new Date()
  if (isNaN(fechaInicio.getTime())) return 0

  let diasHabiles = 0
  const copiaFecha = new Date(fechaInicio.getTime())

  while (copiaFecha <= fechaFin) {
    const diaSemana = copiaFecha.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) { 
      diasHabiles++
    }
    copiaFecha.setDate(copiaFecha.getDate() + 1)
  }
  return diasHabiles > 0 ? diasHabiles - 1 : 0
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [alertasCriticas, setAlertasCriticas] = useState<any[]>([])
  const [accionesIE, setAccionesIE] = useState<{ accion: string; cantidad: number }[]>([])
  const [accionesSEM, setAccionesSEM] = useState<{ accion: string; cantidad: number }[]>([])
  const [barChartData, setBarChartData] = useState<{ name: string; casos: number; fill: string }[]>([])
  const [usernameUsuario, setUsernameUsuario] = useState("Usuario")

  const procesarAcciones = (listaCasos: any[], campoId: string, catalogoAcciones: any[], nombreCampoCatalogo: string) => {
    const conteo: Record<string, number> = {};
    
    listaCasos.forEach((caso) => {
      const idAccion = caso[campoId];
      if (idAccion) {
        const item = catalogoAcciones.find(cat => cat.id?.toString() === idAccion.toString());
        const nombre = item ? (item[nombreCampoCatalogo] || item.nombre || "Acción " + idAccion) : "Sin clasificar";
        conteo[nombre] = (conteo[nombre] || 0) + 1;
      }
    });

    return Object.entries(conteo)
      .map(([accion, cantidad]) => ({ accion, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUsernameUsuario(userObj.username && userObj.username.trim() !== "" ? userObj.username : "Usuario");
      } catch (e) { console.error("Error al leer usuario", e); }
    }

    const cargarDatosReales = async () => {
      const token = getAuthToken()
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api"

      try {
        const [resSAC, resSIUCE, resCatIE, resCatSEM, resEstadosSAC, resEstadosSIUCE] = await Promise.allSettled([
          api?.getCasosSAC ? api.getCasosSAC() : fetch(`${baseUrl}/caso-sac/`, { headers }).then(r => r.json()),
          api?.getCasosSIUCE ? api.getCasosSIUCE() : fetch(`${baseUrl}/caso-siuce/`, { headers }).then(r => r.json()),
          api?.getAccionesIE ? api.getAccionesIE() : fetch(`${baseUrl}/acciones_ie/`, { headers }).then(r => r.json()),
          api?.getAccionesSEM ? api.getAccionesSEM() : fetch(`${baseUrl}/acciones_sem/`, { headers }).then(r => r.json()),
          api?.getEstadosSAC ? api.getEstadosSAC() : fetch(`${baseUrl}/estados_sac/`, { headers }).then(r => r.json()),
          api?.getEstadosSIUCE ? api.getEstadosSIUCE() : fetch(`${baseUrl}/estados_siuce/`, { headers }).then(r => r.json()),
        ]);

        const extractData = (res: any) => {
          if (res.status === "fulfilled") {
            return Array.isArray(res.value) ? res.value : (res.value?.results || []);
          }
          return [];
        };

        const listaSAC = extractData(resSAC);
        const listaSIUCE = extractData(resSIUCE);
        const catIE = extractData(resCatIE);
        const catSEM = extractData(resCatSEM);
        const estadosSAC = extractData(resEstadosSAC); 

        const objTerminado = estadosSAC.find((e:any) => {
          const val = (e.estado_sac || e.nombre || "").toString().toUpperCase();
          return val.includes("TERMINADO") || val.includes("RESUELTO");
        });

        const objSeguimiento = estadosSAC.find((e:any) => {
          const val = (e.estado_sac || e.nombre || "").toString().toUpperCase();
          return val.includes("SEGUIMIENTO");
        });

        const idTerminadoStr = objTerminado ? objTerminado.id?.toString() : null;
        const idSeguimientoStr = objSeguimiento ? objSeguimiento.id?.toString() : null;
        const totalSAC = listaSAC.length;
        
        const resueltosSAC = listaSAC.filter((c: any) => {
          const id = c.estado_sac_id ?? (typeof c.estado_sac === 'object' ? c.estado_sac?.id : c.estado_sac);
          return id !== undefined && id !== null && id.toString() === idTerminadoStr;
        }).length;
        
        const seguimientoSAC = listaSAC.filter((c: any) => {
          const id = c.estado_sac_id ?? (typeof c.estado_sac === 'object' ? c.estado_sac?.id : c.estado_sac);
          return id !== undefined && id !== null && id.toString() === idSeguimientoStr;
        }).length;
        const sinRespuestaSAC = Math.max(0, totalSAC - resueltosSAC - seguimientoSAC);

        const totalSIUCE = listaSIUCE.length;
        const resueltosSIUCE = listaSIUCE.filter((c: any) => {
          const estado = (c.estado_siuce || c.estado || "").toString().toUpperCase();
          return estado.includes("TERMINADO") || c.avance_general === 100;
        }).length;

        const pendientesSIUCE = listaSIUCE.filter((c: any) => {
          const estado = (c.estado_siuce || c.estado || "").toString().toUpperCase();
          return estado.includes("PENDIENTE") || c.avance_general === 0;
        }).length;

        const seguimientoSIUCE = Math.max(0, totalSIUCE - resueltosSIUCE - pendientesSIUCE);
        const sinRespuestaSIUCE = pendientesSIUCE;

        setStats({
          totalCasos: totalSAC + totalSIUCE,
          casosEnSeguimiento: seguimientoSAC + seguimientoSIUCE,
          casosResueltos: resueltosSAC + resueltosSIUCE, 
          casosSinRespuesta: sinRespuestaSAC + sinRespuestaSIUCE,
          sac: { 
            total: totalSAC, 
            seguimiento: seguimientoSAC, 
            resueltos: resueltosSAC, 
            sinRespuesta: sinRespuestaSAC 
          },
          siuce: { 
            total: totalSIUCE, 
            seguimiento: seguimientoSIUCE, 
            resueltos: resueltosSIUCE, 
            sinRespuesta: sinRespuestaSIUCE 
          }
        });

        const alertasSAC = listaSAC
          .filter((c: any) => {
            const diasHabiles = calcularDiasHabilesTranscurridos(c.fecha_radicacion);
            return c.respondido === false && diasHabiles >= 13;
          })
          .map((c: any) => {
            const dias = calcularDiasHabilesTranscurridos(c.fecha_radicacion);
            return {
              id: c.id,
              radicado: c.num_radicado_sac || `SAC-${c.id}`,
              nombre: c.ciudadano || "No registrado",
              motivo: `Próximo a vencer (${dias}/15 días hábiles)`,
              sistema: 'SAC',
              badgeStyle: "bg-red-100 text-red-800 border-red-200",
              link: `/lider/sac/editar/${c.id}`
            };
          });

        const alertasSIUCE = listaSIUCE
          .filter((c: any) => {
            const avance = c.avance_general || 0;
            return avance < 30;
          })
          .map((c: any) => ({
            id: c.id,
            radicado: c.num_radicado_siuce || `SIUCE-${c.id}`,
            nombre: c.estudiante_victima || "No registrado",
            motivo: `Avance crítico (${c.avance_general || 0}%)`,
            sistema: 'SIUCE',
            badgeStyle: "bg-amber-100 text-amber-800 border-amber-200",
            link: `/lider/siuce/editar/${c.id}`
          }));

        setAlertasCriticas([...alertasSAC, ...alertasSIUCE]);

        setBarChartData([
          { name: "SAC", casos: totalSAC, fill: COLORS.sac },
          { name: "SIUCE", casos: totalSIUCE, fill: COLORS.siuce },
        ]);

        setAccionesIE(procesarAcciones(listaSIUCE, "accion_ie", catIE, "nom_accion_ie"));
        setAccionesSEM(procesarAcciones(listaSIUCE, "accion_sem", catSEM, "nom_accion_sem"));

      } catch (error) { 
        console.error("Error al cargar el Dashboard:", error) 
      }
    }

    cargarDatosReales()
  }, [])

  if (!stats) return <div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Bienvenido, {usernameUsuario}. Aquí tienes el resumen de casos de convivencia escolar.</p>
      </div>

      {/* --- SECCIÓN DE ALERTAS CRÍTICAS --- */}
      <div className="border border-red-200 bg-red-50/30 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            Alertas Críticas de Convivencia ({alertasCriticas.length})
          </h2>
          <p className="text-sm mt-1 text-slate-600">
            Casos SAC próximos al vencimiento legal (15 días hábiles) y Casos SIUCE con avance inferior al 30%.
          </p>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
          {alertasCriticas.length === 0 ? (
            <div className="text-center py-8 rounded-lg border border-dashed border-slate-200 text-slate-500 bg-white">
              🎉 Excelente. No se registran casos en estado crítico en este momento.
            </div>
          ) : (
            alertasCriticas.map((caso, idx) => (
              <div key={`${caso.sistema}-${caso.id}-${idx}`} className="bg-white border border-slate-100 rounded-lg p-3 sm:px-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 text-sm sm:text-base">
                    {caso.radicado} <span className="font-normal text-slate-500 hidden sm:inline-block">- {caso.nombre}</span>
                  </span>
                  <span className="font-normal text-slate-500 text-xs sm:hidden mt-1">{caso.nombre}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 font-semibold">{caso.sistema}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-red-600 font-medium">{caso.motivo}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                  <Badge variant="outline" className={caso.badgeStyle}>
                    Atención Urgente
                  </Badge>
                  <Link href={caso.link}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm text-xs px-4">
                      Atender Caso
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RESUMEN DE ESTADÍSTICAS --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card: Total */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total de Casos</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalCasos}</div>
            <p className="text-xs text-slate-500 mt-2">SAC: {stats.sac.total} | SIUCE: {stats.siuce.total}</p>
          </CardContent>
        </Card>
        
        {/* Card: En Seguimiento */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">En Seguimiento</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.casosEnSeguimiento}</div>
            <p className="text-xs text-slate-500 mt-2">SAC: {stats.sac.seguimiento} | SIUCE: {stats.siuce.seguimiento}</p>
          </CardContent>
        </Card>
        
        {/* Card: Resueltos */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600">Resueltos</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.casosResueltos}</div>
            <p className="text-xs text-slate-500 mt-2">SAC: {stats.sac.resueltos} | SIUCE: {stats.siuce.resueltos}</p>
          </CardContent>
        </Card>
        
        {/* Card: Sin Respuesta */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Sin Respuesta</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.casosSinRespuesta}</div>
            <p className="text-xs text-slate-500 mt-2">SAC: {stats.sac.sinRespuesta} | SIUCE: {stats.siuce.sinRespuesta}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Distribución de Casos por Sistema</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="casos" radius={[4, 4, 0, 0]}>{barChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Casos por Acción I.E.
            </CardTitle>
            <CardDescription>Distribución de casos según acciones de la Institución Educativa</CardDescription>
          </CardHeader>
          <CardContent>
            {accionesIE.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aún no hay acciones I.E. registradas.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accionesIE} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="accion" tick={{ fill: "#64748b", fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                      {accionesIE.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={ACCION_COLORS[index % ACCION_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Casos por Acción S.E.M.
            </CardTitle>
            <CardDescription>Distribución de casos según acciones de la Secretaría de Educación</CardDescription>
          </CardHeader>
          <CardContent>
            {accionesSEM.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aún no hay acciones S.E.M. registradas.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accionesSEM} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="accion" tick={{ fill: "#64748b", fontSize: 11 }} width={150} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                      {accionesSEM.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={ACCION_COLORS[index % ACCION_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}