import { api } from "../libs/axios";
import type { Entrega, EntregaArchivo } from "../types/entrega.types";

export const entregaService = {
  listar: async (): Promise<Entrega[]> =>
    (await api.get<Entrega[]>("/entrega")).data,

  detalle: async (id: number): Promise<Entrega> =>
    (await api.get<Entrega>(`/entrega/${id}`)).data,

  crear: async (dto: {
    asignacion_id: number;
    contenido_texto?: string;
  }): Promise<Entrega> => (await api.post<Entrega>("/entrega", dto)).data,

  actualizar: async (id: number, contenido_texto: string): Promise<Entrega> =>
    (await api.patch<Entrega>(`/entrega/${id}`, { contenido_texto })).data,

  calificar: async (id: number, calificacion: number): Promise<Entrega> =>
    (await api.patch<Entrega>(`/entrega/${id}/calificar`, { calificacion }))
      .data,

  adjuntarArchivo: async (dto: {
    entrega_id: number;
    url: string;
    nombre: string;
    mimeType: string;
  }): Promise<EntregaArchivo> =>
    (await api.post<EntregaArchivo>("/entrega-archivo", dto)).data,
};
