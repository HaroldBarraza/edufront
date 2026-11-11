import { api } from '../libs/axios';
import type {
  EstudianteConObligaciones,
  ObligacionFinanciera,
  Pago,
} from '../types/financiero.types';

export const financieroService = {
  historialEstudiante: async (id: number): Promise<EstudianteConObligaciones> =>
    (await api.get<EstudianteConObligaciones>(`/estudiante/${id}/me`)).data,

  obligacionesConPagoPendiente: async (): Promise<ObligacionFinanciera[]> => {
    const todas = (await api.get<ObligacionFinanciera[]>('/obligaciones')).data;
    return todas.filter((o) => o.pagos.some((p) => p.estado === 'PENDIENTE'));
  },

  aprobarPago: async (idPago: number): Promise<Pago> =>
    (await api.patch<Pago>(`/pago/${idPago}/aprobar`)).data,

  rechazarPago: async (idPago: number): Promise<Pago> =>
    (await api.patch<Pago>(`/pago/${idPago}/rechazar`)).data,
};