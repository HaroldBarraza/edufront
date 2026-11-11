import { api } from "../libs/axios";
import type {
  EstudianteListado,
  EstudianteDetalle,
} from "../types/estudiante.type";

export const estudianteService = {
  listar: async (): Promise<EstudianteListado[]> =>
    (await api.get<EstudianteListado[]>("/estudiante")).data,

  detalle: async (id: number): Promise<EstudianteDetalle> =>
    (await api.get<EstudianteDetalle>(`/estudiante/${id}/me`)).data,
};
