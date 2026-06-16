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
    const res = await fetch(`${BASE_URL}/institucion_educativa/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener instituciones");
    return res.json();
  },
  obtenerInstitucionById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/institucion_educativa/${id}/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener la institución");
    return res.json();
  },
  crearInstitucion: async (data: any) => {
    const res = await fetch(`${BASE_URL}/institucion_educativa/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear institución");
    return res.json();
  },
  editarInstitucion: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/institucion_educativa/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar institución");
    return res.json();
  },
  toggleActivoInstitucion: async (id: number, activo: boolean) => {
    const res = await fetch(`${BASE_URL}/institucion_educativa/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: activo }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error del servidor:", errorData); 
      throw new Error("Error en la API");
    }
    return res.json();
    
  },
  eliminarInstitucion: async (id: number) => {
    const res = await fetch(`${BASE_URL}/institucion_educativa/${id}/`, {
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
  crearRolCiudadano: async (data: { nombre_rol: string; activo?: boolean }) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) {
      const errorData = await res.json();
      // Extraemos el error del campo nombre_rol si existe
      const mensaje = errorData.nombre_rol?.[0] || "Error al crear el rol de ciudadano";
      throw new Error(mensaje);
    }
    return res.json();
  },
  editarRolCiudadano: async (id: number, data: { nombre_rol?: string; activo?: boolean }) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      const mensaje = errorData.nombre_rol?.[0] || "Error al actualizar el rol de ciudadano";
      throw new Error(mensaje);
    }
    return res.json();
  },
  toggleActivoRolCiudadano: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    if (!res.ok) throw new Error("Error al cambiar el estado del rol");
    return res.json();
  },
  eliminarRolCiudadano: async (id: number) => {
    const res = await fetch(`${BASE_URL}/rol_ciudadano/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok && res.status !== 204) {
      throw new Error("Error al eliminar el rol");
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
  toggleActivoEstadoSAC: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/estado_sac/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    if (!res.ok) throw new Error("Error al cambiar el estado");
    return res.json();
  },
  eliminarEstadoSAC: async (id: number) => {
    const res = await fetch(`${BASE_URL}/estado_sac/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
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
  toggleActivoRespuestaSAC: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    if (!res.ok) throw new Error("Error al cambiar el estado");
    return res.json();
  },
  eliminarRespuestaSAC: async (id: number) => {
    const res = await fetch(`${BASE_URL}/respuesta_sac/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
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
  toggleActivoClasificacion: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/clasificacion_caso/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }), // Asegúrate que el backend acepte este campo
    });
    if (!res.ok) throw new Error("Error al cambiar el estado");
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
  crearTipoIdentificacion: async (data: { tipo_identificacion: string; activo: boolean }) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), 
    });
    if (!res.ok) throw new Error("Error al crear tipo de identificación");
    return res.json();
  },
  editarTipoIdentificacion: async (id: number, data: { tipo_identificacion?: string; activo?: boolean }) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/${id}/`, {
      method: 'PATCH', // Usamos PATCH para permitir actualizaciones parciales (ej. solo cambiar 'activo')
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar tipo de identificación");
    return res.json();
  },
  toggleActivoTipoIdentificacion: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/tipo_identificacion/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    if (!res.ok) throw new Error("Error al actualizar el estado del tipo de identificación");
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
  toggleActivoEstadoSIUCE: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/estado_siuce/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
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
  toggleActivoGradoEscolaridad: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/grado_escolaridad/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
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
  toggleActivoTipoDano: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/tipo_dano/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
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
  toggleActivoTipoAgresion: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/tipo_agresion/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
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

  // --- GESTIÓN EVENTOS GENERADORES ---

  getEventosGeneradores: async () => {
    const res = await fetch(`${BASE_URL}/evento_generador/`, { headers: getAuthHeaders() });
    return res.json();
  },
  crearEventoGenerador: async (data: { evento_generador: string }) => {
    const res = await fetch(`${BASE_URL}/evento_generador/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  editarEventoGenerador: async (id: number, data: { evento_generador: string }) => {
    const res = await fetch(`${BASE_URL}/evento_generador/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleActivoEventoGenerador: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/evento_generador/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    return res.json();
  },
  eliminarEventoGenerador: async (id: number) => {
    const res = await fetch(`${BASE_URL}/evento_generador/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
    return true;
  },

  // --- GESTIÓN ROLES AGRESOR ---
  getRolesAgresor: async () => {
    const res = await fetch(`${BASE_URL}/rol_agresor/`, { headers: getAuthHeaders() });
    return res.json();
  },
  crearRolAgresor: async (data: { nom_rol_agresor: string }) => {
    const res = await fetch(`${BASE_URL}/rol_agresor/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  editarRolAgresor: async (id: number, data: { nom_rol_agresor: string }) => {
    const res = await fetch(`${BASE_URL}/rol_agresor/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleActivoRolAgresor: async (id: number, nuevoEstado: boolean) => {
    const res = await fetch(`${BASE_URL}/rol_agresor/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo: nuevoEstado }),
    });
    return res.json();
  },
  eliminarRolAgresor: async (id: number) => {
    const res = await fetch(`${BASE_URL}/rol_agresor/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
    return true;
  },

  // --- Lugar de los Hechos ---
  getLugaresHechos: async () => {
    const res = await fetch(`${BASE_URL}/lugar_hechos/`, { headers: getAuthHeaders() });
    return res.json();
  },
  crearLugarHechos: async (data: { nom_lugar: string }) => {
    const res = await fetch(`${BASE_URL}/lugar_hechos/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  editarLugarHechos: async (id: number, data: { nom_lugar: string }) => {
    const res = await fetch(`${BASE_URL}/lugar_hechos/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleActivoLugarHechos: async (id: number, objetoCompleto: any) => {
    const res = await fetch(`${BASE_URL}/lugar_hechos/${id}/`, { 
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(objetoCompleto) 
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error("Error al hacer toggle:", error);
      throw new Error("Error en el servidor");
    }
    return res.json();
  },
  eliminarLugarHechos: async (id: number) => {
    const res = await fetch(`${BASE_URL}/lugar_hechos/${id}/`, { 
      method: 'DELETE', 
      headers: getAuthHeaders() 
    });
    return true;
  },

  // --- Acciones I.E. ---
  getAccionesIE: async () => {
    const res = await fetch(`${BASE_URL}/acciones_ie/`, { headers: getAuthHeaders() });
    return res.json();
  },
  crearAccionIE: async (data: { nom_accion_ie: string, porcentaje: number }) => {
    const res = await fetch(`${BASE_URL}/acciones_ie/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  editarAccionIE: async (id: number, data: { nom_accion_ie: string, porcentaje: number }) => {
    const res = await fetch(`${BASE_URL}/acciones_ie/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleActivoAccionIE: async (id: number, objetoCompleto: any) => {
    const res = await fetch(`${BASE_URL}/acciones_ie/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(objetoCompleto),
    });
    return res.json();
  },

  // Eliminar
  eliminarAccionIE: async (id: number) => {
    const res = await fetch(`${BASE_URL}/acciones_ie/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok && res.status !== 204) {
      throw new Error("Error al eliminar");
    }
    return true;
  },

  getAccionesSEM: async () => {
    const res = await fetch(BASE_URL + '/acciones_sem/', { headers: getAuthHeaders() });
    return res.json();
  },
  crearAccionesSEM: async (data: { nom_accion_sem: string, porcentaje: number }) => {
    const res = await fetch(BASE_URL + '/acciones_sem/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  editarAccionesSEM: async (id: number, data: { nom_accion_sem: string, porcentaje: number }) => {
    const res = await fetch(`${BASE_URL}/acciones_sem/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleActivoAccionesSEM: async (id: number, objetoCompleto: any) => {
    const res = await fetch(`${BASE_URL}/acciones_sem/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(objetoCompleto),
    });
    return res.json();
  },
  eliminarAccionesSEM: async (id: number) => {
    const res = await fetch(`${BASE_URL}/acciones_sem/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Error al eliminar");
    return true;
  },
};