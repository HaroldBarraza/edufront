import axios from 'axios';

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

export interface FeedbackMatricula {
  titulo: string;
  mensaje: string;
  sugerencia: string;
  tipo: 'error' | 'advertencia';
}

export const FEEDBACK_MATRICULA: Record<MotivoRechazoMatricula, FeedbackMatricula> = {
  GRUPO_LLENO: {
    titulo: 'Grupo sin cupo',
    mensaje: 'Este grupo ya alcanzó su capacidad máxima de estudiantes.',
    sugerencia: 'Elige otro grupo de la misma materia, o espera a que alguien se retire.',
    tipo: 'error',
  },
  LIMITE_CREDITOS: {
    titulo: 'Límite de créditos superado',
    mensaje: 'Inscribirte en este grupo te haría superar el máximo de créditos permitidos en el periodo.',
    sugerencia: 'Retira una inscripción existente o espera al siguiente periodo.',
    tipo: 'error',
  },
  TRASLAPE_HORARIO: {
    titulo: 'Traslape de horario',
    mensaje: 'El horario de este grupo se cruza con otra materia en la que ya estás inscrito.',
    sugerencia: 'Busca un grupo con otro horario, o retira la inscripción en conflicto.',
    tipo: 'error',
  },
  MATERIA_YA_CURSADA: {
    titulo: 'Materia ya inscrita',
    mensaje: 'Ya tienes una inscripción activa en esta materia durante este periodo.',
    sugerencia: 'Solo puedes inscribirte una vez por materia en el mismo periodo.',
    tipo: 'error',
  },
  GRUPO_CERRADO: {
    titulo: 'Grupo no disponible',
    mensaje: 'Este grupo ya no admite inscripciones en su estado actual.',
    sugerencia: 'Elige otro grupo abierto de la misma materia.',
    tipo: 'error',
  },
  PERIODO_NO_ACTIVO: {
    titulo: 'Periodo no activo',
    mensaje: 'El periodo de este grupo no está abierto para matrícula en este momento.',
    sugerencia: 'Solo puedes matricularte durante el periodo activo del semestre.',
    tipo: 'advertencia',
  },
  ESTUDIANTE_NO_ACTIVO: {
    titulo: 'Cuenta no habilitada',
    mensaje: 'Tu cuenta no está activa. Probablemente tu matrícula no ha sido aprobada o estás suspendido por mora.',
    sugerencia: 'Contacta a recepción para verificar tu situación académica o financiera.',
    tipo: 'error',
  },
  ESTUDIANTE_NO_EXISTE: {
    titulo: 'Estudiante no registrado',
    mensaje: 'No encontramos tu perfil de estudiante en el sistema.',
    sugerencia: 'Contacta a recepción para completar tu registro.',
    tipo: 'error',
  },
  GRUPO_NO_EXISTE: {
    titulo: 'Grupo inexistente',
    mensaje: 'El grupo que intentas inscribir ya no existe.',
    sugerencia: 'Actualiza la página y prueba con otro grupo disponible.',
    tipo: 'error',
  },
};

const FALLBACK: FeedbackMatricula = {
  titulo: 'No se pudo completar la matrícula',
  mensaje: 'Ocurrió un problema al procesar tu inscripción.',
  sugerencia: 'Intenta de nuevo en unos segundos.',
  tipo: 'error',
};

export function parsearErrorMAtricula(err: unknown): FeedbackMatricula {
  if (!axios.isAxiosError(err)) return FALLBACK;

  if (err.response?.status === 401) {
    return {
      titulo: 'Sesión expirada',
      mensaje: 'Tu sesión ya no es válida.',
      sugerencia: 'Vuelve a iniciar sesión para continuar.',
      tipo: 'error',
    };
  }

  if (err.response?.status === 403) {
    return {
      titulo: 'Sin permiso',
      mensaje: 'Tu rol no puede realizar matrículas.',
      sugerencia: 'Esta acción solo está disponible para estudiantes.',
      tipo: 'error',
    };
  }

  const data = err.response?.data;
  const code: MotivoRechazoMatricula | undefined =
    data?.code ?? data?.message?.code;

  if (code && code in FEEDBACK_MATRICULA) {
    const base = FEEDBACK_MATRICULA[code];
    const detalleBackend =
      typeof data?.message === 'string' ? data.message : undefined;
    return { ...base, mensaje: detalleBackend ?? base.mensaje };
  }

  const texto =
    typeof data?.message === 'string'
      ? data.message
      : data?.message?.message;

  return {
    ...FALLBACK,
    mensaje: typeof texto === 'string' ? texto : FALLBACK.mensaje,
  };
}