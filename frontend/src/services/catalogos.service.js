import { apiClient } from "../api/client";

export const CatalogosService = {
  async obtenerTodos() {
    return await apiClient('/catalogos');
  },

  async crearMarca(nombreMarca) {
    return await apiClient('/marcas', {
      body: { nombreMarca: nombreMarca.trim() },
    });
  },

  async crearModelo(nombreModelo, idMarca) {
    return await apiClient('/modelos', {
      body: { nombreModelo: nombreModelo.trim(), idMarca: Number(idMarca) },
    });
  },

  async crearCarroceria(nombre) {
    return await apiClient('/carrocerias', {
      body: { nombre: nombre.trim() },
    });
  },

  async crearSegmento(nombre) {
    return await apiClient('/segmentos', {
      body: { nombre: nombre.trim() },
    });
  },

  async crearCondicion(nombre) {
    return await apiClient('/condiciones', {
      body: { nombre: nombre.trim() },
    });
  },

  async crearCombustible(nombre) {
    return await apiClient('/combustibles', {
      body: { nombre: nombre.trim() },
    });
  },

  async crearCaja(nombre, descripcion) {
    return await apiClient('/cajas', {
      body: {
        nombre: nombre.trim(),
        ...(descripcion?.trim() ? { descripcion: descripcion.trim() } : {}),
      },
    });
  },

  async crearTraccion(nombre) {
    return await apiClient('/tracciones', {
      body: { nombre: nombre.trim() },
    });
  },

  async crearTapizado(nombre, descripcion) {
    return await apiClient('/tapizados', {
      body: {
        nombre: nombre.trim(),
        ...(descripcion?.trim() ? { descripcion: descripcion.trim() } : {}),
      },
    });
  },

  async crearDireccion(nombre, descripcion) {
    return await apiClient('/direcciones', {
      body: {
        nombre: nombre.trim(),
        ...(descripcion?.trim() ? { descripcion: descripcion.trim() } : {}),
      },
    });
  },

  async crearTipoMotor(nombreTipo) {
    return await apiClient('/tipos-motor', {
      body: { nombreTipo: nombreTipo.trim() },
    });
  },

  async crearMotor(descripcion, idTipoMotor = 1) {
    return await apiClient('/motores', {
      body: {
        descripcion: descripcion.trim(),
        idTipoMotor: Number(idTipoMotor) || 1,
      },
    });
  },
};
