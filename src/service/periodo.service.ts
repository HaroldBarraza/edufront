import { api } from "../libs/axios";
import type { Periodo, EstadoPeriodo } from "../types/academinco.types";

export const periodoService = {
  listar: async (): Promise<Periodo[]> =>
    (await api.get<Periodo[]>("/periodo")).data,
  crear: async (year: number): Promise<Periodo[]> =>
    (await api.post<Periodo[]>("/periodo", { year })).data,
  cambiarEstado: async (id: number, estado: EstadoPeriodo): Promise<Periodo> =>
    (await api.patch<Periodo>(`/periodo/${id}/estado`, { estado })).data,
};
