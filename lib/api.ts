const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  let token = null;
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    if (match) token = match[2];
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- CRUD USUARIOS ---
  getUsuarios: async () => {
    const res = await fetch(`${BASE_URL}/usuarios/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener usuarios del backend");
    return res.json();
  },

  getUsuarioById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Usuario no encontrado");
    return res.json();
  },

  crearUsuario: async (data: any) => {
    const res = await fetch(`${BASE_URL}/registro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error del servidor`);
    return res.json();
  },
  
  editarUsuario: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
      method: 'PATCH', 
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el usuario");
    return res.json();
  },

  eliminarUsuario: async (id: number) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar el usuario");
    return true;
  },

  // --- CRUD INSTITUCIONES EDUCATIVAS ---
  obtenerInstituciones: async () => {
    const res = await fetch(`${BASE_URL}/instituciones/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener instituciones");
    return res.json();
  },

  obtenerInstitucionById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/instituciones/${id}/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener la institución");
    return res.json();
  },

  crearInstitucion: async (data: any) => {
    const res = await fetch(`${BASE_URL}/instituciones/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear institución");
    return res.json();
  },

  editarInstitucion: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/instituciones/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar institución");
    return res.json();
  },

  eliminarInstitucion: async (id: number) => {
    const res = await fetch(`${BASE_URL}/instituciones/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
    return true;
  },

  // --- GESTIÓN ROLES CIUDADANO (SAC) ---
  getRolesCiudadano: async () => {
    // Asegúrate de que esta ruta sea idéntica a la que usas para el POST
    const res = await fetch(`${BASE_URL}/rol_ciudadano/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔥 ERROR EN GET ROLES:", res.status, errorText);
      throw new Error("Error al obtener roles");
    }
    
  },

  crearRolCiudadano: async (data: { nombre_rol: string }) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre_rol: data.nombre_rol }), 
    });
    if (!res.ok) throw new Error("Error al crear el rol");
    return res.json();
  },

  editarRolCiudadano: async (id: number, data: { nombre_rol: string }) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre_rol: data.nombre_rol }),
    });
    if (!res.ok) throw new Error("Error en la edición");
    return res.json();
  },

  eliminarRolCiudadano: async (id: number) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok && res.status !== 204) {
      throw new Error("Error al eliminar rol");
    }
    return true;
  },
};