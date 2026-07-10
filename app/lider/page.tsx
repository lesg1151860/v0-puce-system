"use client"

import { useEffect, useState } from "react"
import {Building2,Activity} from "lucide-react"
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip, ResponsiveContainer,Cell} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAccionesIEStats, getAccionesSEMStats } from "@/lib/storage"

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
  return localStorage.getItem("access_token")
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [casosSinRespuesta, setCasosSinRespuesta] = useState<any[]>([])
  const [accionesIE, setAccionesIE] = useState<{ accion: string; cantidad: number }[]>([])
  const [accionesSEM, setAccionesSEM] = useState<{ accion: string; cantidad: number }[]>([])
  const [barChartData, setBarChartData] = useState<{ name: string; casos: number; fill: string }[]>([])
  const [usernameUsuario, setUsernameUsuario] = useState("Usuario")

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

      try {
        const [resSAC, resSIUCE] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/casos-sac/", { headers }).catch(() => null),
          fetch("http://127.0.0.1:8000/api/casos-siuce/", { headers }).catch(() => null)
        ])

        const dataSAC = resSAC?.ok ? await resSAC.json() : { results: [] }
        const dataSIUCE = resSIUCE?.ok ? await resSIUCE.json() : { results: [] }
        const listaSAC = Array.isArray(dataSAC) ? dataSAC : (dataSAC.results || [])
        const listaSIUCE = Array.isArray(dataSIUCE) ? dataSIUCE : (dataSIUCE.results || [])
        const totalSAC = listaSAC.length
        const totalSIUCE = listaSIUCE.length
        const pendientesSAC = listaSAC.filter((c: any) => c.respondido === false)
        const resueltosSAC = listaSAC.filter((c: any) => c.respondido === true).length
        const resueltosSIUCE = listaSIUCE.filter((c: any) => c.respondido === true).length
        
        setStats({
          totalCasos: totalSAC + totalSIUCE,
          casosSAC: totalSAC,
          casosSIUCE: totalSIUCE,
          casosEnSeguimiento: (totalSAC + totalSIUCE) - (resueltosSAC + resueltosSIUCE) - pendientesSAC.length,
          casosResueltos: resueltosSAC + resueltosSIUCE
        })

        setCasosSinRespuesta(pendientesSAC.map((c: any) => ({
          id: c.id,
          radicado: c.num_radicado_sac || `SAC-${c.id}`,
          ciudadano: c.ciudadano || "No registrado"
        })))

        setBarChartData([
          { name: "SAC", casos: totalSAC, fill: COLORS.sac },
          { name: "SIUCE", casos: totalSIUCE, fill: COLORS.siuce },
        ])

      } catch (error) { console.error("Error API:", error) }
    }

    cargarDatosReales()
    setAccionesIE(getAccionesIEStats())
    setAccionesSEM(getAccionesSEMStats())
  }, [])

  if (!stats) return <div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Bienvenido, usuario {usernameUsuario}. Aquí tienes el resumen de casos de convivencia escolar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCasos}</div>
            <p className="text-xs text-slate-500">SAC: {stats.casosSAC} | SIUCE: {stats.casosSIUCE}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.casosEnSeguimiento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.casosResueltos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{casosSinRespuesta.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Distribución SAC vs SIUCE */}
      <Card>
        <CardHeader><CardTitle>Distribución de Casos por Sistema</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="casos" radius={[4, 4, 0, 0]}>{barChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estadísticas de Acciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Acciones I.E. */}
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
              <p className="text-center text-slate-500 py-8">No hay datos de acciones I.E.</p>
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

        {/* Acciones S.E.M. */}
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
              <p className="text-center text-slate-500 py-8">No hay datos de acciones S.E.M.</p>
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