import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  // 1. Acceso a las cookies de forma asíncrona (Next.js 15+ estándar)
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const userRole = cookieStore.get("user_role")?.value

  console.log("-> Dashboard detectó token:", !!token)
  console.log("-> Dashboard detectó rol:", userRole)

  // 2. Si no hay token, redirigimos al login
  if (!token) {
    console.log("-> Token no encontrado, redirigiendo a /login")
    redirect("/login")
  }

  // 3. (Opcional) Protección extra: Verificar si realmente es ADMIN
  // Si el usuario llega aquí pero no es administrador, podemos mandarlo al login o a otra ruta
  if (userRole !== "ADMINISTRADOR") {
    console.log("-> Usuario no autorizado para esta ruta, redirigiendo...")
    // Puedes comentar esta línea si prefieres que los líderes vean esto también
    // redirect("/lider") 
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Panel de Administración - PUCE
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            ¡Acceso concedido!
          </h2>
          <p className="text-slate-600 mb-4">
            Has ingresado correctamente al panel de administrador.
          </p>
          
          <div className="mt-6 p-4 bg-slate-100 rounded text-sm text-slate-700">
            <p><strong>Estado de sesión:</strong> Activo</p>
            <p><strong>Rol detectado:</strong> {userRole}</p>
          </div>
        </div>
      </div>
    </div>
  )
}