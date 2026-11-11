import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { grupoService } from '../../service/grupo.service';
import { materiaService } from '../../service/materia.service';
import { periodoService } from '../../service/periodo.service';
import { docenteService } from '../../service/docente.service';
import type {
  Grupo,
  Materia,
  Periodo,
  DocenteResumen,
  EstadoGrupo,
} from '../../types/academinco.types';

const schema = z.object({
  materia_id: z.number().int().positive('Selecciona materia'),
  periodo_id: z.number().int().positive('Selecciona periodo'),
  docente_id: z.number().int().positive('Selecciona docente'),
  codigo: z.string().min(1, 'Requerido').max(10),
  cupo_maximo: z.number().int().positive('Debe ser positivo'),
  estado: z.enum(['ABIERTO', 'CANCELADO', 'CERRADO']).optional(),
});
type FormData = z.infer<typeof schema>;

function mensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === 'string') return raw;
    if (typeof raw?.message === 'string') return raw.message;
  }
  return fallback;
}

export function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [docentes, setDocentes] = useState<DocenteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Grupo | null>(null);

  const crearForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { estado: 'ABIERTO' },
  });
  const editarForm = useForm<FormData>({ resolver: zodResolver(schema) });

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [gs, ms, ps, ds] = await Promise.all([
        grupoService.listar(),
        materiaService.listar(),
        periodoService.listar(),
        docenteService.listar(),
      ]);
      setGrupos(gs);
      setMaterias(ms);
      setPeriodos(ps);
      setDocentes(ds);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar los datos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const crear = async (data: FormData) => {
    try {
      await grupoService.crear(data);
      crearForm.reset({ estado: 'ABIERTO' });
      await cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo crear el grupo.'));
    }
  };

  const abrirEdicion = (g: Grupo) => {
    setEditando(g);
    editarForm.reset({
      materia_id: g.materia_id,
      periodo_id: g.periodo_id,
      docente_id: g.docente_id,
      codigo: g.codigo,
      cupo_maximo: g.cupo_maximo,
      estado: g.estado,
    });
  };

  const guardarEdicion = async (data: FormData) => {
    if (!editando) return;
    try {
      await grupoService.actualizar(editando.id_grupo, data);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo actualizar el grupo.'));
    }
  };

  const etiquetaPeriodo = useMemo(
    () => (id: number) => {
      const p = periodos.find((x) => x.id_periodo === id);
      return p ? `${p.nombre}` : `#${id}`;
    },
    [periodos],
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grupos</h1>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form
        onSubmit={crearForm.handleSubmit(crear)}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-6 p-4 bg-white border rounded"
      >
        <div>
          <label className="block text-sm">Materia</label>
          <select
            {...crearForm.register('materia_id', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>—</option>
            {materias.map((m) => (
              <option key={m.id_materia} value={m.id_materia}>
                {m.nombre}
              </option>
            ))}
          </select>
          {crearForm.formState.errors.materia_id && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.materia_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Periodo</label>
          <select
            {...crearForm.register('periodo_id', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>—</option>
            {periodos.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre} ({p.estado})
              </option>
            ))}
          </select>
          {crearForm.formState.errors.periodo_id && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.periodo_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Docente</label>
          <select
            {...crearForm.register('docente_id', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>—</option>
            {docentes.map((d) => (
              <option key={d.id_docente} value={d.id_docente}>
                {d.usuario.nombre} {d.usuario.appaterno}
              </option>
            ))}
          </select>
          {crearForm.formState.errors.docente_id && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.docente_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Código</label>
          <input
            {...crearForm.register('codigo')}
            className="border p-2 rounded w-full"
            placeholder="A"
          />
          {crearForm.formState.errors.codigo && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.codigo.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Cupo</label>
          <input
            type="number"
            {...crearForm.register('cupo_maximo', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
            placeholder="30"
          />
          {crearForm.formState.errors.cupo_maximo && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.cupo_maximo.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Estado</label>
          <select
            {...crearForm.register('estado')}
            className="border p-2 rounded w-full"
          >
            <option value="ABIERTO">ABIERTO</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={crearForm.formState.isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end disabled:opacity-50"
        >
          {crearForm.formState.isSubmitting ? 'Creando…' : 'Crear grupo'}
        </button>
      </form>

      {editando && (
        <form
          onSubmit={editarForm.handleSubmit(guardarEdicion)}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-6 p-4 bg-amber-50 border border-amber-300 rounded"
        >
          <div className="md:col-span-3 lg:col-span-7 flex justify-between items-center">
            <strong>
              Editando: {editando.materia.nombre} · Grupo {editando.codigo}
            </strong>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="text-red-600 text-sm"
            >
              Cancelar
            </button>
          </div>
          <select
            {...editarForm.register('materia_id', { valueAsNumber: true })}
            className="border p-2 rounded"
          >
            {materias.map((m) => (
              <option key={m.id_materia} value={m.id_materia}>
                {m.nombre}
              </option>
            ))}
          </select>
          <select
            {...editarForm.register('periodo_id', { valueAsNumber: true })}
            className="border p-2 rounded"
          >
            {periodos.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            {...editarForm.register('docente_id', { valueAsNumber: true })}
            className="border p-2 rounded"
          >
            {docentes.map((d) => (
              <option key={d.id_docente} value={d.id_docente}>
                {d.usuario.nombre} {d.usuario.appaterno}
              </option>
            ))}
          </select>
          <input
            {...editarForm.register('codigo')}
            className="border p-2 rounded"
          />
          <input
            type="number"
            {...editarForm.register('cupo_maximo', { valueAsNumber: true })}
            className="border p-2 rounded"
          />
          <select
            {...editarForm.register('estado')}
            className="border p-2 rounded"
          >
            <option value="ABIERTO">ABIERTO</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
          <button
            type="submit"
            disabled={editarForm.formState.isSubmitting}
            className="bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editarForm.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {cargando ? (
        <p>Cargando…</p>
      ) : grupos.length === 0 ? (
        <p className="text-gray-600">Aún no hay grupos creados.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Materia</th>
              <th className="border p-2">Código</th>
              <th className="border p-2">Periodo</th>
              <th className="border p-2">Docente</th>
              <th className="border p-2">Cupo</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.id_grupo}>
                <td className="border p-2">{g.materia.nombre}</td>
                <td className="border p-2 text-center">{g.codigo}</td>
                <td className="border p-2 text-xs">
                  {etiquetaPeriodo(g.periodo_id)}
                </td>
                <td className="border p-2 text-xs">
                  {g.docente.usuario.nombre} {g.docente.usuario.appaterno}
                </td>
                <td className="border p-2 text-center">{g.cupo_maximo}</td>
                <td className="border p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      g.estado === 'ABIERTO'
                        ? 'bg-green-100 text-green-800'
                        : g.estado === 'CERRADO'
                          ? 'bg-gray-200'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {g.estado}
                  </span>
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => abrirEdicion(g)}
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