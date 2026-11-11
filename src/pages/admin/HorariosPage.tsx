import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { horarioService } from '../../service/horario.service';
import { grupoService } from '../../service/grupo.service';
import type { Grupo, HorarioGrupo, Dia } from '../../types/academinco.types';

const DIAS: Dia[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

const schema = z
  .object({
    grupo_id: z.number().int().positive('Selecciona grupo'),
    dia_semana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']),
    hora_inicio: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm'),
    hora_fin: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm'),
  })
  .refine((d) => d.hora_fin > d.hora_inicio, {
    message: 'Hora fin debe ser posterior a hora inicio',
    path: ['hora_fin'],
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

function horaDe(f: string): string {
  if (/^\d{2}:\d{2}/.test(f)) return f.slice(0, 5);
  return new Date(f).toISOString().slice(11, 16);
}

export function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioGrupo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<HorarioGrupo | null>(null);

  const crearForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { dia_semana: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00' },
  });
  const editarForm = useForm<FormData>({ resolver: zodResolver(schema) });

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [hs, gs] = await Promise.all([
        horarioService.listarTodo ? await horarioService.listarTodo() : [],
        grupoService.listar(),
      ]);
      setHorarios(hs);
      setGrupos(gs);
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
      await horarioService.crear(data);
      crearForm.reset({
        dia_semana: data.dia_semana,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
      });
      await cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo crear el horario.'));
    }
  };

  const abrirEdicion = (h: HorarioGrupo) => {
    setEditando(h);
    editarForm.reset({
      grupo_id: h.grupo_id,
      dia_semana: h.dia_semana,
      hora_inicio: horaDe(h.hora_inicio),
      hora_fin: horaDe(h.hora_fin),
    });
  };

  const guardarEdicion = async (data: FormData) => {
    if (!editando) return;
    try {
      await horarioService.actualizar(editando.id_horario, data);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo actualizar el horario.'));
    }
  };

  const horariosPorGrupo = useMemo(() => {
    const map: Record<number, HorarioGrupo[]> = {};
    for (const h of horarios) {
      (map[h.grupo_id] ??= []).push(h);
    }
    return map;
  }, [horarios]);

  const etiquetaGrupo = (id: number) => {
    const g = grupos.find((x) => x.id_grupo === id);
    return g ? `${g.materia.nombre} · ${g.codigo}` : `#${id}`;
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Horarios</h1>

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
          <label className="block text-sm">Grupo</label>
          <select
            {...crearForm.register('grupo_id', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>—</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.materia.nombre} · {g.codigo} ({g.periodo.nombre})
              </option>
            ))}
          </select>
          {crearForm.formState.errors.grupo_id && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.grupo_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Día</label>
          <select
            {...crearForm.register('dia_semana')}
            className="border p-2 rounded w-full"
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Hora inicio</label>
          <input
            type="time"
            {...crearForm.register('hora_inicio')}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.hora_inicio && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.hora_inicio.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm">Hora fin</label>
          <input
            type="time"
            {...crearForm.register('hora_fin')}
            className="border p-2 rounded w-full"
          />
          {crearForm.formState.errors.hora_fin && (
            <p className="text-red-600 text-xs">
              {crearForm.formState.errors.hora_fin.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={crearForm.formState.isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end disabled:opacity-50"
        >
          {crearForm.formState.isSubmitting ? 'Creando…' : 'Crear horario'}
        </button>
      </form>
      {editando && (
        <form
          onSubmit={editarForm.handleSubmit(guardarEdicion)}
          className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 p-4 bg-amber-50 border border-amber-300 rounded"
        >
          <div className="md:col-span-5 flex justify-between items-center">
            <strong>
              Editando horario de {etiquetaGrupo(editando.grupo_id)} —{' '}
              {editando.dia_semana}
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
            {...editarForm.register('grupo_id', { valueAsNumber: true })}
            className="border p-2 rounded"
          >
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.materia.nombre} · {g.codigo}
              </option>
            ))}
          </select>
          <select
            {...editarForm.register('dia_semana')}
            className="border p-2 rounded"
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            {...editarForm.register('hora_inicio')}
            className="border p-2 rounded"
          />
          <input
            type="time"
            {...editarForm.register('hora_fin')}
            className="border p-2 rounded"
          />
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
      ) : horarios.length === 0 ? (
        <p className="text-gray-600">Aún no hay horarios creados.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(horariosPorGrupo).map(([grupoId, hs]) => (
            <section key={grupoId} className="border rounded">
              <header className="bg-gray-100 p-2 font-semibold">
                {etiquetaGrupo(Number(grupoId))}
              </header>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2">Día</th>
                    <th className="border p-2">Inicio</th>
                    <th className="border p-2">Fin</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {hs.map((h) => (
                    <tr key={h.id_horario}>
                      <td className="border p-2 capitalize">
                        {h.dia_semana.toLowerCase()}
                      </td>
                      <td className="border p-2 text-center">
                        {horaDe(h.hora_inicio)}
                      </td>
                      <td className="border p-2 text-center">
                        {horaDe(h.hora_fin)}
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => abrirEdicion(h)}
                          className="text-blue-600 underline text-sm"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}