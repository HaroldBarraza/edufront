import { Inscripcion } from "../types/incripciones.type";
import type { Dia } from "../types/academinco.types";

const DIAS: Dia[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const BLOQUES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

function horaDe(fecha: string | Date): string {
  if (typeof fecha === "string" && /^\d{2}:\d{2}/.test(fecha)) {
    return fecha.slice(0, 5);
  }
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toISOString().slice(11, 16);
}

interface Props {
  inscripciones: Inscripcion[];
}

export function HorarioSemanal({ inscripciones }: Props) {
  const porDiaBloque: Record<string, Record<string, Inscripcion[]>> = {};
  for (const dia of DIAS) porDiaBloque[dia] = {};

  for (const ins of inscripciones) {
    if (ins.estado !== "INSCRITO") continue;
    const horarios = ins.grupo?.horarios ?? [];
    if (!Array.isArray(horarios)) continue; 

    for (const h of horarios) {
      const ini = horaDe(h.hora_inicio);
      if (!porDiaBloque[h.dia_semana]) continue;
      (porDiaBloque[h.dia_semana][ini] ??= []).push(ins);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 w-20">Hora</th>
            {DIAS.map((d) => (
              <th key={d} className="border p-2 bg-gray-100 capitalize">
                {d.toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BLOQUES.map((bloque) => (
            <tr key={bloque}>
              <td className="border p-2 text-center text-xs text-gray-600">
                {bloque}
              </td>
              {DIAS.map((dia) => {
                const clases = porDiaBloque[dia][bloque] ?? [];
                return (
                  <td key={dia} className="border p-1 align-top h-16">
                    {clases.map((ins) => (
                      <div
                        key={ins.id_inscripcion}
                        className="bg-blue-100 border border-blue-300 rounded p-1 mb-1 text-xs"
                      >
                        <div className="font-bold">
                          {ins.grupo.materia.nombre}
                        </div>
                        <div className="text-gray-600">
                          {ins.grupo.codigo} ·{" "}
                          {horaDe(
                            ins.grupo.horarios.find(
                              (h) =>
                                h.dia_semana === dia &&
                                horaDe(h.hora_inicio) === bloque,
                            )!.hora_inicio,
                          )}
                          -
                          {horaDe(
                            ins.grupo.horarios.find(
                              (h) =>
                                h.dia_semana === dia &&
                                horaDe(h.hora_inicio) === bloque,
                            )!.hora_fin,
                          )}
                        </div>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
