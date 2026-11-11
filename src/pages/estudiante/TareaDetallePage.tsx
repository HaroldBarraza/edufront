import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Paperclip, Upload } from 'lucide-react';
import { AsginacionesService } from '../../service/asignaciones.service';
import { entregaService } from '../../service/entrega.service';
import { subirArchivoCloudinary } from '../../libs/cloudinary';
import { BadgeFechaAsignacion } from '../../components/BadgeFechaAsignacion';
import { BadgeEstadoEntrega } from '../../components/BadgeEstadoEntrega';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Button } from '../../components/ui/button';
import { estadoEntrega } from '../../libs/asignaciones';
import { useAuthStore } from '../../stores/useAuthstore';
import type { Asginacion } from '../../types/asignaciones.types';
import type { Entrega } from '../../types/entrega.types';

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === 'string') return raw;
    if (typeof raw?.message === 'string') return raw.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function TareaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const idAsignacion = Number(id);
  const usuario = useAuthStore((s) => s.usuario);

  const [asignacion, setAsignacion] = useState<Asginacion | null>(null);
  const [miEntrega, setMiEntrega] = useState<Entrega | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [texto, setTexto] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [a, todas] = await Promise.all([
        AsginacionesService.detalle(idAsignacion),
        entregaService.listar(),
      ]);
      setAsignacion(a);
      const mia = todas.find(
        (e) => e.asignacion_id === idAsignacion && e.estudiante_id === usuario?.id,
      );
      setMiEntrega(mia ?? null);
      if (mia) setTexto(mia.contenido_texto ?? '');
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar la tarea.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(idAsignacion)) void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAsignacion]);

  const estado = estadoEntrega(miEntrega);
  const calificada = miEntrega !== null && miEntrega.calificacion !== null;

  const adjuntarArchivos = async (entregaId: number, files: File[]) => {
    for (const file of files) {
      const subido = await subirArchivoCloudinary(file);
      await entregaService.adjuntarArchivo({
        entrega_id: entregaId,
        url: subido.url,
        nombre: subido.nombre,
        mimeType: subido.mimeType,
      });
    }
  };

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    setExito(null);
    try {
      let entregaId: number;

      if (miEntrega) {
        if (miEntrega.calificacion !== null) {
          throw new Error('No puedes editar una entrega ya calificada.');
        }
        await entregaService.actualizar(miEntrega.id_entrega, texto);
        entregaId = miEntrega.id_entrega;
      } else {
        const nueva = await entregaService.crear({
          asignacion_id: idAsignacion,
          contenido_texto: texto || undefined,
        });
        entregaId = nueva.id_entrega;
      }

      if (archivos.length > 0) {
        await adjuntarArchivos(entregaId, archivos);
      }

      setArchivos([]);
      setExito('¡Entrega enviada con éxito!');
      await cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo enviar la entrega.'));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <p className="p-6 text-slate-500">Cargando…</p>;
  }

  if (!asignacion) {
    return (
      <div className="p-6">
        <ErrorBanner mensaje={error ?? 'Tarea no encontrada'} />
      </div>
    );
  }

  return (
    <section className="max-w-3xl space-y-6">
      <Link to="/estudiante/asignaciones" className="text-sm text-blue-600 hover:underline">
        ← Volver a mis tareas
      </Link>

      <PageHeader
        kicker="Aula virtual"
        titulo={asignacion.titulo}
        descripcion={`${asignacion.grupo?.materia.nombre ?? 'Materia'} · Grupo ${asignacion.grupo?.codigo ?? '—'}`}
      />

      <div className="flex flex-wrap gap-2">
        <BadgeFechaAsignacion fecha_limite={asignacion.fecha_limite} />
        <BadgeEstadoEntrega estado={estado} calificacion={miEntrega?.calificacion ?? null} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Instrucciones
        </h2>
        <p className="whitespace-pre-wrap text-sm text-slate-700">
          {asignacion.instrucciones}
        </p>
      </section>

      {error && <ErrorBanner mensaje={error} onCerrar={() => setError(null)} />}
      {exito && (
        <ErrorBanner variante="exito" mensaje={exito} onCerrar={() => setExito(null)} />
      )}

      {/* Calificado: solo lectura */}
      {calificada && miEntrega && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="mb-2 text-lg font-bold text-emerald-900">
             Calificación: {Number(miEntrega.calificacion).toFixed(2)} / 20
          </h2>
          {miEntrega.contenido_texto && (
            <div className="my-2 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm">
              {miEntrega.contenido_texto}
            </div>
          )}
          {miEntrega.archivos.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {miEntrega.archivos.map((a) => (
                <li key={a.id_archivo} className="flex items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {a.nombre}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Calificado el{' '}
            {miEntrega.fecha_calificacion
              ? new Date(miEntrega.fecha_calificacion).toLocaleString('es-PE')
              : '—'}
          </p>
        </section>
      )}

      {/* Entregado sin calificar */}
      {estado === 'ENTREGADO_SIN_CALIFICAR' && miEntrega && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-2 text-lg font-bold text-blue-900">📤 Entrega enviada</h2>
          <p className="mb-3 text-sm text-slate-700">
            Tu profesor aún no ha calificado. Puedes editar tu entrega mientras no esté
            calificada.
          </p>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contenido</label>
          <textarea
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
          />
          {miEntrega.archivos.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs text-slate-600">Archivos ya adjuntos:</p>
              <ul className="space-y-1 text-sm">
                {miEntrega.archivos.map((a) => (
                  <li key={a.id_archivo} className="flex items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {a.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Añadir más archivos (opcional)
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
            className="mb-3"
          />
          <Button onClick={() => void enviar()} disabled={enviando}>
            {enviando ? 'Actualizando…' : 'Actualizar entrega'}
          </Button>
        </section>
      )}
      {estado === 'SIN_ENTREGAR' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Entregar tarea</h2>
          <p className="mb-3 text-sm text-slate-600">
            Puedes entregar solo texto, solo archivos, o ambos.
          </p>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Contenido (opcional)
          </label>
          <textarea
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Escribe tu respuesta o pega un enlace…"
          />

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Archivos (opcional, puedes adjuntar varios)
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
            className="mb-3"
          />
          {archivos.length > 0 && (
            <ul className="mb-3 space-y-1 text-sm text-slate-600">
              {archivos.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          )}

          <Button
            onClick={() => void enviar()}
            disabled={enviando || (!texto.trim() && archivos.length === 0)}
          >
            <Upload className="h-4 w-4" />
            {enviando ? 'Enviando…' : 'Enviar entrega'}
          </Button>
        </section>
      )}
    </section>
  );
}