"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Code2, Building2 } from "lucide-react"
import Image from "next/image"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/images/logo-puce.png" alt="Logo PUCE" width={100} height={100} className="rounded-full shadow-lg" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido a <span className="text-blue-600">PUCE</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Plataforma Unificada de Convivencia Escolar. Un sistema integral diseñado para la gestión, 
            seguimiento y mejora de la convivencia en las instituciones educativas.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="text-blue-600 h-6 w-6" />
                <h3 className="text-xl font-bold text-slate-900">Gestión Pedagógica</h3>
              </div>
              <p className="text-slate-600">
                Liderado por la <span className="font-semibold text-slate-800">Doc. María Fernanda Ayala</span>, 
                Subsecretaría de Gestión Pedagógica. Compromiso con la excelencia y el bienestar escolar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Code2 className="text-orange-600 h-6 w-6" />
                <h3 className="text-xl font-bold text-slate-900">Desarrollo del Sistema</h3>
              </div>
              <p className="text-slate-600">
                Desarrollado por el <span className="font-semibold text-slate-800">Ing. Luis Eduardo Soto García</span>. 
                Proyecto bajo el sello de la Universidad Francisco de Paula Santander (UFPS) y LS Solutions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center pt-8">
          <Button 
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-lg"
          >
            Ingresar al Sistema <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}