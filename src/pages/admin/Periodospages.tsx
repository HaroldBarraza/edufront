import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { periodoService } from "../../service/periodo.service";
import type { Periodo, EstadoPeriodo } from "../../types/academinco.types";

const schema = z.object({
  year: z
    .number()
    .int()
    .min(new Date().getFullYear(), "No puede ser un año anterior"),
});
type FormData = z.infer<typeof schema>;

export function PeriodoPage() {
  const [periodo, setPeriodo] = useState<Periodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const cargar = async () => {
    setCargando(true);
    try {
      setPeriodo(await periodoService.listar());
    } catch {
      setError("No se pudieron cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar()
  },[])

  const crear = async(data: FormData) =>  {
    try {
        await periodoService.crear(data.year)
        reset()
        await cargar()
    } catch (err) {
        if(axios.isAxiosError(err)){
            const msg = err.response?.data?.message;
            setError(typeof msg === "string" ? msg : "Error al crear")
        }
    }
  }
  const cambiar = async(id:number, estado: EstadoPeriodo) => {
    try {
        await periodoService.cambiarEstado(id, estado)
        await cargar()
    } catch (err) {
        if(axios.isAxiosError(err)){
            const msg = err.response?.data?.message;
            setError(typeof msg === "string" ? msg : "Error al cambiar")
        }        
    }
  }


  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Periodos</h1>

      {error && (
        <p className="bg-red-50 border border-red-300 p-3 rounded mb-4">
          {error}{' '}
          <button onClick={() => setError(null)} className="ml-2">
            ×
          </button>
        </p>
      )}

      <form
        onSubmit={handleSubmit(crear)}
        className="flex items-end gap-2 mb-6"
      >
        <div>
          <label className="block text-sm">Año</label>
          <input
            type="number"
            {...register('year', { valueAsNumber: true })}
            className="border p-2 rounded w-32"
          />
          {errors.year && (
            <p className="text-red-600 text-xs">{errors.year.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Creando…' : 'Crear (2 semestres)'}
        </button>
      </form>

      {cargando ? (
        <p>Cargando…</p>
      ) : periodo.length === 0 ? (
        <p className="text-gray-600">Aún no hay periodos creados.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Rango</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodo.map((p) => (
              <tr key={p.id_periodo}>
                <td className="border p-2">{p.nombre}</td>
                <td className="border p-2 text-xs">
                  {new Date(p.fecha_inicio).toLocaleDateString()} –{' '}
                  {new Date(p.fecha_fin).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.estado === 'ACTIVO'
                        ? 'bg-green-100 text-green-800'
                        : p.estado === 'CERRADO'
                          ? 'bg-gray-200'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="border p-2 space-x-2">
                  {p.estado === 'PREPARADO' && (
                    <button
                      onClick={() => void cambiar(p.id_periodo, 'ACTIVO')}
                      className="text-green-700 underline text-xs"
                    >
                      Activar
                    </button>
                  )}
                  {p.estado === 'ACTIVO' && (
                    <button
                      onClick={() => void cambiar(p.id_periodo, 'CERRADO')}
                      className="text-red-700 underline text-xs"
                    >
                      Cerrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )


}
