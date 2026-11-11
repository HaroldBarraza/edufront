import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { financieroService } from '../service/financiero.service';
import type { ObligacionFinanciera } from '../types/financiero.types';

interface UseHistorialFinancieroResult {
  obligaciones: ObligacionFinanciera[];
  cargando: boolean;
  error: string | null;
  stats: { pendiente: number; pagado: number; vencidas: number };
  recargar: () => Promise<void>;
}

export function useHistorialFinanciero(
  estudianteId: number | undefined,
): UseHistorialFinancieroResult {
  const [obligaciones, setObligaciones] = useState<ObligacionFinanciera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!estudianteId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const data = await financieroService.historialEstudiante(estudianteId);
      setObligaciones(data.obligaciones);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'No se pudo cargar el historial.');
      } else {
        setError('Error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  }, [estudianteId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const stats = useMemo(() => {
    const pendiente = obligaciones
      .filter((o) => o.estado === 'PENDIENTE' || o.estado === 'VENCIDO')
      .reduce((acc, o) => acc + Number(o.monto), 0);
    const pagado = obligaciones
      .filter((o) => o.estado === 'PAGADO')
      .reduce((acc, o) => acc + Number(o.monto), 0);
    const vencidas = obligaciones.filter((o) => o.estado === 'VENCIDO').length;
    return { pendiente, pagado, vencidas };
  }, [obligaciones]);

  return { obligaciones, cargando, error, stats, recargar: cargar };
}