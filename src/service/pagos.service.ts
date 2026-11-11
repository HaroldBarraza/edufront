import { api } from '../libs/axios';
import type { MetodoPago, Pago } from '../types/financiero.types';

export interface CrearPagoDto {
  obligacion_id: number;
  monto: number;
  metodo: MetodoPago;
  referencia_pasarela?: string;
  comprobante_url?: string;
}

export const pagoService = {
  crear: async (dto: CrearPagoDto): Promise<Pago> =>
    (await api.post<Pago>('/pago', dto)).data,
};