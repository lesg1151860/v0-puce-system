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

  // --- GESTIÓN ROLES CIUDADANO ---
  getRolesCiudadano: async () => {
    // Asegúrate de que esta ruta sea idéntica a la que usas para el POST
    const res = await fetch(`${BASE_URL}/rol_ciudadano/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener roles");
    return res.json();
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

  // --- GESTIÓN ESTADOS SAC ---
  getEstadosSAC: async () => {
    const res = await fetch(`${BASE_URL}/estado_sac/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener estados");
    return res.json();
  },

  crearEstadoSAC: async (data: { estado_sac: string }) => {
    const res = await fetch(`${BASE_URL}/estado_sac/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear estado");
    return res.json();
  },

  editarEstadoSAC: async (id: number, data: { estado_sac: string }) => {
    const res = await fetch(`${BASE_URL}/estado_sac/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
    return res.json();
  },

  eliminarEstadoSAC: async (id: number) => {
    const res = await fetch(`${BASE_URL}/estado_sac/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar estado");
    return true;
  },

  // --- GESTIÓN RESPUESTAS SAC ---
  getRespuestasSAC: async () => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener respuestas");
    return res.json();
  },

  crearRespuestaSAC: async (data: { respuesta_sac: string }) => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear respuesta");
    return res.json();
  },

  editarRespuestaSAC: async (id: number, data: { respuesta_sac: string }) => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar respuesta");
    return res.json();
  },

  eliminarRespuestaSAC: async (id: number) => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar respuesta");
    return true;
  },

  // --- GESTIÓN CLASIFICACIÓN ---
  getClasificaciones: async () => {
    const res = await fetch(`${BASE_URL}/clasificacion_caso/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener datos");
    
    return res.json();
  },

  guardarClasificacion: async (id: number | null, data: { descripcion: string }) => {
    const url = id ? `${BASE_URL}/clasificacion_caso/${id}/` : `${BASE_URL}/clasificacion_caso/`;
    const method = id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar clasificación");
    return res.json();
  },

  eliminarClasificacion: async (id: number) => {
    const res = await fetch(`${BASE_URL}/clasificacion_caso/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar clasificación");
    return true;
  },

  // --- GESTIÓN TIPOS DE IDENTIFICACIÓN ---
  getTiposIdentificacion: async () => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener tipos de identificación");
    return res.json();
  },

  crearTipoIdentificacion: async (data: { codigo: string; descripcion: string; activo: boolean }) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear tipo de identificación");
    return res.json();
  },

  editarTipoIdentificacion: async (id: number, data: { codigo?: string; descripcion?: string; activo?: boolean }) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/${id}/`, {
      method: 'PATCH', // Usamos PATCH para permitir actualizaciones parciales (ej. solo cambiar 'activo')
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar tipo de identificación");
    return res.json();
  },

  eliminarTipoIdentificacion: async (id: number) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar tipo de identificación");
    return true;
  },

  // --- GESTIÓN ESTADOS SIUCE ---
  getEstadosSIUCE: async () => {
    const res = await fetch(`${BASE_URL}/estado_siuce/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener los estados del SIUCE");
    return res.json();
  },

  crearEstadoSIUCE: async (data: { estado_siuce: string }) => {
    const res = await fetch(`${BASE_URL}/estado_siuce/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear el estado del SIUCE");
    return res.json();
  },

  editarEstadoSIUCE: async (id: number, data: { estado_siuce: string }) => {
    const res = await fetch(`${BASE_URL}/estado_siuce/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el estado del SIUCE");
    return res.json();
  },

  eliminarEstadoSIUCE: async (id: number) => {
    const res = await fetch(`${BASE_URL}/estado_siuce/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar el estado del SIUCE");
    return true;
  },

  // --- GESTIÓN GRADOS DE ESCOLARIDAD ---
  getGradosEscolaridad: async () => {
    const res = await fetch(`${BASE_URL}/grado_escolaridad/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener los grados de escolaridad");
    return res.json();
  },

  crearGradoEscolaridad: async (data: { nom_grado: string; }) => {
    const res = await fetch(`${BASE_URL}/grado_escolaridad/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear el grado de escolaridad");
    return res.json();
  },

  editarGradoEscolaridad: async (id: number, data: { nom_grado: string }) => {
    const res = await fetch(`${BASE_URL}/grado_escolaridad/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el grado de escolaridad");
    return res.json();
  },

  eliminarGradoEscolaridad: async (id: number) => {
    const res = await fetch(`${BASE_URL}/grado_escolaridad/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar el grado de escolaridad");
    return true;
  },

  // --- GESTIÓN TIPOS DE DAÑO ---
  getTiposDano: async () => {
    const res = await fetch(`${BASE_URL}/tipo_dano/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener los tipos de daño");
    return res.json();
  },

  crearTipoDano: async (data: { tipo_dano: string }) => {
    const res = await fetch(`${BASE_URL}/tipo_dano/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear el tipo de daño");
    return res.json();
  },

  editarTipoDano: async (id: number, data: { tipo_dano: string }) => {
    const res = await fetch(`${BASE_URL}/tipo_dano/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el tipo de daño");
    return res.json();
  },

  eliminarTipoDano: async (id: number) => {
    const res = await fetch(`${BASE_URL}/tipo_dano/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar el tipo de daño");
    return true;
  },

  // --- GESTIÓN TIPOS DE AGRESIÓN ---
  getTiposAgresion: async () => {
    const res = await fetch(`${BASE_URL}/tipo_agresion/`, { 
      method: 'GET',
      headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error al obtener los tipos de agresión");
    return res.json();
  },

  crearTipoAgresion: async (data: { tipo_agresion: string }) => {
    const res = await fetch(`${BASE_URL}/tipo_agresion/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear el tipo de agresión");
    return res.json();
  },

  editarTipoAgresion: async (id: number, data: { tipo_agresion: string }) => {
    const res = await fetch(`${BASE_URL}/tipo_agresion/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el tipo de agresión");
    return res.json();
  },

  eliminarTipoAgresion: async (id: number) => {
    const res = await fetch(`${BASE_URL}/tipo_agresion/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar el tipo de agresión");
    return true;
  },
};