import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, FileText } from 'lucide-react';
import { AsginacionesService } from '../../service/asignaciones.service';
import { entregaService } from '../../service/entrega.service';
import { useAuthStore } from '../../stores/useAuthstore';
import { BadgeFechaAsignacion } from '../../components/BadgeFechaAsignacion';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Button } from '../../components/ui/button';
import type { Asginacion } from '../../types/asignaciones.types';
import type { Entrega } from '../../types/entrega.types';

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === 'string') return raw;
    if (typeof raw?.message === 'string') return raw.message;
  }
  return fallback;
}

export function MisAsignacionesPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [asignaciones, setAsignaciones] = useState<Asginacion[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [asigs, ents] = await Promise.all([
          AsginacionesService.listar(),
          entregaService.listar(),
        ]);
        setAsignaciones(asigs.filter((a) => a.docente_id === usuario?.id));
        setEntregas(ents);
      } catch (err) {
        setError(mensajeError(err, 'No se pudieron cargar las asignaciones.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [usuario?.id]);

  const entregasPorAsignacion = useMemo(() => {
    const map: Record<number, { total: number; sinCalificar: number }> = {};
    for (const e of entregas) {
      const bucket = (map[e.asignacion_id] ??= { total: 0, sinCalificar: 0 });
      bucket.total += 1;
      if (e.calificacion === null) bucket.sinCalificar += 1;
    }
    return map;
  }, [entregas]);

  if (cargando) return <p className="p-6 text-slate-500">Cargando…</p>;
  if (error) return <ErrorBanner mensaje={error} />;

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Aula virtual"
        titulo="Mis asignaciones"
        descripcion="Publica tareas y revisa las entregas de tus estudiantes."
        accion={
          <Link to="/profesor/asignaciones/nueva">
            <Button>
              <Plus className="h-4 w-4" /> Nueva asignación
            </Button>
          </Link>
        }
      />

      {asignaciones.length === 0 ? (
        <EmptyState
          icon={FileText}
          titulo="Aún no has publicado asignaciones"
          descripcion="Crea la primera tarea para que tus estudiantes puedan entregar."
          accion={
            <Link to="/profesor/asignaciones/nueva">
              <Button>
                <Plus className="h-4 w-4" /> Publicar primera asignación
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {asignaciones.map((a) => {
            const stats = entregasPorAsignacion[a.id_asignacion] ?? {
              total: 0,
              sinCalificar: 0,
            };
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

                <div className="mb-3">
                  <BadgeFechaAsignacion fecha_limite={a.fecha_limite} />
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                  {a.instrucciones}
                </p>

                <div className="mb-3 flex items-center gap-3 text-sm">
                  <span className="text-slate-600">
                    📥 {stats.total} entrega{stats.total === 1 ? '' : 's'}
                  </span>
                  {stats.sinCalificar > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                      {stats.sinCalificar} por calificar
                    </span>
                  )}
                </div>

                <Link
                  to={`/profesor/asignaciones/${a.id_asignacion}`}
                  className="mt-auto text-sm font-semibold text-primary hover:underline"
                >
                  Ver entregas y calificar →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}