export type EstadoPeriodo = "PREPARADO" | "ACTIVO" | "CERRADO";
export type EstadoGrupo = "ABIERTO" | "CANCELADO" | "CERRADO";
export type Dia = "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES";

export interface Periodo {
  id_periodo: number;
  year: number;
  numero: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  limite_creditos: number;
  estado: EstadoPeriodo;
}

export interface Materia {
  id_materia: number;
  nombre: string;
  creditos: number;
  costo_inscripcion: string;
  costo_mensualidad: string;
}

export interface HorarioGrupo {
  id_horario: number;
  grupo_id: number;
  dia_semana: Dia;
  hora_inicio: string;
  hora_fin: string;
}

export interface DocenteResumen {
  id_docente: number;
  usuario: {
    id_usuario: number;
    nombre: string;
    appaterno: string;
    apmaterno: string;
  };
}

export interface Grupo {
  id_grupo: number;
  materia_id: number;
  periodo_id: number;
  docente_id: number;
  codigo: string;
  cupo_maximo: number;
  estado: EstadoGrupo;
  materia: Materia;
  periodo: Periodo;
  docente: DocenteResumen;
  horarios: HorarioGrupo[];
}
