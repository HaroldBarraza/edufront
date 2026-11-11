import type { Grupo } from "./academinco.types";
import type { Entrega } from "./entrega.types";


export interface Asginacion {
  id_asignacion: number;
  grupo_id: number;
  docente_id: number;
  titulo: string;
  instrucciones: string;
  fecha_limite: string;
  creacion_asignacion: string;
  grupo?: Grupo;
  docente?: {
    id_docente: number;
    usuario: {
      id_usuario: number;
      nombre: string;
      appaternos: string;
      apmaterno: string;
    };
  };
  entregas?: Entrega[]
}
