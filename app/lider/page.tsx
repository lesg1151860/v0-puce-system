"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Bell,
  Building2,
  Activity,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  getDashboardStats, 
  getCasosSACSinRespuesta, 
  getAccionesIEStats, 
  getAccionesSEMStats 
} from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { DashboardStats, CasoSAC } from "@/lib/types"

const COLORS = {
  sac: "#6366f1",
  siuce: "#f97316",
}

const ACCION_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", 
  "#14b8a6", "#f59e0b", "#6366f1", "#ef4444", "#84cc16"
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [casosSinRespuesta, setCasosSinRespuesta] = useState<CasoSAC[]>([])
  const [accionesIE, setAccionesIE] = useState<{ accion: string; cantidad: number }[]>([])
  const [accionesSEM, setAccionesSEM] = useState<{ accion: string; cantidad: number }[]>([])
  const [barChartData, setBarChartData] = useState<{ name: string; casos: number; fill: string }[]>([])
  const user = getCurrentUser()

  useEffect(() => {
    const dashboardStats = getDashboardStats()
    setStats(dashboardStats)

    // Cargar casos sin respuesta
    const sinRespuesta = getCasosSACSinRespuesta()
    setCasosSinRespuesta(sinRespuesta)

    // Cargar estadísticas de acciones
    setAccionesIE(getAccionesIEStats())
    setAccionesSEM(getAccionesSEMStats())

    // Preparar datos para gráfico de barras
    setBarChartData([
      { name: "SAC", casos: dashboardStats.casosSAC, fill: COLORS.sac },
      { name: "SIUCE", casos: dashboardStats.casosSIUCE, fill: COLORS.siuce },
    ])
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          Bienvenido, {user?.nombre || "Usuario"}. Aqui tienes el resumen de casos de convivencia escolar.
        </p>
      </div>

      {/* Notificación de casos sin respuesta */}
      {casosSinRespuesta.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Bell className="h-5 w-5 animate-pulse" />
              Casos Pendientes de Respuesta ({casosSinRespuesta.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              Los siguientes casos requieren prioridad para responder en el tiempo de ley
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {casosSinRespuesta.slice(0, 5).map((caso) => (
                <div key={caso.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-200">
                  <div>
                    <span className="font-medium text-slate-900">{caso.radicado}</span>
                    <span className="text-sm text-slate-500 ml-2">- {caso.ciudadano}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Sin Respuesta
                    </Badge>
                    <Link href={`/sac/${caso.id}`}>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        Atender
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {casosSinRespuesta.length > 5 && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Y {casosSinRespuesta.length - 5} casos mas pendientes...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-slate-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Casos</CardTitle>
            <FileText className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalCasos}</div>
            <p className="text-xs text-slate-500 mt-1">
              SAC: {stats.casosSAC} | SIUCE: {stats.casosSIUCE}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">En Seguimiento</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.casosEnSeguimiento}</div>
            <p className="text-xs text-slate-500 mt-1">En proceso de gestion</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Resueltos</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.casosResueltos}</div>
            <p className="text-xs text-slate-500 mt-1">Casos cerrados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sin Respuesta</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{casosSinRespuesta.length}</div>
            <p className="text-xs text-slate-500 mt-1">Requieren atencion prioritaria</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart - Casos por Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            Casos por Sistema
          </CardTitle>
          <CardDescription>Distribucion de casos entre SAC y SIUCE</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="casos" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Acciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Acciones I.E. */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Casos por Accion I.E.
            </CardTitle>
            <CardDescription>Distribucion de casos segun acciones de la Institucion Educativa</CardDescription>
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
              Casos por Accion S.E.M.
            </CardTitle>
            <CardDescription>Distribucion de casos segun acciones de la Secretaria de Educacion</CardDescription>
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
