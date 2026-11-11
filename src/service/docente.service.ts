import { api } from "../libs/axios";
import type { DocenteResumen } from "../types/academinco.types";

export const docenteService = {
  listar: async (): Promise<DocenteResumen[]> =>
    (await api.get<DocenteResumen[]>("/docente")).data,
};
