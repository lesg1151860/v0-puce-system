import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const role = cookieStore.get("user_role")?.value

  if (!token || role !== "ADMINISTRADOR") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Solo le enviamos la instrucción "admin" */}
      <Sidebar type="admin" />
      
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0">
        <div className="h-full p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}