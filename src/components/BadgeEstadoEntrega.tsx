import type { EstadoEntregaEstudiante } from "../libs/asignaciones";

export function BadgeEstadoEntrega({
  estado,
  calificacion,
}: {
  estado: EstadoEntregaEstudiante;
  calificacion?: string | null;
}) {
  if (estado === "SIN_ENTREGAR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
        ⏳ Sin entregar
      </span>
    );
  }
  if (estado === "ENTREGADO_SIN_CALIFICAR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
        📤 Entregado · esperando calificación
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      ✅ Calificado: {Number(calificacion).toFixed(2)} / 20
    </span>
  );
}
