import { apiClient } from "../api/client";

export const PublicacionesService = {
  async listar(filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.idModelo) params.append('idModelo', filtros.idModelo);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
    if (filtros.estado) params.append('estado', filtros.estado);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient(`/publicaciones${queryString}`);
  },

  async obtenerPorId(id) {
    return await apiClient(`/publicaciones/${id}`);
  },

  async crear(datosPublicacion) {
    return await apiClient('/publicaciones', {
      method: 'POST',
      body: datosPublicacion,
    });
  },

  async cambiarEstado(id, nuevoEstado) {
    return await apiClient(`/publicaciones/${id}/estado`, {
      method: 'PATCH',
      body: { nuevoEstado },
    });
  },

  async eliminar(id) {
    return await apiClient(`/publicaciones/${id}`, {
      method: 'DELETE',
    });
  },

  // Alias por compatibilidad
  async eleminar(id) {
    return await this.eliminar(id);
  },
};

// Alias export
export const PublicacionesServices = PublicacionesService;
