"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw, Database, Bell, Shield } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuracion del Sistema</h1>
        <p className="text-slate-600">Ajusta los parametros generales de PUCE</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Configuracion General
            </CardTitle>
            <CardDescription>Parametros basicos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-sistema">Nombre del Sistema</Label>
              <Input id="nombre-sistema" defaultValue="PUCE - Plataforma Unificada de Convivencia Escolar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institucion">Institucion</Label>
              <Input id="institucion" defaultValue="Secretaria de Educacion de Cucuta" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-soporte">Email de Soporte</Label>
              <Input id="email-soporte" type="email" defaultValue="soporte@puce.edu.co" />
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura las alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones por Email</p>
                <p className="text-sm text-slate-500">Recibir alertas de casos nuevos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Vencimiento</p>
                <p className="text-sm text-slate-500">Avisar antes de que venzan los plazos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resumen Semanal</p>
                <p className="text-sm text-slate-500">Enviar reporte cada lunes</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Seguridad
            </CardTitle>
            <CardDescription>Opciones de seguridad del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verificacion CAPTCHA</p>
                <p className="text-sm text-slate-500">Requerir en el inicio de sesion</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bloqueo por Intentos</p>
                <p className="text-sm text-slate-500">Bloquear despues de 3 intentos fallidos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Tiempo de Sesion (minutos)</Label>
              <Input id="session-timeout" type="number" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        {/* Mantenimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              Mantenimiento
            </CardTitle>
            <CardDescription>Acciones de mantenimiento del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar Cache del Sistema
            </Button>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Respaldar Base de Datos
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar Datos de Prueba
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
