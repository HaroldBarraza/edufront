import { api } from "../libs/axios";
import { HorarioGrupo, Dia } from "../types/academinco.types";

export type CrearHorearioDto = {
  grupo_id: number;
  dia_semana: Dia;
  hora_inicio: string;
  hora_fin: string;
};
export const horarioService = {
  listarTodo: async (): Promise<HorarioGrupo[]> =>
    (await api.get<HorarioGrupo[]>("/horario")).data,
  listarGrupo: async (grupoId: number): Promise<HorarioGrupo[]> => {
    const todos = (await api.get<HorarioGrupo[]>("/horario")).data;
    return todos.filter((h) => h.grupo_id === grupoId);
  },
  crear: async (dto: CrearHorearioDto): Promise<HorarioGrupo> =>
    (await api.post<HorarioGrupo>("/horario", dto)).data,
  actualizar: async (
    id: number,
    dto: Partial<CrearHorearioDto>,
  ): Promise<HorarioGrupo> =>
    (await api.patch<HorarioGrupo>(`/horario/${id}`, dto)).data,
};
