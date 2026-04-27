"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats, getCasesSAC, getCasesSIUCE } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { DashboardStats } from "@/lib/types"

const COLORS = {
  nuevo: "#eab308",
  enSeguimiento: "#3b82f6",
  resuelto: "#22c55e",
  sac: "#6366f1",
  siuce: "#f97316",
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [barChartData, setBarChartData] = useState<{ name: string; casos: number; fill: string }[]>([])
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number; fill: string }[]>([])
  const user = getCurrentUser()

  useEffect(() => {
    const dashboardStats = getDashboardStats()
    setStats(dashboardStats)

    // Preparar datos para gráfico de barras
    setBarChartData([
      { name: "SAC", casos: dashboardStats.casosSAC, fill: COLORS.sac },
      { name: "SIUCE", casos: dashboardStats.casosSIUCE, fill: COLORS.siuce },
    ])

    // Preparar datos para gráfico de torta
    setPieChartData([
      { name: "Nuevos", value: dashboardStats.casosNuevos, fill: COLORS.nuevo },
      { name: "En Seguimiento", value: dashboardStats.casosEnSeguimiento, fill: COLORS.enSeguimiento },
      { name: "Resueltos", value: dashboardStats.casosResueltos, fill: COLORS.resuelto },
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
          Bienvenido, {user?.name || "Usuario"}. Aquí tienes el resumen de casos de convivencia escolar.
        </p>
      </div>

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
            <p className="text-xs text-slate-500 mt-1">En proceso de gestión</p>
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
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Casos por Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              Casos por Sistema
            </CardTitle>
            <CardDescription>Distribución de casos entre SAC y SIUCE</CardDescription>
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

        {/* Pie Chart - Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Distribución por Estado
            </CardTitle>
            <CardDescription>Estado actual de todos los casos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
