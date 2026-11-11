import { api } from "../libs/axios";
import type { Asginacion } from "../types/asignaciones.types";

export type CrearAsginacionDTO = {
    grupo_id: number
    titulo: string
    instrucciones: string
    fecha_limite: string
}

export const AsginacionesService = {
      listar: async (): Promise<Asginacion[]> =>
    (await api.get<Asginacion[]>('/asignacion')).data,

  detalle: async (id: number): Promise<Asginacion> =>
    (await api.get<Asginacion>(`/asignacion/${id}`)).data,

  crear: async (dto: CrearAsginacionDTO): Promise<Asginacion> =>
    (await api.post<Asginacion>('/asignacion', dto)).data,

  actualizar: async (id: number, dto: Partial<CrearAsginacionDTO>): Promise<Asginacion> =>
    (await api.patch<Asginacion>(`/asignacion/${id}`, dto)).data,
}