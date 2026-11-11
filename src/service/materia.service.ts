import { api } from "../libs/axios";
import type { Materia } from "../types/academinco.types";

export type CrearMateriaDto = {
    nombre: string
    creditos: number
    costo_inscripcion: number
    costo_mensualidad: number
}

export const materiaService = {
    listar : async(): Promise<Materia[]> => (await api.get<Materia[]>('/materia')).data,
    crear: async(dto:CrearMateriaDto):Promise<Materia> => (await api.post<Materia>('/materia', dto)).data, 
    actualizar: async(id:number, dto: Partial<CrearMateriaDto>): Promise<Materia> => (await api.patch<Materia>(`/materia/${id}`, dto)).data,
}