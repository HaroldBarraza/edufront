import type { ObligacionFinanciera } from "./financiero.types";

export interface EstudianteListado {
  id_estudiante: number;
  codigo_matricula: string;
  tutor_id: number | null;
  usuario: {
    id_usuario: number;
    email: string;
    nombre: string;
    appaterno: string;
    apmaterno: string;
    telefono: string;
    estado: string;
  };
  tutor: { id_tutor: number; nombre: string; appaterno: string } | null;
}

export interface EstudianteDetalle extends EstudianteListado {
  obligaciones: ObligacionFinanciera[];
}
