"use client"

import { redirect } from "next/navigation"

export default function AdminUsuariosPage() {
  // Redirigir al dashboard principal que ya tiene la gestión de usuarios
  redirect("/admin")
}
