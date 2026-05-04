"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Error de Autenticacion</CardTitle>
          <CardDescription>
            Hubo un problema al iniciar sesion. Por favor intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/login">
            <Button>Volver al Inicio de Sesion</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
