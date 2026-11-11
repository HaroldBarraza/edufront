import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AsginacionesService } from "../../service/asignaciones.service";
import { grupoService } from "../../service/grupo.service";
import { useAuthStore } from "../../stores/useAuthstore";
import { Grupo } from "../../types/academinco.types";

const schema = z.object({
  grupo_id: z.number().int().positive("Selecciona un grupo"),
  titulo: z.string().min(3, "Mínimo 3 caracteres").max(150),
  instrucciones: z.string().min(1, "Requerido"),
  fecha_limite: z
    .string()
    .min(1, "Fecha requerida")
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: "La fecha límite debe ser futura",
    }),
});
type FormData = z.infer<typeof schema>;

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === "string") return raw;
    if (typeof raw?.message === "string") return raw.message;
  }
  return fallback;
}

export function NuevaAsignacionPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      try {
        const todos = await grupoService.listar();
        setGrupos(todos.filter((g) => g.docente_id === usuario?.id));
      } catch (err) {
        setError(mensajeError(err, "No se pudieron cargar tus grupos."));
      } finally {
        setCargandoGrupos(false);
      }
    })();
  }, [usuario?.id]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const isoDate = new Date(data.fecha_limite).toISOString();
      await AsginacionesService.crear({
        grupo_id: data.grupo_id,
        titulo: data.titulo,
        instrucciones: data.instrucciones,
        fecha_limite: isoDate,
      });
      navigate("/profesor/asignaciones");
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear la asignación."));
    }
  };

  if (cargandoGrupos) return <p className="p-6">Cargando grupos…</p>;

  if (grupos.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Nueva asignación</h1>
        <p className="text-amber-700">
          No tienes grupos asignados todavía. Contacta a administración.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Nueva asignación</h1>

      {error && (
        <p className="bg-red-50 border border-red-300 p-3 rounded mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Grupo</label>
          <select
            {...register("grupo_id", { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>— Selecciona —</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.materia.nombre} · {g.codigo} ({g.periodo.nombre})
              </option>
            ))}
          </select>
          {errors.grupo_id && (
            <p className="text-red-600 text-xs mt-1">
              {errors.grupo_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            {...register("titulo")}
            className="border p-2 rounded w-full"
            placeholder="Ej. Práctica calificada 1"
          />
          {errors.titulo && (
            <p className="text-red-600 text-xs mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Instrucciones
          </label>
          <textarea
            {...register("instrucciones")}
            rows={5}
            className="border p-2 rounded w-full"
            placeholder="Describe la tarea, criterios, formato esperado…"
          />
          {errors.instrucciones && (
            <p className="text-red-600 text-xs mt-1">
              {errors.instrucciones.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha límite (fecha y hora)
          </label>
          <input
            type="datetime-local"
            {...register("fecha_limite")}
            className="border p-2 rounded w-full"
          />
          {errors.fecha_limite && (
            <p className="text-red-600 text-xs mt-1">
              {errors.fecha_limite.message}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Publicando…" : "Publicar asignación"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profesor/asignaciones")}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
