"use client"

import { useEffect, useState } from "react"
import { Building2, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [casosSinRespuesta, setCasosSinRespuesta] = useState<any[]>([])
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
        const [resSAC, resSIUCE, resCatIE, resCatSEM] = await Promise.allSettled([
          api?.getCasosSAC ? api.getCasosSAC() : fetch(`${baseUrl}/caso-sac/`, { headers }).then(r => r.json()),
          api?.getCasosSIUCE ? api.getCasosSIUCE() : fetch(`${baseUrl}/caso-siuce/`, { headers }).then(r => r.json()),
          api?.getAccionesIE ? api.getAccionesIE() : fetch(`${baseUrl}/acciones_ie/`, { headers }).then(r => r.json()),
          api?.getAccionesSEM ? api.getAccionesSEM() : fetch(`${baseUrl}/acciones_sem/`, { headers }).then(r => r.json())
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
        // 1. Totales
        const totalSAC = listaSAC.length;
        const totalSIUCE = listaSIUCE.length;
        // 2. SAC
        const sinRespuestaSAC = listaSAC.filter((c: any) => c.respondido === false).length;
        const resueltosSAC = listaSAC.filter((c: any) => c.respondido === true).length;
        const seguimientoSAC = Math.max(0, totalSAC - resueltosSAC - sinRespuestaSAC);
        // 3. SIUCE
        const resueltosSIUCE = listaSIUCE.filter((c: any) => {
          const estado = c.estado_siuce || c.estado || "";
          return estado.toString().toUpperCase().includes("TERMINADO") || c.avance_general === 100;
        }).length;

        const sinRespuestaSIUCE = listaSIUCE.filter((c: any) => {
          const estado = c.estado_siuce || c.estado || "";
          return estado.toString().toUpperCase().includes("PENDIENTE") || c.avance_general === 0;
        }).length;

        const seguimientoSIUCE = Math.max(0, totalSIUCE - resueltosSIUCE - sinRespuestaSIUCE);
        
        setStats({
          // Sumas globales
          totalCasos: totalSAC + totalSIUCE,
          casosEnSeguimiento: seguimientoSAC + seguimientoSIUCE,
          casosResueltos: resueltosSAC + resueltosSIUCE,
          casosSinRespuesta: sinRespuestaSAC + sinRespuestaSIUCE,
      
          // Desglose para la UI
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

        const pendientesSAC_lista = listaSAC.filter((c: any) => c.respondido === false);
        setCasosSinRespuesta(pendientesSAC_lista.map((c: any) => ({
          id: c.id,
          radicado: c.num_radicado_sac || `SAC-${c.id}`,
          ciudadano: c.ciudadano || "No registrado"
        })));

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card: Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCasos}</div>
            <p className="text-xs text-slate-500 mt-1">SAC: {stats.sac.total} | SIUCE: {stats.siuce.total}</p>
          </CardContent>
        </Card>
        
        {/* Card: En Seguimiento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.casosEnSeguimiento}</div>
            <p className="text-xs text-slate-500 mt-1">SAC: {stats.sac.seguimiento} | SIUCE: {stats.siuce.seguimiento}</p>
          </CardContent>
        </Card>
        
        {/* Card: Resueltos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.casosResueltos}</div>
            <p className="text-xs text-slate-500 mt-1">SAC: {stats.sac.resueltos} | SIUCE: {stats.siuce.resueltos}</p>
          </CardContent>
        </Card>
        
        {/* Card: Sin Respuesta */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.casosSinRespuesta}</div>
            <p className="text-xs text-slate-500 mt-1">SAC: {stats.sac.sinRespuesta} | SIUCE: {stats.siuce.sinRespuesta}</p>
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
                  <BarChart 
                    data={accionesIE} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b" }} allowDecimals={false} />
                    <YAxis 
                      type="category" 
                      dataKey="accion" 
                      tick={{ fill: "#64748b", fontSize: 11 }} 
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
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
                  <BarChart 
                    data={accionesSEM} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b" }} allowDecimals={false} />
                    <YAxis 
                      type="category" 
                      dataKey="accion" 
                      tick={{ fill: "#64748b", fontSize: 11 }} 
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
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