import { useCallback, useState } from 'react';
import { incripcionService } from '../service/inscripcion.service';
import {
  parsearErrorMAtricula,
  type FeedbackMatricula,
} from '../libs/inscripciones.error';

export interface UseMatriculaResult {
  matricular: (grupoId: number) => Promise<void>;
  matriculandoId: number | null;
  feedback: FeedbackMatricula | null;
  limpiarFeedback: () => void;
  exito: string | null;
  limpiarExito: () => void;
}

export function useMatricula(
  onSuccess?: () => void | Promise<void>,
): UseMatriculaResult {
  const [matriculandoId, setMatriculandoId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMatricula | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const matricular = useCallback(
    async (grupoId: number) => {
      setMatriculandoId(grupoId);
      setFeedback(null);
      setExito(null);
      try {
        await incripcionService.matricula(grupoId);
        setExito('¡Matrícula exitosa! Ya apareces en el grupo.');
        await onSuccess?.();
      } catch (err) {
        setFeedback(parsearErrorMAtricula(err));
      } finally {
        setMatriculandoId(null);
      }
    },
    [onSuccess],
  );

  return {
    matricular,
    matriculandoId,
    feedback,
    limpiarFeedback: () => setFeedback(null),
    exito,
    limpiarExito: () => setExito(null),
  };
}