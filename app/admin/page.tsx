import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  // EXTRAEMOS EL VALOR REAL DE LA COOKIE AQUÍ CON .value
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración - PUCE</h1>
      <p className="text-green-600 mb-8">
        ¡Conexión exitosa! Bucle infinito destruido y sesión protegida.
      </p>
    </div>
  )
}