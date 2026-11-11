export interface EntregaArchivo {
  id_archivo: number;
  entrega_id: number;
  url: string;
  nombre: string;
  mimeType: string;
}

export interface Entrega {
  id_entrega: number;
  asignacion_id: number;
  estudiante_id: number;
  contenido_texto: string | null;
  fecha_entrega: string;
  calificacion: string | null;
  calificado_docente: number | null;
  fecha_calificacion: string | null;
  archivos: EntregaArchivo[];
  estudiante?: {
    id_estudiante: number;
    codigo_matricula: string;
    usuario: {
      id_usuario: number;
      nombre: string;
      appaterno: string;
      apmaterno: string;
    };
  };
  calificadoPorDocente?: {
    id_docente: number;
    usuario: { id_usuario: number; nombre: string; appaterno: string };
  };
}