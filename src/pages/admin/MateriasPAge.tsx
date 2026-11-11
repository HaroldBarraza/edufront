import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { materiaService } from "../../service/materia.service";
import type { Materia } from "../../types/academinco.types";

const schema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
  creditos: z.number().int().positive("Debe ser positivo"),
  costo_inscripcion: z.number().min(0, "No puede ser negativo"),
  costo_mensualidad: z.number().min(0, "No puede ser negativo"),
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

export function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Materia | null>(null);

  const crearForm = useForm<FormData>({ resolver: zodResolver(schema) });
  const editarForm = useForm<FormData>({ resolver: zodResolver(schema) });

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setMaterias(await materiaService.listar());
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar las materias."));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const crear = async (data: FormData) => {
    try {
      await materiaService.crear(data);
      crearForm.reset();
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear la materia."));
    }
  };

  const abrirEdicion = (m: Materia) => {
    setEditando(m);
    editarForm.reset({
      nombre: m.nombre,
      creditos: m.creditos,
      costo_inscripcion: Number(m.costo_inscripcion),
      costo_mensualidad: Number(m.costo_mensualidad),
    });
  };

  const guardarEdicion = async (data: FormData) => {
    if (!editando) return;
    try {
      await materiaService.actualizar(editando.id_materia, data);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar la materia."));
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materias</h1>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form
        onSubmit={crearForm.handleSubmit(crear)}
        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 p-4 bg-white border rounded"
      >
        <div>
          <label className="block text-sm">Nombre</label>
          <input
            {...crearForm.register("nombre")}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.nombre && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.nombre.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Créditos</label>
          <input
            type="number"
            {...crearForm.register("creditos", { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.creditos && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.creditos.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Inscripción (Bs)</label>
          <input
            type="number"
            step="0.01"
            {...crearForm.register("costo_inscripcion", {
              valueAsNumber: true,
            })}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.costo_inscripcion && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.costo_inscripcion.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Mensualidad (Bs)</label>
          <input
            type="number"
            step="0.01"
            {...crearForm.register("costo_mensualidad", {
              valueAsNumber: true,
            })}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.costo_mensualidad && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.costo_mensualidad.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={crearForm.formState.isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end disabled:opacity-50"
        >
          {crearForm.formState.isSubmitting ? "Creando…" : "Crear materia"}
        </button>
      </form>

      {editando && (
        <form
          onSubmit={editarForm.handleSubmit(guardarEdicion)}
          className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 p-4 bg-amber-50 border border-amber-300 rounded"
        >
          <div className="md:col-span-5 flex justify-between items-center">
            <strong>Editando: {editando.nombre}</strong>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="text-red-600 text-sm"
            >
              Cancelar
            </button>
          </div>
          <input
            {...editarForm.register("nombre")}
            className="border p-2 rounded"
            placeholder="Nombre"
          />
          <input
            type="number"
            {...editarForm.register("creditos", { valueAsNumber: true })}
            className="border p-2 rounded"
            placeholder="Créditos"
          />
          <input
            type="number"
            step="0.01"
            {...editarForm.register("costo_inscripcion", {
              valueAsNumber: true,
            })}
            className="border p-2 rounded"
            placeholder="Inscripción"
          />
          <input
            type="number"
            step="0.01"
            {...editarForm.register("costo_mensualidad", {
              valueAsNumber: true,
            })}
            className="border p-2 rounded"
            placeholder="Mensualidad"
          />
          <button
            type="submit"
            disabled={editarForm.formState.isSubmitting}
            className="bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editarForm.formState.isSubmitting ? "Guardando…" : "Guardar"}
          </button>
        </form>
      )}

      {cargando ? (
        <p>Cargando…</p>
      ) : materias.length === 0 ? (
        <p className="text-gray-600">Aún no hay materias creadas.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2">Créditos</th>
              <th className="border p-2">Inscripción</th>
              <th className="border p-2">Mensualidad</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id_materia}>
                <td className="border p-2">{m.nombre}</td>
                <td className="border p-2 text-center">{m.creditos}</td>
                <td className="border p-2 text-right">
                  S/. {Number(m.costo_inscripcion).toFixed(2)}
                </td>
                <td className="border p-2 text-right">
                  S/. {Number(m.costo_mensualidad).toFixed(2)}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => abrirEdicion(m)}
                    className="text-blue-600 underline text-sm"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
