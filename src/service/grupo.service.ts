import { api } from "../libs/axios";
import type { Grupo, EstadoGrupo } from "../types/academinco.types";

export type CrearGrupoDto = {
    materia_id: number
    periodo_id: number
    docente_id: number
    codigo:string
    cupo_maximo: number
    estado?: EstadoGrupo
}
export const grupoService = {
    listar: async() : Promise<Grupo[]> => (await api.get<Grupo[]>('/grupo')).data,
    crear: async(dto: CrearGrupoDto): Promise<Grupo> => (await api.post<Grupo>('/grupo',dto)).data,
    actualizar: async(id:number, dto:Partial<CrearGrupoDto>): Promise<Grupo> => (await api.patch<Grupo>(`/grupo/${id}`,dto)).data
}