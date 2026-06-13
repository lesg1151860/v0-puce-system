'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api'; // Ajusta la ruta si es necesario

// Tipado para TypeScript
interface TipoIdentificacion {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export default function GestionTipoIdentificacion() {
  const [tipos, setTipos] = useState<TipoIdentificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ codigo: '', descripcion: '', activo: true });

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const data = await api.getTiposIdentificacion();
      setTipos(data);
    } catch (error) {
      console.error("Error obteniendo tipos de identificación:", error);
      // Si el error persiste, abre la consola (F12) en la pestaña "Network/Red" para ver qué responde Django
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleOpenModal = (tipo?: TipoIdentificacion) => {
    if (tipo) {
      setFormData({ codigo: tipo.codigo, descripcion: tipo.descripcion, activo: tipo.activo });
      setEditingId(tipo.id);
    } else {
      setFormData({ codigo: '', descripcion: '', activo: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ codigo: '', descripcion: '', activo: true });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.editarTipoIdentificacion(editingId, formData);
      } else {
        await api.crearTipoIdentificacion(formData);
      }
      fetchTipos();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar. Revisa la consola.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      try {
        await api.eliminarTipoIdentificacion(id);
        fetchTipos();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se puede eliminar porque está asociado a un caso SIUCE. Intenta desactivarlo editándolo.");
      }
    }
  };

  const filteredTipos = tipos.filter(t => 
    t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Encabezado calcado de tu diseño */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Gestión Tipo de Identificación</h1>
          <p className="text-sm text-gray-500">Administra los tipos de documentos disponibles para el módulo SAC e SIUCE</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
        >
          <span>+</span> Nuevo Tipo
        </button>
      </div>

      {/* Contenedor Principal (Tarjeta blanca) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* Buscador y Contador */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/2 max-w-md">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar por descripción o código..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center text-gray-500 text-sm font-medium gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Total Registros: {filteredTipos.length}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                <th className="p-4 font-semibold text-center w-24">Código</th>
                <th className="p-4 font-semibold text-center">Descripción del Tipo</th>
                <th className="p-4 font-semibold text-center w-32">Estado</th>
                <th className="p-4 font-semibold text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Cargando datos...</td></tr>
              ) : filteredTipos.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No se encontraron registros.</td></tr>
              ) : (
                filteredTipos.map((tipo) => (
                  <tr key={tipo.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-center font-medium text-gray-700">{tipo.codigo}</td>
                    <td className="p-4 text-center text-gray-600">{tipo.descripcion}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tipo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-4">
                      {/* Botón Editar (Lápiz Azul) */}
                      <button onClick={() => handleOpenModal(tipo)} className="text-blue-500 hover:text-blue-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      {/* Botón Eliminar (Basurero Rojo) */}
                      <button onClick={() => handleDelete(tipo.id)} className="text-red-500 hover:text-red-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Editar Tipo de Identificación' : 'Nuevo Tipo de Identificación'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código (Ej. CC, TI)</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Estado Activo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}