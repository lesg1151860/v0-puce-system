const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const api = {
  // Obtener lista de usuarios
  getUsuarios: async () => {
    const res = await fetch(`${BASE_URL}/usuarios/`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Detalle del error del backend:", errorText);
      throw new Error("Error al obtener usuarios del backend");
    }
    return res.json();
  },

  getUsuarioById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`);
    if (!res.ok) throw new Error("Usuario no encontrado");
    return res.json();
  },

  // Funciones para crear usuarios
  crearUsuario: async (data: any) => {
    const res = await fetch(`${BASE_URL}/registro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }
    return res.json();
  },
  
  // Función para editar usuarios
  editarUsuario: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el usuario");
    return res.json();
  },

  // Función para eliminar usuarios
  eliminarUsuario: async (id: number) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
      method: 'DELETE',
    });
    
    if (!res.ok && res.status !== 204) {
      throw new Error("Error al eliminar el usuario");
    }
    return true;
  }
};