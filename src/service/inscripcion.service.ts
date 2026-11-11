import { api } from "../libs/axios";
import type {Inscripcion} from "../types/incripciones.type"
export const incripcionService = {
    listarTodos: async(): Promise<Inscripcion[]> => (await api.get<Inscripcion[]>('/inscripcion')).data,
    matricula: async(grupoId: number): Promise<Inscripcion> => (await api.post<Inscripcion>('/inscripcion',{grupo_id: grupoId})).data
}