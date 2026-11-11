import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import { grupoService } from '../../service/grupo.service';
import { periodoService } from '../../service/periodo.service';
import { incripcionService } from '../../service/inscripcion.service';
import { useAuthStore } from '../../stores/useAuthstore';
import { useMatricula } from '../../hooks/useMatricula';
import { GrupoCard } from '../../components/GrupoCard';
import { FeedbackMatriculaAlert } from '../../components/FeedbackMatriculaAlert';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Button } from '../../components/ui/button';
import type { Grupo, Periodo } from '../../types/academinco.types';
import type { Inscripcion } from '../../types/incripciones.type';

export function GruposDisponiblesPage() {
  const usuario = useAuthStore((s) => s.usuario);

  const [periodoActivo, setPeriodoActivo] = useState<Periodo | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [periodos, todosGrupos, todasInscripciones] = await Promise.all([
        periodoService.listar(),
        grupoService.listar(),
        incripcionService.listarTodos(),
      ]);
      const activo = periodos.find((p) => p.estado === 'ACTIVO') ?? null;
      setPeriodoActivo(activo);
      setGrupos(todosGrupos);
      setInscripciones(
        todasInscripciones.filter((i) => i.estudiante_id === usuario?.id),
      );
    } catch (err) {
      console.error('[GruposDisponibles] error:', err);
      setErrorCarga(
        axios.isAxiosError(err)
          ? 'No se pudieron cargar los grupos.'
          : 'Error inesperado.',
      );
    } finally {
      setCargando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const {
    matricular,
    matriculandoId,
    feedback,
    limpiarFeedback,
    exito,
    limpiarExito,
  } = useMatricula(cargar);

  const gruposDisponibles = useMemo(
    () =>
      grupos.filter(
        (g) =>
          g.periodo_id === periodoActivo?.id_periodo && g.estado === 'ABIERTO',
      ),
    [grupos, periodoActivo],
  );

  const misMaterias = useMemo(() => {
    const set = new Set<number>();
    for (const i of inscripciones) {
      if (
        i.estado === 'INSCRITO' &&
        i.grupo.periodo_id === periodoActivo?.id_periodo
      ) {
        set.add(i.grupo.materia_id);
      }
    }
    return set;
  }, [inscripciones, periodoActivo]);

  const onMatricular = useCallback(
    (grupoId: number) => {
      void matricular(grupoId);
    },
    [matricular],
  );

  if (cargando) {
    return <p className="p-6 text-slate-500">Cargando grupos…</p>;
  }

  if (errorCarga) {
    return (
      <div className="p-6">
        <ErrorBanner mensaje={errorCarga} />
      </div>
    );
  }

  if (!periodoActivo) {
    return (
      <div className="p-6">
        <ErrorBanner
          variante="advertencia"
          mensaje="No hay periodo activo. Espera a que administración abra un semestre."
        />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Matriculación"
        titulo="Grupos disponibles"
        descripcion={`Periodo: ${periodoActivo.nombre} · Límite de créditos: ${periodoActivo.limite_creditos}`}
      />

      {feedback && (
        <FeedbackMatriculaAlert
          feedback={feedback}
          onCerrar={limpiarFeedback}
        />
      )}
      {exito && (
        <ErrorBanner
          variante="exito"
          mensaje={exito}
          onCerrar={limpiarExito}
        />
      )}

      {gruposDisponibles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          titulo="No hay grupos abiertos"
          descripcion="Aún no se han publicado grupos para este periodo."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gruposDisponibles.map((g) => (
            <GrupoCard
              key={g.id_grupo}
              grupo={g}
              yaInscrito={misMaterias.has(g.materia_id)}
              matriculando={matriculandoId === g.id_grupo}
              onMatricular={onMatricular}
            />
          ))}
        </div>
      )}

      <Link
        to="/estudiante/horario"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Ver mi horario semanal →
      </Link>
    </section>
  );
}