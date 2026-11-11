import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { AsginacionesService } from "../../service/asignaciones.service";
import { entregaService } from "../../service/entrega.service";
import { BadgeFechaAsignacion } from "../../components/BadgeFechaAsignacion";
import type { Asginacion } from "../../types/asignaciones.types";
import type { Entrega } from "../../types/entrega.types";

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === "string") return raw;
    if (typeof raw?.message === "string") return raw.message;
  }
  return fallback;
}

export function AsignacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const idAsignacion = Number(id);
  const [asignacion, setAsignacion] = useState<Asginacion | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [calificando, setCalificando] = useState<number | null>(null);
  const [notaInput, setNotaInput] = useState<Record<number, string>>({});

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [a, todas] = await Promise.all([
        AsginacionesService.detalle(idAsignacion),
        entregaService.listar(),
      ]);
      setAsignacion(a);
      setEntregas(todas.filter((e) => e.asignacion_id === idAsignacion));
    } catch (err) {
      setError(mensajeError(err, "No se pudo cargar la asignación."));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(idAsignacion)) void cargar();
  }, [idAsignacion]);

  const calificar = async (entregaId: number) => {
    const raw = notaInput[entregaId];
    const nota = Number(raw);
    if (!Number.isFinite(nota) || nota < 0 || nota > 20) {
      setError("La calificación debe estar entre 0 y 20.");
      return;
    }
    setCalificando(entregaId);
    setError(null);
    try {
      await entregaService.calificar(entregaId, nota);
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo calificar la entrega."));
    } finally {
      setCalificando(null);
    }
  };

  if (cargando) return <p className="p-6">Cargando…</p>;
  if (!asignacion)
    return <p className="p-6 text-red-600">{error ?? "No encontrada"}</p>;

  return (
    <main className="p-6">
      <Link to="/profesor/asignaciones" className="text-blue-600 text-sm">
        ← Volver a mis asignaciones
      </Link>

      <header className="my-4">
        <h1 className="text-2xl font-bold">{asignacion.titulo}</h1>
        <p className="text-sm text-gray-600">
          {asignacion.grupo?.materia.nombre} · Grupo {asignacion.grupo?.codigo}
        </p>
        <div className="mt-2">
          <BadgeFechaAsignacion fecha_limite={asignacion.fecha_limite} />
        </div>
      </header>

      <section className="bg-gray-50 border rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Instrucciones</h2>
        <p className="whitespace-pre-wrap text-sm">
          {asignacion.instrucciones}
        </p>
      </section>

      {error && (
        <p className="bg-red-50 border border-red-300 p-3 rounded mb-4">
          {error}
        </p>
      )}

      <h2 className="text-lg font-bold mb-3">
        Entregas recibidas ({entregas.length})
      </h2>

      {entregas.length === 0 ? (
        <p className="text-gray-600">Ningún estudiante ha entregado todavía.</p>
      ) : (
        <div className="space-y-4">
          {entregas.map((e) => {
            const calificada = e.calificacion !== null;
            return (
              <article
                key={e.id_entrega}
                className="border rounded p-4 bg-white"
              >
                <header className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">
                      {e.estudiante?.usuario.nombre}{" "}
                      {e.estudiante?.usuario.appaterno}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {e.estudiante?.codigo_matricula} · Entregado:{" "}
                      {new Date(e.fecha_entrega).toLocaleString("es-PE")}
                    </p>
                  </div>
                  {calificada && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                      {Number(e.calificacion).toFixed(2)} / 20
                    </span>
                  )}
                </header>

                {e.contenido_texto && (
                  <div className="text-sm bg-gray-50 p-3 rounded mb-2 whitespace-pre-wrap">
                    {e.contenido_texto}
                  </div>
                )}

                {e.archivos.length > 0 && (
                  <ul className="text-sm mb-2">
                    {e.archivos.map((a) => (
                      <li key={a.id_archivo}>
                        📎{" "}
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          {a.nombre}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {!calificada ? (
                  <div className="flex items-end gap-2 mt-3">
                    <div>
                      <label className="block text-xs">Nota (0–20)</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={notaInput[e.id_entrega] ?? ""}
                        onChange={(ev) =>
                          setNotaInput((p) => ({
                            ...p,
                            [e.id_entrega]: ev.target.value,
                          }))
                        }
                        className="border p-2 rounded w-24"
                      />
                    </div>
                    <button
                      onClick={() => void calificar(e.id_entrega)}
                      disabled={calificando === e.id_entrega}
                      className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {calificando === e.id_entrega
                        ? "Calificando…"
                        : "Calificar"}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    Calificado por {e.calificadoPorDocente?.usuario.nombre}{" "}
                    {e.calificadoPorDocente?.usuario.appaterno} el{" "}
                    {e.fecha_calificacion
                      ? new Date(e.fecha_calificacion).toLocaleString("es-PE")
                      : "—"}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
