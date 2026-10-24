import { apiClient } from "../api/client";

export const MetricasService = {
  async registrarVisitaAuto(idPublicacion) {
    try {
      return await apiClient(`/publicaciones/${idPublicacion}/visitas`, { method: 'POST' });
    } catch (error) {
      console.warn('Error, no se pudo registrar la visita: ', error);
    }
  },

  async registrarConsultaWhatsApp(idPublicacion) {
    try {
      return await apiClient(`/publicaciones/${idPublicacion}/consultas`, { method: 'POST' });
    } catch (error) {
      console.warn('Error, no se pudo registrar la consulta: ', error);
    }
  },

  async registrarEvento(tipoEvento, metadata = null) {
    try {
      return await apiClient('/metricas/evento', {
        method: 'POST',
        body: { tipoEvento, metadata },
      });
    } catch (error) {
      console.warn('Error, no se pudo registrar el evento: ', error);
    }
  },

  async obtenerKpis(periodo = 'semana', desde = null, hasta = null) {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/metricas/kpis${queryString}`);
  },

  async obtenerGraficoBarras(periodo = 'semana') {
    return await apiClient(`/metricas/barras?periodo=${periodo}`);
  },

  async obtenerTopVehiculos(limite = 5) {
    return await apiClient(`/metricas/top-vehiculos?limite=${limite}`);
  },

  async obtenerDistribucionSegmentos() {
    return await apiClient('/metricas/segmentos');
  },

  async obtenerDemandaInsatisfecha() {
    return await apiClient('/metricas/demanda-insatisfecha');
  },

  async obtenerDistribucionCarrocerias() {
    return await apiClient('/metricas/carrocerias');
  },
};

export const MetricasServiece = MetricasService;
