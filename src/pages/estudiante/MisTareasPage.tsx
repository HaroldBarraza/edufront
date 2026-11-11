import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList } from 'lucide-react';
import { AsginacionesService } from '../../service/asignaciones.service';
import { entregaService } from '../../service/entrega.service';
import { incripcionService } from '../../service/inscripcion.service';
import { useAuthStore } from '../../stores/useAuthstore';
import { BadgeFechaAsignacion } from '../../components/BadgeFechaAsignacion';
import { BadgeEstadoEntrega } from '../../components/BadgeEstadoEntrega';
import { estadoEntrega } from '../../libs/asignaciones';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import type { Asginacion } from '../../types/asignaciones.types';
import type { Entrega } from '../../types/entrega.types';
import type { Inscripcion } from '../../types/incripciones.type';

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === 'string') return raw;
    if (typeof raw?.message === 'string') return raw.message;
  }
  return fallback;
}

export function MisTareasPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [asignaciones, setAsignaciones] = useState<Asginacion[]>([]);
  const [misEntregas, setMisEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [asigs, todasEntregas, todasInscripciones] = await Promise.all([
          AsginacionesService.listar(),
          entregaService.listar(),
          incripcionService.listarTodos(),
        ]);

        const gruposInscritos = new Set<number>();
        for (const i of todasInscripciones as Inscripcion[]) {
          if (i.estudiante_id === usuario?.id && i.estado === 'INSCRITO') {
            gruposInscritos.add(i.grupo_id);
          }
        }

        setAsignaciones(asigs.filter((a) => gruposInscritos.has(a.grupo_id)));
        setMisEntregas(todasEntregas.filter((e) => e.estudiante_id === usuario?.id));
      } catch (err) {
        setError(mensajeError(err, 'No se pudieron cargar tus tareas.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [usuario?.id]);

  const entregaPorAsignacion = useMemo(() => {
    const map: Record<number, Entrega> = {};
    for (const e of misEntregas) map[e.asignacion_id] = e;
    return map;
  }, [misEntregas]);

  if (cargando) return <p className="p-6 text-slate-500">Cargando…</p>;
  if (error) return <ErrorBanner mensaje={error} />;

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Aula virtual"
        titulo="Mis tareas"
        descripcion="Revisa las tareas de tus grupos y envía tus entregas."
      />

      {asignaciones.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          titulo="No tienes tareas publicadas"
          descripcion="Cuando tu profesor publique una asignación en tus grupos, aparecerá aquí."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {asignaciones.map((a) => {
            const miEntrega = entregaPorAsignacion[a.id_asignacion] ?? null;
            const estado = estadoEntrega(miEntrega);
            return (
              <article
                key={a.id_asignacion}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <header className="mb-2">
                  <h3 className="text-lg font-bold text-slate-950">{a.titulo}</h3>
                  <p className="text-sm text-slate-500">
                    {a.grupo?.materia.nombre} · Grupo {a.grupo?.codigo}
                  </p>
                </header>

                <div className="mb-3 flex flex-wrap gap-2">
                  <BadgeFechaAsignacion fecha_limite={a.fecha_limite} />
                  <BadgeEstadoEntrega
                    estado={estado}
                    calificacion={miEntrega?.calificacion ?? null}
                  />
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                  {a.instrucciones}
                </p>

                <Link
                  to={`/estudiante/asignaciones/${a.id_asignacion}`}
                  className="mt-auto text-sm font-semibold text-primary hover:underline"
                >
                  {estado === 'SIN_ENTREGAR' ? 'Entregar tarea →' : 'Ver detalle →'}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}