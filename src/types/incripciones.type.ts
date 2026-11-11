import type { EstadoUsuario } from './auth.types';
import type { Grupo } from './academinco.types';

export type MotivoRechazoMatricula =
  | 'GRUPO_NO_EXISTE'
  | 'GRUPO_CERRADO'
  | 'PERIODO_NO_ACTIVO'
  | 'ESTUDIANTE_NO_EXISTE'
  | 'ESTUDIANTE_NO_ACTIVO'
  | 'GRUPO_LLENO'
  | 'MATERIA_YA_CURSADA'
  | 'LIMITE_CREDITOS'
  | 'TRASLAPE_HORARIO';

export type EstadoInscripcion = 'INSCRITO' | 'RETIRADO';

export interface Inscripcion {
  id_inscripcion: number;
  estudiante_id: number;
  grupo_id: number;
  fecha_inscripcion: string;
  estado: EstadoInscripcion;
  grupo: Grupo;
  estudiante?: {
    id_estudiante: number;
    usuario: { id_usuario: number; estado: EstadoUsuario };
  };
}